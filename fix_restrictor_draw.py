import os
import re

unit_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\entities\Unit.js'
with open(unit_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update attack logic to trigger animation
old_attack = """} else if (this.type === 'restrictor') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          AudioManager.play('throw');"""
new_attack = """} else if (this.type === 'restrictor') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          AudioManager.play('throw');
          this.isThrowing = true;
          this.throwAnimDuration = 300;
          this.throwAnimProgress = this.throwAnimDuration;"""
content = content.replace(old_attack, new_attack)

# 2. Add drawEquipment logic
# Insert before "    } else if (this.type === 'sledgehammer') {" in drawEquipment
# Wait, sledgehammer isn't in drawEquipment. Let's find "    } else if (this.type === 'abyssal_summoner') {"
draw_block = """    } else if (this.type === 'restrictor') {
      const offsetDistance = this.width / 2 + 5;
      const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
      const offsetY = Math.sin(angle + Math.PI / 2) * offsetDistance;
      
      let throwProgress = 0;
      if (this.isThrowing) {
        throwProgress = 1 - (this.throwAnimProgress / this.throwAnimDuration);
      }
      
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x + offsetX, this.y + offsetY);
      uiElements.ctx.rotate(angle);
      
      uiElements.ctx.strokeStyle = '#94a3b8';
      uiElements.ctx.lineWidth = 2;
      
      if (this.isThrowing) {
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
      } else {
         // Holding coiled chain
         for (let i = 0; i < 3; i++) {
            uiElements.ctx.beginPath();
            uiElements.ctx.ellipse(0, 0 + i * 2, 5, 2, 0, 0, Math.PI*2);
            uiElements.ctx.stroke();
         }
      }
      
      uiElements.ctx.restore();
"""
# find "} else if (this.type === 'dummy') {" to insert before it inside drawEquipment
# Actually, let's find "} else if (this.type === 'sentry') {" which is in drawEquipment
content = content.replace("    } else if (this.type === 'dummy') {", draw_block + "    } else if (this.type === 'dummy') {")

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Restrictor animation and draw logic added.")
