import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# 1. Constructor init
old_init = "this.reviveTime = 0;"
new_init = "this.reviveTime = 0;\n    this.isCharging = false;\n    this.chargeDuration = 0;\n    this.chargeAngle = 0;"
unit_js = unit_js.replace(old_init, new_init)

# 2. Update logic
old_update = """    if (Date.now() < this.stunnedUntil || this.isBeingKnockedBack) return;
    if (this.isCasting) {"""
new_update = """    if (Date.now() < this.stunnedUntil || this.isBeingKnockedBack) return;
    
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
    
    if (this.isCasting) {"""
unit_js = unit_js.replace(old_update, new_update)

# 3. Attack logic
old_attack = """      if (this.type === 'rockgolem') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 10) {
          if (this.basicAttackCounter === undefined) this.basicAttackCounter = 0;
          this.basicAttackCounter++;
          
          if (this.basicAttackCounter >= 4) {
             this.basicAttackCounter = 0;
             const chargeDamage = this.attackDamage * 3;
             this.target.takeDamage(chargeDamage, this);
             
             this.target.stunnedUntil = Date.now() + 2000;
             this.target.stunType = 'stun';
             
             const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
             const knockbackDist = 200;
             this.target.isBeingKnockedBack = true;
             this.target.knockbackTargetX = Math.max(this.target.width/2, Math.min(uiElements.canvas.width - this.target.width/2, this.target.x + Math.cos(angle) * knockbackDist));
             this.target.knockbackTargetY = Math.max(this.target.width/2, Math.min(uiElements.canvas.height - this.target.width/2, this.target.y + Math.sin(angle) * knockbackDist));
             
             this.isBeingKnockedBack = true;
             this.knockbackTargetX = this.target.knockbackTargetX - Math.cos(angle) * 50;
             this.knockbackTargetY = this.target.knockbackTargetY - Math.sin(angle) * 50;
             
             gameState.animations.push(new FloatingText("CHARGE!", this.x, this.y - 40, "#eab308"));
             for(let i=0; i<20; i++) gameState.particles.push(new Particle(this.target.x, this.target.y, this.team, true, 'rock'));
          } else {
             this.target.takeDamage(this.attackDamage, this);
             const specs = UNIT_SPECS.rockgolem;
             gameState.animations.push(new GroundSmashAnimation(this, specs.aoeRadius, specs.aoeDamage, specs.stunDuration, gameState.units));
          }
        }
        return;
      }"""
new_attack = """      if (this.type === 'rockgolem') {
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
      }"""
unit_js = unit_js.replace(old_attack, new_attack)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
