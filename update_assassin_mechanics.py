import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# 1. Clean up bad insertion in drawEquipment
bad_logic_in_draw = """} else if (this.type === 'assassin') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new SlashAnimation(this, '71, 85, 105')); // Dark slash
          if (!this.isSlashing) {
            this.isSlashing = true;
            this.slashAnimProgress = this.slashAnimDuration;
          }
        }
} else if (this.type === 'ghoul') {"""
new_logic_in_draw = """} else if (this.type === 'ghoul') {"""
unit_js = unit_js.replace(bad_logic_in_draw, new_logic_in_draw)

# 2. Add single dagger draw logic
ghoul_draw = "} else if (this.type === 'ghoul') {"
assassin_draw = """} else if (this.type === 'assassin') {
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
} else if (this.type === 'ghoul') {"""
unit_js = unit_js.replace(ghoul_draw, assassin_draw, 1) # Only first occurrence, which should be in drawEquipment now

# 3. Add isInitialStealth in constructor
unit_js = unit_js.replace("this.shadowTime = 0;", "this.shadowTime = 0;\n    this.isInitialStealth = false;\n    this.currentMoveAngle = 0;")
unit_js = unit_js.replace("this.stunType = null;", "this.stunType = null;\n    if (this.type === 'assassin') {\n      this.isShadow = true;\n      this.isInitialStealth = true;\n      this.shadowTime = Infinity;\n    }")

# 4. Modify attack for crit and break stealth
old_assassin_attack = """} else if (this.type === 'assassin') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new SlashAnimation(this, '71, 85, 105')); // Dark slash
          if (!this.isSlashing) {
            this.isSlashing = true;
            this.slashAnimProgress = this.slashAnimDuration;
          }
        }"""
new_assassin_attack = """} else if (this.type === 'assassin') {
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
        }"""
unit_js = unit_js.replace(old_assassin_attack, new_assassin_attack)

# 5. Modify update for smooth curving and back-targeting
old_update_move = """        const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        this.x += Math.cos(angle) * currentSpeed * gameState.gameSpeed;
        this.y += Math.sin(angle) * currentSpeed * gameState.gameSpeed;"""
        
new_update_move = """        let targetX = this.target.x;
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
        this.y += Math.sin(angle) * currentSpeed * gameState.gameSpeed;"""
        
unit_js = unit_js.replace(old_update_move, new_update_move)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
