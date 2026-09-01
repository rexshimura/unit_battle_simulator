import { gameState, uiElements } from '../state.js';
import { UNIT_SPECS } from '../config.js';
import { getDistance } from '../utils.js';
import { PoisonSplashAnimation, AoeExplosion, Particle, FloatingText } from './Effects.js';

class Projectile {
  constructor(shooter, target, damage, team) {
    this.shooter = shooter;
    this.target = target;
    this.damage = damage;
    this.team = team;
    this.color = shooter.color;
    this.speed = 12;
    this.radius = 4;
    this.angle = Math.atan2(this.target.y - shooter.y, this.target.x - shooter.x);
    const nozzleTipDist = shooter.width / 2 + 8;
    this.x = shooter.x + Math.cos(this.angle) * nozzleTipDist;
    this.y = shooter.y + Math.sin(this.angle) * nozzleTipDist;
  }
  update(enemies) {
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
    if (this.target && this.target.hp > 0) {
      this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    }
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;
    for (const enemy of enemies) {
      if (getDistance(this, enemy) < enemy.width / 2 + this.radius) {
        enemy.takeDamage(this.damage, this.shooter);
        return false;
      }
    }
    return this.x > -this.radius && this.x < uiElements.canvas.width + this.radius && this.y > -this.radius && this.y < uiElements.canvas.height + this.radius;
  }
  draw() {
    uiElements.ctx.fillStyle = this.color;
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    uiElements.ctx.fill();
  }
}

class IceShard extends Projectile {
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
}

class HealingOrb extends Projectile {
  constructor(shooter, target) {
    const specs = UNIT_SPECS.druid;
    super(shooter, target, 0, shooter.team);
    this.healAmount = specs.healAmount;
    this.speed = 4;
    this.radius = 6;
  }
  update(allies) {
    if (this.target && this.target.hp > 0) {
      this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    } else {
      return false;
    }
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;
    if (getDistance(this, this.target) < this.target.width / 2 + this.radius) {
      let healedAmount = Math.min(this.target.maxHp - this.target.hp, this.healAmount);
      if (this.target.buffs.healingReduced) {
        healedAmount *= 1 - this.target.buffs.healingReduced.amount;
      }
      this.target.hp += healedAmount;
      this.shooter.healingDone += healedAmount;
      if (healedAmount > 0) {
        gameState.animations.push(new FloatingText(`+${Math.round(healedAmount)}`, this.target.x, this.target.y, '#4ade80'));
      }
      for (let i = 0; i < 8; i++) gameState.particles.push(new Particle(this.target.x, this.target.y, this.team, true, 'heal'));
      return false;
    }
    return this.x > -this.radius && this.x < uiElements.canvas.width + this.radius && this.y > -this.radius && this.y < uiElements.canvas.height + this.radius;
  }
  draw() {
    uiElements.ctx.fillStyle = this.team === 1 ? 'rgba(74, 222, 128, 0.8)' : 'rgba(163, 230, 53, 0.8)';
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    uiElements.ctx.fill();
    uiElements.ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
    uiElements.ctx.fill();
  }
}

class Arrow extends Projectile {
  constructor(shooter, target) {
    const specs = UNIT_SPECS.archer;
    super(shooter, target, specs.attackDamage, shooter.team);
    this.speed = 6;
    this.length = 15;
  }
  draw() {
    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    uiElements.ctx.rotate(this.angle);
    uiElements.ctx.strokeStyle = this.team === 1 ? '#56c5d6' : '#fca5a5';
    uiElements.ctx.lineWidth = 2;
    uiElements.ctx.beginPath();
    uiElements.ctx.moveTo(-this.length / 2, 0);
    uiElements.ctx.lineTo(this.length / 2, 0);
    uiElements.ctx.stroke();
    uiElements.ctx.fillStyle = this.team === 1 ? '#eb897f' : '#fecaca';
    uiElements.ctx.beginPath();
    uiElements.ctx.moveTo(this.length / 2, 0);
    uiElements.ctx.lineTo(this.length / 2 - 5, -3);
    uiElements.ctx.lineTo(this.length / 2 - 5, 3);
    uiElements.ctx.closePath();
    uiElements.ctx.fill();
    uiElements.ctx.restore();
  }
}

