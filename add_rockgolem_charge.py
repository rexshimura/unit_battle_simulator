import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_logic = """      if (this.type === 'rockgolem') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 10) {
          this.target.takeDamage(this.attackDamage, this);
          const specs = UNIT_SPECS.rockgolem;
          gameState.animations.push(new GroundSmashAnimation(this, specs.aoeRadius, specs.aoeDamage, specs.stunDuration, gameState.units));
        }
        return;
      }"""

new_logic = """      if (this.type === 'rockgolem') {
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

unit_js = unit_js.replace(old_logic, new_logic)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
