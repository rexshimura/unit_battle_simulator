import os
import re

effects_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\entities\Effects.js'
with open(effects_path, 'r', encoding='utf-8') as f:
    effects = f.read()

# Remove all ShieldBashAnimation class definitions
# They start with "class ShieldBashAnimation {" and end with "} // end of class" ... wait, let's use regex
pattern = r"class ShieldBashAnimation \{[\s\S]*?\n\}\n"
effects = re.sub(pattern, "", effects)

# Remove all exports of ShieldBashAnimation
effects = re.sub(r"export \{ ShieldBashAnimation \};\n?", "", effects)


# Now append it exactly once at the bottom
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
        const targetX = unit.x + Math.cos(angle) * force;
        const targetY = unit.y + Math.sin(angle) * force;
        const unitRadius = unit.width / 2;
        unit.knockbackTargetX = Math.max(unitRadius, Math.min(targetX, uiElements.canvas.width - unitRadius));
        unit.knockbackTargetY = Math.max(unitRadius, Math.min(targetY, uiElements.canvas.height - unitRadius));
        unit.isBeingKnockedBack = true;
        // brief stun
        const stunDuration = 1000;
        if (Date.now() > unit.stunnedUntil) {
          unit.stunType = 'stun';
          unit.stunnedUntil = Date.now() + stunDuration;
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

export { ShieldBashAnimation };
"""

effects += bash_effect

with open(effects_path, 'w', encoding='utf-8') as f:
    f.write(effects)
