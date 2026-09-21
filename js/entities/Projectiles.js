import { gameState, uiElements } from '../state.js';
import { UNIT_SPECS } from '../config.js';
import { getDistance, AudioManager } from '../utils.js';
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
    const enemyGuardians = gameState.units.filter(u => u.team !== this.team && (u.type === 'guardian' || u.type === 'force_wall' || u.type === 'absorber' || u.type === 'spartan'));
    for (const guardian of enemyGuardians) {
      if (guardian.type === 'absorber') {
          if (getDistance(this, guardian) < guardian.width / 2 + 15) {
              guardian.takeDamage(this.damage, this.shooter);
              return false;
          }
      } else if (guardian.type === 'force_wall') {
         if (guardian.isReflecting && getDistance(this, guardian) < guardian.width / 2 + 10) {
             this.team = guardian.team;
             this.target = null; 
             this.shooter = guardian;
             this.angle += Math.PI + (Math.random() - 0.5) * Math.PI; // deflected back with wide spread
             const shieldDist = guardian.width / 2 + 8;
             let faceAngle = guardian.team === 1 ? 0 : Math.PI;
             if (guardian.target) faceAngle = Math.atan2(guardian.target.y - guardian.y, guardian.target.x - guardian.x);
             this.x = guardian.x + Math.cos(faceAngle) * shieldDist;
             this.y = guardian.y + Math.sin(faceAngle) * shieldDist;
             return true;
         } else if (!guardian.isReflecting && getDistance(this, guardian) < guardian.width / 2 + 10) {
             guardian.takeDamage(this.damage, this.shooter);
             return false;
         }
      } else {
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
    }
    if (this.target && this.target.hp > 0) {
      this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    }
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;
    for (const enemy of enemies) {
      if (getDistance(this, enemy) < enemy.width / 2 + this.radius) {
        if (this.hitTargets && this.hitTargets.has(enemy)) continue;
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

class Nail extends Projectile {
  constructor(shooter, target, damage, team) {
    super(shooter, target, damage, team);
    this.speed = 15;
    this.radius = 2;
    this.color = '#9ca3af'; // gray
  }
  draw() {
    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    uiElements.ctx.rotate(this.angle);
    uiElements.ctx.fillStyle = this.color;
    uiElements.ctx.fillRect(-4, -1, 8, 2);
    uiElements.ctx.restore();
  }
}

class SentryBullet extends Projectile {
  constructor(shooter, target, damage, team) {
    super(shooter, target, damage, team);
    this.speed = 10;
    this.radius = 3;
    this.color = '#fbbf24'; // yellow
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
    const enemyGuardians = gameState.units.filter(u => u.team !== this.team && (u.type === 'guardian' || u.type === 'force_wall' || u.type === 'absorber' || u.type === 'spartan'));
    for (const guardian of enemyGuardians) {
      if (guardian.type === 'absorber') {
          if (getDistance(this, guardian) < guardian.width / 2 + 15) {
              guardian.takeDamage(this.damage, this.shooter);
              return false;
          }
      } else if (guardian.type === 'force_wall') {
         if (guardian.isReflecting && getDistance(this, guardian) < guardian.width / 2 + 10) {
             this.team = guardian.team;
             this.target = null; 
             this.shooter = guardian;
             this.angle += Math.PI + (Math.random() - 0.5) * Math.PI; // deflected back with wide spread
             const shieldDist = guardian.width / 2 + 8;
             let faceAngle = guardian.team === 1 ? 0 : Math.PI;
             if (guardian.target) faceAngle = Math.atan2(guardian.target.y - guardian.y, guardian.target.x - guardian.x);
             this.x = guardian.x + Math.cos(faceAngle) * shieldDist;
             this.y = guardian.y + Math.sin(faceAngle) * shieldDist;
             return true;
         } else if (!guardian.isReflecting && getDistance(this, guardian) < guardian.width / 2 + 10) {
             guardian.takeDamage(this.damage, this.shooter);
             return false;
         }
      } else {
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
        if (this.hitTargets && this.hitTargets.has(enemy)) continue;
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

class NecromancerSwarmFireball extends Projectile {
  constructor(x, y, target, shooter, angleOffset) {
    super({x, y, color: shooter.color, width: 0}, target, 4, shooter.team);
    this.shooter = shooter;
    this.speed = 8; // Start fast for the burst
    this.radius = 4;
    this.angle = angleOffset;
    this.x = x;
    this.y = y;
    this.timer = 0;
  }
  update(enemies) {
    this.timer += gameState.gameSpeed;
    
    // Spread outward for the first 0.9 seconds (~55 frames)
    if (this.timer < 55) {
        // Decelerate so they don't fly off screen, hovering in the air
        this.speed = Math.max(0.5, this.speed * 0.92);
    } else {
        // Phase 2: Accelerate and seek target
        this.speed = Math.min(10, this.speed + 0.4);
        
        // Find a new target if we don't have one, or if we just entered phase 2
        if (!this.target || this.target.hp <= 0 || this.timer === 55) {
            let closest = null;
            let minDist = Infinity;
            for (const e of enemies) {
                if (e.hp > 0) {
                    const d = getDistance(this, e);
                    if (d < minDist) {
                        minDist = d;
                        closest = e;
                    }
                }
            }
            this.target = closest;
        }

        if (this.target && this.target.hp > 0) {
            const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            const turnSpeed = 0.2 * gameState.gameSpeed;
            let diff = targetAngle - this.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            this.angle += Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);
        }
    }
    
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;
    
    if (Math.random() > 0.5) {
      gameState.particles.push(new Particle(this.x, this.y, this.team, false, 'poison'));
    }
    
    // Only allow collisions during phase 2
    if (this.timer >= 55) {
        for (const enemy of enemies) {
          if (getDistance(this, enemy) < enemy.width / 2 + this.radius) {
            AudioManager.play('small_fireball'); // tiny pop sound
            enemy.takeDamage(this.damage, this.shooter);
            return false;
          }
        }
    }
    return this.x > -100 && this.x < uiElements.canvas.width + 100 && this.y > -100 && this.y < uiElements.canvas.height + 100;
  }
  draw() {
    uiElements.ctx.fillStyle = '#22c55e';
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    uiElements.ctx.fill();
    uiElements.ctx.fillStyle = `rgba(200, 255, 200, 0.8)`;
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
    uiElements.ctx.fill();
  }
}

class NecromancerFireball extends Projectile {
  constructor(shooter, target) {
    super(shooter, target, UNIT_SPECS.necromancer.attackDamage, shooter.team);
    this.speed = 4;
    this.radius = 7;
  }
  update(enemies) {
    if (this.target && this.target.hp > 0) {
      const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      const dist = getDistance(this, this.target);
      if (dist < 80) {
        this.angle = targetAngle;
      } else {
        const turnSpeed = Math.max(0.12, (1 / dist) * 600) * gameState.gameSpeed;
        let diff = targetAngle - this.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        if (Math.abs(diff) < turnSpeed) {
          this.angle = targetAngle;
        } else {
          this.angle += Math.sign(diff) * turnSpeed;
        }
      }
    }
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;
    if (Math.random() > 0.5) {
      gameState.particles.push(new Particle(this.x, this.y, this.team, false, 'poison'));
    }
    for (const enemy of enemies) {
      if (getDistance(this, enemy) < enemy.width / 2 + this.radius) {
        AudioManager.play('fireball_hit');
        
        enemy.takeDamage(this.damage, this.shooter);
        
        // Use setTimeout to push to gameState.projectiles AFTER game.js filter completes
        setTimeout(() => {
            for(let i = 0; i < 4; i++) {
               const spreadAngle = (Math.PI / 2) * i + (Math.PI / 4);
               gameState.projectiles.push(new NecromancerSwarmFireball(this.x, this.y, this.target, this.shooter, spreadAngle));
            }
        }, 0);
        
        return false; // Parent disappears
      }
    }
    return this.x > -this.radius && this.x < uiElements.canvas.width + this.radius && this.y > -this.radius && this.y < uiElements.canvas.height + this.radius;
  }
  draw() {
    uiElements.ctx.fillStyle = '#22c55e';
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    uiElements.ctx.fill();
    uiElements.ctx.fillStyle = `rgba(200, 255, 200, 0.8)`;
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
      const dist = getDistance(this, this.target);
      // Snap directly when close — prevents the orbit bug where a fixed turn speed
      // can't curve fast enough and the fireball just circles the target
      if (dist < 80) {
        this.angle = targetAngle;
      } else {
        // Adaptive turn speed: tighter curve the closer we get
        const turnSpeed = Math.max(0.12, (1 / dist) * 600) * gameState.gameSpeed;
        let diff = targetAngle - this.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        if (Math.abs(diff) < turnSpeed) {
          this.angle = targetAngle;
        } else {
          this.angle += Math.sign(diff) * turnSpeed;
        }
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
      AudioManager.play('fireball_hit');
      gameState.animations.push(new AoeExplosion(this.target.x, this.target.y, aoeRadius, aoeDamage, this.team, gameState.units, this.shooter));
      return false;
    }
    for (const enemy of enemies) {
      if (getDistance(this, enemy) < enemy.width / 2 + this.radius) {
        const specs = UNIT_SPECS.flamecaller;
        const aoeRadius = this.isSmall ? specs.aoeRadius * 0.6 : specs.aoeRadius;
        const aoeDamage = this.isSmall ? specs.aoeDamage * 0.6 : specs.aoeDamage;
        AudioManager.play('fireball_hit');
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
      AudioManager.play('potion_throw');
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
      AudioManager.play('poison_dart');
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
export { Nail };
export { SentryBullet };
export { IceShard };
export { HealingOrb };
export { Arrow };
export { Fireball };
export { PoisonPotion };
export { AntiHealDart };

export class EagleProjectile {
  constructor(caster, target, damage) {
    this.caster = caster;
    this.target = target;
    this.damage = damage;
    this.x = caster.x;
    this.y = caster.y - 15; // start slightly above shoulder
    this.team = caster.team;
    this.speed = UNIT_SPECS.hunter.eagleSpeed || 6.0; // so it reaches targets cleanly with curve
    this.state = 'going'; 
    // Start shooting upwards slightly so it curves down
    this.angle = Math.atan2(target.y - this.y, target.x - this.x) - (Math.PI / 4) * (Math.random() < 0.5 ? 1 : -1);
  }
  update() {
    let destX, destY;
    if (this.state === 'going') {
      if (this.target && this.target.hp > 0) {
        destX = this.target.x;
        destY = this.target.y;
      } else {
        // Target died, return early
        this.state = 'returning';
        destX = this.caster.x;
        destY = this.caster.y;
      }
    } else {
      destX = this.caster.x;
      destY = this.caster.y - 15; // aim for the shoulder
    }
    
    let desiredAngle = Math.atan2(destY - this.y, destX - this.x);
    let diff = desiredAngle - this.angle;
    
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    
    let dist = Math.hypot(destX - this.x, destY - this.y);
    
    // Sharpen the curve aggressively as it gets closer so it never orbits
    let turnRate = 0.08;
    if (dist < 150) turnRate = 0.15;
    if (dist < 80) turnRate = 0.4;
    
    this.angle += diff * turnRate * gameState.gameSpeed;
    
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;
    
    // Eagle feather/wind trail
    if (Math.random() < 0.2) {
      let p = new Particle(this.x, this.y, this.team, false, 'smoke');
      p.life = 10;
      gameState.particles.push(p);
    }
    
    let hitDist = this.state === 'going' && this.target ? (this.target.width / 2 + 10) : 20;
    if (dist < hitDist) {
      if (this.state === 'going') {
        this.target.takeDamage(this.damage, this.caster);
        AudioManager.play('eagle_bite');
        this.state = 'returning';
        // Add a bit of arc when flying back!
        this.angle = Math.atan2(this.caster.y - this.y, this.caster.x - this.x) + (Math.PI / 3) * (Math.random() < 0.5 ? 1 : -1);
      } else {
        // Returned to caster, despawn
        this.caster.eagleOut = false;
        return false;
      }
    }
    return true;
  }
  draw() {
    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    uiElements.ctx.rotate(this.angle); // use actual movement angle
    
    // Draw an eagle-like shape (scaled up by 1.6x for visibility)
    uiElements.ctx.fillStyle = '#8B4513'; 
    uiElements.ctx.beginPath();
    uiElements.ctx.moveTo(16, 0); // Beak
    uiElements.ctx.lineTo(-10, 13); // Right Wing
    uiElements.ctx.lineTo(-5, 0); // Tail
    uiElements.ctx.lineTo(-10, -13); // Left Wing
    uiElements.ctx.closePath();
    uiElements.ctx.fill();
    
    // Head accent
    uiElements.ctx.fillStyle = '#FFFFFF';
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(6, 0, 4.5, 0, Math.PI * 2);
    uiElements.ctx.fill();
    
    uiElements.ctx.restore();
  }
}

export class PenetratingBeam {
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

  update(enemies) {
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;

    
    let hitWall = false;
    let reflected = false;
    gameState.units.forEach(unit => {
      if (unit.team !== this.team && unit.hp > 0 && !this.hitTargets.has(unit)) {
        const dx = this.x - unit.x;
        const dy = this.y - unit.y;
        if (Math.sqrt(dx * dx + dy * dy) <= unit.width / 2 + this.radius) {
          if (unit.type === 'force_wall' && unit.isReflecting) {
             this.team = unit.team;
             this.angle += Math.PI + (Math.random() - 0.5) * Math.PI; // deflected back with wide spread
             this.shooter = unit;
             this.hitTargets.clear();
             reflected = true;
             const shieldDist = unit.width / 2 + 8;
             let faceAngle = unit.team === 1 ? 0 : Math.PI;
             if (unit.target) faceAngle = Math.atan2(unit.target.y - unit.y, unit.target.x - unit.x);
             this.x = unit.x + Math.cos(faceAngle) * shieldDist;
             this.y = unit.y + Math.sin(faceAngle) * shieldDist;
          } else {
             unit.takeDamage(this.damage, this.shooter);
             this.hitTargets.add(unit);
             if (unit.type === 'force_wall' || unit.type === 'absorber') {
                 hitWall = true;
             }
          }
        }
      }
    });

    if (hitWall && !reflected) return false; // stop beam if it hit a wall and wasn't reflected

    if (this.x < 0 || this.x > uiElements.canvas.width || this.y < 0 || this.y > uiElements.canvas.height) {
      return false;
    }
    return true;
  }

  draw() {
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

export class ChainProjectile extends Projectile {
  constructor(shooter, target, damage, team, side = 1) {
    super(shooter, target, damage, team);
    this.speed = 16;
    this.radius = 4;
    this.side = side;
  }
  
  update(enemies) {
    if (this.returning && this.shooter && this.shooter.hp > 0) {
       this.angle = Math.atan2(this.shooter.y - this.y, this.shooter.x - this.x);
       this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed * 1.5;
       this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed * 1.5;
       if (getDistance(this, this.shooter) < this.shooter.width/2 + this.radius + 15) {
           return false; // Despawn when it reaches shooter
       }
       return true;
    }
    
    // Bounds check to force return if it misses
    if (!this.returning && (this.x < -50 || this.x > uiElements.canvas.width + 50 || this.y < -50 || this.y > uiElements.canvas.height + 50)) {
        if (this.shooter && this.shooter.hp > 0) {
            this.returning = true;
            return true;
        } else {
            return false;
        }
    }

    // Deflection logic (copied from base)
    const enemyGuardians = gameState.units.filter(u => u.team !== this.team && (u.type === 'guardian' || u.type === 'force_wall' || u.type === 'absorber'));
    for (const guardian of enemyGuardians) {
      if (guardian.type === 'absorber') {
          if (getDistance(this, guardian) < guardian.width / 2 + 15) {
              guardian.takeDamage(this.damage, this.shooter);
              return false;
          }
      } else if (guardian.type === 'force_wall') {
         if (guardian.isReflecting && getDistance(this, guardian) < guardian.width / 2 + 10) {
             this.team = guardian.team;
             this.target = null; 
             this.shooter = guardian;
             this.angle += Math.PI + (Math.random() - 0.5) * Math.PI;
             const shieldDist = guardian.width / 2 + 8;
             let faceAngle = guardian.team === 1 ? 0 : Math.PI;
             if (guardian.target) faceAngle = Math.atan2(guardian.target.y - guardian.y, guardian.target.x - guardian.x);
             this.x = guardian.x + Math.cos(faceAngle) * shieldDist;
             this.y = guardian.y + Math.sin(faceAngle) * shieldDist;
             return true;
         } else if (!guardian.isReflecting && getDistance(this, guardian) < guardian.width / 2 + 10) {
             guardian.takeDamage(this.damage, this.shooter);
             return false;
         }
      } else {
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
    }
    
    if (this.target && this.target.hp > 0) {
      this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    }
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;
    
    for (const enemy of enemies) {
      if (getDistance(this, enemy) < enemy.width / 2 + this.radius) {
        if (this.hitTargets && this.hitTargets.has(enemy)) continue;
        
        let actualDamage = this.damage;
        let isLocked = false;
        if (this.shooter && this.shooter.type === 'restrictor') {
            isLocked = enemy.stunType === 'restrict' && Date.now() < enemy.stunnedUntil;
            if (isLocked) {
                actualDamage *= 2;
                gameState.animations.push(new FloatingText("CRIT!", enemy.x, enemy.y - 20, "#ef4444"));
            }
        }
        
        enemy.takeDamage(actualDamage, this.shooter);
        
        // Custom restrictor logic
        if (this.shooter && this.shooter.type === 'restrictor') {
            if (!isLocked) {
                if (!enemy.restrictorHitCount) enemy.restrictorHitCount = {};
                enemy.restrictorHitCount[this.shooter.id] = (enemy.restrictorHitCount[this.shooter.id] || 0) + 1;
                
                // 8 hits = 4 full attacks
                if (enemy.restrictorHitCount[this.shooter.id] >= 8) {
                    enemy.restrictorHitCount[this.shooter.id] = 0;
                    enemy.stunnedUntil = Date.now() + 10000; // 10 seconds!
                    enemy.stunType = 'restrict';
                    gameState.animations.push(new FloatingText("LOCKED!", enemy.x, enemy.y - 30, "#a855f7"));
                    AudioManager.play('chain_lock');
                } else {
                    if (Math.random() > 0.5) AudioManager.play('chain_hit_1');
                    else AudioManager.play('chain_hit_2');
                }
            } else {
                if (Math.random() > 0.5) AudioManager.play('chain_hit_1');
                else AudioManager.play('chain_hit_2');
            }
        }
        
        // Return to shooter instead of disappearing
        if (this.shooter && this.shooter.hp > 0 && !this.returning) {
            this.returning = true;
            this.hitTargets = this.hitTargets || new Set();
            this.hitTargets.add(enemy);
            return true; 
        } else {
            return false;
        }
      }
    }
    return this.x > -this.radius && this.x < uiElements.canvas.width + this.radius && this.y > -this.radius && this.y < uiElements.canvas.height + this.radius;
  }
  
  draw() {
    if (this.shooter && this.shooter.hp > 0) {
      let faceAngle = this.shooter.team === 1 ? 0 : Math.PI;
      if (this.shooter.target) {
          faceAngle = Math.atan2(this.shooter.target.y - this.shooter.y, this.shooter.target.x - this.shooter.x);
      }
      
      // Calculate hand offset
      const handDist = this.shooter.width / 2 + 2;
      const handOffsetDist = 10;
      const handX = this.shooter.x + Math.cos(faceAngle) * handDist + Math.cos(faceAngle - Math.PI / 2 * this.side) * handOffsetDist;
      const handY = this.shooter.y + Math.sin(faceAngle) * handDist + Math.sin(faceAngle - Math.PI / 2 * this.side) * handOffsetDist;
      
      uiElements.ctx.save();
      uiElements.ctx.strokeStyle = '#94a3b8'; 
      uiElements.ctx.lineWidth = 3;
      uiElements.ctx.setLineDash([10, 6]); // smooth broken line

      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(handX, handY);
      
      const midX = (handX + this.x) / 2;
      const midY = (handY + this.y) / 2;
      const dx = this.x - handX;
      const dy = this.y - handY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      // alternate curve direction based on side
      const curveOffset = dist * -0.1 * this.side;
      const perpX = -dy / (dist || 1) * curveOffset;
      const perpY = dx / (dist || 1) * curveOffset;
      
      uiElements.ctx.quadraticCurveTo(midX + perpX, midY + perpY, this.x, this.y);
      uiElements.ctx.stroke();
      uiElements.ctx.restore();
    }
    
    // Draw sharp point at the end of the chain
    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    uiElements.ctx.rotate(this.angle);
    uiElements.ctx.fillStyle = '#94a3b8';
    uiElements.ctx.beginPath();
    uiElements.ctx.moveTo(8, 0); // sharp tip
    uiElements.ctx.lineTo(-4, 5);
    uiElements.ctx.lineTo(-4, -5);
    uiElements.ctx.closePath();
    uiElements.ctx.fill();
    uiElements.ctx.restore();
  }
}

export class AbsorbOrb extends Projectile {
  constructor(shooter, target, damage, team) {
    super(shooter, target, damage, team);
    this.speed = 4;
    this.radius = 15;
  }
  
  draw() {
    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    
    // Pulse animation
    const scale = 1 + 0.2 * Math.sin(Date.now() / 100);
    uiElements.ctx.scale(scale, scale);

    // Glow
    uiElements.ctx.shadowBlur = 15;
    uiElements.ctx.shadowColor = 'rgba(217, 70, 239, 0.9)'; // Purple/Pink

    // Core
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    uiElements.ctx.fillStyle = 'rgba(168, 85, 247, 1)';
    uiElements.ctx.fill();

    // Inner bright core
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(0, 0, this.radius / 2, 0, Math.PI * 2);
    uiElements.ctx.fillStyle = '#fff';
    uiElements.ctx.fill();

    uiElements.ctx.restore();
  }
}


export { NecromancerFireball };

