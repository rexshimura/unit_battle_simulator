import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# 1. Constructor update
unit_js = unit_js.replace("this.isInitialStealth = true;", "this.isInitialStealth = true;\n      this.isFlurrying = false;\n      this.flurryTarget = null;")

# 2. Teleport logic update
old_teleport = """        if (this.type === 'assassin' && this.isShadow && getDistance(this, this.target) <= 200) {
            for (let i = 0; i < 15; i++) gameState.particles.push(new Particle(this.x, this.y, this.team, true, 'poison'));
            const backOffset = this.target.team === 1 ? -25 : 25;
            this.x = this.target.x + backOffset;
            this.y = this.target.y;
            for (let i = 0; i < 15; i++) gameState.particles.push(new Particle(this.x, this.y, this.team, true, 'poison'));
            this.isShadow = false;
            this.shadowTime = 0;
            this.attack(enemies);
        }"""
new_teleport = """        if (this.type === 'assassin' && this.isShadow && getDistance(this, this.target) <= 200) {
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
        }"""
unit_js = unit_js.replace(old_teleport, new_teleport)

# 3. Flurry cooldown logic
old_cooldown = """  attack(alliesOrEnemies) {
    let currentCooldown = this.attackCooldown;
    if (this.buffs.bard && Date.now() < this.buffs.bard.expires) {
      currentCooldown /= 1 + this.buffs.bard.attackSpeedBoost;
    }"""
new_cooldown = """  attack(alliesOrEnemies) {
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
    }"""
unit_js = unit_js.replace(old_cooldown, new_cooldown)

# 4. Remove initial stealth crit logic
old_attack = """} else if (this.type === 'assassin') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          let dmg = this.attackDamage;
          let isCrit = false;
          if (this.isInitialStealth) {
              dmg *= 2.5; // CRIT!
              isCrit = true;
              this.isInitialStealth = false;
              this.isShadow = false; // Break stealth
              this.shadowTime = 0;
          }
          this.target.takeDamage(dmg, this);
          if (isCrit) {
              gameState.animations.push(new FloatingText(`CRIT! ${Math.round(dmg)}`, this.target.x, this.target.y - 20, '#f97316'));
          }
          gameState.animations.push(new SlashAnimation(this, '71, 85, 105')); // Dark slash
          if (!this.isSlashing) {
            this.isSlashing = true;
            this.slashAnimProgress = this.slashAnimDuration;
          }
        }
}"""
new_attack = """} else if (this.type === 'assassin') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          this.isInitialStealth = false;
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new SlashAnimation(this, '71, 85, 105')); // Dark slash
          if (!this.isSlashing) {
            this.isSlashing = true;
            this.slashAnimProgress = this.slashAnimDuration;
          }
        }
}"""
unit_js = unit_js.replace(old_attack, new_attack)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
