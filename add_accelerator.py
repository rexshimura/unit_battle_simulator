import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
config_path = os.path.join(base_dir, 'js', 'config.js')
proj_path = os.path.join(base_dir, 'js', 'entities', 'Projectiles.js')
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
index_path = os.path.join(base_dir, 'index.html')

# 1. Update config.js
with open(config_path, 'r', encoding='utf-8') as f:
    config_js = f.read()

config_js = config_js.replace("Rangers: ['musketeer', 'sniper', 'archer', 'hunter', 'minigunner'],", "Rangers: ['musketeer', 'sniper', 'archer', 'hunter', 'minigunner', 'accelerator'],")
config_js = config_js.replace("Tinkerers: ['alchemist'],", "Tinkerers: ['alchemist', 'accelerator'],")

old_specs = """const UNIT_SPECS = {"""
new_specs = """const UNIT_SPECS = {
  'accelerator': {description: 'Charges up and fires 3 penetrating lasers', name: 'Accelerator', hp: 80, speed: 0.5, attackDamage: 12, attackRange: 800, attackCooldown: 3000, color: {team1: '#60a5fa', team2: '#f87171'}, burstTriggerCount: 3, burstDelay: 150, chargeTime: 1200},"""
config_js = config_js.replace(old_specs, new_specs)

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config_js)

# 2. Update Projectiles.js
with open(proj_path, 'r', encoding='utf-8') as f:
    proj_js = f.read()

beam_class = """export class PenetratingBeam {
  constructor(shooter, target, damage, team) {
    this.shooter = shooter;
    this.damage = damage;
    this.team = team;
    this.x = shooter.x;
    this.y = shooter.y;
    this.angle = Math.atan2(target.y - shooter.y, target.x - shooter.x);
    this.speed = 25; 
    this.radius = 6;
    this.hitTargets = new Set();
  }

  update(uiElements, gameState) {
    import { getDistance } from '../utils.js'; // Needed if getDistance isn't in scope, but wait, it is imported at top
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;

    gameState.units.forEach(unit => {
      // Inline distance calculation to avoid import issues
      if (unit.team !== this.team && unit.hp > 0 && !this.hitTargets.has(unit)) {
        const dx = this.x - unit.x;
        const dy = this.y - unit.y;
        if (Math.sqrt(dx * dx + dy * dy) <= unit.width / 2 + this.radius) {
          unit.takeDamage(this.damage, this.shooter);
          this.hitTargets.add(unit);
          // Play hit effect via gameState if possible, but simpler to skip particle import issues
        }
      }
    });

    if (this.x < 0 || this.x > uiElements.canvas.width || this.y < 0 || this.y > uiElements.canvas.height) {
      return false;
    }
    return true;
  }

  draw(uiElements) {
    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    uiElements.ctx.rotate(this.angle);
    uiElements.ctx.fillStyle = '#6b7280'; // Gray outer
    uiElements.ctx.fillRect(-10, -3, 20, 6);
    uiElements.ctx.fillStyle = '#ffffff'; // White core
    uiElements.ctx.fillRect(-8, -1, 16, 2);
    uiElements.ctx.restore();
  }
}
"""

if "class PenetratingBeam" not in proj_js:
    proj_js += "\n" + beam_class
    with open(proj_path, 'w', encoding='utf-8') as f:
        f.write(proj_js)

# 3. Update Unit.js imports
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_import = "import { Projectile, AntiHealDart, PoisonPotion, Arrow, Fireball, EagleProjectile } from './Projectiles.js';"
new_import = "import { Projectile, AntiHealDart, PoisonPotion, Arrow, Fireball, EagleProjectile, PenetratingBeam } from './Projectiles.js';"
unit_js = unit_js.replace(old_import, new_import)

# Update Unit.js draw block for sniper laser to include accelerator laser
old_sniper_laser = """    if (this.type === 'sniper' && this.target && getDistance(this, this.target) <= this.attackRange) {
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(this.x, this.y);
      uiElements.ctx.lineTo(this.target.x, this.target.y);
      uiElements.ctx.strokeStyle = this.team === 1 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)';
      uiElements.ctx.lineWidth = 1;
      uiElements.ctx.stroke();
    }"""

new_sniper_laser = """    if (this.type === 'sniper' && this.target && getDistance(this, this.target) <= this.attackRange) {
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(this.x, this.y);
      uiElements.ctx.lineTo(this.target.x, this.target.y);
      uiElements.ctx.strokeStyle = this.team === 1 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)';
      uiElements.ctx.lineWidth = 1;
      uiElements.ctx.stroke();
    }
    
    if (this.type === 'accelerator' && this.isCharging && this.target) {
       const specs = UNIT_SPECS.accelerator;
       const chargeProgress = Math.min(1, (Date.now() - this.chargeStartTime) / (specs.chargeTime / gameState.gameSpeed));
       uiElements.ctx.beginPath();
       uiElements.ctx.moveTo(this.x, this.y);
       uiElements.ctx.lineTo(this.target.x, this.target.y);
       uiElements.ctx.strokeStyle = `rgba(156, 163, 175, ${chargeProgress})`; // Gray line 0 to 1 opacity
       uiElements.ctx.lineWidth = 2;
       uiElements.ctx.stroke();
    }"""
