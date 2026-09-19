import os

proj_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\entities\Projectiles.js'
with open(proj_path, 'r', encoding='utf-8') as f:
    text = f.read()

update_logic_old = """        // Custom restrictor logic
        if (this.shooter && this.shooter.type === 'restrictor') {
            this.shooter.restrictorHits = (this.shooter.restrictorHits || 0) + 1;
            if (this.shooter.restrictorHits >= 7) {
                this.shooter.restrictorHits = 0;
                enemy.stunnedUntil = Date.now() + 5000;
                enemy.stunType = 'restrict';
                gameState.animations.push(new FloatingText("LOCKED!", enemy.x, enemy.y - 30, "#a855f7"));
            }
        }
        
        return false;"""

update_logic_new = """        // Custom restrictor logic
        if (this.shooter && this.shooter.type === 'restrictor') {
            this.shooter.restrictorHits = (this.shooter.restrictorHits || 0) + 1;
            if (this.shooter.restrictorHits >= 7) {
                this.shooter.restrictorHits = 0;
                enemy.stunnedUntil = Date.now() + 5000;
                enemy.stunType = 'restrict';
                gameState.animations.push(new FloatingText("LOCKED!", enemy.x, enemy.y - 30, "#a855f7"));
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
        }"""

text = text.replace(update_logic_old, update_logic_new)

start_idx = text.find('update(enemies) {', text.find('class ChainProjectile'))
insert_idx = text.find('{', start_idx) + 1
return_check = """
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
"""
text = text[:insert_idx] + return_check + text[insert_idx:]

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(text)
print('ChainProjectile returning logic added.')
