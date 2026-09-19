import os

# 1. Update Projectiles.js
proj_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\entities\Projectiles.js'
with open(proj_path, 'r', encoding='utf-8') as f:
    text = f.read()

draw_method_start = text.find('draw() {', text.find('class ChainProjectile'))
draw_method_end = text.find('}', text.find('uiElements.ctx.restore();', draw_method_start + 100)) + 1

new_draw_method = '''draw() {
    if (this.shooter && this.shooter.hp > 0) {
      uiElements.ctx.save();
      uiElements.ctx.strokeStyle = '#94a3b8'; 
      uiElements.ctx.lineWidth = 3;
      uiElements.ctx.setLineDash([10, 6]); // smooth broken line

      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(this.shooter.x, this.shooter.y);
      
      const midX = (this.shooter.x + this.x) / 2;
      const midY = (this.shooter.y + this.y) / 2;
      const dx = this.x - this.shooter.x;
      const dy = this.y - this.shooter.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      const curveOffset = dist * 0.1; // slight smooth curve
      const perpX = -dy / (dist || 1) * curveOffset;
      const perpY = dx / (dist || 1) * curveOffset;
      
      uiElements.ctx.quadraticCurveTo(midX + perpX, midY + perpY, this.x, this.y);
      uiElements.ctx.stroke();
      uiElements.ctx.restore();
    }
  }'''

text = text[:draw_method_start] + new_draw_method + text[draw_method_end:]
with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(text)

# 2. Update Unit.js (simplify whip to just a broken line or remove it since projectile handles it)
unit_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\entities\Unit.js'
with open(unit_path, 'r', encoding='utf-8') as f:
    text2 = f.read()

# Replace throwing whip with just the hand movement or remove the drawn whip since projectile draws the tether
draw_block_old = '''      if (this.isThrowing) {
         // Chain whipping forward
         const whipLength = throwProgress < 0.5 ? throwProgress * 60 : (1 - throwProgress) * 60;
         uiElements.ctx.beginPath();
         uiElements.ctx.moveTo(0, 0);
         uiElements.ctx.quadraticCurveTo(whipLength / 2, -15, whipLength, 0);
         uiElements.ctx.stroke();
         
         // Draw a few links on the whip
         for (let i = 1; i <= 3; i++) {
             const lx = (whipLength / 3) * i;
             uiElements.ctx.beginPath();
             uiElements.ctx.ellipse(lx, -15 * Math.sin(Math.PI * (i/4)), 4, 2, Math.PI/4, 0, Math.PI*2);
             uiElements.ctx.stroke();
         }
      } else {'''

draw_block_new = '''      if (this.isThrowing) {
         // No extra whip needed here because the projectile itself draws the tether continuously from the body.
      } else {'''
text2 = text2.replace(draw_block_old, draw_block_new)

# Also simplify the restriction lock chains on enemies to broken lines instead of ellipses
restrict_old = '''    // Draw chains if locked
    if (this.stunType === 'restrict' && Date.now() < this.stunnedUntil) {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.strokeStyle = '#a855f7';
      uiElements.ctx.lineWidth = 3;
      uiElements.ctx.beginPath();
      uiElements.ctx.ellipse(0, 0, this.width / 2 + 4, this.width / 2 - 2, Math.PI / 6, 0, Math.PI*2);
      uiElements.ctx.stroke();
      uiElements.ctx.beginPath();
      uiElements.ctx.ellipse(0, 0, this.width / 2 + 4, this.width / 2 - 2, -Math.PI / 6, 0, Math.PI*2);
      uiElements.ctx.stroke();
      uiElements.ctx.restore();
    }'''

restrict_new = '''    // Draw chains if locked
    if (this.stunType === 'restrict' && Date.now() < this.stunnedUntil) {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.strokeStyle = '#a855f7';
      uiElements.ctx.lineWidth = 3;
      uiElements.ctx.setLineDash([8, 6]);
      uiElements.ctx.beginPath();
      uiElements.ctx.ellipse(0, 0, this.width / 2 + 4, this.width / 2 - 2, Math.PI / 6, 0, Math.PI*2);
      uiElements.ctx.stroke();
      uiElements.ctx.beginPath();
      uiElements.ctx.ellipse(0, 0, this.width / 2 + 4, this.width / 2 - 2, -Math.PI / 6, 0, Math.PI*2);
      uiElements.ctx.stroke();
      uiElements.ctx.restore();
    }'''
text2 = text2.replace(restrict_old, restrict_new)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(text2)

print('Visuals simplified.')
