import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
config_path = os.path.join(base_dir, 'js', 'config.js')

with open(config_path, 'r', encoding='utf-8') as f:
    config_js = f.read()

ghoul_config = """  'ghoul': {description: 'Bites enemies, revives faster on death', name: 'Ghoul', tags: ['Melee', 'Unique'], hp: 120, speed: 1.2, attackDamage: 12, attackRange: 40, attackCooldown: 600, color: {team1: '#60a5fa', team2: '#f87171'}, reviveHpMultiplier: 0.5, reviveSpeedMultiplier: 2.5, reviveDamageMultiplier: 1.5, reviveCooldownMultiplier: 0.6},
  'abyssal_summoner':"""

config_js = config_js.replace("  'abyssal_summoner':", ghoul_config)

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config_js)

unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# Add Ghoul to drawEquipment
old_draw = """    } else if (this.type === 'rockgolem') {"""
new_draw = """    } else if (this.type === 'ghoul') {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      // Draw stitches on the body
      uiElements.ctx.strokeStyle = '#000000';
      uiElements.ctx.lineWidth = 1.5;
      uiElements.ctx.beginPath();
      // Main cut
      uiElements.ctx.moveTo(-5, -5);
      uiElements.ctx.lineTo(5, 5);
      // Stitches across
      uiElements.ctx.moveTo(-2, -6);
      uiElements.ctx.lineTo(0, -2);
      uiElements.ctx.moveTo(2, -2);
      uiElements.ctx.lineTo(4, 2);
      uiElements.ctx.moveTo(6, 2);
      uiElements.ctx.lineTo(8, 6);
      uiElements.ctx.stroke();
      // If revived, glowing eyes
      if (this.isRevived) {
          uiElements.ctx.fillStyle = '#ef4444'; // glowing red eyes
          uiElements.ctx.shadowColor = '#ef4444';
          uiElements.ctx.shadowBlur = 5;
          uiElements.ctx.beginPath();
          uiElements.ctx.arc(4, -3, 2, 0, Math.PI*2);
          uiElements.ctx.arc(4, 3, 2, 0, Math.PI*2);
          uiElements.ctx.fill();
      }
      uiElements.ctx.restore();
    } else if (this.type === 'rockgolem') {"""
unit_js = unit_js.replace(old_draw, new_draw)

# Add Ghoul logic to takeDamage
old_takeDamage_end = """    if (this.hp <= 0 && attacker) {
      attacker.kills++;
    }"""
new_takeDamage_end = """    if (this.hp <= 0 && this.type === 'ghoul' && !this.isRevived) {
      this.isRevived = true;
      const specs = UNIT_SPECS.ghoul;
      this.hp = this.maxHp * specs.reviveHpMultiplier;
      this.speed *= specs.reviveSpeedMultiplier;
      this.attackDamage *= specs.reviveDamageMultiplier;
      this.attackCooldown *= specs.reviveCooldownMultiplier;
      for (let i = 0; i < 20; i++) gameState.particles.push(new Particle(this.x, this.y, this.team, true, 'poison'));
      gameState.animations.push(new FloatingText("REVIVED!", this.x, this.y - 30, "#ef4444"));
      return;
    }
    
    if (this.hp <= 0 && attacker) {
      attacker.kills++;
    }"""
unit_js = unit_js.replace(old_takeDamage_end, new_takeDamage_end)

# Add Ghoul attack logic to update
old_swordsman_attack = """} else if (this.type === 'swordsman' || this.type === 'guardian') {"""
new_swordsman_attack = """} else if (this.type === 'ghoul') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new SlashAnimation(this, '239, 68, 68')); // Red bite slash
          if (!this.isSlashing) {
            this.isSlashing = true;
            this.slashAnimProgress = this.slashAnimDuration;
          }
        }
} else if (this.type === 'swordsman' || this.type === 'guardian') {"""
unit_js = unit_js.replace(old_swordsman_attack, new_swordsman_attack)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
