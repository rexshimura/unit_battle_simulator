import os

BASE_DIR = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator'
eff_path = os.path.join(BASE_DIR, 'js', 'entities', 'Effects.js')
with open(eff_path, 'r', encoding='utf-8') as f:
    eff_text = f.read()

anim_class = """
export class ChainPushAnimation {
  constructor(attacker, target) {
    this.attacker = attacker;
    this.target = target;
    this.creationTime = Date.now();
    this.duration = 200;
  }
  update() {
    return Date.now() - this.creationTime < this.duration;
  }
  draw() {
    const progress = (Date.now() - this.creationTime) / this.duration;
    uiElements.ctx.save();
    uiElements.ctx.strokeStyle = `rgba(148, 163, 184, ${1 - progress})`;
    uiElements.ctx.lineWidth = 5 * (1 - progress);
    uiElements.ctx.setLineDash([10, 5]);
    uiElements.ctx.beginPath();
    uiElements.ctx.moveTo(this.attacker.x, this.attacker.y);
    uiElements.ctx.lineTo(this.target.x, this.target.y);
    uiElements.ctx.stroke();
    uiElements.ctx.restore();
  }
}
"""
if 'ChainPushAnimation' not in eff_text:
    eff_text += anim_class
    with open(eff_path, 'w', encoding='utf-8') as f:
        f.write(eff_text)

unit_path = os.path.join(BASE_DIR, 'js', 'entities', 'Unit.js')
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_text = f.read()

if 'ChainPushAnimation' not in unit_text:
    unit_text = unit_text.replace('PoisonSplashAnimation,', 'PoisonSplashAnimation, ChainPushAnimation,')

# Add passive to update
update_passive = """
    if (this.type === 'restrictor') {
       const PUSH_COOLDOWN = 5000;
       const PUSH_RANGE = 70;
       if (!this.lastPushTime || Date.now() - this.lastPushTime > PUSH_COOLDOWN) {
          for (const enemy of enemies) {
             if (enemy.hp > 0 && enemy.team !== this.team) {
                if (getDistance(this, enemy) < PUSH_RANGE) {
                   const angle = Math.atan2(enemy.y - this.y, enemy.x - this.x);
                   enemy.isBeingKnockedBack = true;
                   enemy.knockbackTargetX = enemy.x + Math.cos(angle) * 120;
                   enemy.knockbackTargetY = enemy.y + Math.sin(angle) * 120;
                   enemy.takeDamage(5, this);
                   this.lastPushTime = Date.now();
                   AudioManager.play('chain_release');
                   gameState.animations.push(new ChainPushAnimation(this, enemy));
                   break;
                }
             }
          }
       }
    }
"""
update_idx = unit_text.find('update(enemies) {')
insert_idx = unit_text.find('{', update_idx) + 1
unit_text = unit_text[:insert_idx] + update_passive + unit_text[insert_idx:]

# Add cooldown bar to draw()
draw_cd = """
    if (this.type === 'restrictor') {
        const PUSH_COOLDOWN = 5000;
        if (this.lastPushTime && Date.now() - this.lastPushTime < PUSH_COOLDOWN) {
            const cdProgress = 1 - ((Date.now() - this.lastPushTime) / PUSH_COOLDOWN);
            uiElements.ctx.fillStyle = 'rgba(75, 85, 99, 0.5)';
            uiElements.ctx.fillRect(this.x - 15, this.y + this.height + 15, 30, 4);
            uiElements.ctx.fillStyle = '#a855f7';
            uiElements.ctx.fillRect(this.x - 15, this.y + this.height + 15, 30 * cdProgress, 4);
        } else {
            uiElements.ctx.fillStyle = '#a855f7';
            uiElements.ctx.font = 'bold 9px Arial';
            uiElements.ctx.textAlign = 'center';
            uiElements.ctx.fillText("PUSH READY", this.x, this.y + this.height + 22);
        }
    }
"""
draw_idx = unit_text.find('this.drawHealthBar();')
unit_text = unit_text[:draw_idx] + draw_cd + unit_text[draw_idx:]

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_text)
print('Passive push added.')
