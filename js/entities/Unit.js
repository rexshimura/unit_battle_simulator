import { gameState, uiElements } from '../state.js';
import { UNIT_SPECS, ARMOR_DAMAGE_REDUCTION_PERCENT } from '../config.js';
import { getDistance, drawLightningBolt, AudioManager } from '../utils.js';
import { Projectile, IceShard, HealingOrb, Arrow, Fireball, PoisonPotion, AntiHealDart } from './Projectiles.js';
import { PoisonSplashAnimation, SlashAnimation, ThrustAnimation, AoeExplosion, AoeHeal, MultiHealAura, GroundSmashAnimation, TrollSmashAnimation, ShiverWaveAnimation, ChainLightning, AuraBuffAnimation, FloatingText, Particle, ShieldBashAnimation } from './Effects.js';

class Unit {
  constructor(x, y, team, type, relX, relY) {
    this.id = gameState.nextUnitId++;
    this.x = x;
    this.y = y;
    this.relX = relX;
    this.relY = relY;
    this.team = team;
    this.type = type;
    const specs = UNIT_SPECS[type];
    this.hp = specs.hp;
    this.maxHp = specs.hp;
    this.speed = specs.speed;
    this.attackDamage = specs.attackDamage;
    this.attackRange = specs.attackRange;
    this.attackCooldown = specs.attackCooldown;
    this.color = specs.color[team === 1 ? 'team1' : 'team2'];
    this.lastAttackTime = 0;
    this.target = null;
    this.width = specs.size || 20;
    this.height = specs.size || 20;
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.healingDone = 0;
    this.kills = 0;
    this.armor = 0;
    this.coldStacks = 0;
    this.ownedSnakes = [];
    this.isBeingKnockedBack = false;
    this.knockbackTargetX = 0;
    this.knockbackTargetY = 0;
    this.isSlashing = false;
    this.slashAnimDuration = 15;
    this.slashAnimProgress = 0;
    this.deflectAnim = 0;
    this.isThrusting = false;
    this.thrustAnimDuration = 20;
    this.thrustAnimProgress = 0;
    this.isThrowing = false;
    this.throwAnimDuration = 30;
    this.throwAnimProgress = 0;
    this.isSmashing = false;
    this.smashAnimDuration = 40;
    this.smashAnimProgress = 0;
    this.isSwinging = false;
    this.swingAnimDuration = 50;
    this.swingAnimProgress = 0;
    this.basicAttackCounter = 0;
    this.isBursting = false;
    this.burstsLeft = 0;
    this.lastBurstSlashTime = 0;
    this.activeSword = 1;
    this.healAttackCounter = 0;
    this.isMultiHealActive = false;
    this.isReviving = false;
    this.reviveTime = 0;
    this.isCharging = false;
    this.chargeDuration = 0;
    this.chargeAngle = 0;
    this.isShadow = false;
    this.shadowTime = 0;
    this.isInitialStealth = false;
    this.currentMoveAngle = 0;
    this.battleFrames = 0;
    this.multiHealEndTime = 0;
    this.isCasting = false;
    this.castAnimProgress = 0;
    this.glowAnimProgress = Math.random() * Math.PI * 2;
    this.buffs = {};
    this.stunnedUntil = 0;
    this.stunType = null;
    if (this.type === 'assassin') {
      this.isShadow = false; // Start normal
      this.isInitialStealth = true;
      this.isFlurrying = false;
      this.flurryTarget = null;
      this.shadowTime = 0;
    }
  }
  draw() {
    uiElements.ctx.save();
    if (this.isShadow) {
        uiElements.ctx.globalAlpha = 0.4;
        uiElements.ctx.filter = 'brightness(0.2)';
    }
    
    if (this.isReviving) {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(this.team === 1 ? 0 : Math.PI);
      
      // Draw a simple bone
      uiElements.ctx.fillStyle = '#f3f4f6';
      uiElements.ctx.beginPath();
      uiElements.ctx.roundRect(-8, -3, 16, 6, 2);
      uiElements.ctx.fill();
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(-8, -4, 4, 0, Math.PI * 2);
      uiElements.ctx.arc(-8, 4, 4, 0, Math.PI * 2);
      uiElements.ctx.arc(8, -4, 4, 0, Math.PI * 2);
      uiElements.ctx.arc(8, 4, 4, 0, Math.PI * 2);
      uiElements.ctx.fill();
      
      uiElements.ctx.restore();
      return;
    }

    uiElements.ctx.save();
    if (this.isRevived) {
      uiElements.ctx.filter = 'brightness(0.6)'; // darker when revived
    }

    if (this.stunType === 'freeze' && Date.now() < this.stunnedUntil) {
      uiElements.ctx.save();
      const size = this.width * 0.8;
      uiElements.ctx.fillStyle = 'rgba(165, 243, 252, 0.6)';
      uiElements.ctx.strokeStyle = 'rgba(224, 242, 254, 0.8)';
      uiElements.ctx.lineWidth = 2;
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(this.x - size, this.y - size);
      uiElements.ctx.lineTo(this.x + size, this.y - size);
      uiElements.ctx.lineTo(this.x + size * 0.8, this.y);
      uiElements.ctx.lineTo(this.x + size, this.y + size);
      uiElements.ctx.lineTo(this.x - size, this.y + size);
      uiElements.ctx.lineTo(this.x - size * 0.7, this.y);
      uiElements.ctx.closePath();
      uiElements.ctx.fill();
      uiElements.ctx.stroke();
      uiElements.ctx.restore();
      uiElements.ctx.filter = 'saturate(0.3) brightness(1.5)';
    }
    if (this.type === 'troll' && this.hp <= this.maxHp * 0.5) {
      uiElements.ctx.save();
      uiElements.ctx.globalCompositeOperation = 'lighter';
      uiElements.ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(this.x, this.y, this.width / 2 + 5 + Math.sin(Date.now() / 100) * 4, 0, Math.PI * 2);
      uiElements.ctx.fill();
      uiElements.ctx.restore();
    }
    uiElements.ctx.fillStyle = this.color;
    if (this.type === 'abyssal_summoner') {
      const glowSize = Math.sin(this.glowAnimProgress) * 5 + 20;
      uiElements.ctx.globalCompositeOperation = 'lighter';
      uiElements.ctx.fillStyle = this.team === 1 ? 'rgba(139, 92, 246, 0.4)' : 'rgba(236, 72, 153, 0.4)';
      uiElements.ctx.filter = 'blur(10px)';
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
      uiElements.ctx.fill();
      uiElements.ctx.restore();
      uiElements.ctx.save();
      if (this.stunType === 'freeze' && Date.now() < this.stunnedUntil) {
        uiElements.ctx.filter = 'saturate(0.3) brightness(1.5)';
      }
      uiElements.ctx.fillStyle = this.color;
    }
    if (this.buffs.druidHeal) {
      const glowSize = 18;
      uiElements.ctx.globalCompositeOperation = 'lighter';
      uiElements.ctx.fillStyle = this.team === 1 ? 'rgba(74, 222, 128, 0.5)' : 'rgba(163, 230, 53, 0.5)';
      uiElements.ctx.filter = 'blur(8px)';
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(this.x, this.y, this.width / 2 + 5, 0, Math.PI * 2);
      uiElements.ctx.fill();
    }
    if (this.type === 'rockgolem') {
      uiElements.ctx.beginPath();
      uiElements.ctx.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
      uiElements.ctx.fill();
    } else {
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
      uiElements.ctx.fill();
    }
    uiElements.ctx.restore();
    this.drawEquipment();
    uiElements.ctx.fillStyle = this.team === 1 ? 'rgba(100, 200, 255, 0.7)' : 'rgba(255, 100, 100, 0.7)';
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(this.x, this.y, this.width / 2 + 3, 0, Math.PI * 2);
    uiElements.ctx.lineWidth = 2;
    uiElements.ctx.strokeStyle = uiElements.ctx.fillStyle;
    uiElements.ctx.stroke();
    

    this.drawHealthBar();
    uiElements.ctx.restore(); // Restore globalAlpha and filter from shadow mode
  }
  drawHealthBar() {
    const barWidth = 30;
    let barY = this.y - this.height - 15;
    if (this.buffs.armor && this.buffs.armor.expires > Date.now()) {
      const barHeight = 3;
      const timeRemaining = this.buffs.armor.expires - Date.now();
      const progress = Math.max(0, timeRemaining / this.buffs.armor.duration);
      uiElements.ctx.fillStyle = 'rgba(75, 85, 99, 0.5)';
      uiElements.ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
      uiElements.ctx.fillStyle = '#67e8f9';
      uiElements.ctx.fillRect(this.x - barWidth / 2, barY, barWidth * progress, barHeight);
      barY += barHeight + 1;
    }
    if (this.buffs.healingReduced && this.buffs.healingReduced.expires > Date.now()) {
      const barHeight = 3;
      const timeRemaining = this.buffs.healingReduced.expires - Date.now();
      const progress = Math.max(0, timeRemaining / this.buffs.healingReduced.duration);
      uiElements.ctx.fillStyle = 'rgba(75, 85, 99, 0.5)';
      uiElements.ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
      uiElements.ctx.fillStyle = '#d946ef';
      uiElements.ctx.fillRect(this.x - barWidth / 2, barY, barWidth * progress, barHeight);
      barY += barHeight + 1;
    }
    const healthBarHeight = 5;
    const healthBarX = this.x - barWidth / 2;
    const healthBarY = barY;
    uiElements.ctx.fillStyle = '#4b5563';
    uiElements.ctx.fillRect(healthBarX, healthBarY, barWidth, healthBarHeight);
    const healthWidth = this.hp / this.maxHp * barWidth;
    const armorWidth = this.armor / this.maxHp * barWidth;
    const healthColor = this.hp / this.maxHp > 0.5 ? '#22c55e' : this.hp / this.maxHp > 0.25 ? '#f59e0b' : '#ef4444';
    uiElements.ctx.fillStyle = healthColor;
    uiElements.ctx.fillRect(healthBarX, healthBarY, healthWidth, healthBarHeight);
    uiElements.ctx.fillStyle = 'rgba(103, 232, 249, 0.8)';
    uiElements.ctx.fillRect(healthBarX + healthWidth, healthBarY, Math.min(armorWidth, barWidth - healthWidth), healthBarHeight);
    let specialBarY = healthBarY + healthBarHeight + 1;
    if (gameState.isBattleStarted && this.attackCooldown > 0 && this.type !== 'fortress') {
      const cooldownBarHeight = 3;
      uiElements.ctx.fillStyle = 'rgba(75, 85, 99, 0.5)';
      uiElements.ctx.fillRect(healthBarX, specialBarY, barWidth, cooldownBarHeight);
      let currentCooldown = this.attackCooldown;
      if (this.buffs.bard && Date.now() < this.buffs.bard.expires) {
        currentCooldown /= 1 + this.buffs.bard.attackSpeedBoost;
      }
      const cooldownProgress = Math.min(1, (Date.now() - this.lastAttackTime) / (currentCooldown / gameState.gameSpeed));
      uiElements.ctx.fillStyle = '#facc15';
      uiElements.ctx.fillRect(healthBarX, specialBarY, cooldownProgress * barWidth, cooldownBarHeight);
      specialBarY += cooldownBarHeight + 1;
    }
    const specialBarHeight = 4;
    
    if (this.type === 'assassin' && gameState.isBattleStarted) {
        if (this.isShadow) {
           uiElements.ctx.fillStyle = 'rgba(75, 85, 99, 0.5)';
           uiElements.ctx.fillRect(healthBarX, specialBarY, barWidth, specialBarHeight);
           let stealthProgress = 1;
           if (this.shadowTime !== Infinity) {
               stealthProgress = Math.max(0, (this.shadowTime - Date.now()) / 2000);
           }
           uiElements.ctx.fillStyle = '#94a3b8'; // Slate lighter
           uiElements.ctx.fillRect(healthBarX, specialBarY, stealthProgress * barWidth, specialBarHeight);
           specialBarY += specialBarHeight + 1;
        } else if (this.isInitialStealth) {
           uiElements.ctx.fillStyle = 'rgba(75, 85, 99, 0.5)';
           uiElements.ctx.fillRect(healthBarX, specialBarY, barWidth, specialBarHeight);
           let stealthProgress = Math.min(1, this.battleFrames / 30);
           uiElements.ctx.fillStyle = '#475569'; // Slate dark
           uiElements.ctx.fillRect(healthBarX, specialBarY, stealthProgress * barWidth, specialBarHeight);
           specialBarY += specialBarHeight + 1;
        }
    }
    
    if ((this.type === 'rockgolem' || this.type === 'duelist' || this.type === 'druid' || this.type === 'priest' || this.type === 'troll' || this.type === 'cryomancer' || this.type === 'alchemist' || this.type === 'fortress' || this.type === 'flamecaller') && gameState.isBattleStarted) {
      uiElements.ctx.fillStyle = 'rgba(75, 85, 99, 0.5)';
      uiElements.ctx.fillRect(healthBarX, specialBarY, barWidth, specialBarHeight);
      let specs, counter, maxCount, barColor, activeColor, activeDuration, activeEndTime;
      switch (this.type) {
        case 'duelist':
          specs = UNIT_SPECS.duelist;
          counter = this.basicAttackCounter;
          maxCount = specs.burstTriggerCount;
          barColor = '#a78bfa';
          break;
        case 'druid':
          specs = UNIT_SPECS.druid;
          counter = this.healAttackCounter;
          maxCount = specs.multiHealTriggerCount;
          barColor = '#4ade80';
          activeColor = '#16a34a';
          activeDuration = specs.multiHealDuration;
          activeEndTime = this.multiHealEndTime;
          break;
        case 'priest':
          specs = UNIT_SPECS.priest;
          counter = this.healAttackCounter;
          maxCount = specs.lightHealTriggerCount;
          barColor = '#fef08a';
          break;
                case 'fortress':
          counter = this.hitsTaken || 0;
          maxCount = 5;
          barColor = '#94a3b8'; // Slate metallic color
          break;
        case 'troll':
          specs = UNIT_SPECS.troll;
          counter = this.basicAttackCounter;
          maxCount = specs.smashTriggerCount;
          barColor = '#f97316';
          break;
        case 'flamecaller':
          counter = this.basicAttackCounter || 0;
          maxCount = 3;
          barColor = '#fb923c';
          break;
        case 'cryomancer':
          specs = UNIT_SPECS.cryomancer;
          counter = this.basicAttackCounter;
          maxCount = specs.specialTriggerCount;
          barColor = '#67e8f9';
          break;
        case 'alchemist':
          specs = UNIT_SPECS.alchemist;
          counter = this.basicAttackCounter;
          maxCount = specs.specialTriggerCount;
          barColor = '#bef264';
          break;
        case 'rockgolem':
          counter = this.basicAttackCounter || 0;
          maxCount = 3;
          barColor = '#eab308';
          break;
      }
      if (this.isMultiHealActive) {
        const progress = (activeEndTime - Date.now()) / activeDuration;
        uiElements.ctx.fillStyle = activeColor;
        uiElements.ctx.fillRect(healthBarX, specialBarY, barWidth * progress, specialBarHeight);
      } else if (this.type === 'rockgolem' && this.isCharging) {
        const progress = Math.max(0, this.chargeDuration / 45);
        uiElements.ctx.fillStyle = '#fde047'; // Bright yellow
        uiElements.ctx.fillRect(healthBarX, specialBarY, barWidth * progress, specialBarHeight);
      } else if (counter > 0) {
        const segmentWidth = barWidth / maxCount;
        uiElements.ctx.fillStyle = barColor;
        for (let i = 0; i < counter; i++) {
          uiElements.ctx.fillRect(healthBarX + i * segmentWidth, specialBarY, segmentWidth - 1, specialBarHeight);
        }
      }
    }
    let iconX = this.x;
    const iconSpacing = 12;
    if (this.buffs.bard && Date.now() < this.buffs.bard.expires) {
      uiElements.ctx.fillStyle = '#f0abfc';
      uiElements.ctx.font = 'bold 18px "Roboto Mono"';
      uiElements.ctx.textAlign = 'center';
      uiElements.ctx.textBaseline = 'bottom';
      uiElements.ctx.fillText('♫', iconX, healthBarY - 2);
      iconX -= iconSpacing;
    }
    if (this.buffs.druidHeal) {
      uiElements.ctx.fillStyle = '#4ade80';
      uiElements.ctx.font = 'bold 18px "Roboto Mono"';
      uiElements.ctx.textAlign = 'center';
      uiElements.ctx.textBaseline = 'bottom';
      uiElements.ctx.fillText('+', iconX, healthBarY - 2);
      iconX -= iconSpacing;
    }
    if (this.buffs.armor && Date.now() < this.buffs.armor.expires) {
      uiElements.ctx.fillStyle = '#67e8f9';
      uiElements.ctx.font = 'bold 16px "Roboto Mono"';
      uiElements.ctx.textAlign = 'center';
      uiElements.ctx.textBaseline = 'bottom';
      uiElements.ctx.fillText('🛡', iconX, healthBarY - 2);
      iconX -= iconSpacing;
    }
    if (this.buffs.healingReduced && Date.now() < this.buffs.healingReduced.expires) {
      uiElements.ctx.fillStyle = '#d946ef';
      uiElements.ctx.font = 'bold 16px "Roboto Mono"';
      uiElements.ctx.textAlign = 'center';
      uiElements.ctx.textBaseline = 'bottom';
      uiElements.ctx.fillText('☠', this.x, healthBarY - 15);
    }
    if (this.buffs.poison && Date.now() < this.buffs.poison.expires) {
      uiElements.ctx.fillStyle = '#84cc16';
      uiElements.ctx.font = 'bold 16px "Roboto Mono"';
      uiElements.ctx.textAlign = 'center';
      uiElements.ctx.textBaseline = 'bottom';
      uiElements.ctx.fillText('☣', this.x + iconSpacing, healthBarY - 15);
    }
    if (this.coldStacks > 0) {
      uiElements.ctx.fillStyle = '#38bdf8';
      uiElements.ctx.font = 'bold 16px "Roboto Mono"';
      uiElements.ctx.textAlign = 'center';
      uiElements.ctx.textBaseline = 'bottom';
      uiElements.ctx.fillText(`❄️${this.coldStacks}`, this.x - iconSpacing, healthBarY - 15);
    }
    if (Date.now() < this.stunnedUntil) {
      uiElements.ctx.fillStyle = 'white';
      uiElements.ctx.font = 'bold 12px "Roboto Mono"';
      uiElements.ctx.textAlign = 'center';
      uiElements.ctx.textBaseline = 'bottom';
      uiElements.ctx.fillText(this.stunType === 'freeze' ? 'FROZEN' : 'STUN', this.x, healthBarY - 2);
      const angle = Date.now() / 200 % (Math.PI * 2);
      uiElements.ctx.fillStyle = '#facc15';
      uiElements.ctx.font = 'bold 14px "Roboto Mono"';
      for (let i = 0; i < 2; i++) {
        const starAngle = angle + i * Math.PI;
        const starX = this.x + Math.cos(starAngle) * 12;
        const starY = this.y - 25 + Math.sin(starAngle) * 4;
        uiElements.ctx.fillText('★', starX, starY);
      }
    }
  }
  drawEquipment() {
    let angle = this.team === 1 ? 0 : Math.PI;
    if (this.target) {
      angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    }

    if (this.type === 'abyssal_summoner') {
      const tetherRange = 250;
      uiElements.ctx.save();
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(this.x, this.y, tetherRange, 0, Math.PI * 2);
      uiElements.ctx.strokeStyle = this.team === 1 ? 'rgba(96, 165, 250, 0.2)' : 'rgba(248, 113, 113, 0.2)';
      uiElements.ctx.lineWidth = 2;
      uiElements.ctx.setLineDash([10, 10]);
      uiElements.ctx.stroke();
      uiElements.ctx.restore();
    }
    if (this.type === 'musketeer' || this.type === 'sniper') {
      const nozzleLength = this.type === 'sniper' ? 18 : 12;
      const nozzleWidth = 5;
      const startX = this.x + Math.cos(angle) * (this.width / 2);
      const startY = this.y + Math.sin(angle) * (this.width / 2);
      const endX = this.x + Math.cos(angle) * (this.width / 2 + nozzleLength);
      const endY = this.y + Math.sin(angle) * (this.width / 2 + nozzleLength);
      
      // Draw weapon barrel
      uiElements.ctx.strokeStyle = '#9ca3af';
      uiElements.ctx.lineWidth = nozzleWidth;
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(startX, startY);
      uiElements.ctx.lineTo(endX, endY);
      uiElements.ctx.stroke();

      // Laser pointer for sniper
      if (this.type === 'sniper' && this.target && this.target.hp > 0) {
        uiElements.ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; // Red transparent laser
        uiElements.ctx.lineWidth = 1;
        uiElements.ctx.beginPath();
        uiElements.ctx.moveTo(endX, endY);
        uiElements.ctx.lineTo(this.target.x, this.target.y);
        uiElements.ctx.stroke();
      }
    } else if (this.type === 'archer') {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      const bowHeight = 30;
      uiElements.ctx.strokeStyle = '#854d0e';
      uiElements.ctx.lineWidth = 4;
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(0, 0, bowHeight / 2, -Math.PI / 2.5, Math.PI / 2.5, false);
      uiElements.ctx.stroke();
      uiElements.ctx.strokeStyle = '#e5e7eb';
      uiElements.ctx.lineWidth = 1.5;
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(0, -bowHeight / 2.2);
      uiElements.ctx.lineTo(0, bowHeight / 2.2);
      uiElements.ctx.stroke();
      uiElements.ctx.restore();
    } else if (this.type === 'abyssal_summoner') {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      uiElements.ctx.strokeStyle = '#a855f7';
      uiElements.ctx.lineWidth = 3;
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(this.width / 2 + 5, 0, 6, 0, Math.PI * 2);
      uiElements.ctx.stroke();
      uiElements.ctx.restore();
    } else if (this.type === 'swordsman') {
      let swordAngle = angle;
      if (this.isSlashing) {
        const progress = this.slashAnimProgress / this.slashAnimDuration;
        const arc = Math.PI / 1.5;
        swordAngle += (1 - progress) * arc - arc / 2;
      }
      const swordLength = 18;
      const swordWidth = 4;
      const offsetDistance = 8;
      const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
      const offsetY = Math.sin(angle + Math.PI / 2) * offsetDistance;
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x + offsetX, this.y + offsetY);
      uiElements.ctx.rotate(swordAngle);
      const hiltPosition = this.width / 2 - 8;
      uiElements.ctx.fillStyle = '#d1d5db';
      uiElements.ctx.fillRect(hiltPosition, -swordWidth / 2, swordLength, swordWidth);
      uiElements.ctx.fillStyle = '#9ca3af';
      uiElements.ctx.fillRect(hiltPosition, -swordWidth, swordWidth, swordWidth * 2);
      uiElements.ctx.restore();
    } else if (this.type === 'spearman') {
      const spearLength = 35;
      const spearWidth = 3;
      const headLength = 8;
      const headWidth = 6;
      let thrustOffset = 0;
      if (this.isThrusting) {
        const progress = this.thrustAnimProgress / this.thrustAnimDuration;
        thrustOffset = Math.sin(progress * Math.PI) * 15;
      }
      const offsetDistance = 8;
      const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
      const offsetY = Math.sin(angle + Math.PI / 2) * offsetDistance;
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x + offsetX, this.y + offsetY);
      uiElements.ctx.rotate(angle);
      const shaftStart = this.width / 2 - 10 + thrustOffset;
      uiElements.ctx.fillStyle = '#a16207';
      uiElements.ctx.fillRect(shaftStart, -spearWidth / 2, spearLength, spearWidth);
      uiElements.ctx.fillStyle = '#a8a29e';
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(shaftStart + spearLength, 0);
      uiElements.ctx.lineTo(shaftStart + spearLength - headLength, -headWidth / 2);
      uiElements.ctx.lineTo(shaftStart + spearLength - headLength, headWidth / 2);
      uiElements.ctx.closePath();
      uiElements.ctx.fill();
      uiElements.ctx.restore();
    } else if (this.type === 'fortress') {
      const shieldWidth = 12;
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      
      let thrustOffset = 0;
      if (this.isSlashing) {
        const progress = this.slashAnimProgress / this.slashAnimDuration;
        // thrust forward and back
        thrustOffset = Math.sin(progress * Math.PI) * 12;
      }
      
      uiElements.ctx.translate(thrustOffset, 0);

      // Draw a massive curved shield
      uiElements.ctx.strokeStyle = '#334155'; // darker slate
      uiElements.ctx.lineWidth = shieldWidth;
      uiElements.ctx.lineCap = 'round';
      
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(0, 0, this.width / 2 + 6, -Math.PI / 2.2, Math.PI / 2.2, false);
      uiElements.ctx.stroke();

      // Add a metallic highlight
      uiElements.ctx.strokeStyle = '#94a3b8';
      uiElements.ctx.lineWidth = 4;
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(0, 0, this.width / 2 + 6, -Math.PI / 2.2, Math.PI / 2.2, false);
      uiElements.ctx.stroke();
      
      uiElements.ctx.restore(); } else if (this.type === 'guardian') {
      const shieldWidth = 10;
      const shieldHeight = 30;
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      uiElements.ctx.fillStyle = '#9ca3af';
      uiElements.ctx.fillRect(this.width / 2, -shieldHeight / 2, shieldWidth, shieldHeight);
      if (this.deflectAnim > 0) {
        uiElements.ctx.fillStyle = `rgba(255, 255, 255, ${this.deflectAnim / 10})`;
        uiElements.ctx.fillRect(this.width / 2, -shieldHeight / 2, shieldWidth, shieldHeight);
      }
      uiElements.ctx.restore();
      let swordAngle = angle;
      if (this.isSlashing) {
        const progress = this.slashAnimProgress / this.slashAnimDuration;
        const arc = Math.PI / 1.5;
        swordAngle += (1 - progress) * arc - arc / 2;
      }
      const swordLength = 18;
      const swordWidth = 4;
      const offsetDistance = 8;
      const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
      const offsetY = Math.sin(angle + Math.PI / 2) * offsetDistance;
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x + offsetX, this.y + offsetY);
      uiElements.ctx.rotate(swordAngle);
      const hiltPosition = this.width / 2 - 8;
      uiElements.ctx.fillStyle = '#d1d5db';
      uiElements.ctx.fillRect(hiltPosition, -swordWidth / 2, swordLength, swordWidth);
      uiElements.ctx.fillStyle = '#9ca3af';
      uiElements.ctx.fillRect(hiltPosition, -swordWidth, swordWidth, swordWidth * 2);
      uiElements.ctx.restore();
    } else if (this.type === 'priest') {
      const crossVLength = 24,
        crossHLength = 16;
      const crossWidth = 5;
      const offsetDistance = 8;
      const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
      const offsetY = Math.sin(angle + Math.PI / 2) * offsetDistance;
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x + offsetX, this.y + offsetY);
      uiElements.ctx.fillStyle = '#fde047';
      uiElements.ctx.shadowColor = '#fef08a';
      uiElements.ctx.shadowBlur = 10;
      uiElements.ctx.fillRect(this.width / 2, -crossVLength / 2, crossWidth, crossVLength);
      uiElements.ctx.fillRect(this.width / 2 - (crossHLength - crossWidth) / 2, -crossVLength / 2 + 4, crossHLength, crossWidth);
      uiElements.ctx.shadowColor = 'transparent';
      uiElements.ctx.shadowBlur = 0;
      uiElements.ctx.restore();
    } else if (this.type === 'alchemist') {
      let throwProgress = 0;
      if (this.isThrowing) {
        throwProgress = this.throwAnimProgress / this.throwAnimDuration;
      }
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle + Math.sin(throwProgress * Math.PI) * -Math.PI / 2);
      const flaskBodyWidth = 10;
      const flaskNeckHeight = 4;
      const flaskNeckWidth = 4;
      const flaskX = 8;
      uiElements.ctx.fillStyle = this.team === 1 ? '#a3e635' : '#facc15';
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(flaskX, 0, flaskBodyWidth / 2, 0, Math.PI * 2);
      uiElements.ctx.fill();
      uiElements.ctx.fillStyle = 'rgba(200, 220, 255, 0.4)';
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(flaskX, 0, flaskBodyWidth / 2, 0, Math.PI * 2);
      uiElements.ctx.fill();
      uiElements.ctx.fillRect(flaskX - flaskNeckWidth / 2, -flaskBodyWidth / 2 - flaskNeckHeight + 2, flaskNeckWidth, flaskNeckHeight);
      uiElements.ctx.restore();
    } else if (this.type === 'flamecaller') {
      const staffLength = 24;
      const staffWidth = 4;
      const gemSize = 6;
      const offsetDistance = 8;
      const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
      const offsetY = Math.sin(angle + Math.PI / 2) * offsetDistance;
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x + offsetX, this.y + offsetY);
      uiElements.ctx.rotate(angle);
      uiElements.ctx.fillStyle = '#b45309';
      uiElements.ctx.fillRect(this.width / 2, -staffWidth / 2, staffLength, staffWidth);
      let gemColor = this.team === 1 ? '#f97316' : '#ef4444';
      uiElements.ctx.shadowColor = gemColor;
      uiElements.ctx.shadowBlur = 15;
      uiElements.ctx.fillStyle = gemColor;
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(this.width / 2 + staffLength, 0, gemSize, 0, Math.PI * 2);
      uiElements.ctx.fill();
      uiElements.ctx.shadowColor = 'transparent';
      uiElements.ctx.shadowBlur = 0;
      uiElements.ctx.fillStyle = 'white';
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(this.width / 2 + staffLength, 0, gemSize * 0.4, 0, Math.PI * 2);
      uiElements.ctx.fill();
      uiElements.ctx.restore();
    } else if (this.type === 'cryomancer') {
      const gemSize = 8;
      const floatingDist = this.width / 2 + 5;
      const floatAngle = Date.now() / 400;
      const gemX = this.x + Math.cos(angle) * floatingDist + Math.cos(floatAngle) * 3;
      const gemY = this.y + Math.sin(angle) * floatingDist + Math.sin(floatAngle) * 3;
      uiElements.ctx.save();
      const gemColor = this.team === 1 ? '#67e8f9' : '#06b6d4';
      uiElements.ctx.shadowColor = gemColor;
      uiElements.ctx.shadowBlur = 20;
      uiElements.ctx.fillStyle = gemColor;
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(gemX, gemY - gemSize);
      uiElements.ctx.lineTo(gemX + gemSize * 0.7, gemY);
      uiElements.ctx.lineTo(gemX, gemY + gemSize);
      uiElements.ctx.lineTo(gemX - gemSize * 0.7, gemY);
      uiElements.ctx.closePath();
      uiElements.ctx.fill();
      uiElements.ctx.shadowColor = 'transparent';
      uiElements.ctx.shadowBlur = 0;
      uiElements.ctx.fillStyle = 'white';
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(gemX, gemY, gemSize * 0.3, 0, Math.PI * 2);
      uiElements.ctx.fill();
      uiElements.ctx.restore();
    } else if (this.type === 'druid') {
      const branchLength = 28;
      const branchWidth = 4;
      const offsetDistance = 8;
      const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
      const offsetY = Math.sin(angle + Math.PI / 2) * offsetDistance;
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x + offsetX, this.y + offsetY);
      uiElements.ctx.rotate(angle);
      uiElements.ctx.strokeStyle = '#5f3f2e';
      uiElements.ctx.lineWidth = branchWidth;
      uiElements.ctx.lineCap = 'round';
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(this.width / 2 - 8, 0);
      uiElements.ctx.quadraticCurveTo(this.width / 2 + branchLength / 2, -8, this.width / 2 + branchLength, 5);
      uiElements.ctx.stroke();
      uiElements.ctx.lineWidth = branchWidth * 0.6;
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(this.width / 2 + 5, 0);
      uiElements.ctx.quadraticCurveTo(this.width / 2 + 12, 6, this.width / 2 + 18, 8);
      uiElements.ctx.stroke();
      const leafColor = this.team === 1 ? '#4ade80' : '#a3e635';
      uiElements.ctx.fillStyle = leafColor;
      const drawLeaf = (x, y, rotation) => {
        uiElements.ctx.save();
        uiElements.ctx.translate(x, y);
        uiElements.ctx.rotate(rotation);
        uiElements.ctx.scale(1, 0.6);
        uiElements.ctx.beginPath();
        uiElements.ctx.arc(0, 0, 5, 0, Math.PI * 2);
        uiElements.ctx.fill();
        uiElements.ctx.restore();
      };
      drawLeaf(this.width / 2 + branchLength, 5, Math.PI / 4);
      drawLeaf(this.width / 2 + branchLength - 5, -2, -Math.PI / 6);
      drawLeaf(this.width / 2 + 18, 8, Math.PI / 3);
      uiElements.ctx.restore();
    } else if (this.type === 'wizard') {
      let orbSize = 8;
      const floatingHeight = Math.sin(Date.now() / 300) * 3 - 15;
      if (this.isCasting) {
        const progress = 1 - this.castAnimProgress / 30;
        orbSize += Math.sin(progress * Math.PI) * 4;
        if (Math.random() < 0.5) gameState.particles.push(new Particle(this.x, this.y + floatingHeight, this.team, false, 'electric'));
      }
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y + floatingHeight);
      let orbColor = this.team === 1 ? '#a78bfa' : '#fde047';
      uiElements.ctx.shadowColor = orbColor;
      uiElements.ctx.shadowBlur = 20;
      uiElements.ctx.fillStyle = orbColor;
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(0, 0, orbSize, 0, Math.PI * 2);
      uiElements.ctx.fill();
      uiElements.ctx.shadowColor = 'transparent';
      uiElements.ctx.shadowBlur = 0;
      uiElements.ctx.fillStyle = 'white';
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(0, 0, orbSize * 0.4, 0, Math.PI * 2);
      uiElements.ctx.fill();
      uiElements.ctx.restore();
    } else if (this.type === 'bard') {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle + Math.PI / 2.5);
      uiElements.ctx.strokeStyle = '#854d0e';
      uiElements.ctx.lineWidth = 3;
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(-8, 5);
      uiElements.ctx.quadraticCurveTo(-10, -10, 0, -12);
      uiElements.ctx.quadraticCurveTo(10, -10, 8, 5);
      uiElements.ctx.lineTo(-8, 5);
      uiElements.ctx.stroke();
      uiElements.ctx.strokeStyle = '#fde047';
      uiElements.ctx.lineWidth = 1;
      for (let i = -6; i <= 6; i += 3) {
        uiElements.ctx.beginPath();
        uiElements.ctx.moveTo(i, 5);
        uiElements.ctx.lineTo(i * 0.7, -8);
        uiElements.ctx.stroke();
      }
      uiElements.ctx.restore();
    } else if (this.type === 'sledgehammer' || this.type === 'troll') {
      let weaponAngle = angle;
      const progress = this.swingAnimProgress / this.swingAnimDuration;
      if (this.isSwinging) {
        if (progress > 0.5) {
          const raiseProgress = (1 - progress) * 2;
          weaponAngle -= raiseProgress * (Math.PI / 1.5);
        } else {
          const slamProgress = progress * 2;
          weaponAngle += slamProgress * Math.PI;
        }
      }
      const handleLength = this.type === 'troll' ? 30 : 22;
      const handleWidth = this.type === 'troll' ? 6 : 4;
      const headWidth = this.type === 'troll' ? 20 : 12;
      const headHeight = this.type === 'troll' ? 18 : 10;
      const offsetDistance = 8;
      const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
      const offsetY = Math.sin(angle + Math.PI / 2) * offsetDistance;
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x + offsetX, this.y + offsetY);
      uiElements.ctx.rotate(weaponAngle);
      const handleStart = this.width / 2 - 10;
      uiElements.ctx.fillStyle = '#a16207';
      uiElements.ctx.fillRect(handleStart, -handleWidth / 2, handleLength, handleWidth);
      uiElements.ctx.fillStyle = this.type === 'troll' ? '#78716c' : '#a8a29e';
      const headX = handleStart + handleLength;
      uiElements.ctx.fillRect(headX, -headHeight / 2, headWidth, headHeight);
      uiElements.ctx.restore();
    } else if (this.type === 'duelist') {
      for (let i = -1; i <= 1; i += 2) {
        let swordAngle = angle;
        if (this.isSlashing && this.activeSword === i) {
          const progress = this.slashAnimProgress / this.slashAnimDuration;
          const arc = Math.PI / 1.5;
          swordAngle += (1 - progress) * arc - arc / 2;
        }
        const swordLength = 18;
        const swordWidth = 4;
        const offsetDistance = 8 * i;
        const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
        const offsetY = Math.sin(angle + Math.PI / 2) * offsetDistance;
        uiElements.ctx.save();
        uiElements.ctx.translate(this.x + offsetX, this.y + offsetY);
        uiElements.ctx.rotate(swordAngle);
        const hiltPosition = this.width / 2 - 8;
        uiElements.ctx.fillStyle = '#d1d5db';
        uiElements.ctx.fillRect(hiltPosition, -swordWidth / 2, swordLength, swordWidth);
        uiElements.ctx.fillStyle = '#9ca3af';
        uiElements.ctx.fillRect(hiltPosition, -swordWidth, swordWidth, swordWidth * 2);
        uiElements.ctx.restore();
      }
    } else if (this.type === 'assassin') {
      const daggerLength = 16;
      const daggerWidth = 4;
      const offsetDistance = 8;
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      
      let thrustOffset = 0;
      if (this.isSlashing) {
          const progress = 1 - (this.slashAnimProgress / this.slashAnimDuration);
          thrustOffset = Math.sin(progress * Math.PI) * 12;
      }
      
      uiElements.ctx.fillStyle = '#64748b'; // Slate dagger
      uiElements.ctx.fillRect(this.width/2 - 5 + thrustOffset, offsetDistance - daggerWidth/2, daggerLength, daggerWidth);
      uiElements.ctx.restore();
} else if (this.type === 'ghoul') {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      // Draw stitches on the body
      uiElements.ctx.strokeStyle = '#000000';
      uiElements.ctx.lineWidth = 1.5;
      uiElements.ctx.beginPath();
      // Main cut
      uiElements.ctx.moveTo(-5, -5);
      uiElements.ctx.lineTo(5, 5);
      // Stitches across
      uiElements.ctx.moveTo(-2, -6);
      uiElements.ctx.lineTo(0, -2);
      uiElements.ctx.moveTo(2, -2);
      uiElements.ctx.lineTo(4, 2);
      uiElements.ctx.moveTo(6, 2);
      uiElements.ctx.lineTo(8, 6);
      uiElements.ctx.stroke();
      // If revived, glowing eyes
      if (this.isRevived) {
          uiElements.ctx.fillStyle = '#ef4444'; // glowing red eyes
          uiElements.ctx.shadowColor = '#ef4444';
          uiElements.ctx.shadowBlur = 5;
          uiElements.ctx.beginPath();
          uiElements.ctx.arc(4, -3, 2, 0, Math.PI*2);
          uiElements.ctx.arc(4, 3, 2, 0, Math.PI*2);
          uiElements.ctx.fill();
      }
      uiElements.ctx.restore();
    } else if (this.type === 'assassin') {
      const daggerLength = 14;
      const daggerWidth = 3;
      const offsetDistance = 10;
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      
      let thrustOffset = 0;
      if (this.isSlashing) {
          const progress = this.slashAnimProgress / this.slashAnimDuration;
          thrustOffset = Math.sin(progress * Math.PI) * 12;
      }
      
      uiElements.ctx.fillStyle = '#64748b'; // Slate daggers
      // Left dagger
      uiElements.ctx.fillRect(this.width/2 - 5 + thrustOffset, -offsetDistance - daggerWidth/2, daggerLength, daggerWidth);
      // Right dagger
      uiElements.ctx.fillRect(this.width/2 - 5 + thrustOffset, offsetDistance - daggerWidth/2, daggerLength, daggerWidth);
      
      uiElements.ctx.restore();
    } else if (this.type === 'rockgolem') {
      for (let i = -1; i <= 1; i += 2) {
        let armAngle = angle + i * Math.PI / 4;
        let armDist = this.width / 2;
        if (this.isSmashing) {
          const progress = this.smashAnimProgress / this.smashAnimDuration;
          if (progress > 0.5) {
            const raiseProgress = (1 - progress) * 2;
            armAngle -= i * (Math.PI / 2) * raiseProgress;
            armDist += 5 * raiseProgress;
          } else {
            const smashProgress = progress * 2;
            armAngle += i * (Math.PI / 2.2) * smashProgress;
            armDist += 10 * Math.sin(smashProgress * Math.PI);
          }
        }
        const fistX = this.x + Math.cos(armAngle) * armDist;
        const fistY = this.y + Math.sin(armAngle) * armDist;
        uiElements.ctx.fillStyle = '#a1a1aa';
        uiElements.ctx.beginPath();
        uiElements.ctx.arc(fistX, fistY, 8, 0, Math.PI * 2);
        uiElements.ctx.fill();
        uiElements.ctx.strokeStyle = '#4b5563';
        uiElements.ctx.lineWidth = 1;
        uiElements.ctx.stroke();
      }
    }
  }
  findTarget(enemies) {
    if (enemies.length === 0) {
      this.target = null;
      return;
    }
    let bestTarget = null;
    if (this.type === 'assassin') {
      let bestScore = -Infinity;
      enemies.forEach(e => {
        if (e.isReviving || e.isShadow) return;
        
        let score = -e.hp; // Prefer lower HP
        
        const tags = UNIT_SPECS[e.type].tags;
        if (tags.includes('Support')) score += 500;
        else if (tags.includes('Magic')) score += 400;
        else if (tags.includes('Ranged')) score += 300;
        
        if (score > bestScore) {
          bestScore = score;
          bestTarget = e;
        }
      });
    } else {
      let minDistance = Infinity;
      enemies.forEach(e => {
        if (e.isReviving || e.isShadow) return;
        const d = getDistance(this, e);
        if (d < minDistance) {
          minDistance = d;
          bestTarget = e;
        }
      });
    }
    this.target = bestTarget;
  }
  findAllyTarget(friendlies) {
    const alliesToHeal = friendlies.filter(f => f.hp < f.maxHp && f !== this);
    if (alliesToHeal.length === 0) {
      this.target = null;
      return;
    }
    alliesToHeal.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    this.target = alliesToHeal[0];
  }
  applySeparation(friendlies) {
    if (this.type === 'guardian') return;
    let steerX = 0,
      steerY = 0;
    friendlies.forEach(other => {
      if (other !== this && other.type !== 'guardian') {
        const d = getDistance(this, other);
        if (d > 0 && d < this.width * 1.5) {
          const diffX = this.x - other.x;
          const diffY = this.y - other.y;
          steerX += diffX / d;
          steerY += diffY / d;
        }
      }
    });
    this.x += steerX * 0.5 * gameState.gameSpeed;
    this.y += steerY * 0.5 * gameState.gameSpeed;
  }
  update(friendlies, enemies) {
    if (this.target && (this.target.isReviving || this.target.isShadow)) this.target = null;
    
    if (this.isShadow && Date.now() > this.shadowTime) {
      this.isShadow = false;
    }
    
    if (this.type === 'assassin' && this.isInitialStealth) {
        if (!this.isShadow && this.battleFrames > 30) {
            this.isShadow = true;
            this.shadowTime = Infinity;
            gameState.animations.push(new FloatingText("STEALTH", this.x, this.y - 30, "#475569"));
        }
        this.battleFrames += 1 * gameState.gameSpeed;
    }
    
    if (this.isReviving) {
      if (Date.now() >= this.reviveTime) {
        this.isReviving = false;
        this.isRevived = true;
        const specs = UNIT_SPECS.ghoul;
        this.maxHp = specs.reviveMaxHp;
        this.hp = this.maxHp * specs.reviveHpMultiplier;
        this.speed *= specs.reviveSpeedMultiplier;
        this.attackDamage *= specs.reviveDamageMultiplier;
        this.attackCooldown *= specs.reviveCooldownMultiplier;
        for (let i = 0; i < 20; i++) gameState.particles.push(new Particle(this.x, this.y, this.team, true, 'poison'));
        gameState.animations.push(new FloatingText("REVIVED!", this.x, this.y - 30, "#ef4444"));
      }
      return;
    }
    
    if (this.isBeingKnockedBack) {
      this.x += (this.knockbackTargetX - this.x) * 0.1 * gameState.gameSpeed;
      this.y += (this.knockbackTargetY - this.y) * 0.1 * gameState.gameSpeed;
      if (getDistance(this, {
        x: this.knockbackTargetX,
        y: this.knockbackTargetY
      }) < 5) {
        this.isBeingKnockedBack = false;
      }
    }
    for (const buffKey in this.buffs) {
      if (Date.now() > this.buffs[buffKey].expires) {
        if (buffKey === 'armor') this.armor = 0;
        if (buffKey === 'chilled') this.coldStacks = 0;
        delete this.buffs[buffKey];
      }
    }
    if (this.buffs.druidHeal) {
      let healAmount = this.buffs.druidHeal.healPerTick * gameState.gameSpeed;
      if (this.buffs.healingReduced) {
        healAmount *= 1 - this.buffs.healingReduced.amount;
      }
      this.hp = Math.min(this.maxHp, this.hp + healAmount);
      this.buffs.druidHeal.caster.healingDone += healAmount;
      this.buffs.druidHeal.healedSinceLastText += healAmount;
      if (Date.now() > this.buffs.druidHeal.nextTextTime) {
        if (this.buffs.druidHeal.healedSinceLastText >= 1) {
          gameState.animations.push(new FloatingText(`+${Math.round(this.buffs.druidHeal.healedSinceLastText)}`, this.x, this.y, '#4ade80'));
          this.buffs.druidHeal.healedSinceLastText = 0;
          this.buffs.druidHeal.nextTextTime = Date.now() + 1000;
        }
      }
    }
    if (this.buffs.poison && Date.now() < this.buffs.poison.expires) {
      const damage = this.buffs.poison.dps * (1000 / 60 / 1000) * gameState.gameSpeed;
      const actualDamage = Math.min(this.hp, damage);
      this.hp -= actualDamage;
      this.damageTaken += actualDamage;
      if (this.buffs.poison.caster) {
        this.buffs.poison.caster.damageDealt += actualDamage;
      }
      if (this.hp <= 0 && this.buffs.poison.caster && !this.buffs.poison.killAwarded) {
        this.buffs.poison.caster.kills++;
        this.buffs.poison.killAwarded = true;
      }
      if (Math.random() < 0.2) {
        gameState.particles.push(new Particle(this.x, this.y, this.team === 1 ? 2 : 1, false, 'poison'));
      }
    }
    if (Date.now() < this.stunnedUntil || this.isBeingKnockedBack) return;
    
    if (this.type === 'rockgolem' && this.isCharging) {
        const chargeSpeed = 5 * gameState.gameSpeed;
        this.x += Math.cos(this.chargeAngle) * chargeSpeed;
        this.y += Math.sin(this.chargeAngle) * chargeSpeed;
        
        enemies.forEach(e => {
            if (e.hp <= 0) return;
            const dist = getDistance(this, e);
            if (dist < this.width/2 + e.width/2 + 20) {
                const angleToEnemy = Math.atan2(e.y - this.y, e.x - this.x);
                let diff = Math.abs(angleToEnemy - this.chargeAngle);
                
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                
                if (Math.abs(diff) < Math.PI / 2.5) { // In front! Drag them!
                   e.x += Math.cos(this.chargeAngle) * chargeSpeed;
                   e.y += Math.sin(this.chargeAngle) * chargeSpeed;
                   
                   // Keep them within bounds
                   e.x = Math.max(e.width/2, Math.min(e.x, uiElements.canvas.width - e.width/2));
                   e.y = Math.max(e.width/2, Math.min(e.y, uiElements.canvas.height - e.width/2));
                   
                   if (!e.chargeHitBy || e.chargeHitBy !== this) {
                       e.takeDamage(this.attackDamage * 4, this);
                       e.chargeHitBy = this;
                       e.stunnedUntil = Date.now() + 1500;
                       e.stunType = 'stun';
                       gameState.animations.push(new FloatingText("CRUSHED!", e.x, e.y - 30, "#eab308"));
                   }
                } else { // On the side! Push away!
                   if (!e.isBeingKnockedBack) {
                       e.isBeingKnockedBack = true;
                       e.knockbackTargetX = e.x + Math.cos(angleToEnemy) * 150;
                       e.knockbackTargetY = e.y + Math.sin(angleToEnemy) * 150;
                   }
                }
            }
        });

        this.chargeDuration -= 1 * gameState.gameSpeed;
        if (this.chargeDuration <= 0) {
            this.isCharging = false;
            enemies.forEach(e => { if (e.chargeHitBy === this) e.chargeHitBy = null; });
        }
        
        if (Math.random() < 0.5) {
            gameState.particles.push(new Particle(this.x + (Math.random()-0.5)*this.width, this.y + (Math.random()-0.5)*this.width, this.team, true, 'rock'));
            gameState.particles.push(new Particle(this.x + (Math.random()-0.5)*this.width, this.y + (Math.random()-0.5)*this.width, this.team, true, 'smoke'));
        }
        
        const radius = this.width / 2;
        this.x = Math.max(radius, Math.min(this.x, uiElements.canvas.width - radius));
        this.y = Math.max(radius, Math.min(this.y, uiElements.canvas.height - radius));
        
        // Stop charging if we hit a wall
        if (this.x === radius || this.x === uiElements.canvas.width - radius || this.y === radius || this.y === uiElements.canvas.height - radius) {
            this.isCharging = false;
            enemies.forEach(e => { if (e.chargeHitBy === this) e.chargeHitBy = null; });
        }
        return;
    }
    
    if (this.isCasting) {
      this.castAnimProgress -= 1 * gameState.gameSpeed;
      if (this.castAnimProgress <= 0) this.isCasting = false;
    }
    this.glowAnimProgress += 0.05 * gameState.gameSpeed;
    if (this.isSlashing) {
      this.slashAnimProgress -= 1 * gameState.gameSpeed;
      if (this.slashAnimProgress <= 0) this.isSlashing = false;
    }
    if (this.isThrusting) {
      this.thrustAnimProgress -= 1 * gameState.gameSpeed;
      if (this.thrustAnimProgress <= 0) this.isThrusting = false;
    }
    if (this.isThrowing) {
      this.throwAnimProgress -= 1 * gameState.gameSpeed;
      if (this.throwAnimProgress <= 0) this.isThrowing = false;
    }
    if (this.deflectAnim > 0) this.deflectAnim -= 1 * gameState.gameSpeed;
    if (this.isSmashing) {
      this.smashAnimProgress -= 1 * gameState.gameSpeed;
      if (this.smashAnimProgress <= 0) this.isSmashing = false;
    }
    if (this.isSwinging) {
      this.swingAnimProgress -= 1 * gameState.gameSpeed;
      if (this.swingAnimProgress <= 0) this.isSwinging = false;
    }
    if (this.isMultiHealActive && Date.now() > this.multiHealEndTime) this.isMultiHealActive = false;
    let currentSpeed = this.speed;
    if (this.type === 'troll' && this.hp <= this.maxHp * 0.5) {
      currentSpeed *= 2.5; // Rage mode, 2.5x faster!
    }
    if (this.type === 'assassin' && this.isShadow) {
      currentSpeed *= 3.0; // 3x movement speed in shadow mode!
    }
    if (this.buffs.slow && Date.now() < this.buffs.slow.expires) {
      currentSpeed *= 1 - this.buffs.slow.amount;
    }
    if (this.type === 'druid' || this.type === 'priest' || this.type === 'bard' || this.type === 'abyssal_summoner') {
      if (this.type === 'druid') {
        this.findAllyTarget(friendlies.filter(f => getDistance(this, f) <= this.attackRange));
        if (this.target) {
          this.attack(friendlies);
          return;
        }
      }
      if (friendlies.length > 1) {
        let totalX = 0,
          totalY = 0;
        let frontmostX = this.team === 1 ? -Infinity : Infinity;
        friendlies.forEach(f => {
          if (f !== this) {
            totalX += f.x;
            totalY += f.y;
            if (this.team === 1) frontmostX = Math.max(frontmostX, f.x);else frontmostX = Math.min(frontmostX, f.x);
          }
        });
        const avgY = totalY / (friendlies.length - 1);
        const followDistance = this.type === 'priest' || this.type === 'abyssal_summoner' ? 120 : 100;
        const targetX = this.team === 1 ? frontmostX - followDistance : frontmostX + followDistance;
        const dist = getDistance(this, {
          x: targetX,
          y: avgY
        });
        if (dist > 30) {
          const angle = Math.atan2(avgY - this.y, targetX - this.x);
          this.x += Math.cos(angle) * currentSpeed * gameState.gameSpeed;
          this.y += Math.sin(angle) * currentSpeed * gameState.gameSpeed;
          
          // Slide along wall if stuck
          if (this.x <= this.width / 2 || this.x >= uiElements.canvas.width - this.width / 2) {
              this.y += (this.y > uiElements.canvas.height / 2 ? -1 : 1) * currentSpeed * gameState.gameSpeed;
          }
        }
      } else {
        this.findTarget(enemies);
        if (this.target) {
          const angle = Math.atan2(this.y - this.target.y, this.x - this.target.x);
          this.x += Math.cos(angle) * currentSpeed * gameState.gameSpeed;
          this.y += Math.sin(angle) * currentSpeed * gameState.gameSpeed;
          
          // Slide along wall if stuck
          if (this.x <= this.width / 2 || this.x >= uiElements.canvas.width - this.width / 2) {
              this.y += (this.y > uiElements.canvas.height / 2 ? -1 : 1) * currentSpeed * gameState.gameSpeed;
          }
        }
      }
      const radius = this.width / 2;
      this.x = Math.max(radius, Math.min(this.x, uiElements.canvas.width - radius));
      this.y = Math.max(radius, Math.min(this.y, uiElements.canvas.height - radius));
      this.attack(enemies);
      return;
    }
    this.applySeparation(friendlies);
    this.findTarget(enemies);
    if (this.target) {
      if (getDistance(this, this.target) > this.attackRange) {
        if (this.type === 'assassin' && this.isShadow && getDistance(this, this.target) <= 200) {
            const oldX = this.x;
            const oldY = this.y;
            const backOffset = this.target.team === 1 ? -25 : 25;
            this.x = this.target.x + backOffset;
            this.y = this.target.y;
            
            for (let i = 0; i <= 15; i++) {
                const px = oldX + (this.x - oldX) * (i / 15);
                const py = oldY + (this.y - oldY) * (i / 15);
                let p = new Particle(px, py, this.team, true, 'poison');
                p.life = 15 + Math.random() * 10;
                gameState.particles.push(p);
            }
            for (let i = 0; i < 15; i++) gameState.particles.push(new Particle(this.x, this.y, this.team, true, 'poison'));
            
            this.isShadow = false;
            this.shadowTime = 0;
            this.isFlurrying = true;
            this.flurryTarget = this.target;
            this.attack(enemies);
        } else {
            let targetX = this.target.x;
            let targetY = this.target.y;
            
            if (this.type === 'assassin' && this.isShadow) {
                // Target the BACK of the enemy
                const backOffset = this.target.team === 1 ? -40 : 40;
                targetX += backOffset;
            }

            let angle = Math.atan2(targetY - this.y, targetX - this.x);
            
            if (this.type === 'assassin' && this.isShadow) {
                if (this.currentMoveAngle === 0) {
                    // Initialize facing perpendicular to add a curving effect
                    this.currentMoveAngle = angle + (Math.PI / 1.5) * (this.y > uiElements.canvas.height / 2 ? -1 : 1);
                }
                // Smoothly turn towards the target angle
                let angleDiff = angle - this.currentMoveAngle;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                
                const turnRate = 0.04 * gameState.gameSpeed;
                if (Math.abs(angleDiff) < turnRate) {
                    this.currentMoveAngle = angle;
                } else {
                    this.currentMoveAngle += Math.sign(angleDiff) * turnRate;
                }
                angle = this.currentMoveAngle;
            } else {
                this.currentMoveAngle = 0; // Reset
            }

            this.x += Math.cos(angle) * currentSpeed * gameState.gameSpeed;
            this.y += Math.sin(angle) * currentSpeed * gameState.gameSpeed;
        }
      } else {
        this.attack(enemies);
      }
    } else {
      this.x += (this.team === 1 ? currentSpeed : -currentSpeed) * gameState.gameSpeed;
    }
    const radius = this.width / 2;
    this.x = Math.max(radius, Math.min(this.x, uiElements.canvas.width - radius));
    this.y = Math.max(radius, Math.min(this.y, uiElements.canvas.height - radius));
    this.relX = this.x / uiElements.canvas.width;
    this.relY = this.y / uiElements.canvas.height;
  }
  attack(alliesOrEnemies) {
    let currentCooldown = this.attackCooldown;
    if (this.buffs.bard && Date.now() < this.buffs.bard.expires) {
      currentCooldown /= 1 + this.buffs.bard.attackSpeedBoost;
    }
    if (this.type === 'assassin' && this.isFlurrying) {
        if (this.target === this.flurryTarget && this.target.hp > 0) {
            currentCooldown = 150; // Flurry speed!
        } else {
            this.isFlurrying = false;
        }
    }
    const now = Date.now();
    if (this.type === 'duelist') {
      const specs = UNIT_SPECS.duelist;
      if (this.isBursting) {
        if (now - this.lastBurstSlashTime > specs.burstSlashCooldown / gameState.gameSpeed) {
          this.lastBurstSlashTime = now;
          this.burstsLeft--;
          this.activeSword *= -1;
          if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
            this.target.takeDamage(this.attackDamage, this);
            AudioManager.play('slice');
            gameState.animations.push(new SlashAnimation(this));
            this.isSlashing = true;
            this.slashAnimProgress = this.slashAnimDuration;
          }
          if (this.burstsLeft <= 0) {
            this.isBursting = false;
            this.lastAttackTime = now;
          }
        }
      } else if (now - this.lastAttackTime > currentCooldown / gameState.gameSpeed) {
        this.lastAttackTime = now;
        this.basicAttackCounter++;
        if (this.basicAttackCounter >= specs.burstTriggerCount) {
          this.basicAttackCounter = 0;
          this.isBursting = true;
          this.burstsLeft = specs.burstSlashCount;
          this.lastBurstSlashTime = now - specs.burstSlashCooldown / gameState.gameSpeed;
        } else {
          this.activeSword *= -1;
          if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
            this.target.takeDamage(this.attackDamage, this);
            AudioManager.play('slice');
            gameState.animations.push(new SlashAnimation(this));
            this.isSlashing = true;
            this.slashAnimProgress = this.slashAnimDuration;
          }
        }
      }
      return;
    }
    if (now - this.lastAttackTime > currentCooldown / gameState.gameSpeed) {
      this.lastAttackTime = now;
      if (this.type === 'abyssal_summoner') {
        const specs = UNIT_SPECS.abyssal_summoner;
        this.ownedSnakes = this.ownedSnakes.filter(s => s.hp > 0 && gameState.units.includes(s));
        if (this.ownedSnakes.length < specs.maxSnakes) {
          if (this.snakesSummoned === undefined) this.snakesSummoned = 0;
          
          let cost = 0;
          let label = '';
          const onePercent = Math.max(1, this.maxHp * 0.01);
          
          if (this.snakesSummoned === 0) {
            if (this.hp > this.maxHp * 0.5) {
              cost = this.maxHp * 0.5;
              label = '-50% HP (Sacrifice)';
            }
          } else {
            if (this.hp > onePercent) {
              cost = this.hp - onePercent;
              label = 'Final Sacrifice!';
            }
          }
          
          if (cost > 0) {
            this.hp -= cost;
            this.snakesSummoned++;
            gameState.animations.push(new FloatingText(label, this.x, this.y - 10, '#ef4444'));

            const baseAngle = this.team === 1 ? 0 : Math.PI;
            const spawnX = this.x + Math.cos(baseAngle) * 20;
            const spawnY = this.y + Math.sin(baseAngle) * 20;
            const snake = new ShadowSnake(spawnX, spawnY, this.team, this);
            gameState.units.push(snake);
            gameState.allUnitsThisRound.push(snake);
            this.ownedSnakes.push(snake);
          }
        }
        return;
      }
      if (this.type === 'wizard') {
        if (this.target) {
          this.isCasting = true;
          this.castAnimProgress = 30;
          gameState.animations.push(new ChainLightning(this, this.target, gameState.units));
        }
        return;
      }
      if (this.type === 'druid') {
        const specs = UNIT_SPECS.druid;
        if (this.isMultiHealActive) return;
        if (this.healAttackCounter >= specs.multiHealTriggerCount - 1) {
          this.healAttackCounter = 0;
          this.isMultiHealActive = true;
          this.multiHealEndTime = now + specs.multiHealDuration;
          gameState.animations.push(new MultiHealAura(this, gameState.units));
        } else {
          if (this.target) {
            gameState.projectiles.push(new HealingOrb(this, this.target));
            this.healAttackCounter++;
          }
        }
        return;
      }
      if (this.type === 'priest') {
        const specs = UNIT_SPECS.priest;
        const needsHeal = gameState.units.some(u => u.team === this.team && getDistance(this, u) <= specs.healRadius && u.hp < u.maxHp);
        if (!needsHeal) {
          // Revert cooldown so it can check again next frame
          this.lastAttackTime -= currentCooldown / gameState.gameSpeed;
          return;
        }
        this.healAttackCounter++;
        if (this.healAttackCounter >= specs.lightHealTriggerCount) {
          this.healAttackCounter = 0;
          gameState.animations.push(new AoeHeal(this.x, this.y, specs.healRadius, specs.healAmount, this.team, gameState.units, this, specs.lightHealArmorBonus, specs.lightHealArmorDuration, true));
        } else {
          gameState.animations.push(new AoeHeal(this.x, this.y, specs.healRadius, specs.healAmount, this.team, gameState.units, this, 0, 0, false));
        }
        return;
      }
      if (this.type === 'cryomancer') {
        const specs = UNIT_SPECS.cryomancer;
        this.basicAttackCounter++;
        if (this.basicAttackCounter >= specs.specialTriggerCount) {
          this.basicAttackCounter = 0;
          AudioManager.play('frostwave');
          gameState.animations.push(new ShiverWaveAnimation(this, gameState.units, specs.waveDamage, specs.freezeStacksApplied));
        } else {
          if (this.target) {
            AudioManager.play('ice_shards');
            const spreadAngles = [-0.4, -0.2, 0, 0.2, 0.4];
            for (let i = 0; i < 5; i++) {
               gameState.projectiles.push(new IceShard(this, this.target, spreadAngles[i]));
            }
          }
        }
        return;
      }
      if (this.type === 'alchemist') {
        const specs = UNIT_SPECS.alchemist;
        this.isThrowing = true;
        this.throwAnimProgress = this.throwAnimDuration;
        this.basicAttackCounter++;
        if (this.basicAttackCounter > specs.specialTriggerCount) {
          this.basicAttackCounter = 0;
          const enemies = alliesOrEnemies.sort((a, b) => getDistance(this, a) - getDistance(this, b));
          for (let i = 0; i < Math.min(specs.antiHealTargets, enemies.length); i++) {
            gameState.projectiles.push(new AntiHealDart(this, enemies[i]));
          }
        } else {
          if (this.target) {
            gameState.projectiles.push(new PoisonPotion(this, this.target));
          }
        }
        return;
      }
      if (this.type === 'rockgolem') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 10) {
          if (this.basicAttackCounter === undefined) this.basicAttackCounter = 0;
          this.basicAttackCounter++;
          
          if (this.basicAttackCounter >= 3) {
             this.basicAttackCounter = 0;
             this.isCharging = true;
             this.chargeDuration = 45; // Plow forward for 45 frames
             this.chargeAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
             gameState.animations.push(new FloatingText("CHARGE!", this.x, this.y - 40, "#eab308"));
             for(let i=0; i<15; i++) gameState.particles.push(new Particle(this.x, this.y, this.team, true, 'rock'));
          } else {
             this.target.takeDamage(this.attackDamage, this);
             const specs = UNIT_SPECS.rockgolem;
             gameState.animations.push(new GroundSmashAnimation(this, specs.aoeRadius, specs.aoeDamage, specs.stunDuration, gameState.units));
          }
        }
        return;
      } else if (this.type === 'bard') {
        const specs = UNIT_SPECS.bard;
        gameState.animations.push(new AuraBuffAnimation(this, specs.buffRadius, specs.damageBoost, specs.attackSpeedBoost, specs.buffDuration, gameState.units));
        return;
      } else if (this.type === 'troll') {
        const specs = UNIT_SPECS.troll;
        this.basicAttackCounter++;
        this.isSwinging = true;
        this.swingAnimProgress = this.swingAnimDuration;
        if (this.basicAttackCounter >= specs.smashTriggerCount) {
          this.basicAttackCounter = 0;
          gameState.animations.push(new TrollSmashAnimation(this, specs.smashAoeRadius, this.attackDamage, specs.smashStunDuration, specs.smashKnockback, gameState.units));
        } else {
          if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
            this.target.takeDamage(this.attackDamage, this, true);
            for (let i = 0; i < 5; i++) {
              gameState.particles.push(new Particle(this.target.x, this.target.y, this.team, true, 'rock'));
            }
          }
        }
        return;
      }
  
    if (this.type === 'abyssal_summoner') {
      const tetherRange = 250;
      uiElements.ctx.save();
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(this.x, this.y, tetherRange, 0, Math.PI * 2);
      uiElements.ctx.strokeStyle = this.team === 1 ? 'rgba(96, 165, 250, 0.2)' : 'rgba(248, 113, 113, 0.2)';
      uiElements.ctx.lineWidth = 2;
      uiElements.ctx.setLineDash([10, 10]);
      uiElements.ctx.stroke();
      uiElements.ctx.restore();
    }
    if (this.type === 'musketeer' || this.type === 'sniper') {
        if (this.type === 'musketeer') AudioManager.play('bullet');
        else if (this.type === 'sniper') AudioManager.play('snipe');
        gameState.projectiles.push(new Projectile(this, this.target, this.attackDamage, this.team));
        for (let i = 0; i < 8; i++) {
          gameState.particles.push(new Particle(this.x, this.y, this.team, false, 'smoke'));
        }
      } else if (this.type === 'archer') {
        AudioManager.play('arrow');
        gameState.projectiles.push(new Arrow(this, this.target));
      } else if (this.type === 'flamecaller') {
        if (this.basicAttackCounter === undefined) this.basicAttackCounter = 0;
        this.basicAttackCounter++;
        if (this.basicAttackCounter >= 3) {
          this.basicAttackCounter = 0;
          // Shoot 3 small homing fireballs
          gameState.projectiles.push(new Fireball(this, this.target, true, -0.3));
          gameState.projectiles.push(new Fireball(this, this.target, true, 0));
          gameState.projectiles.push(new Fireball(this, this.target, true, 0.3));
        } else {
          gameState.projectiles.push(new Fireball(this, this.target));
        }
      
    } else if (this.type === 'fortress') {
      // Fortress does not attack normally, it only bashes on hit
      return;
} else if (this.type === 'sledgehammer') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          this.target.takeDamage(this.attackDamage, this);
          for (let i = 0; i < 5; i++) {
            gameState.particles.push(new Particle(this.target.x, this.target.y, this.team, true, 'rock'));
          }
          if (!this.isSwinging) {
            this.isSwinging = true;
            this.swingAnimProgress = this.swingAnimDuration;
          }
        }
} else if (this.type === 'assassin') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          this.isInitialStealth = false;
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new SlashAnimation(this, '71, 85, 105')); // Dark slash
          if (!this.isSlashing) {
            this.isSlashing = true;
            this.slashAnimProgress = this.slashAnimDuration;
          }
        }
} else if (this.type === 'ghoul') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          AudioManager.play('bite');
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new SlashAnimation(this, '239, 68, 68')); // Red bite slash
          if (!this.isSlashing) {
            this.isSlashing = true;
            this.slashAnimProgress = this.slashAnimDuration;
          }
        }
} else if (this.type === 'swordsman' || this.type === 'guardian') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          if (this.type === 'swordsman') AudioManager.play('slash');
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new SlashAnimation(this));
          if (!this.isSlashing) {
            this.isSlashing = true;
            this.slashAnimProgress = this.slashAnimDuration;
          }
        }
      } else if (this.type === 'spearman') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          AudioManager.play('thrust');
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new ThrustAnimation(this, this.target));
          if (!this.isThrusting) {
            this.isThrusting = true;
            this.thrustAnimProgress = this.thrustAnimDuration;
          }
        }
      }
    }
  }
  takeDamage(damage, attacker = null, bypassesArmor = false) {
    if (this.isReviving) return;
    let modifiedDamage = damage;
    const attackerSpecs = attacker ? UNIT_SPECS[attacker.type] : null;
    if (attacker && attacker.buffs.bard && Date.now() < attacker.buffs.bard.expires) {
      modifiedDamage *= 1 + attacker.buffs.bard.damageBoost;
    }
    if (this.type === 'guardian' && attacker) {
      if (attacker.type === 'spearman') {
        modifiedDamage *= 0.5;
      }
      if (attacker.type === 'archer') {
        modifiedDamage *= 0.6;
      }
    }
    if (attackerSpecs && attackerSpecs.alwaysCrit) {
      bypassesArmor = true;
      gameState.animations.push(new FloatingText(`CRIT! ${Math.round(modifiedDamage)}`, this.x, this.y - 20, '#f97316'));
    } else if (attackerSpecs && attackerSpecs.critTargets && attackerSpecs.critTargets.includes(this.type)) {
      modifiedDamage *= attackerSpecs.critMultiplier;
      gameState.animations.push(new FloatingText(`CRIT! ${Math.round(modifiedDamage)}`, this.x, this.y - 20, '#f97316'));
    }
    let damageToArmor = 0;
    let damageToHp = 0;
    if (this.armor > 0 && !bypassesArmor) {
      const damageReducedByArmor = modifiedDamage * ARMOR_DAMAGE_REDUCTION_PERCENT;
      damageToArmor = Math.min(this.armor, damageReducedByArmor);
      this.armor -= damageToArmor;
      damageToHp = modifiedDamage - damageToArmor;
    } else {
      damageToHp = modifiedDamage;
    }
    
    // Check if it wasn't a crit (which already pushes its own text)
    if (!bypassesArmor && (!attackerSpecs || !attackerSpecs.alwaysCrit)) {
        let isCrit = attackerSpecs && attackerSpecs.critTargets && attackerSpecs.critTargets.includes(this.type);
        if (!isCrit && modifiedDamage > 0) {
            gameState.animations.push(new FloatingText(`-${Math.round(modifiedDamage)}`, this.x, this.y - 10, '#ef4444'));
        }
    }
    const actualDamage = Math.min(this.hp, damageToHp);
    this.hp -= damageToHp;
    
    // Fortress shield bash logic (after receiving 5 hits/instances of damage)
    if (this.type === 'fortress' && this.hp > 0 && damageToHp > 0) {
      this.hitsTaken = (this.hitsTaken || 0) + 1;
      if (this.hitsTaken >= 5) {
        this.hitsTaken = 0;
        const radius = 100;
        const force = 100;
        const damage = 5;
        
        if (!this.isSlashing) {
          this.isSlashing = true;
          this.slashAnimProgress = this.slashAnimDuration;
        }
        
        AudioManager.play('push');
        gameState.animations.push(new ShieldBashAnimation(this.x, this.y, radius, damage, force, this.team, gameState.units, this));
      }
    }
    
    this.damageTaken += damageToArmor + actualDamage;
    if (attacker) {
      attacker.damageDealt += damageToArmor + actualDamage;
    }
    if (this.hp <= 0 && this.type === 'ghoul' && !this.isRevived && !this.isReviving) {
      this.isReviving = true;
      this.hp = 1; // keep alive
      this.reviveTime = Date.now() + UNIT_SPECS.ghoul.reviveDelay;
      return;
    }
    
    if (this.hp <= 0 && attacker) {
      attacker.kills++;
      if (attacker.type === 'assassin') {
        attacker.isShadow = true;
        attacker.shadowTime = Date.now() + 2000; // 2 seconds stealth
        gameState.animations.push(new FloatingText("STEALTH", attacker.x, attacker.y - 30, "#475569"));
      }
    }
  }
  deflect() {
    this.deflectAnim = 10;
  }
}