unit_js = unit_js.replace(old_sniper_laser, new_sniper_laser)

# Update Unit.js drawEquipment for Accelerator
old_equip = "if (this.type === 'musketeer' || this.type === 'sniper' || this.type === 'hunter' || this.type === 'minigunner') {"
new_equip = "if (this.type === 'musketeer' || this.type === 'sniper' || this.type === 'hunter' || this.type === 'minigunner' || this.type === 'accelerator') {"
unit_js = unit_js.replace(old_equip, new_equip)

old_equip2 = """      if (this.type === 'minigunner') {
         nozzleLength = 16;
         nozzleWidth = 8; // THICK barrel for minigun
         weaponColor = '#374151'; 
      }"""
new_equip2 = """      if (this.type === 'minigunner') {
         nozzleLength = 16;
         nozzleWidth = 8; // THICK barrel for minigun
         weaponColor = '#374151'; 
      }
      if (this.type === 'accelerator') {
         nozzleLength = 18;
         nozzleWidth = 6; 
         weaponColor = '#6b7280'; // Accelerator futuristic gray
      }"""
unit_js = unit_js.replace(old_equip2, new_equip2)

old_equip3 = """      // Draw minigun barrel lines
      if (this.type === 'minigunner') {"""
new_equip3 = """      // Draw accelerator glowing core
      if (this.type === 'accelerator') {
          uiElements.ctx.save();
          const coreX = this.x + Math.cos(angle) * (this.width / 2 + nozzleLength/2);
          const coreY = this.y + Math.sin(angle) * (this.width / 2 + nozzleLength/2);
          uiElements.ctx.fillStyle = this.isCharging ? '#60a5fa' : '#4b5563'; // Glow blue when charging
          uiElements.ctx.beginPath();
          uiElements.ctx.arc(coreX, coreY, 3, 0, Math.PI * 2);
          uiElements.ctx.fill();
          uiElements.ctx.restore();
      }
      // Draw minigun barrel lines
      if (this.type === 'minigunner') {"""
unit_js = unit_js.replace(old_equip3, new_equip3)

# Add pre-cooldown attack logic for Accelerator
old_attack_cryo = """    if (this.type === 'cryomancer') {"""
new_attack_accel = """    if (this.type === 'accelerator') {
      const specs = UNIT_SPECS.accelerator;
      if (this.isBursting) {
         if (now - this.lastBurstShotTime > specs.burstDelay / gameState.gameSpeed) {
           this.lastBurstShotTime = now;
           this.burstsLeft--;
           if (this.target) {
             AudioManager.play('snipe'); // Laser shot SFX
             gameState.projectiles.push(new PenetratingBeam(this, this.target, this.attackDamage, this.team));
           }
           if (this.burstsLeft <= 0) {
             this.isBursting = false;
             this.lastAttackTime = now;
           }
         }
         return;
      } else if (this.isCharging) {
         if (now - this.chargeStartTime > specs.chargeTime / gameState.gameSpeed) {
             this.isCharging = false;
             this.isBursting = true;
             this.burstsLeft = specs.burstTriggerCount;
             this.lastBurstShotTime = 0; // Trigger instantly
         }
         return;
      }
    }
    
    if (this.type === 'cryomancer') {"""
unit_js = unit_js.replace(old_attack_cryo, new_attack_accel)

# Add cooldown trigger for Accelerator
old_cd_trigger = """      } else if (this.type === 'archer') {"""
new_cd_trigger = """      } else if (this.type === 'accelerator') {
          this.isCharging = true;
          this.chargeStartTime = now;
      } else if (this.type === 'archer') {"""
unit_js = unit_js.replace(old_cd_trigger, new_cd_trigger)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)

# 4. Inject into index.html
with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

minigunner_btn_pattern = r'(<button data-unit-type="minigunner"[\s\S]*?</button>)'
accelerator_btn = """
                    <button data-unit-type="accelerator" class="unit-btn w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center gap-3">
                        <canvas width="40" height="40" class="unit-preview-canvas" data-unit-type="accelerator"></canvas>
                        <div>
                            <p class="text-sm font-bold text-gray-200">Accelerator</p>
                        </div>
                    </button>"""

html = re.sub(minigunner_btn_pattern, r'\1' + accelerator_btn, html)

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(html)
