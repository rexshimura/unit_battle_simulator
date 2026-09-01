import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
effects_path = os.path.join(base_dir, 'js', 'entities', 'Effects.js')

with open(effects_path, 'r', encoding='utf-8') as f:
    effects_js = f.read()

old_shiver = """class ShiverWaveAnimation {
  constructor(caster, allUnits, waveDamage, freezeStacksApplied) {
    this.caster = caster;
    this.specs = UNIT_SPECS.cryomancer;
    this.angle = caster.target ? Math.atan2(caster.target.y - caster.y, caster.target.x - caster.x) : caster.team === 1 ? 0 : Math.PI;
    this.duration = 80;
    this.maxDuration = 80;
    this.hitUnits = [];
    this.waveDamage = waveDamage;
    this.freezeStacksApplied = freezeStacksApplied;
  }
  update() {
    this.duration -= 1 * gameState.gameSpeed;
    const enemies = gameState.units.filter(u => u.team !== this.caster.team);
    const waveProgress = 1 - this.duration / this.maxDuration;
    const maxWaveRange = this.specs.attackRange * 2.0; // Wave travels twice as far as attack range
    const currentDist = maxWaveRange * waveProgress;
    if (this.duration > 0) {
      const particleAngle = this.angle - Math.PI / 6 + Math.random() * Math.PI / 3;
      const pX = this.caster.x + Math.cos(particleAngle) * currentDist;
      const pY = this.caster.y + Math.sin(particleAngle) * currentDist;
      gameState.particles.push(new Particle(pX, pY, this.caster.team, false, 'ice'));
    }
    enemies.forEach(enemy => {
      if (this.hitUnits.includes(enemy.id)) return;
      const d = getDistance(this.caster, enemy);
      if (d < currentDist && d > currentDist - 40) {
        const angleToEnemy = Math.atan2(enemy.y - this.caster.y, enemy.x - this.caster.x);
        let angleDiff = Math.abs(this.angle - angleToEnemy);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        if (angleDiff < Math.PI / 4) {
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
            for (let i = 0; i < 25; i++) gameState.particles.push(new Particle(enemy.x, enemy.y, this.caster.team, true, 'snow'));
          }
        }
      }
    });
    return this.duration > 0;
  }
  draw() {
    const progress = 1 - this.duration / this.maxDuration;
    const maxWaveRange = this.specs.attackRange * 2.0; // Draw out to twice the attack range
    const currentRadius = maxWaveRange * progress;
    const alpha = Math.sin(progress * Math.PI);
    uiElements.ctx.save();
    uiElements.ctx.translate(this.caster.x, this.caster.y);
    uiElements.ctx.rotate(this.angle);
    const coneAngle = Math.PI / 4;
    const gradient = uiElements.ctx.createRadialGradient(0, 0, currentRadius * 0.7, 0, 0, currentRadius);
    gradient.addColorStop(0, `rgba(165, 243, 252, ${alpha * 0.05})`);
    gradient.addColorStop(1, `rgba(103, 232, 249, ${alpha * 0.4})`);
    uiElements.ctx.fillStyle = gradient;
    uiElements.ctx.beginPath();
    uiElements.ctx.moveTo(0, 0);
    uiElements.ctx.arc(0, 0, currentRadius, -coneAngle, coneAngle);
    uiElements.ctx.closePath();
    uiElements.ctx.fill();
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(0, 0, currentRadius, -coneAngle, coneAngle);
    uiElements.ctx.strokeStyle = `rgba(224, 242, 254, ${alpha * 0.7})`;
    uiElements.ctx.lineWidth = 3;
    uiElements.ctx.stroke();
    uiElements.ctx.restore();
  }
}"""

new_shiver = """class ShiverWaveAnimation {
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
    uiElements.ctx.arc(0, 0, currentRadius, -cone      Angle, coneAngle);
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
}"""
new_shiver = new_shiver.replace("-cone      Angle", "-coneAngle") # Fix spacing artifact in my string

effects_js = effects_js.replace(old_shiver, new_shiver)

with open(effects_path, 'w', encoding='utf-8') as f:
    f.write(effects_js)