class Fireball extends Projectile {
  constructor(shooter, target, isSmall = false, angleOffset = 0) {
    const specs = UNIT_SPECS.flamecaller;
    super(shooter, target, isSmall ? specs.attackDamage / 2 : specs.attackDamage, shooter.team);
    this.speed = isSmall ? 4.5 : 3;
    this.radius = isSmall ? 4 : 8;
    this.isSmall = isSmall;
    this.angle += angleOffset;
    this.creationTime = Date.now();
  }
  update(enemies) {
    if (this.isSmall && this.target && this.target.hp > 0 && Date.now() - this.creationTime > 250) {
      const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      const turnSpeed = 0.08 * gameState.gameSpeed;
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
}

class PoisonPotion extends Projectile {
  constructor(shooter, target) {
    const specs = UNIT_SPECS.alchemist;
    super(shooter, target, specs.attackDamage, shooter.team);
    this.speed = 3;
    this.rotation = 0;
    this.targetPos = {
      x: target.x,
      y: target.y
    };
  }
  update(enemies) {
    this.rotation += 0.2 * gameState.gameSpeed;
    const distToTarget = getDistance(this, this.targetPos);
    if (distToTarget < this.speed * gameState.gameSpeed) {
      const specs = UNIT_SPECS.alchemist;
      gameState.animations.push(new PoisonSplashAnimation(this.x, this.y, specs.poisonAoeRadius, this.team, this.shooter));
      return false;
    }
    const angle = Math.atan2(this.targetPos.y - this.y, this.targetPos.x - this.x);
    this.x += Math.cos(angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(angle) * this.speed * gameState.gameSpeed;
    if (Math.random() < 0.2) {
      gameState.particles.push(new Particle(this.x, this.y, this.team, false, 'poison'));
    }
    return this.x > -this.radius && this.x < uiElements.canvas.width + this.radius && this.y > -this.radius && this.y < uiElements.canvas.height + this.radius;
  }
  draw() {
    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    uiElements.ctx.rotate(this.rotation);
    const flaskBodyWidth = 10;
    uiElements.ctx.fillStyle = this.team === 1 ? '#a3e635' : '#facc15';
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(0, 0, flaskBodyWidth / 2, 0, Math.PI * 2);
    uiElements.ctx.fill();
    uiElements.ctx.fillStyle = 'rgba(200, 220, 255, 0.4)';
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(0, 0, flaskBodyWidth / 2, 0, Math.PI * 2);
    uiElements.ctx.fill();
    uiElements.ctx.restore();
  }
}

class AntiHealDart extends Projectile {
  constructor(shooter, target) {
    super(shooter, target, 0, shooter.team);
    this.speed = 7;
  }
  update(enemies) {
    if (!this.target || this.target.hp <= 0) return false;
    const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    this.x += Math.cos(angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(angle) * this.speed * gameState.gameSpeed;
    if (getDistance(this, this.target) < this.target.width / 2) {
      const specs = UNIT_SPECS.alchemist;
      this.target.buffs.healingReduced = {
        expires: Date.now() + specs.healReductionDuration,
        duration: specs.healReductionDuration,
        amount: specs.healReductionAmount
      };
      for (let i = 0; i < 8; i++) {
        gameState.particles.push(new Particle(this.target.x, this.target.y, this.team, true, 'poison'));
      }
      return false;
    }
    return this.x > -this.radius && this.x < uiElements.canvas.width + this.radius && this.y > -this.radius && this.y < uiElements.canvas.height + this.radius;
  }
  draw() {
    const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    uiElements.ctx.rotate(angle);
    const length = 10;
    uiElements.ctx.strokeStyle = '#d946ef';
    uiElements.ctx.lineWidth = 2;
    uiElements.ctx.beginPath();
    uiElements.ctx.moveTo(-length / 2, 0);
    uiElements.ctx.lineTo(length / 2, 0);
    uiElements.ctx.stroke();
    uiElements.ctx.restore();
  }
}

export { Projectile };
export { IceShard };
export { HealingOrb };
export { Arrow };
export { Fireball };
export { PoisonPotion };
export { AntiHealDart };
