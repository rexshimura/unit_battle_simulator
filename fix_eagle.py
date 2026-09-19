import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
proj_path = os.path.join(base_dir, 'js', 'entities', 'Projectiles.js')
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

# 1. Fix Projectiles.js export
with open(proj_path, 'r', encoding='utf-8') as f:
    proj_js = f.read()

proj_js = proj_js.replace("class EagleProjectile {", "export class EagleProjectile {")

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(proj_js)


# 2. Fix Unit.js import & draw eagle on shoulder
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# Fix import
unit_js = unit_js.replace(
    "import { Projectile, IceShard, HealingOrb, Arrow, Fireball, PoisonPotion, AntiHealDart } from './Projectiles.js';",
    "import { Projectile, IceShard, HealingOrb, Arrow, Fireball, PoisonPotion, AntiHealDart, EagleProjectile } from './Projectiles.js';"
)

# Draw eagle on shoulder
eagle_draw_code = """      // Draw weapon barrel
      uiElements.ctx.strokeStyle = '#9ca3af';
      uiElements.ctx.lineWidth = nozzleWidth;
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(startX, startY);
      uiElements.ctx.lineTo(endX, endY);
      uiElements.ctx.stroke();
      
      // Draw eagle on Hunter's shoulder
      if (this.type === 'hunter') {
          uiElements.ctx.save();
          // Calculate shoulder position (left side of the unit, slightly up)
          const shoulderX = this.x + Math.cos(angle - Math.PI / 2) * (this.width / 2 + 2);
          const shoulderY = this.y + Math.sin(angle - Math.PI / 2) * (this.width / 2 + 2);
          uiElements.ctx.translate(shoulderX, shoulderY);
          uiElements.ctx.rotate(angle);
          
          // Draw resting eagle body
          uiElements.ctx.fillStyle = '#8B4513';
          uiElements.ctx.beginPath();
          uiElements.ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
          uiElements.ctx.fill();
          
          // Draw eagle head (white)
          uiElements.ctx.fillStyle = '#FFFFFF';
          uiElements.ctx.beginPath();
          uiElements.ctx.arc(4, 0, 2.5, 0, Math.PI * 2);
          uiElements.ctx.fill();
          uiElements.ctx.restore();
      }
"""

# We need to find the barrel drawing part to replace it
old_barrel_code = """      // Draw weapon barrel
      uiElements.ctx.strokeStyle = '#9ca3af';
      uiElements.ctx.lineWidth = nozzleWidth;
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(startX, startY);
      uiElements.ctx.lineTo(endX, endY);
      uiElements.ctx.stroke();"""

unit_js = unit_js.replace(old_barrel_code, eagle_draw_code)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
