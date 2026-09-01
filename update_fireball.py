import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
proj_path = os.path.join(base_dir, 'js', 'entities', 'Projectiles.js')

with open(proj_path, 'r', encoding='utf-8') as f:
    proj_js = f.read()

old_fireball = """class Fireball extends Projectile {
  constructor(shooter, target) {
    const specs = UNIT_SPECS.flamecaller;
    super(shooter, target, specs.attackDamage, shooter.team);
    this.speed = 3;
    this.radius = 8;
  }
  update(enemies) {
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;
    if (Math.random() > 0.5) {
      gameState.particles.push(new Particle(this.x, this.y, this.team, false, 'fire'));
    }
    if (this.target && this.target.hp > 0 && getDistance(this, this.target) < this.radius + this.target.width / 2) {
      const specs = UNIT_SPECS.flamecaller;
      gameState.animations.push(new AoeExplosion(this.target.x, this.target.y, specs.aoeRadius, specs.aoeDamage, this.team, gameState.units, this.shooter));
      return false;
    }
    for (const enemy of enemies) {
      if (getDistance(this, enemy) < enemy.width / 2 + this.radius) {
        const specs = UNIT_SPECS.flamecaller;
        gameState.animations.push(new AoeExplosion(this.x, this.y, specs.aoeRadius, specs.aoeDamage, this.team, gameState.units, this.shooter));
        return false;
      }
    }
    return this.x > -this.radius && this.x < uiElements.canvas.width + this.radius && this.y > -this.radius && this.y < uiElements.canvas.height + this.radius;
  }
  draw() {
    uiElements.ctx.fillStyle = this.team === 1 ? '#fb923c' : '#f87171';
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    uiElements.ctx.fill();
    uiElements.ctx.fillStyle = `rgba(255, 255, 100, 0.8)`;
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
    uiElements.ctx.fill();
  }
}"""

new_fireball = """class Fireball extends Projectile {
  constructor(shooter, target, isSmall = false, angleOffset = 0) {
    const specs = UNIT_SPECS.flamecaller;
    super(shooter, target, isSmall ? specs.attackDamage / 2 : specs.attackDamage, shooter.team);
    this.speed = isSmall ? 4.5 : 3;
    this.radius = isSmall ? 4 : 8;
    this.isSmall = isSmall;
    this.angle += angleOffset;
  }
  update(enemies) {
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;
    if (Math.random() > 0.5) {
      gameState.particles.push(new Particle(this.x, this.y, this.team, false, 'fire'));
    }
    if (this.target && this.target.hp > 0 && getDistance(this, this.target) < this.radius + this.target.width / 2) {
      const specs = UNIT_SPECS.flamecaller;
      const aoeRadius = this.isSmall ? specs.aoeRadius * 0.6 : specs.aoeRadius;
      const aoeDamage = this.isSmall ? specs.aoeDamage * 0.6 : specs.aoeDamage;
      gameState.animations.push(new AoeExplosion(this.target.x, this.target.y, aoeRadius, aoeDamage, this.team, gameState.units, this.shooter));
      return false;
    }
    for (const enemy of enemies) {
      if (getDistance(this, enemy) < enemy.width / 2 + this.radius) {
        const specs = UNIT_SPECS.flamecaller;
        const aoeRadius = this.isSmall ? specs.aoeRadius * 0.6 : specs.aoeRadius;
        const aoeDamage = this.isSmall ? specs.aoeDamage * 0.6 : specs.aoeDamage;
        gameState.animations.push(new AoeExplosion(this.x, this.y, aoeRadius, aoeDamage, this.team, gameState.units, this.shooter));
        return false;
      }
    }
    return this.x > -this.radius && this.x < uiElements.canvas.width + this.radius && this.y > -this.radius && this.y < uiElements.canvas.height + this.radius;
  }
  draw() {
    uiElements.ctx.fillStyle = this.team === 1 ? '#fb923c' : '#f87171';
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    uiElements.ctx.fill();
    uiElements.ctx.fillStyle = `rgba(255, 255, 100, 0.8)`;
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
    uiElements.ctx.fill();
  }
}"""

proj_js = proj_js.replace(old_fireball, new_fireball)

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(proj_js)