class ShadowSnake extends Unit {
  constructor(x, y, team, summoner) {
    super(x, y, team, 'swordsman', x / uiElements.canvas.width, y / uiElements.canvas.height);
    const specs = UNIT_SPECS.abyssal_summoner;
    this.hp = specs.snakeHp;
    this.maxHp = specs.snakeHp;
    this.speed = specs.snakeSpeed;
    this.attackDamage = specs.snakeDamage;
    this.attackRange = specs.snakeAttackRange || 35;
    this.summoner = summoner;
    this.width = 24;
    this.height = 24;
    this.color = team === 1 ? '#1e3a8a' : '#7f1d1d'; // dark team colors
    this.wiggleOffset = Math.random() * Math.PI * 2;
    this.attackCooldown = 250; // Attack speed of the snake
  }
  update(friendlies, enemies) {
    if (!this.summoner || this.summoner.hp <= 0) {
      this.hp = 0; // Dies if owner dies
      return;
    }
    
    // Attack cooldown logic
    if (this.lastAttackTime === undefined) this.lastAttackTime = 0;
    
    if (enemies.length > 0) {
      const sortedEnemies = [...enemies].sort((a, b) => getDistance(this, a) - getDistance(this, b));
      this.target = sortedEnemies[0];
      
      if (this.target) {
        const dist = getDistance(this, this.target);
        if (dist <= this.attackRange) {
          const now = Date.now();
          if (now - this.lastAttackTime > this.attackCooldown / gameState.gameSpeed) {
            this.lastAttackTime = now;
            this.target.takeDamage(this.attackDamage, this);
            gameState.animations.push(new SlashAnimation(this));
          }
        } else {
          // Wiggle towards target
          const baseAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
          this.wiggleOffset += 0.15 * gameState.gameSpeed;
          const curveAngle = baseAngle + Math.sin(this.wiggleOffset) * 0.4;
          this.x += Math.cos(curveAngle) * this.speed * gameState.gameSpeed;
          this.y += Math.sin(curveAngle) * this.speed * gameState.gameSpeed;
        }
      }
    }
    
    // Tether to summoner (Drags the summoner, but summoner resists!)
    if (this.summoner) {
      const tetherRange = 250;
      const distToSummoner = getDistance(this, this.summoner);
      if (distToSummoner > tetherRange) {
        const pullAngle = Math.atan2(this.y - this.summoner.y, this.x - this.summoner.x);
        const pullDist = distToSummoner - tetherRange;
        
        // The summoner is heavy and resists! 
        // Snake only manages to drag the summoner 15% of the excess distance, 
        // while the snake is held back by the remaining 85%.
        const summonerDragFactor = 0.15;
        const snakePullBackFactor = 1 - summonerDragFactor;
        
        // Drag the summoner forward
        this.summoner.x += Math.cos(pullAngle) * pullDist * summonerDragFactor;
        this.summoner.y += Math.sin(pullAngle) * pullDist * summonerDragFactor;
        
        // Yank the snake back (so the tether doesn't exceed 250px)
        this.x -= Math.cos(pullAngle) * pullDist * snakePullBackFactor;
        this.y -= Math.sin(pullAngle) * pullDist * snakePullBackFactor;
        
        // Keep summoner in bounds
        const sRadius = this.summoner.width / 2;
        this.summoner.x = Math.max(sRadius, Math.min(this.summoner.x, uiElements.canvas.width - sRadius));
        this.summoner.y = Math.max(sRadius, Math.min(this.summoner.y, uiElements.canvas.height - sRadius));
      }
    }
    
    const radius = this.width / 2;
    this.x = Math.max(radius, Math.min(this.x, uiElements.canvas.width - radius));
    this.y = Math.max(radius, Math.min(this.y, uiElements.canvas.height - radius));
  }
  draw() {
    // Draw link to summoner
    if (this.summoner && this.summoner.hp > 0) {
      uiElements.ctx.save();
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(this.x, this.y);
      uiElements.ctx.lineTo(this.summoner.x, this.summoner.y);
      uiElements.ctx.strokeStyle = this.team === 1 ? 'rgba(96, 165, 250, 0.4)' : 'rgba(248, 113, 113, 0.4)';
      uiElements.ctx.lineWidth = 4;
      uiElements.ctx.setLineDash([5, 5]);
      uiElements.ctx.stroke();
      uiElements.ctx.restore();
    }

    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    let angle = 0;
    if (this.target) {
      angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    }
    uiElements.ctx.rotate(angle);
    uiElements.ctx.fillStyle = this.color;
    
    // Draw large evil snake body
    const segments = 6;
    for (let i = 0; i < segments; i++) {
      const segOffset = -i * 6;
      const currentW = Math.max(5, 18 - i * 2);
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(segOffset, Math.sin(Date.now() / 80 + i + this.wiggleOffset) * 6, currentW / 2, 0, Math.PI * 2);
      uiElements.ctx.fill();
    }
    
    // Draw evil eyes
    uiElements.ctx.fillStyle = '#ef4444'; // glowing red eyes
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(4, -4, 2.5, 0, Math.PI * 2);
    uiElements.ctx.fill();
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(4, 4, 2.5, 0, Math.PI * 2);
    uiElements.ctx.fill();
    
    uiElements.ctx.restore();
    super.drawHealthBar();
  }
}

export { Unit };
