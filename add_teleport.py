import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_logic = """      if (getDistance(this, this.target) > this.attackRange) {
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
      } else {"""

new_logic = """      if (getDistance(this, this.target) > this.attackRange) {
        if (this.type === 'assassin' && this.isShadow && getDistance(this, this.target) <= 200) {
            for (let i = 0; i < 15; i++) gameState.particles.push(new Particle(this.x, this.y, this.team, true, 'poison'));
            const backOffset = this.target.team === 1 ? -25 : 25;
            this.x = this.target.x + backOffset;
            this.y = this.target.y;
            for (let i = 0; i < 15; i++) gameState.particles.push(new Particle(this.x, this.y, this.team, true, 'poison'));
            this.isShadow = false;
            this.shadowTime = 0;
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
      } else {"""

unit_js = unit_js.replace(old_logic, new_logic)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
