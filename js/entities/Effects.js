import { gameState, uiElements } from '../state.js';
import { getDistance, drawLightningBolt, AudioManager } from '../utils.js';
import { UNIT_SPECS } from '../config.js';

class PoisonSplashAnimation {
  constructor(x, y, radius, team, caster) {
    this.x = x;
    this.y = y;
    this.maxRadius = radius;
    this.team = team;
    this.caster = caster;
    this.duration = 40;
    this.maxDuration = 40;
    const specs = UNIT_SPECS.alchemist;
    const enemies = gameState.units.filter(u => u.team !== this.team);
    enemies.forEach(enemy => {
      if (getDistance(this, enemy) < this.maxRadius) {
        enemy.takeDamage(specs.attackDamage, this.caster);
        enemy.buffs.poison = {
          expires: Date.now() + specs.poisonDuration,
          dps: specs.dps,
          caster: this.caster,
          killAwarded: false
        };
      }
    });
    for (let i = 0; i < this.maxRadius / 2; i++) {
      gameState.particles.push(new Particle(this.x, this.y, this.team, true, 'poison'));
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
    uiElements.ctx.fillStyle = this.team === 1 ? `rgba(132, 204, 22, ${alpha * 0.5})` : `rgba(202, 138, 4, ${alpha * 0.5})`;
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
    uiElements.ctx.fill();
  }
}

class SlashAnimation {
  constructor(caster, color = '255, 255, 255') {
    this.caster = caster;
    this.color = color;
    this.angle = Math.atan2(caster.target.y - caster.y, caster.target.x - caster.x);
    this.radius = caster.attackRange * 1.5;
    this.duration = 15;
    this.maxDuration = 15;
  }
  update() {
    this.duration -= 1 * gameState.gameSpeed;
    if (this.duration > this.maxDuration / 2 && Math.random() > 0.5) {
      const progress = 1 - this.duration / this.maxDuration;
      const arcWidth = Math.PI / 1.5;
      const particleAngle = this.angle - arcWidth / 2 + arcWidth * progress;
      const pX = this.caster.x + Math.cos(particleAngle) * this.radius;
      const pY = this.caster.y + Math.sin(particleAngle) * this.radius;
      gameState.particles.push(new Particle(pX, pY, this.caster.team));
    }
    return this.duration > 0;
  }
  draw() {
    const progress = 1 - this.duration / this.maxDuration;
    const alpha = Math.sin(progress * Math.PI);
    const arcWidth = Math.PI / 1.5;
    uiElements.ctx.save();
    uiElements.ctx.translate(this.caster.x, this.caster.y);
    uiElements.ctx.rotate(this.angle - arcWidth / 2);
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(0, 0, this.radius, 0, arcWidth * progress);
    uiElements.ctx.strokeStyle = `rgba(${this.color}, ${alpha * 0.8})`;
    uiElements.ctx.lineWidth = 1 + 3 * alpha;
    uiElements.ctx.stroke();
    uiElements.ctx.restore();
  }
}

class ThrustAnimation {
  constructor(caster, target) {
    this.caster = caster;
    this.target = target;
    this.angle = Math.atan2(target.y - caster.y, target.x - caster.x);
    this.duration = 15;
    this.maxDuration = 15;
    for (let i = 0; i < 5; i++) {
      gameState.particles.push(new Particle(this.target.x, this.target.y, this.caster.team, true));
    }
  }
  update() {
    this.duration -= 1 * gameState.gameSpeed;
    return this.duration > 0;
  }
  draw() {
    const progress = 1 - this.duration / this.maxDuration;
    const alpha = Math.sin(progress * Math.PI);
    const startX = this.caster.x + Math.cos(this.angle) * this.caster.width / 2;
    const startY = this.caster.y + Math.sin(this.angle) * this.caster.width / 2;
    const endX = this.target.x - Math.cos(this.angle) * this.target.width / 2;
    const endY = this.target.y - Math.sin(this.angle) * this.target.height / 2;
    const currentX = startX + (endX - startX) * progress;
    const currentY = startY + (endY - startY) * progress;
    uiElements.ctx.beginPath();
    uiElements.ctx.moveTo(startX, startY);
    uiElements.ctx.lineTo(currentX, currentY);
    uiElements.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
    uiElements.ctx.lineWidth = 2;
    uiElements.ctx.stroke();
  }
}

class AoeExplosion {
  constructor(x, y, radius, damage, team, allUnits, caster) {
    this.x = x;
    this.y = y;
    this.maxRadius = radius;
    this.duration = 40;
    this.maxDuration = 40;
    const enemies = allUnits.filter(u => u.team !== team);
    enemies.forEach(unit => {
      if (getDistance(this, unit) <= this.maxRadius) {
        unit.takeDamage(damage, caster);
      }
    });
    for (let i = 0; i < 30; i++) {
      gameState.particles.push(new Particle(this.x, this.y, team, true, 'fire'));
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
    uiElements.ctx.fillStyle = `rgba(255, 100, 0, ${alpha * 0.5})`;
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
    uiElements.ctx.fill();
    if (progress < 1) {
      uiElements.ctx.strokeStyle = `rgba(255, 165, 0, ${alpha * 0.7})`;
      uiElements.ctx.lineWidth = 2;
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(this.x, this.y, this.maxRadius, 0, Math.PI * 2);
      uiElements.ctx.stroke();
    }
  }
}

class AoeHeal {
  constructor(x, y, radius, healAmount, team, allUnits, caster, armorBonus, armorDuration, isLightHeal = false) {
    this.x = x;
    this.y = y;
    this.maxRadius = isLightHeal ? radius * 1.2 : radius;
    this.duration = 80;
    this.maxDuration = 80;
    this.isLightHeal = isLightHeal;
    allUnits.forEach(unit => {
      if (unit.team === team && getDistance(this, unit) <= this.maxRadius) {
        if (unit.hp < unit.maxHp) {
          let actualHeal = Math.min(unit.maxHp - unit.hp, healAmount);
          if (unit.buffs.healingReduced) {
            actualHeal *= 1 - unit.buffs.healingReduced.amount;
          }
          unit.hp += actualHeal;
          caster.healingDone += actualHeal;
          gameState.animations.push(new FloatingText(`+${Math.round(actualHeal)}`, unit.x, unit.y, this.isLightHeal ? '#fef08a' : '#facc15'));
        }
        if (this.isLightHeal && armorBonus > 0) {
          unit.armor = Math.min(unit.maxHp, unit.armor + armorBonus);
          unit.buffs.armor = {
            expires: Date.now() + armorDuration,
            duration: armorDuration
          };
          gameState.animations.push(new FloatingText(`+${Math.round(armorBonus)}`, unit.x, unit.y - 15, '#67e8f9'));
        }
      }
    });
  }
  update() {
    this.duration -= 1 * gameState.gameSpeed;
    return this.duration > 0;
  }
  draw() {
    const progress = 1 - this.duration / this.maxDuration;
    const currentRadius = this.maxRadius * progress;
    const alpha = Math.sin(progress * Math.PI);
    const color = this.isLightHeal ? `rgba(254, 240, 138, ${alpha * 0.9})` : `rgba(250, 204, 21, ${alpha * 0.8})`;
    const lineWidth = this.isLightHeal ? 6 : 4;
    uiElements.ctx.strokeStyle = color;
    uiElements.ctx.lineWidth = lineWidth;
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
    uiElements.ctx.stroke();
    if (this.isLightHeal) {
      uiElements.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
      uiElements.ctx.lineWidth = 2;
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(this.x, this.y, currentRadius * 0.8, 0, Math.PI * 2);
      uiElements.ctx.stroke();
    }
  }
}

class MultiHealAura {
  constructor(caster, allUnits) {
    this.caster = caster;
    this.specs = UNIT_SPECS.druid;
    this.duration = this.specs.multiHealDuration;
    this.maxDuration = this.specs.multiHealDuration;
    this.targets = [];
    const potentialTargets = allUnits.filter(u => u.team === caster.team && u !== caster && u.hp < u.maxHp);
    potentialTargets.sort((a, b) => getDistance(caster, a) - getDistance(caster, b));
    this.targets = potentialTargets.slice(0, this.specs.multiHealTargets);
    this.targets.forEach(target => {
      target.buffs.druidHeal = {
        caster: this.caster,
        healPerTick: this.specs.multiHealAmount,
        expires: Date.now() + this.specs.multiHealDuration,
        healedSinceLastText: 0,
        nextTextTime: Date.now() + 1000
      };
    });
  }
  update() {
    this.duration -= 1000 / 60 * gameState.gameSpeed;
    if (this.duration <= 0) {
      this.targets.forEach(t => {
        if (t.buffs.druidHeal && t.buffs.druidHeal.caster === this.caster) {
          delete t.buffs.druidHeal;
        }
      });
      return false;
    }
    return true;
  }
  draw() {
    if (this.caster.hp <= 0) return;
    const alpha = Math.max(0, this.duration / this.maxDuration);
    this.targets.forEach(target => {
      if (target.hp > 0) {
        uiElements.ctx.beginPath();
        uiElements.ctx.moveTo(this.caster.x, this.caster.y);
        uiElements.ctx.lineTo(target.x, target.y);
        uiElements.ctx.strokeStyle = `rgba(74, 222, 128, ${0.1 + alpha * 0.2})`;
        uiElements.ctx.lineWidth = 6;
        uiElements.ctx.stroke();
        uiElements.ctx.strokeStyle = `rgba(134, 239, 172, ${0.3 + alpha * 0.3})`;
        uiElements.ctx.lineWidth = 2;
        uiElements.ctx.stroke();
        if (Math.random() < 0.2) {
          gameState.particles.push(new Particle(target.x, target.y, this.caster.team, false, 'heal'));
        }
      }
    });
  }
}

class GroundSmashAnimation {
  constructor(caster, radius, damage, stunDuration, allUnits) {
    this.caster = caster;
    this.x = caster.x;
    this.y = caster.y;
    this.maxRadius = radius;
    this.duration = 60;
    this.maxDuration = 60;
    this.caster.isSmashing = true;
    this.caster.smashAnimProgress = this.caster.smashAnimDuration;
    const enemies = allUnits.filter(u => u.team !== caster.team);
    enemies.forEach(unit => {
      if (getDistance(this, unit) <= this.maxRadius) {
        unit.takeDamage(damage, caster);
        unit.stunnedUntil = Date.now() + stunDuration;
      }
    });
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * this.maxRadius;
      const pX = this.x + Math.cos(angle) * dist;
      const pY = this.y + Math.sin(angle) * dist;
      gameState.particles.push(new Particle(pX, pY, caster.team, false, 'rock'));
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
    uiElements.ctx.strokeStyle = `rgba(168, 162, 158, ${alpha * 0.8})`;
    uiElements.ctx.lineWidth = 5 * alpha;
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
    uiElements.ctx.stroke();
  }
}

class TrollSmashAnimation extends GroundSmashAnimation {
  constructor(caster, radius, damage, stunDuration, knockback, allUnits) {
    super(caster, radius, 0, stunDuration, allUnits);
    const specs = UNIT_SPECS.troll;
    const enemies = allUnits.filter(u => u.team !== caster.team);
    enemies.forEach(unit => {
      if (getDistance(this, unit) <= this.maxRadius) {
        unit.takeDamage(damage, caster, true);
        const angle = Math.atan2(unit.y - this.y, unit.x - this.x);
        const targetX = unit.x + Math.cos(angle) * knockback;
        const targetY = unit.y + Math.sin(angle) * knockback;
        const unitRadius = unit.width / 2;
        unit.knockbackTargetX = Math.max(unitRadius, Math.min(targetX, uiElements.canvas.width - unitRadius));
        unit.knockbackTargetY = Math.max(unitRadius, Math.min(targetY, uiElements.canvas.height - unitRadius));
        unit.isBeingKnockedBack = true;
        unit.buffs.slow = {
          expires: Date.now() + specs.smashSlowDuration,
          amount: specs.smashSlowAmount
        };
      }
    });
  }
}

class ShiverWaveAnimation {
  constructor(caster, allUnits, waveDamage, freezeStacksApplied) {
    this.startX = caster.x;
    this.startY = caster.y;
    this.team = caster.team;
    this.caster = caster;
    this.specs = UNIT_SPECS.cryomancer;
    this.angle = caster.target ? Math.atan2(caster.target.y - caster.y, caster.target.x - caster.x) : caster.team === 1 ? 0 : Math.PI;
    this.duration = 180; // Slower! (3 seconds)
    this.maxDuration = 180;
    this.hitUnits = [];
    this.waveDamage = waveDamage;
    this.freezeStacksApplied = freezeStacksApplied;
  }
  update() {
    this.duration -= 1 * gameState.gameSpeed;
    const enemies = gameState.units.filter(u => u.team !== this.team);
    const waveProgress = 1 - this.duration / this.maxDuration;
    const maxWaveRange = this.specs.attackRange * 2.0; // Wave travels twice as far as attack range
    const currentDist = maxWaveRange * waveProgress;
    
    if (this.duration > 0) {
      // Spawn particles along the advancing edge
      const particleAngle = this.angle - Math.PI / 4 + Math.random() * Math.PI / 2;
      const pX = this.startX + Math.cos(particleAngle) * currentDist;
      const pY = this.startY + Math.sin(particleAngle) * currentDist;
      gameState.particles.push(new Particle(pX, pY, this.team, false, 'ice'));
      
      // Additional dense particles for a cooler wave
      if (Math.random() < 0.5) {
          const pAngle2 = this.angle - Math.PI / 4 + Math.random() * Math.PI / 2;
          const pX2 = this.startX + Math.cos(pAngle2) * currentDist;
          const pY2 = this.startY + Math.sin(pAngle2) * currentDist;
          let p = new Particle(pX2, pY2, this.team, false, 'snow');
          p.life = 15; // short life
          gameState.particles.push(p);
      }
    }
    
    enemies.forEach(enemy => {
      if (this.hitUnits.includes(enemy.id)) return;
      const d = getDistance({x: this.startX, y: this.startY}, enemy);
      // The "hitbox" is the ring of the wave between currentDist - 60 and currentDist
      if (d <= currentDist && d >= currentDist - 60) {
        const angleToEnemy = Math.atan2(enemy.y - this.startY, enemy.x - this.startX);
        let angleDiff = Math.abs(this.angle - angleToEnemy);
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        if (Math.abs(angleDiff) <= Math.PI / 4) { // 90 degree cone
          this.hitUnits.push(enemy.id);
          enemy.takeDamage(this.waveDamage, this.caster);
          enemy.coldStacks = (enemy.coldStacks || 0) + this.freezeStacksApplied;
          enemy.buffs.chilled = {
            expires: Date.now() + this.specs.chillDuration
          };
          if (enemy.coldStacks >= this.specs.freezeTriggerCount) {
            enemy.coldStacks = 0;
            delete enemy.buffs.chilled;
            enemy.stunnedUntil = Date.now() + this.specs.freezeDuration;
            enemy.stunType = 'freeze';
            AudioManager.play('freeze');
            for (let i = 0; i < 25; i++) gameState.particles.push(new Particle(enemy.x, enemy.y, this.team, true, 'snow'));
          }
        }
      }
    });
    return this.duration > 0;
  }
  draw() {
    const progress = 1 - this.duration / this.maxDuration;
    const maxWaveRange = this.specs.attackRange * 2.0; 
    const currentRadius = maxWaveRange * progress;
    // Fade in initially, fade out at end
    let alpha = 1.0;
    if (progress < 0.1) alpha = progress / 0.1;
    if (progress > 0.8) alpha = (1 - progress) / 0.2;
    
    uiElements.ctx.save();
    uiElements.ctx.translate(this.startX, this.startY);
    uiElements.ctx.rotate(this.angle);
    const coneAngle = Math.PI / 4;
    
    // Draw the main body of the wave
    const gradient = uiElements.ctx.createRadialGradient(0, 0, Math.max(0.1, currentRadius - 60), 0, 0, currentRadius);
    gradient.addColorStop(0, `rgba(165, 243, 252, 0)`);
    gradient.addColorStop(0.8, `rgba(165, 243, 252, ${alpha * 0.15})`);
    gradient.addColorStop(1, `rgba(103, 232, 249, ${alpha * 0.6})`);
    
    uiElements.ctx.fillStyle = gradient;
    uiElements.ctx.beginPath();
    uiElements.ctx.moveTo(0, 0);
    uiElements.ctx.arc(0, 0, currentRadius, -coneAngle, coneAngle);
    uiElements.ctx.closePath();
    uiElements.ctx.fill();
    
    // Draw the bright leading edge
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(0, 0, currentRadius, -coneAngle, coneAngle);
    uiElements.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
    uiElements.ctx.lineWidth = 4;
    uiElements.ctx.stroke();
    
    // Draw an inner icy edge
    if (currentRadius > 10) {
        uiElements.ctx.beginPath();
        uiElements.ctx.arc(0, 0, currentRadius - 10, -coneAngle, coneAngle);
        uiElements.ctx.strokeStyle = `rgba(103, 232, 249, ${alpha * 0.7})`;
        uiElements.ctx.lineWidth = 8;
        uiElements.ctx.stroke();
    }
    
    uiElements.ctx.restore();
  }
}

class ChainLightning {
  constructor(caster, initialTarget, allUnits) {
    this.caster = caster;
    this.duration = 30;
    this.maxDuration = 30;
    this.team = caster.team;
    const specs = UNIT_SPECS.wizard;
    this.targets = [initialTarget];
    let lastTarget = initialTarget;
    const potentialTargets = allUnits.filter(u => u.team !== this.team && u.hp > 0 && !this.targets.includes(u));
    for (let i = 0; i < specs.chainTargets - 1; i++) {
      let nextTarget = null;
      let minDistance = specs.chainRange;
      for (const p of potentialTargets) {
        const d = getDistance(lastTarget, p);
        if (d < minDistance) {
          minDistance = d;
          nextTarget = p;
        }
      }
      if (nextTarget) {
        this.targets.push(nextTarget);
        potentialTargets.splice(potentialTargets.indexOf(nextTarget), 1);
        lastTarget = nextTarget;
      } else {
        break;
      }
    }
    this.targets.forEach(target => {
      target.takeDamage(specs.attackDamage, this.caster);
    });
  }
  update() {
    this.duration -= 1 * gameState.gameSpeed;
    if (Math.random() < 0.8) {
      const from = this.caster;
      const to = this.targets[0];
      const p = Math.random();
      const x = from.x + (to.x - from.x) * p;
      const y = from.y + (to.y - from.y) * p;
      gameState.particles.push(new Particle(x, y, this.team, false, 'electric'));
      for (let i = 0; i < this.targets.length - 1; i++) {
        const p = Math.random();
        const x = this.targets[i].x + (this.targets[i + 1].x - this.targets[i].x) * p;
        const y = this.targets[i].y + (this.targets[i + 1].y - this.targets[i].y) * p;
        gameState.particles.push(new Particle(x, y, this.team, false, 'electric'));
      }
    }
    return this.duration > 0;
  }
  draw() {
    const alpha = Math.max(0, this.duration / this.maxDuration);
    uiElements.ctx.save();
    uiElements.ctx.filter = 'blur(4px)';
    uiElements.ctx.strokeStyle = `rgba(139, 92, 246, ${alpha * 0.5})`;
    uiElements.ctx.lineWidth = 7;
    drawLightningBolt(this.caster.x, this.caster.y, this.targets[0].x, this.targets[0].y, 10);
    uiElements.ctx.stroke();
    for (let i = 0; i < this.targets.length - 1; i++) {
      drawLightningBolt(this.targets[i].x, this.targets[i].y, this.targets[i + 1].x, this.targets[i + 1].y, 10);
      uiElements.ctx.stroke();
    }
    uiElements.ctx.restore();
    uiElements.ctx.strokeStyle = `rgba(224, 231, 255, ${alpha})`;
    uiElements.ctx.lineWidth = 2;
    drawLightningBolt(this.caster.x, this.caster.y, this.targets[0].x, this.targets[0].y, 10);
    uiElements.ctx.stroke();
    for (let i = 0; i < this.targets.length - 1; i++) {
      drawLightningBolt(this.targets[i].x, this.targets[i].y, this.targets[i + 1].x, this.targets[i + 1].y, 10);
      uiElements.ctx.stroke();
    }
  }
}

class AuraBuffAnimation {
  constructor(caster, radius, damageBoost, attackSpeedBoost, buffDuration, allUnits) {
    this.caster = caster;
    this.maxRadius = radius;
    this.duration = 60;
    this.maxDuration = 60;
    const allies = allUnits.filter(u => u.team === caster.team);
    allies.forEach(unit => {
      if (getDistance(this.caster, unit) <= this.maxRadius) {
        unit.buffs.bard = {
          expires: Date.now() + buffDuration,
          damageBoost: damageBoost,
          attackSpeedBoost: attackSpeedBoost
        };
      }
    });
    if (Math.random() < 0.25) {
      gameState.particles.push(new Particle(this.caster.x, this.caster.y - 15, this.caster.team, false, 'music'));
    }
  }
  update() {
    this.duration -= 1 * gameState.gameSpeed;
    return this.duration > 0;
  }
  draw() {
    if (this.caster.hp <= 0) return;
    const progress = 1 - this.duration / this.maxDuration;
    const alpha = Math.sin(progress * Math.PI);
    uiElements.ctx.strokeStyle = `rgba(167, 139, 250, ${alpha * 0.6})`;
    uiElements.ctx.lineWidth = 3;
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.caster.x, this.caster.y, this.maxRadius * progress, 0, Math.PI * 2);
    uiElements.ctx.stroke();
  }
}

class FloatingText {
  constructor(text, x, y, color) {
    this.text = text;
    this.x = x + (Math.random() * 20 - 10);
    this.y = y + (Math.random() * 10 - 5);
    this.color = color;
    this.lifespan = 60;
    this.maxLifespan = 60;
    this.vx = (Math.random() * 0.4 - 0.2);
    this.vy = -(0.5 + Math.random() * 0.5);
  }
  update() {
    this.x += this.vx * gameState.gameSpeed;
    this.y += this.vy * gameState.gameSpeed;
    this.lifespan -= 1 * gameState.gameSpeed;
    return this.lifespan > 0;
  }
  draw() {
    const alpha = Math.max(0, this.lifespan / this.maxLifespan);
    uiElements.ctx.font = 'bold 16px "Roboto Mono"';
    uiElements.ctx.textAlign = 'center';
    uiElements.ctx.lineWidth = 3;
    uiElements.ctx.strokeStyle = `rgba(15, 23, 42, ${alpha * 0.9})`; // Dark slate background stroke
    uiElements.ctx.strokeText(this.text, this.x, this.y);
    uiElements.ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('#', 'rgba(' + parseInt(this.color.slice(1, 3), 16) + ',' + parseInt(this.color.slice(3, 5), 16) + ',' + parseInt(this.color.slice(5, 7), 16) + `, ${alpha})`);
    uiElements.ctx.fillText(this.text, this.x, this.y);
  }
}

class Particle {
  constructor(x, y, team, isImpact = false, type = 'generic') {
    this.x = x;
    this.y = y;
    this.type = type;
    if (isImpact) {
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = (Math.random() - 0.5) * 4;
      this.lifespan = 10 + Math.random() * 10;
    } else {
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.lifespan = 20 + Math.random() * 20;
    }
    this.maxLifespan = this.lifespan;
    this.size = 1 + Math.random() * 2.5;
    this.gravity = 0;
    if (this.type === 'fire') {
      const colors = ['rgba(255, 100, 0,', 'rgba(255, 165, 0,', 'rgba(255, 69, 0,'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    } else if (this.type === 'rock') {
      const colors = ['rgba(120, 113, 108,', 'rgba(168, 162, 158,'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = Math.random() * -2;
      this.size = 2 + Math.random() * 3;
    } else if (this.type === 'music') {
      this.color = 'rgba(255, 255, 255,';
      this.vx = (Math.random() - 0.5) * 1;
      this.vy = -0.5 - Math.random() * 0.5;
      this.lifespan = 40 + Math.random() * 20;
      this.maxLifespan = this.lifespan;
      this.char = ['♪', '♫'][Math.floor(Math.random() * 2)];
    } else if (this.type === 'electric') {
      this.color = ['rgba(191, 219, 254,', 'rgba(224, 231, 255,', 'rgba(99, 102, 241,'][Math.floor(Math.random() * 3)];
      this.vx = (Math.random() - 0.5) * 6;
      this.vy = (Math.random() - 0.5) * 6;
      this.lifespan = 5 + Math.random() * 8;
      this.size = 1 + Math.random() * 1.5;
    } else if (this.type === 'ice') {
      this.color = ['rgba(207, 250, 254,', 'rgba(165, 243, 252,'][Math.floor(Math.random() * 2)];
      this.vy = (Math.random() - 0.5) * 1;
      this.vx = (Math.random() - 0.5) * 1;
      this.lifespan = 20 + Math.random() * 20;
    } else if (this.type === 'poison') {
      this.color = ['rgba(132, 204, 22,', 'rgba(163, 230, 53,'][Math.floor(Math.random() * 2)];
      this.vy = -0.5 - Math.random() * 0.5;
      this.vx = (Math.random() - 0.5) * 1;
      this.lifespan = 30 + Math.random() * 20;
      this.size = 2 + Math.random() * 2;
    } else if (this.type === 'snow') {
      this.color = 'rgba(255, 255, 255,';
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = 0.2 + Math.random() * 0.4;
      this.size = 1 + Math.random() * 2;
      this.lifespan = 60 + Math.random() * 60;
    } else if (this.type === 'heal') {
      this.color = 'rgba(74, 222, 128,';
      this.vy = -0.2 - Math.random() * 0.3;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.lifespan = 30 + Math.random() * 15;
    } else if (this.type === 'smoke') {
      this.color = 'rgba(156, 163, 175,';
      this.vy = -0.5 - Math.random() * 1.5;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.size = 3 + Math.random() * 3;
      this.lifespan = 20 + Math.random() * 20;
    } else {
      this.color = team === 1 ? 'rgba(255, 255, 255,' : 'rgba(255, 255, 255,';
    }
  }
  update() {
    this.vy += this.gravity * gameState.gameSpeed;
    this.x += this.vx * gameState.gameSpeed;
    this.y += this.vy * gameState.gameSpeed;
    this.lifespan -= 1 * gameState.gameSpeed;
    return this.lifespan > 0;
  }
  draw() {
    if (this.type === 'music') {
      const alpha = Math.max(0, this.lifespan / this.maxLifespan);
      uiElements.ctx.font = 'bold 18px "Roboto Mono"';
      uiElements.ctx.fillStyle = `rgba(236, 233, 253, ${alpha})`;
      uiElements.ctx.textAlign = 'center';
      uiElements.ctx.fillText(this.char, this.x, this.y);
    } else {
      const alpha = Math.max(0, this.lifespan / this.maxLifespan);
      uiElements.ctx.fillStyle = this.color + `${alpha})`;
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      uiElements.ctx.fill();
    }
  }
}



export { PoisonSplashAnimation };


export { SlashAnimation };


export { ThrustAnimation };


export { AoeExplosion };


export { AoeHeal };


export { MultiHealAura };


export { GroundSmashAnimation };


export { TrollSmashAnimation };


export { ShiverWaveAnimation };


export { ChainLightning };


export { AuraBuffAnimation };


export { FloatingText };


export { Particle };


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
