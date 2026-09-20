
import { gameState, uiElements } from '../state.js';
import { UNIT_SPECS, ARMOR_DAMAGE_REDUCTION_PERCENT } from '../config.js';
import { getDistance, drawLightningBolt, AudioManager } from '../utils.js';
import { Projectile, Nail, SentryBullet, IceShard, HealingOrb, Arrow, Fireball, PoisonPotion, AntiHealDart, EagleProjectile, PenetratingBeam, ChainProjectile, AbsorbOrb, NecromancerFireball } from './Projectiles.js';
import { PoisonSplashAnimation, ChainPushAnimation, SlashAnimation, ThrustAnimation, AoeExplosion, AoeHeal, MultiHealAura, GroundSmashAnimation, TrollSmashAnimation, ShiverWaveAnimation, ChainLightning, AuraBuffAnimation, FloatingText, Particle, ShieldBashAnimation } from './Effects.js';

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
    this.isSmashingWindup = false;
    this.smashWindupProgress = 0;
    this.smashWindupDuration = 162;
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
    if (this.type === 'rockgolem' && this.isSmashingWindup) {
        const specs = UNIT_SPECS.rockgolem;
        const progress = this.smashWindupProgress / this.smashWindupDuration;
        const maxRadius = specs.aoeRadius * 2.5;
        const currentRadius = maxRadius * progress;
        
        uiElements.ctx.save();
        uiElements.ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
        uiElements.ctx.fillStyle = 'rgba(234, 179, 8, 0.1)';
        uiElements.ctx.lineWidth = 2;
        uiElements.ctx.beginPath();
        uiElements.ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        uiElements.ctx.fill();
        uiElements.ctx.stroke();
        
        uiElements.ctx.strokeStyle = 'rgba(234, 179, 8, 0.2)';
        uiElements.ctx.beginPath();
        uiElements.ctx.arc(this.x, this.y, maxRadius, 0, Math.PI * 2);
        uiElements.ctx.stroke();
        uiElements.ctx.restore();
    }

    if (this.type === 'absorber' && this.isAbsorbing) {
        const timeRemaining = this.absorbEndTime - Date.now();
        const progress = 1 - (timeRemaining / 8000);
        if (progress > 0 && progress <= 1) {
            const maxRadius = Math.min(300, 50 + (this.storedDamage || 0));
            const currentRadius = maxRadius * progress;
            const rgbColor = this.team === 1 ? '96, 165, 250' : '248, 113, 113';
            const hexColor = this.team === 1 ? '#60a5fa' : '#f87171';
            
            uiElements.ctx.save();
            uiElements.ctx.strokeStyle = `rgba(${rgbColor}, 0.5)`;
            uiElements.ctx.fillStyle = `rgba(${rgbColor}, 0.1)`;
            uiElements.ctx.lineWidth = 2;
            uiElements.ctx.beginPath();
            uiElements.ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
            uiElements.ctx.fill();
            uiElements.ctx.stroke();
            
            uiElements.ctx.strokeStyle = `rgba(${rgbColor}, 0.4)`;
            uiElements.ctx.setLineDash([5, 5]);
            uiElements.ctx.beginPath();
            uiElements.ctx.arc(this.x, this.y, maxRadius, 0, Math.PI * 2);
            uiElements.ctx.stroke();
            uiElements.ctx.restore();
            
            uiElements.ctx.save();
            uiElements.ctx.fillStyle = hexColor;
            uiElements.ctx.font = 'bold 12px Arial';
            uiElements.ctx.textAlign = 'center';
            const releaseDamage = (this.storedDamage || 0) * 0.4;
            uiElements.ctx.fillText(`DMG: ${Math.round(releaseDamage)}`, this.x, this.y - maxRadius - 10);
            uiElements.ctx.restore();
        }
    }
    if (this.type === 'necromancer' && this.isRevivingAlly && this.reviveTarget) {
      uiElements.ctx.save();
      uiElements.ctx.strokeStyle = '#22c55e'; // Green line
      uiElements.ctx.lineWidth = 3;
      
      const dx = this.reviveTarget.x - this.x;
      const dy = this.reviveTarget.y - this.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(this.x, this.y);
      
      const time = Date.now();
      const amplitude = 12; // wave width
      const frequency = 0.08; // number of waves
      const speed = 0.015; // wiggle speed
      
      for (let i = 0; i <= dist; i += 4) {
         // Taper at the ends so it attaches cleanly to both units
         const taper = Math.sin((i / dist) * Math.PI); 
         const offset = Math.sin(i * frequency - time * speed) * amplitude * taper;
         
         const px = this.x + Math.cos(angle) * i - Math.sin(angle) * offset;
         const py = this.y + Math.sin(angle) * i + Math.cos(angle) * offset;
         uiElements.ctx.lineTo(px, py);
      }
      uiElements.ctx.lineTo(this.reviveTarget.x, this.reviveTarget.y);
      
      uiElements.ctx.stroke();
      
      // Add a slight glow to it
      uiElements.ctx.shadowBlur = 8;
      uiElements.ctx.shadowColor = '#22c55e';
      uiElements.ctx.stroke();
      
      // Draw ghost of the revive target
      uiElements.ctx.globalAlpha = 0.4 + 0.2 * Math.sin(time / 150);
      uiElements.ctx.shadowBlur = 15;
      uiElements.ctx.shadowColor = '#22c55e';
      
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(this.reviveTarget.x, this.reviveTarget.y, this.reviveTarget.width / 2, 0, Math.PI * 2);
      uiElements.ctx.fillStyle = this.team === 1 ? '#2dd4bf' : '#bef264';
      uiElements.ctx.fill();
      uiElements.ctx.lineWidth = 2;
      uiElements.ctx.strokeStyle = '#22c55e';
      uiElements.ctx.stroke();
      
      this.reviveTarget.drawEquipment();
      
      uiElements.ctx.restore();
    }

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
    
    const isRestricted = this.stunType === 'restrict' && Date.now() < this.stunnedUntil;
    if (isRestricted) {
        uiElements.ctx.translate(Math.random() * 4 - 2, Math.random() * 4 - 2);
    }
    
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
    uiElements.ctx.fillStyle = isRestricted ? '#0f172a' : this.color;
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
      uiElements.ctx.fillStyle = isRestricted ? '#0f172a' : this.color; // very dark/black
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
    } else if (this.type === 'dummy') {
      uiElements.ctx.beginPath();
      uiElements.ctx.rect(this.x - this.width / 2 + 5, this.y - this.height / 2, this.width - 10, this.height);
      uiElements.ctx.fill();
      uiElements.ctx.fillStyle = '#f59e0b';
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(this.x, this.y, this.width / 2.5, 0, Math.PI * 2);
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
    
    if (this.type === 'dummy') {
      if (!this.damageHistory) this.damageHistory = [];
      const now = Date.now();
      this.damageHistory = this.damageHistory.filter(d => now - d.time < 1000);
      const dps = this.damageHistory.reduce((sum, d) => sum + d.amount, 0);
      
      uiElements.ctx.fillStyle = '#facc15';
      uiElements.ctx.font = 'bold 14px Arial';
      uiElements.ctx.textAlign = 'center';
      uiElements.ctx.fillText(`DPS: ${Math.round(dps)}`, this.x, this.y - this.height - 25);
      
      uiElements.ctx.fillStyle = '#ef4444';
      uiElements.ctx.font = 'bold 12px Arial';
      const totalStr = Math.round(this.totalDamageReceived || 0).toString();
      uiElements.ctx.fillText(`Total: ${totalStr}`, this.x, this.y + this.height + 15);
    }


    this.drawHealthBar();
    if (this.ownedSentries) {
       this.ownedSentries.forEach(s => s.draw());
    }
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
    
    if ((this.type === 'rockgolem' || this.type === 'duelist' || this.type === 'druid' || this.type === 'priest' || this.type === 'troll' || this.type === 'cryomancer' || this.type === 'alchemist' || this.type === 'force_wall' || this.type === 'fortress' || this.type === 'flamecaller' || this.type === 'wizard' || this.type === 'hunter' || this.type === 'absorber') && gameState.isBattleStarted) {
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
        case 'absorber':
          counter = this.hitsTaken || 0;
          maxCount = 10;
          barColor = this.isAbsorbing ? '#d946ef' : '#a855f7';
          if (this.isAbsorbing) {
             counter = 1;
             maxCount = 1;
          }
          break;
        case 'force_wall':
          counter = this.hitsTaken || 0;
          maxCount = 4;
          barColor = this.isReflecting ? '#f472b6' : '#38bdf8';
          if (this.isReflecting) {
             counter = 1;
             maxCount = 1;
          }
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
        case 'wizard':
          counter = this.basicAttackCounter || 0;
          maxCount = 4;
          barColor = '#c084fc';
          break;
        case 'hunter':
          specs = UNIT_SPECS.hunter;
          counter = this.basicAttackCounter || 0;
          maxCount = specs.eagleTriggerCount;
          barColor = '#8B4513'; // Brown for eagle
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
    let totalRestrictHits = 0;
    if (this.restrictorHitCount) {
        for (let id in this.restrictorHitCount) {
            totalRestrictHits += this.restrictorHitCount[id];
        }
    }
    if (totalRestrictHits > 0 && Date.now() >= this.stunnedUntil) {
      uiElements.ctx.fillStyle = '#a855f7';
      uiElements.ctx.font = 'bold 14px "Roboto Mono"';
      uiElements.ctx.textAlign = 'center';
      uiElements.ctx.textBaseline = 'bottom';
      uiElements.ctx.fillText(`🔗${totalRestrictHits}`, this.x + iconSpacing * 2, healthBarY - 15);
    }
    if (Date.now() < this.stunnedUntil) {
      uiElements.ctx.fillStyle = 'white';
      uiElements.ctx.font = 'bold 12px "Roboto Mono"';
      uiElements.ctx.textAlign = 'center';
      uiElements.ctx.textBaseline = 'bottom';
      uiElements.ctx.fillText(this.stunType === 'freeze' ? 'FROZEN' : (this.stunType === 'restrict' ? 'LOCKED' : 'STUN'), this.x, healthBarY - 2);
      const angle = Date.now() / 200 % (Math.PI * 2);
      uiElements.ctx.fillStyle = '#facc15';
      uiElements.ctx.font = 'bold 14px "Roboto Mono"';
      for (let i = 0; i < 2; i++) {
        const starAngle = angle + i * Math.PI;
        const starX = this.x + Math.cos(starAngle) * 12;
        const starY = this.y - 25 + Math.sin(starAngle) * 4;
        uiElements.ctx.fillText('★', starX, starY);
      }
    let nextY = healthBarY + healthBarHeight + 3;
    if (this.type === 'restrictor') {
        let lockCount = 4;
        if (this.target && this.target.restrictorHitCount) {
            const hits = this.target.restrictorHitCount[this.id] || 0;
            lockCount = 4 - Math.floor(hits / 2);
            if (lockCount < 1) lockCount = 1;
        }
        uiElements.ctx.fillStyle = '#a855f7';
        uiElements.ctx.font = 'bold 9px Arial';
        uiElements.ctx.textAlign = 'center';
        uiElements.ctx.fillText(`LOCK IN: ${lockCount}`, this.x, nextY + 7);
        nextY += 10;
        
        const PUSH_COOLDOWN = 5000;
        if (this.lastPushTime && Date.now() - this.lastPushTime < PUSH_COOLDOWN) {
            const cdProgress = 1 - ((Date.now() - this.lastPushTime) / PUSH_COOLDOWN);
            uiElements.ctx.fillStyle = 'rgba(75, 85, 99, 0.5)';
            uiElements.ctx.fillRect(this.x - 15, nextY, 30, 3);
            uiElements.ctx.fillStyle = '#a855f7';
            uiElements.ctx.fillRect(this.x - 15, nextY, 30 * cdProgress, 3);
        } else {
            uiElements.ctx.fillStyle = '#a855f7';
            uiElements.ctx.font = 'bold 8px Arial';
            uiElements.ctx.textAlign = 'center';
            uiElements.ctx.fillText("PUSH READY", this.x, nextY + 6);
        }
    }

    }
  }
  drawEquipment() {

    let angle = this.team === 1 ? 0 : Math.PI;
    if (this.target) {
      angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    }
    if (this.type === 'accelerator' && this.gunAngle !== undefined) {
      angle = this.gunAngle;
    }

    if (this.type === 'restrictor') {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      uiElements.ctx.strokeStyle = '#94a3b8';
      uiElements.ctx.lineWidth = 2;
      
      // Right hand coil
      for (let i = 0; i < 3; i++) {
         uiElements.ctx.beginPath();
         uiElements.ctx.ellipse(this.width / 2 + 2, -10 + i * 2, 4, 2, 0, 0, Math.PI*2);
         uiElements.ctx.stroke();
      }
      
      // Left hand coil
      for (let i = 0; i < 3; i++) {
         uiElements.ctx.beginPath();
         uiElements.ctx.ellipse(this.width / 2 + 2, 10 + i * 2, 4, 2, 0, 0, Math.PI*2);
         uiElements.ctx.stroke();
      }
      uiElements.ctx.restore();
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
    if (this.type === 'musketeer' || this.type === 'sniper' || this.type === 'hunter' || this.type === 'minigunner' || this.type === 'accelerator' || this.type === 'engineer') {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      
      const gunBaseX = this.width / 2;
      
      if (this.type === 'musketeer') {
         uiElements.ctx.strokeStyle = '#9ca3af';
         uiElements.ctx.lineWidth = 5;
         uiElements.ctx.beginPath();
         uiElements.ctx.moveTo(gunBaseX, 0);
         uiElements.ctx.lineTo(gunBaseX + 12, 0);
         uiElements.ctx.stroke();
         uiElements.ctx.fillStyle = '#8b4513';
         uiElements.ctx.fillRect(gunBaseX - 4, -2, 8, 4);
      } else if (this.type === 'sniper') {
         uiElements.ctx.strokeStyle = '#374151';
         uiElements.ctx.lineWidth = 4;
         uiElements.ctx.beginPath();
         uiElements.ctx.moveTo(gunBaseX, 0);
         uiElements.ctx.lineTo(gunBaseX + 22, 0);
         uiElements.ctx.stroke();
         uiElements.ctx.fillStyle = '#111827';
         uiElements.ctx.fillRect(gunBaseX + 4, -5, 8, 3);
         if (this.target) {
            uiElements.ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
            uiElements.ctx.lineWidth = 1;
            uiElements.ctx.beginPath();
            uiElements.ctx.moveTo(gunBaseX + 22, 0);
            uiElements.ctx.lineTo(gunBaseX + 1000, 0);
            uiElements.ctx.stroke();
         }
      } else if (this.type === 'hunter') {
         uiElements.ctx.strokeStyle = '#4b5563';
         uiElements.ctx.lineWidth = 3;
         uiElements.ctx.beginPath();
         uiElements.ctx.moveTo(gunBaseX, 0);
         uiElements.ctx.lineTo(gunBaseX + 16, 0);
         uiElements.ctx.stroke();
         uiElements.ctx.fillStyle = '#8b4513';
         uiElements.ctx.fillRect(gunBaseX - 2, -2, 6, 4);
         if (!this.eagleOut) {
            uiElements.ctx.fillStyle = '#8B4513';
            uiElements.ctx.beginPath();
            uiElements.ctx.arc(0, -this.height / 2 - 2, 4, 0, Math.PI*2);
            uiElements.ctx.fill();
            uiElements.ctx.fillStyle = '#fef08a';
            uiElements.ctx.beginPath();
            uiElements.ctx.moveTo(4, -this.height / 2 - 2);
            uiElements.ctx.lineTo(7, -this.height / 2 - 4);
            uiElements.ctx.lineTo(4, -this.height / 2 - 6);
            uiElements.ctx.fill();
         }
      } else if (this.type === 'minigunner') {
         uiElements.ctx.fillStyle = '#374151';
         uiElements.ctx.fillRect(gunBaseX - 2, -6, 10, 12);
         uiElements.ctx.strokeStyle = '#1f2937';
         uiElements.ctx.lineWidth = 2;
         for (let i = -4; i <= 4; i += 4) {
            uiElements.ctx.beginPath();
            uiElements.ctx.moveTo(gunBaseX + 8, i);
            uiElements.ctx.lineTo(gunBaseX + 18, i);
            uiElements.ctx.stroke();
         }
      } else if (this.type === 'accelerator') {
         uiElements.ctx.fillStyle = '#6b7280';
         uiElements.ctx.fillRect(gunBaseX, -4, 18, 8);
         uiElements.ctx.fillStyle = '#0ea5e9';
         uiElements.ctx.fillRect(gunBaseX + 4, -2, 10, 4);
         uiElements.ctx.strokeStyle = '#38bdf8';
         uiElements.ctx.lineWidth = 2;
         uiElements.ctx.beginPath();
         uiElements.ctx.arc(gunBaseX + 14, 0, 6, -Math.PI/2, Math.PI/2);
         uiElements.ctx.stroke();
         const isOnCooldown = (Date.now() - this.lastAttackTime < this.attackCooldown / gameState.gameSpeed) && !this.isAiming && !this.isContinuous;
         if (this.target && !isOnCooldown) {
            if (this.isAiming) {
                const aimProgress = (Date.now() - this.aimStartTime) / (800 / gameState.gameSpeed);
                const opacity = Math.max(0, Math.min(1, aimProgress));
                uiElements.ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
                uiElements.ctx.lineWidth = 1;
                uiElements.ctx.beginPath();
                uiElements.ctx.moveTo(gunBaseX + 18, 0);
                uiElements.ctx.lineTo(gunBaseX + 1000, 0);
                uiElements.ctx.stroke();
            }
         }
      } else if (this.type === 'engineer') {
         uiElements.ctx.fillStyle = '#f59e0b';
         uiElements.ctx.fillRect(gunBaseX, -3, 14, 6);
         uiElements.ctx.fillStyle = '#6b7280';
         uiElements.ctx.fillRect(gunBaseX + 14, -1, 4, 2);
         uiElements.ctx.fillStyle = '#8b4513';
         uiElements.ctx.fillRect(-8, 5, 12, 3);
         uiElements.ctx.fillStyle = '#9ca3af';
         uiElements.ctx.fillRect(-10, 3, 4, 7);
      }
      uiElements.ctx.restore();
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
    } else if (this.type === 'guardian') {
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
    } else if (this.type === 'force_wall') {
      const shieldWidth = 10;
      const shieldHeight = 60; // Wide shield
      let shieldOffset = 8;
      if (this.isSlashing) {
         const progress = this.slashAnimProgress / this.slashAnimDuration;
         shieldOffset += Math.sin(progress * Math.PI) * 15;
      }
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      // Holographic glow effect
      uiElements.ctx.shadowBlur = 12;
      uiElements.ctx.shadowColor = this.isReflecting ? 'rgba(244, 114, 182, 0.9)' : 'rgba(56, 189, 248, 0.9)';
      
      const shieldRadius = this.width / 2 + shieldOffset;
      uiElements.ctx.beginPath();
      // Draw arc from -60 to 60 degrees (wide curve)
      uiElements.ctx.arc(0, 0, shieldRadius, -Math.PI / 3, Math.PI / 3);
      
      // Thick semi-transparent core
      uiElements.ctx.lineWidth = 8;
      uiElements.ctx.strokeStyle = this.isReflecting ? 'rgba(236, 72, 153, 0.6)' : 'rgba(56, 189, 248, 0.5)';
      uiElements.ctx.stroke();
      
      // Bright solid inner edge
      uiElements.ctx.lineWidth = 2;
      uiElements.ctx.strokeStyle = this.isReflecting ? 'rgba(252, 165, 211, 1)' : 'rgba(186, 230, 253, 1)';
      uiElements.ctx.stroke();
      uiElements.ctx.restore();
    } else if (this.type === 'absorber') {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      if (this.isAbsorbing) {
         uiElements.ctx.shadowBlur = 15;
         uiElements.ctx.shadowColor = 'rgba(217, 70, 239, 0.9)'; // bright purple/pink
         
         uiElements.ctx.beginPath();
         uiElements.ctx.arc(0, 0, this.width / 2 + 10, 0, Math.PI * 2);
         uiElements.ctx.lineWidth = 4;
         uiElements.ctx.strokeStyle = 'rgba(217, 70, 239, 0.8)';
         uiElements.ctx.stroke();
         uiElements.ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
         uiElements.ctx.fill();
      }
      
      // Draw the core crystal
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(12, 0);
      uiElements.ctx.lineTo(0, 12);
      uiElements.ctx.lineTo(-12, 0);
      uiElements.ctx.lineTo(0, -12);
      uiElements.ctx.closePath();
      uiElements.ctx.fillStyle = this.team === 1 ? '#60a5fa' : '#f87171';
      uiElements.ctx.fill();
      uiElements.ctx.lineWidth = 2;
      uiElements.ctx.strokeStyle = '#fff';
      uiElements.ctx.stroke();

      uiElements.ctx.restore();
      
      if (this.isAbsorbing) {
          uiElements.ctx.save();
          uiElements.ctx.translate(this.x, this.y);
          
          // Draw timer
          const timeLeft = Math.max(0, (this.absorbEndTime - Date.now()) / 1000).toFixed(1);
          
          uiElements.ctx.fillStyle = '#fff';
          uiElements.ctx.font = '12px Arial';
          uiElements.ctx.textAlign = 'center';
          uiElements.ctx.fillText(`${timeLeft}s`, 0, -this.width / 2 - 15);
          
          uiElements.ctx.restore();
      }
    } else if (this.type === 'necromancer') {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      
      // Draw a spellbook
      uiElements.ctx.fillStyle = '#451a03'; // dark brown cover
      uiElements.ctx.fillRect(this.width / 2 + 2, -10, 12, 14);
      
      uiElements.ctx.fillStyle = '#fef3c7'; // parchment pages
      uiElements.ctx.fillRect(this.width / 2 + 4, -8, 8, 10);
      
      // Glowing green runes
      uiElements.ctx.fillStyle = '#22c55e';
      uiElements.ctx.fillRect(this.width / 2 + 5, -6, 6, 1.5);
      uiElements.ctx.fillRect(this.width / 2 + 5, -3, 5, 1.5);
      uiElements.ctx.fillRect(this.width / 2 + 5, 0, 4, 1.5);
      
      if (this.isRevivingAlly) {
         uiElements.ctx.shadowBlur = 10;
         uiElements.ctx.shadowColor = '#22c55e';
         uiElements.ctx.strokeStyle = '#22c55e';
         uiElements.ctx.lineWidth = 1;
         uiElements.ctx.strokeRect(this.width / 2 + 2, -10, 12, 14);
      }
      
      uiElements.ctx.restore();
    } else if (this.type === 'fortress') {
      const shieldWidth = 14;
      const shieldHeight = 40;
      let shieldOffset = 2;
      if (this.isSlashing) {
         const progress = this.slashAnimProgress / this.slashAnimDuration;
         shieldOffset += Math.sin(progress * Math.PI) * 15;
      }
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      uiElements.ctx.fillStyle = '#475569';
      uiElements.ctx.fillRect(this.width / 2 + shieldOffset, -shieldHeight / 2, shieldWidth, shieldHeight);
      uiElements.ctx.lineWidth = 2;
      uiElements.ctx.strokeStyle = '#1e293b';
      uiElements.ctx.strokeRect(this.width / 2 + shieldOffset, -shieldHeight / 2, shieldWidth, shieldHeight);
      uiElements.ctx.fillStyle = '#cbd5e1';
      uiElements.ctx.fillRect(this.width / 2 + shieldOffset, -shieldHeight / 2 + 8, shieldWidth, 4);
      uiElements.ctx.fillRect(this.width / 2 + shieldOffset, shieldHeight / 2 - 12, shieldWidth, 4);
      uiElements.ctx.restore();
    } else if (this.type === 'assassin') {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      let swordAngle = 0;
      if (this.isSlashing) {
         const progress = this.slashAnimProgress / this.slashAnimDuration;
         swordAngle = (1 - progress) * Math.PI;
      }
      uiElements.ctx.rotate(swordAngle);
      uiElements.ctx.fillStyle = '#111827';
      uiElements.ctx.fillRect(this.width / 2, -12, 10, 3);
      uiElements.ctx.fillRect(this.width / 2, 9, 10, 3);
      uiElements.ctx.fillStyle = '#64748b';
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(this.width / 2 + 10, -13);
      uiElements.ctx.lineTo(this.width / 2 + 22, -10.5);
      uiElements.ctx.lineTo(this.width / 2 + 10, -8);
      uiElements.ctx.fill();
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(this.width / 2 + 10, 8);
      uiElements.ctx.lineTo(this.width / 2 + 22, 10.5);
      uiElements.ctx.lineTo(this.width / 2 + 10, 13);
      uiElements.ctx.fill();
      uiElements.ctx.restore();
} else if (this.type === 'ghoul') {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      let clawOffset = 0;
      if (this.isSlashing) clawOffset = 8;
      uiElements.ctx.fillStyle = this.isRevived ? '#dc2626' : '#4ade80';
      uiElements.ctx.fillRect(this.width / 2 + clawOffset, -10, 8, 2);
      uiElements.ctx.fillRect(this.width / 2 + clawOffset, -7, 10, 2);
      uiElements.ctx.fillRect(this.width / 2 + clawOffset, -4, 8, 2);
      uiElements.ctx.fillRect(this.width / 2 + clawOffset, 4, 8, 2);
      uiElements.ctx.fillRect(this.width / 2 + clawOffset, 7, 10, 2);
      uiElements.ctx.fillRect(this.width / 2 + clawOffset, 10, 8, 2);
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
    const validEnemies = enemies.filter(e => !(e.type === 'assassin' && (e.isShadow || e.isInitialStealth)));
    if (validEnemies.length === 0) {
      this.target = null;
      return;
    }
    let closestEnemy = null;
    let minDistance = Infinity;
    if (this.type === 'assassin') {
        validEnemies.forEach(e => {
            let score = e.maxHp + getDistance(this, e) * 0.1;
            if (e.isSummon) score += 10000; // Strongly de-prioritize summons (like the evil snake)
            
            if (score < minDistance) {
                minDistance = score;
                closestEnemy = e;
            }
        });
    } else if (this.type === 'restrictor') {
        let bestTarget = null;
        let bestDistance = Infinity;
        let bestTargetLocked = null;
        let bestDistanceLocked = Infinity;
        validEnemies.forEach(e => {
            const d = getDistance(this, e);
            const isLocked = e.stunType === 'restrict' && Date.now() < e.stunnedUntil;
            if (!isLocked) {
                if (d < bestDistance) {
                    bestDistance = d;
                    bestTarget = e;
                }
            } else {
                if (d < bestDistanceLocked) {
                    bestDistanceLocked = d;
                    bestTargetLocked = e;
                }
            }
        });
        closestEnemy = bestTarget ? bestTarget : bestTargetLocked;
    } else {
        validEnemies.forEach(e => {
          const d = getDistance(this, e);
          if (d < minDistance) {
            minDistance = d;
            closestEnemy = e;
          }
        });
    }
    this.target = closestEnemy;
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
    if (this.type === 'restrictor') {
       const PUSH_COOLDOWN = 5000;
       const PUSH_RANGE = 70;
       if (!this.lastPushTime || Date.now() - this.lastPushTime > PUSH_COOLDOWN) {
          for (const enemy of enemies) {
             if (enemy.hp > 0 && enemy.team !== this.team) {
                if (getDistance(this, enemy) < PUSH_RANGE) {
                   const angle = Math.atan2(enemy.y - this.y, enemy.x - this.x);
                   enemy.isBeingKnockedBack = true;
                   enemy.knockbackTargetX = enemy.x + Math.cos(angle) * 120;
                   enemy.knockbackTargetY = enemy.y + Math.sin(angle) * 120;
                   enemy.takeDamage(5, this);
                   this.lastPushTime = Date.now();
                   AudioManager.play('chain_release');
                   gameState.animations.push(new ChainPushAnimation(this, enemy));
                   break;
                }
             }
          }
       }
    }

    if (this.isReviving) {
      if (Date.now() > this.reviveTime) {
        this.isReviving = false;
        this.isRevived = true;
        const specs = UNIT_SPECS.ghoul;
        this.maxHp = specs.reviveMaxHp;
        this.hp = this.maxHp;
        this.speed *= specs.reviveSpeedMultiplier;
        this.attackDamage *= specs.reviveDamageMultiplier;
        this.attackCooldown *= specs.reviveCooldownMultiplier;
        this.color = '#7f1d1d';
        gameState.animations.push(new FloatingText("REVIVED!", this.x, this.y - 30, "#ef4444"));
      }
      return;
    }
    if (this.type === 'assassin' && this.isShadow && Date.now() > this.shadowTime) {
        this.isShadow = false;
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
    if (this.ownedSentries) {
       if (this.sentryOrbitOffset === undefined) this.sentryOrbitOffset = 0;
       this.sentryOrbitOffset += 0.03 * gameState.gameSpeed;
       this.ownedSentries.forEach(s => s.update(friendlies, enemies));
    }
    if (Date.now() < this.stunnedUntil || this.isBeingKnockedBack) {
        if (this.type === 'accelerator') {
            this.isAiming = false;
            this.isContinuous = false;
        }
        if (this.type === 'rockgolem') {
            this.isSmashingWindup = false;
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
    if (this.type === 'rockgolem' && this.isSmashingWindup) {
      this.smashWindupProgress += 1 * gameState.gameSpeed;
      if (this.smashWindupProgress >= this.smashWindupDuration) {
          this.isSmashingWindup = false;
          const specs = UNIT_SPECS.rockgolem;
          AudioManager.play('rock_smash');
          gameState.animations.push(new FloatingText("SMASH!", this.x, this.y - 40, "#eab308"));
          for(let i=0; i<15; i++) gameState.particles.push(new Particle(this.x, this.y, this.team, true, 'rock'));
          gameState.animations.push(new TrollSmashAnimation(this, specs.aoeRadius * 2.5, specs.aoeDamage * 1.5, specs.stunDuration * 1.5, 60, gameState.units));
          this.lastAttackTime = Date.now();
      }
      return;
    }
    if (this.type === 'accelerator') {
       const isOnCooldown = (Date.now() - this.lastAttackTime < this.attackCooldown / gameState.gameSpeed) && !this.isAiming && !this.isContinuous;
       if (isOnCooldown && Math.random() < 0.3) {
          const angle = this.target ? Math.atan2(this.target.y - this.y, this.target.x - this.x) : (this.team === 1 ? 0 : Math.PI);
          const nozzleX = this.x + Math.cos(angle) * (this.width / 2 + 18);
          const nozzleY = this.y + Math.sin(angle) * (this.width / 2 + 18);
          gameState.particles.push(new Particle(nozzleX, nozzleY, this.team, false, 'smoke'));
       }
    }
    if (this.isMultiHealActive && Date.now() > this.multiHealEndTime) this.isMultiHealActive = false;

    if (this.type === 'force_wall' && this.isReflecting) {
        if (Date.now() > this.reflectEndTime) {
            this.isReflecting = false;
        }
    }
    
    if (this.type === 'absorber' && this.isAbsorbing) {
        if (Date.now() > this.absorbEndTime) {
            this.isAbsorbing = false;
            
            if (this.storedDamage > 0) {
                AudioManager.play('rock_smash');
                gameState.animations.push(new FloatingText("RELEASE!", this.x, this.y - 40, "#d946ef"));
                
                // Deal 60% less damage (which is 40% of stored damage)
                const releaseDamage = this.storedDamage * 0.4;
                
                const radius = Math.min(300, 50 + this.storedDamage);
                
                // Stun duration 1000ms
                gameState.animations.push(new GroundSmashAnimation(this, radius, releaseDamage, 1000, gameState.units));
                this.storedDamage = 0;
            }
        }
    }

    if (this.type === 'necromancer') {
        const specs = UNIT_SPECS.necromancer;
        const now = Date.now();
        
        if (this.isRevivingAlly) {
            if (!this.reviveTarget || now > this.reviveEndTime) {
                if (this.reviveTarget) {
                    this.reviveTarget.hp = this.reviveTarget.maxHp;
                    this.reviveTarget.hasBeenRevivedByNecromancer = true;
                    
                    // Change color based on team: Blue + Green = Teal (#2dd4bf), Red + Green = Lime (#bef264)
                    this.reviveTarget.color = this.team === 1 ? '#2dd4bf' : '#bef264';
                    
                    if (!gameState.units.includes(this.reviveTarget)) {
                        gameState.units.push(this.reviveTarget);
                    }
                    
                    AudioManager.play('druid_aoeheal'); // Re-use a mystical sound
                    gameState.animations.push(new FloatingText("REVIVED!", this.reviveTarget.x, this.reviveTarget.y - 30, "#22c55e"));
                    gameState.animations.push(new AuraBuffAnimation(this.reviveTarget, 50, 0, 0, 1000, [])); // Aura pulse
                    for (let i = 0; i < 20; i++) {
                        gameState.particles.push(new Particle(this.reviveTarget.x, this.reviveTarget.y, this.team, true, 'poison'));
                        gameState.particles.push(new Particle(this.reviveTarget.x, this.reviveTarget.y, this.team, true, 'heal'));
                    }
                }
                this.isRevivingAlly = false;
                this.reviveTarget = null;
                this.lastReviveTime = now;
            }
            return;
        } else {
            if (!this.lastReviveTime || now - this.lastReviveTime >= specs.reviveCooldown) {
                const deadAllies = gameState.allUnitsThisRound.filter(u => 
                    u.team === this.team && 
                    u.hp <= 0 && 
                    !u.hasBeenRevivedByNecromancer && 
                    !u.isSummon && 
                    u !== this &&
                    getDistance(this, u) <= specs.reviveRange &&
                    !gameState.units.some(other => other.type === 'necromancer' && other.isRevivingAlly && other.reviveTarget === u)
                );
                if (deadAllies.length > 0) {
                    deadAllies.sort((a, b) => getDistance(this, a) - getDistance(this, b));
                    this.reviveTarget = deadAllies[0];
                    this.isRevivingAlly = true;
                    this.reviveEndTime = now + specs.reviveCastTime;
                    gameState.animations.push(new FloatingText("REVIVING...", this.x, this.y - 30, "#22c55e"));
                    return;
                }
            }
        }
    }


    let currentSpeed = this.speed;
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
        }
      }
      this.attack(enemies);
      return;
    }
    this.applySeparation(friendlies);
    if (this.type === 'assassin') {
        if (!this.spawnTime) this.spawnTime = Date.now();
        if (this.isInitialStealth) {
            if (Date.now() - this.spawnTime < 600) {
                this.x += (this.team === 1 ? currentSpeed : -currentSpeed) * gameState.gameSpeed;
                return; 
            } else {
                this.isInitialStealth = false;
                this.isShadow = true;
                this.shadowTime = Infinity;
                gameState.animations.push(new FloatingText("SHADOW", this.x, this.y - 30, "#475569"));
            }
        }
    }
    this.findTarget(enemies);
    if (this.target) {
      if (this.type === 'assassin' && this.isShadow) {
          const behindOffsetX = this.target.team === 1 ? -25 : 25;
          const targetDestX = this.target.x + behindOffsetX;
          const targetDestY = this.target.y;
          const distToTarget = getDistance(this, {x: targetDestX, y: targetDestY});
          
          if (distToTarget > this.attackRange) {
              let moveTargetX = targetDestX;
              let moveTargetY = targetDestY;
              
              if (Math.abs(targetDestX - this.x) > 150) {
                 moveTargetY = this.y < uiElements.canvas.height / 2 ? 50 : uiElements.canvas.height - 50;
              }
              
              const baseAngle = Math.atan2(moveTargetY - this.y, moveTargetX - this.x);
              const erraticAngle = baseAngle + Math.sin(Date.now() / 150) * 0.8;
              this.x += Math.cos(erraticAngle) * currentSpeed * 2.5 * gameState.gameSpeed;
              this.y += Math.sin(erraticAngle) * currentSpeed * 2.5 * gameState.gameSpeed;
          } else {
              this.isShadow = false;
              this.attack(enemies);
          }
      } else {
          if (getDistance(this, this.target) > this.attackRange) {
            const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            this.x += Math.cos(angle) * currentSpeed * gameState.gameSpeed;
            this.y += Math.sin(angle) * currentSpeed * gameState.gameSpeed;
          } else {
            this.attack(enemies);
          }
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
    const now = Date.now();
    if (this.type === 'duelist') {
      const specs = UNIT_SPECS.duelist;
      if (this.isBursting) {
        if (now - this.lastBurstSlashTime > specs.burstSlashCooldown / gameState.gameSpeed) {
          this.lastBurstSlashTime = now;
          this.burstsLeft--;
          this.activeSword *= -1;
          if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
            AudioManager.play('slash');
            this.target.takeDamage(this.attackDamage, this);
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
            AudioManager.play('slash');
            this.target.takeDamage(this.attackDamage, this);
            gameState.animations.push(new SlashAnimation(this));
            this.isSlashing = true;
            this.slashAnimProgress = this.slashAnimDuration;
          }
        }
      }
      return;
    }
    if (this.type === 'assassin') {
      if (this.isFlurrying) {
         if (now - this.lastFlurrySlashTime > 80 / gameState.gameSpeed) { // Very fast slash (every 80ms)
             this.lastFlurrySlashTime = now;
             this.flurriesLeft--;
             if (this.target && getDistance(this, this.target) <= this.attackRange + 15) {
                 AudioManager.play('slash');
                 this.target.takeDamage(this.attackDamage * 0.4, this); // Fast multi-hits
                 gameState.animations.push(new SlashAnimation(this, '71, 85, 105')); 
                 this.isSlashing = true;
                 this.slashAnimProgress = 10;
             }
             if (this.flurriesLeft <= 0) {
                 this.isFlurrying = false;
                 this.lastAttackTime = now;
             }
         }
      } else if (now - this.lastAttackTime > currentCooldown / gameState.gameSpeed) {
         if (this.target && getDistance(this, this.target) <= this.attackRange + 15) {
             this.isFlurrying = true;
             this.flurriesLeft = 8; // 8 extremely fast slashes
             this.lastFlurrySlashTime = now - 80 / gameState.gameSpeed; 
         }
      }
      return;
    }
      if (this.type === 'accelerator') {
      const specs = UNIT_SPECS.accelerator;

      let targetAngle = this.team === 1 ? 0 : Math.PI;
      if (this.target) targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      if (this.gunAngle === undefined) this.gunAngle = targetAngle;
      
      if (this.isContinuous) {
         let diff = targetAngle - this.gunAngle;
         while (diff < -Math.PI) diff += Math.PI * 2;
         while (diff > Math.PI) diff -= Math.PI * 2;
         const rotationSpeed = 0.008 * gameState.gameSpeed; 
         if (Math.abs(diff) < rotationSpeed) this.gunAngle = targetAngle;
         else this.gunAngle += Math.sign(diff) * rotationSpeed;
      } else {
         this.gunAngle = targetAngle; 
      }
      
      const aimTarget = {
          x: this.x + Math.cos(this.gunAngle) * 100,
          y: this.y + Math.sin(this.gunAngle) * 100
      };

      if (this.isAiming) {
          if (now - this.aimStartTime > 800 / gameState.gameSpeed) {
              this.isAiming = false;
              this.isContinuous = true;
              this.continuousStartTime = now;
              this.lastContinuousTickTime = 0;
          }
          return;
      } else if (this.isContinuous) {
         const elapsed = now - this.continuousStartTime;
         const progress = Math.min(1, elapsed / (4000 / gameState.gameSpeed));
         const tickDelay = 400 - (350 * progress); // Ramps from 400ms to 50ms tick rate

         if (now - this.lastContinuousTickTime > tickDelay / gameState.gameSpeed) {
             this.lastContinuousTickTime = now;
             if (this.target) {
                 AudioManager.play('beam');
                 const tickBeam = new PenetratingBeam(this, aimTarget, specs.attackDamage, this.team);
                 tickBeam.radius = 12;
                 gameState.projectiles.push(tickBeam);
                 
                 const nozzleX = this.x + Math.cos(this.gunAngle) * (this.width / 2 + 18);
                 const nozzleY = this.y + Math.sin(this.gunAngle) * (this.width / 2 + 18);
                 gameState.particles.push(new Particle(nozzleX, nozzleY, this.team, false, 'smoke'));
             }
         }
         return;
      }
    }
    if (this.type === 'cryomancer') {
      const specs = UNIT_SPECS.cryomancer;
      if (this.isBursting) {
        if (now - this.lastBurstSlashTime > 60 / gameState.gameSpeed) { // shoot fast (60ms between shots)
          this.lastBurstSlashTime = now;
          this.burstsLeft--;
          if (this.target) {
            AudioManager.play('ice_shards');
            const spreadAngles = [-0.4, -0.2, 0, 0.2, 0.4];
            // burstsLeft goes from 4 down to 0
            const angle = spreadAngles[4 - this.burstsLeft]; 
            gameState.projectiles.push(new IceShard(this, this.target, angle));
          }
          if (this.burstsLeft <= 0) {
            this.isBursting = false;
            this.lastAttackTime = now;
          }
        }
      } else if (now - this.lastAttackTime > currentCooldown / gameState.gameSpeed) {
        this.basicAttackCounter++;
        if (this.basicAttackCounter >= specs.specialTriggerCount) {
          this.basicAttackCounter = 0;
          this.lastAttackTime = now;
          AudioManager.play('frostwave');
          gameState.animations.push(new ShiverWaveAnimation(this, gameState.units, specs.waveDamage, specs.freezeStacksApplied));
        } else {
          this.isBursting = true;
          this.burstsLeft = 5;
          this.lastBurstSlashTime = now - 60 / gameState.gameSpeed; // trigger first shot instantly
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
            AudioManager.play('snake_release');
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
          if (this.basicAttackCounter === undefined) this.basicAttackCounter = 0;
          this.basicAttackCounter++;
          let isStrong = false;
          if (this.basicAttackCounter > 4) {
             this.basicAttackCounter = 0;
             isStrong = true;
          }
          this.isCasting = true;
          this.castAnimProgress = 30;
          AudioManager.play('zap');
          gameState.animations.push(new ChainLightning(this, this.target, gameState.units, isStrong));
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
          AudioManager.play('druid_aoeheal');
          gameState.animations.push(new MultiHealAura(this, gameState.units));
        } else {
          if (this.target) {
            AudioManager.play('druid_heal');
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
          AudioManager.play('aoe_applyshield');
          gameState.animations.push(new AoeHeal(this.x, this.y, specs.healRadius, specs.healAmount, this.team, gameState.units, this, specs.lightHealArmorBonus, specs.lightHealArmorDuration, true));
        } else {
          AudioManager.play('aoe_heal');
          gameState.animations.push(new AoeHeal(this.x, this.y, specs.healRadius, specs.healAmount, this.team, gameState.units, this, 0, 0, false));
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
          AudioManager.play('poison_dart');
          const enemies = alliesOrEnemies.sort((a, b) => getDistance(this, a) - getDistance(this, b));
          for (let i = 0; i < Math.min(specs.antiHealTargets, enemies.length); i++) {
            gameState.projectiles.push(new AntiHealDart(this, enemies[i]));
          }
        } else {
          if (this.target) {
            AudioManager.play('potion_throw');
            gameState.projectiles.push(new PoisonPotion(this, this.target));
          }
        }
        return;
      }
      if (this.type === 'engineer') {
        const specs = UNIT_SPECS.engineer;
        
        if (this.nailsShot === undefined) this.nailsShot = 0;
        if (this.isBuildingSentry === undefined) this.isBuildingSentry = false;
        
        if (this.isBuildingSentry) {
          if (now >= this.buildEndTime) {
             this.isBuildingSentry = false;
             this.nailsShot = 0;
             
             if (this.ownedSentries === undefined) this.ownedSentries = [];
             
             if (this.ownedSentries.length < specs.maxSentries) {
                 const sentry = new EngineerSentry(this.x, this.y, this.team, this);
                 // We assign them an index for evenly spaced orbit
                 sentry.orbitIndex = this.ownedSentries.length;
                 this.ownedSentries.push(sentry);
                 gameState.animations.push(new FloatingText("BUILT", this.x, this.y - 15, "#fbbf24"));
             } else {
                 gameState.animations.push(new FloatingText("LIMIT MAX", this.x, this.y - 15, "#ef4444"));
             }
             this.lastAttackTime = now;
          } else {
             // Still building, reset cooldown to check next frame
             this.lastAttackTime -= currentCooldown / gameState.gameSpeed;
          }
          return;
        }
        
        if (this.target && getDistance(this, this.target) <= this.attackRange) {
           AudioManager.play('shot_nail');
           gameState.projectiles.push(new Nail(this, this.target, this.attackDamage, this.team));
           this.nailsShot++;
           
           if (this.nailsShot >= specs.shotsToBuild) {
               this.isBuildingSentry = true;
               this.buildEndTime = now + (specs.buildDuration / gameState.gameSpeed);
               AudioManager.play('create_sentry');
               gameState.animations.push(new FloatingText("BUILDING...", this.x, this.y - 15, "#fbbf24"));
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
             this.isSmashingWindup = true;
             this.smashWindupProgress = 0;
             this.smashWindupDuration = 162; // 2.7 seconds windup
             gameState.animations.push(new FloatingText("CHARGING...", this.x, this.y - 40, "#eab308"));
          } else {
             AudioManager.play('stomp');
             this.target.takeDamage(this.attackDamage, this);
             const specs = UNIT_SPECS.rockgolem;
             gameState.animations.push(new GroundSmashAnimation(this, specs.aoeRadius, specs.aoeDamage, specs.stunDuration, gameState.units));
          }
        }
        return;
      } else if (this.type === 'bard') {
        const specs = UNIT_SPECS.bard;
        const harpVariants = ['harp', 'harp2', 'harp3'];
        AudioManager.play(harpVariants[Math.floor(Math.random() * harpVariants.length)]);
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
    if (this.type === 'hunter') {
        const specs = UNIT_SPECS.hunter;
        AudioManager.play('rifle');
        gameState.projectiles.push(new Projectile(this, this.target, this.attackDamage, this.team));
        for (let i = 0; i < 6; i++) {
          gameState.particles.push(new Particle(this.x, this.y, this.team, false, 'smoke'));
        }
        
        if (this.basicAttackCounter === undefined) this.basicAttackCounter = 0;
        this.basicAttackCounter++;
        
        if (this.basicAttackCounter >= specs.eagleTriggerCount) {
           this.basicAttackCounter = 0;
           this.eagleOut = true;
           AudioManager.play('eagle_release');
           gameState.projectiles.push(new EagleProjectile(this, this.target, specs.eagleDamage));
        }
    } else if (this.type === 'musketeer' || this.type === 'sniper') {
        if (this.type === 'musketeer') AudioManager.play('bullet');
        else if (this.type === 'sniper') AudioManager.play('snipe');
        gameState.projectiles.push(new Projectile(this, this.target, this.attackDamage, this.team));
        for (let i = 0; i < 8; i++) {
          gameState.particles.push(new Particle(this.x, this.y, this.team, false, 'smoke'));
        }
      } else if (this.type === 'minigunner') {
        AudioManager.play('bullet');
        const proj = new Projectile(this, this.target, this.attackDamage, this.team);
        proj.radius = 2; // smaller bullet
        proj.speed = 18; // faster bullet
        gameState.projectiles.push(proj);
        // less smoke for minigun to not lag
        for (let i = 0; i < 2; i++) {
          gameState.particles.push(new Particle(this.x, this.y, this.team, false, 'smoke'));
        }
      } else if (this.type === 'accelerator') {
          this.isAiming = true;
          this.aimStartTime = now;
      } else if (this.type === 'archer') {
        AudioManager.play('arrow');
        gameState.projectiles.push(new Arrow(this, this.target));
      } else if (this.type === 'flamecaller') {
        if (this.basicAttackCounter === undefined) this.basicAttackCounter = 0;
        this.basicAttackCounter++;
        if (this.basicAttackCounter >= 3) {
          this.basicAttackCounter = 0;
          // Shoot 3 small homing fireballs
          AudioManager.play('small_fireball');
          gameState.projectiles.push(new Fireball(this, this.target, true, -0.3));
          gameState.projectiles.push(new Fireball(this, this.target, true, 0));
          gameState.projectiles.push(new Fireball(this, this.target, true, 0.3));
        } else {
          AudioManager.play('fireball');
          gameState.projectiles.push(new Fireball(this, this.target));
        }
      
    } else if (this.type === 'necromancer') {
        AudioManager.play('fireball');
        gameState.projectiles.push(new NecromancerFireball(this, this.target));
    } else if (this.type === 'fortress') {
      // Fortress does not attack normally, it only bashes on hit
      return;
} else if (this.type === 'restrictor') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          AudioManager.play('throw');
          this.isThrowing = true;
          this.throwAnimDuration = 300;
          this.throwAnimProgress = this.throwAnimDuration; // Using existing throw sound
          
          // First chain (right)
          gameState.projectiles.push(new ChainProjectile(this, this.target, this.attackDamage, this.team, 1));
          
          // Second chain delayed (left)
          setTimeout(() => {
              if (this.hp > 0 && this.target && this.target.hp > 0) {
                  gameState.projectiles.push(new ChainProjectile(this, this.target, this.attackDamage, this.team, -1));
              }
          }, 200);
        }
} else if (this.type === 'sledgehammer') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          AudioManager.play('hammer');
          this.target.takeDamage(this.attackDamage, this);
          for (let i = 0; i < 5; i++) {
            gameState.particles.push(new Particle(this.target.x, this.target.y, this.team, true, 'rock'));
          }
          if (!this.isSwinging) {
            this.isSwinging = true;
            this.swingAnimProgress = this.swingAnimDuration;
          }
        }
} else if (this.type === 'force_wall') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          AudioManager.play('force_wall_hit');
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new ShieldBashAnimation(this.x, this.y, 40, this.attackDamage, 30, this.team, gameState.units, this));
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
          AudioManager.play('slash');
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

    if (this.type === 'absorber') {
        if (this.isAbsorbing) {
            this.storedDamage = (this.storedDamage || 0) + damage;
            return;
        } else {
            this.hitsTaken = (this.hitsTaken || 0) + 1;
            if (this.hitsTaken >= 10) {
                this.hitsTaken = 0;
                this.isAbsorbing = true;
                this.storedDamage = 0;
                this.absorbEndTime = Date.now() + 8000;
                gameState.animations.push(new FloatingText("ABSORBING!", this.x, this.y - 40, "#a855f7"));
            }
        }
    }

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
    if (this.type === 'dummy') {
        if (!this.damageHistory) this.damageHistory = [];
        this.damageHistory.push({amount: modifiedDamage, time: Date.now()});
        this.totalDamageReceived = (this.totalDamageReceived || 0) + modifiedDamage;
    }
    
    const actualDamage = Math.min(this.hp, damageToHp);
    this.hp -= damageToHp;
    if (this.type === 'dummy') this.hp = this.maxHp;
    

    if (this.type === 'force_wall' && this.hp > 0 && damageToHp > 0) {
        if (!this.isReflecting) {
            this.hitsTaken = (this.hitsTaken || 0) + 1;
            if (this.hitsTaken >= 4) {
                this.hitsTaken = 0;
                this.isReflecting = true;
                this.reflectEndTime = Date.now() + 5000;
                AudioManager.play('force_wall_deflect_activation');
                gameState.animations.push(new FloatingText("REFLECT!", this.x, this.y - 40, "#f472b6"));
            }
        }
    }
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
        attacker.shadowTime = Infinity;
        gameState.animations.push(new FloatingText("SHADOW", attacker.x, attacker.y - 30, "#475569"));
      }
    }
  }
  deflect() {
    this.deflectAnim = 10;
    if (this.type === 'force_wall') {
      AudioManager.play('force_wall_deflect');
    }
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
    this.isSummon = true;
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
            AudioManager.play('bite');
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
          // Throttled crawling SFX — plays roughly every 1.5s while slithering
          const now = Date.now();
          if (!this.lastCrawlSfxTime || now - this.lastCrawlSfxTime > 1500) {
            this.lastCrawlSfxTime = now;
            AudioManager.play('snake_crawling');
          }
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

class EngineerSentry extends Unit {
  constructor(x, y, team, owner) {
    super(x, y, team, 'engineer', x / uiElements.canvas.width, y / uiElements.canvas.height);
    const specs = UNIT_SPECS.engineer;
    this.type = 'sentry';
    this.hp = specs.sentryHp;
    this.maxHp = specs.sentryHp;
    this.speed = 0; // Does not move
    this.attackDamage = specs.sentryDamage;
    this.attackRange = specs.sentryRange;
    this.attackCooldown = specs.sentryCooldown;
    this.owner = owner;
    this.width = 16;
    this.height = 16;
    this.color = team === 1 ? '#60a5fa' : '#f87171';
    this.lastAttackTime = 0;
    this.isSummon = true;
  }
  update(friendlies, enemies) {
    if (this.hp <= 0) return;
    if (!this.owner || this.owner.hp <= 0) {
      this.hp = 0; // Die if engineer dies
      return;
    }
    
    // Orbit logic
    if (this.baseOrbitAngle === undefined) {
       const specs = UNIT_SPECS.engineer;
       const max = specs.maxSentries || 4;
       this.baseOrbitAngle = (this.orbitIndex * (Math.PI * 2 / max));
    }
    if (this.owner.sentryOrbitOffset === undefined) this.owner.sentryOrbitOffset = 0;
    // Only increment once per frame, let the first sentry do it or let the engineer do it.
    // It's safer to have the engineer do it in its update.
    
    const currentAngle = this.baseOrbitAngle + this.owner.sentryOrbitOffset;
    const targetX = this.owner.x + Math.cos(currentAngle) * 45;
    const targetY = this.owner.y + Math.sin(currentAngle) * 45;
    
    this.x += (targetX - this.x) * 0.2 * gameState.gameSpeed;
    this.y += (targetY - this.y) * 0.2 * gameState.gameSpeed;
    
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
            AudioManager.play('sentry_shot');
            gameState.projectiles.push(new SentryBullet(this, this.target, this.attackDamage, this.team));
          }
        }
      }
    }
  }
  draw() {
    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    // Draw the sentry base
    uiElements.ctx.fillStyle = '#4b5563'; // dark gray
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(0, 0, this.width/2, 0, Math.PI * 2);
    uiElements.ctx.fill();
    
    // Draw the barrel aiming at target
    if (this.target && this.target.hp > 0) {
        const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        uiElements.ctx.rotate(angle);
    }
    uiElements.ctx.fillStyle = '#9ca3af'; // light gray
    uiElements.ctx.fillRect(0, -2, 12, 4); // barrel
    
    uiElements.ctx.restore();
  }
}

export { Unit };
