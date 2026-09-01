import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"

# 1. Update Unit.js to spawn 5 icicles
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_ice_spawn = "if (this.target) gameState.projectiles.push(new IceShard(this, this.target));"
new_ice_spawn = """if (this.target) {
            const spreadAngles = [-0.4, -0.2, 0, 0.2, 0.4];
            for (let i = 0; i < 5; i++) {
               gameState.projectiles.push(new IceShard(this, this.target, spreadAngles[i]));
            }
          }"""
unit_js = unit_js.replace(old_ice_spawn, new_ice_spawn)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)


# 2. Update Projectiles.js IceShard class
proj_path = os.path.join(base_dir, 'js', 'entities', 'Projectiles.js')
with open(proj_path, 'r', encoding='utf-8') as f:
    proj_js = f.read()

old_ice_shard = """class IceShard extends Projectile {
  constructor(shooter, target) {
    const specs = UNIT_SPECS.cryomancer;
    super(shooter, target, specs.attackDamage, shooter.team);
    this.speed = 5;
  }
  update(enemies) {
    if (Math.random() < 0.3) {
      gameState.particles.push(new Particle(this.x, this.y, this.team, false, 'ice'));
    }
    return super.update(enemies);
  }
  draw() {
    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    uiElements.ctx.rotate(this.angle);
    const length = 12;
    const width = 6;
    const gemColor = this.team === 1 ? '#67e8f9' : '#06b6d4';
    uiElements.ctx.fillStyle = gemColor;
    uiElements.ctx.beginPath();
    uiElements.ctx.moveTo(length / 2, 0);
    uiElements.ctx.lineTo(-length / 2, width / 2);
    uiElements.ctx.lineTo(-length / 2 + 2, 0);
    uiElements.ctx.lineTo(-length / 2, -width / 2);
    uiElements.ctx.closePath();
    uiElements.ctx.fill();
    uiElements.ctx.restore();
  }
}"""

new_ice_shard = """class IceShard extends Projectile {
  constructor(shooter, target, angleOffset = 0) {
    const specs = UNIT_SPECS.cryomancer;
    super(shooter, target, 3, shooter.team); // very low damage per shard
    this.speed = 5;
    this.angle += angleOffset;
    this.creationTime = Date.now();
  }
  update(enemies) {
    if (Math.random() < 0.3) {
      gameState.particles.push(new Particle(this.x, this.y, this.team, false, 'ice'));
    }
    
    // Guardian deflect logic
    const enemyGuardians = gameState.units.filter(u => u.team !== this.team && u.type === 'guardian');
    for (const guardian of enemyGuardians) {
      const specs = UNIT_SPECS.guardian;
      if (getDistance(this, guardian) < guardian.width / 2 + 5) {
        guardian.deflect();
        if (Math.random() < specs.deflectChance) {
          this.team = guardian.team;
          this.target = this.shooter;
          this.shooter = guardian;
          return true;
        } else {
          guardian.takeDamage(this.damage * 0.5, this.shooter);
          return false;
        }
      }
    }

    // Homing logic after 0.2s
    if (this.target && this.target.hp > 0 && Date.now() - this.creationTime > 200) {
      const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      const turnSpeed = 0.1 * gameState.gameSpeed;
      let diff = targetAngle - this.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      if (Math.abs(diff) < turnSpeed) {
        this.angle = targetAngle;
      } else {
        this.angle += Math.sign(diff) * turnSpeed;
      }
    }
    
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;
    
    for (const enemy of enemies) {
      if (getDistance(this, enemy) < enemy.width / 2 + this.radius) {
        enemy.takeDamage(this.damage, this.shooter);
        const specs = UNIT_SPECS.cryomancer;
        enemy.buffs.slow = {
          expires: Date.now() + specs.chillDuration,
          amount: 0.3
        };
        return false;
      }
    }
    return this.x > -this.radius && this.x < uiElements.canvas.width + this.radius && this.y > -this.radius && this.y < uiElements.canvas.height + this.radius;
  }
  draw() {
    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    uiElements.ctx.rotate(this.angle);
    const length = 10;
    const width = 4; // Made slightly smaller
    const gemColor = this.team === 1 ? '#67e8f9' : '#06b6d4';
    uiElements.ctx.fillStyle = gemColor;
    uiElements.ctx.beginPath();
    uiElements.ctx.moveTo(length / 2, 0);
    uiElements.ctx.lineTo(-length / 2, width / 2);
    uiElements.ctx.lineTo(-length / 2 + 2, 0);
    uiElements.ctx.lineTo(-length / 2, -width / 2);
    uiElements.ctx.closePath();
    uiElements.ctx.fill();
    uiElements.ctx.restore();
  }
}"""

proj_js = proj_js.replace(old_ice_shard, new_ice_shard)

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(proj_js)
