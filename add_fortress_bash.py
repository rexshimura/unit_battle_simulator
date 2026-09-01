import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"

# 1. Update Unit.js takeDamage
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

take_damage_start = """  takeDamage(amount, attacker, isTrueDamage = false) {
    if (this.hp <= 0) return;"""

take_damage_fortress = """
    // Fortress shield bash logic
    if (this.type === 'fortress' && this.hp > 0 && !isTrueDamage) {
      const specs = UNIT_SPECS[this.type];
      this.hitsTaken = (this.hitsTaken || 0) + 1;
      if (this.hitsTaken >= 5) {
        this.hitsTaken = 0;
        const radius = 100;
        const force = 100;
        const damage = 20;
        
        if (!this.isSlashing) {
          this.isSlashing = true;
          this.slashAnimProgress = this.slashAnimDuration;
        }

        gameState.animations.push(new ShieldBashAnimation(this.x, this.y, radius, damage, force, this.team, gameState.units, this));
      }
    }
"""

unit_js = unit_js.replace("  takeDamage(amount, attacker, isTrueDamage = false) {\n    if (this.hp <= 0) return;", take_damage_start + take_damage_fortress)


# Prevent fortress from normal attacking
attack_logic = """
      if (this.type === 'fortress') {
          // Fortress does not attack normally
          return;
      }
      if (this.type === 'swordsman' || this.type === 'guardian' || this.type === 'fortress') {
"""

unit_js = unit_js.replace("      } else if (this.type === 'swordsman' || this.type === 'guardian' || this.type === 'fortress') {", "} else if (this.type === 'swordsman' || this.type === 'guardian') {")

fortress_block_attack = """
    } else if (this.type === 'fortress') {
      // Fortress does not attack normally, it only bashes on hit
      return;
"""
unit_js = unit_js.replace("} else if (this.type === 'sledgehammer') {", fortress_block_attack + "} else if (this.type === 'sledgehammer') {")

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)


# 2. Add ShieldBashAnimation to Effects.js
effects_path = os.path.join(base_dir, 'js', 'entities', 'Effects.js')
with open(effects_path, 'r', encoding='utf-8') as f:
    effects = f.read()

bash_effect = """
class ShieldBashAnimation {
  constructor(x, y, radius, damage, force, team, allUnits, caster) {
    this.x = x;
    this.y = y;
    this.maxRadius = radius;
    this.duration = 30;
    this.maxDuration = 30;
    
    const enemies = allUnits.filter(u => u.team !== team && u.hp > 0);
    enemies.forEach(unit => {
      const dist = getDistance(this, unit);
      if (dist <= this.maxRadius) {
        unit.takeDamage(damage, caster);
        // knockback
        const angle = Math.atan2(unit.y - this.y, unit.x - this.x);
        unit.vx += Math.cos(angle) * force;
        unit.vy += Math.sin(angle) * force;
        // brief stun
        if (!unit.stunned) {
          unit.stunned = true;
          unit.stunTimer = 1000;
        }
      }
    });
    
    // particles
    for (let i = 0; i < 20; i++) {
      const p = new Particle(this.x, this.y, team, true, 'rock');
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      gameState.particles.push(p);
    }
  }

  update() {
    this.duration -= 1 * gameState.gameSpeed;
    return this.duration > 0;
  }

  draw() {
    const progress = 1 - this.duration / this.maxDuration;
    const alpha = Math.max(0, this.duration / this.maxDuration);
    const currentRadius = this.maxRadius * progress;
    
    uiElements.ctx.save();
    uiElements.ctx.globalAlpha = alpha * 0.6;
    uiElements.ctx.strokeStyle = '#94a3b8';
    uiElements.ctx.lineWidth = 15 * alpha;
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
    uiElements.ctx.stroke();
    
    uiElements.ctx.fillStyle = `rgba(148, 163, 184, ${alpha * 0.3})`;
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
    uiElements.ctx.fill();
    uiElements.ctx.restore();
  }
}
"""

effects = effects.replace("export {", bash_effect + "\nexport {")

with open(effects_path, 'w', encoding='utf-8') as f:
    f.write(effects)
