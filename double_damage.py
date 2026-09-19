import os

proj_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\entities\Projectiles.js'
with open(proj_path, 'r', encoding='utf-8') as f:
    text = f.read()

old_logic = """        if (this.hitTargets && this.hitTargets.has(enemy)) continue;
        enemy.takeDamage(this.damage, this.shooter);
        
        // Custom restrictor logic
        if (this.shooter && this.shooter.type === 'restrictor') {
            const isLocked = enemy.stunType === 'restrict' && Date.now() < enemy.stunnedUntil;
            if (!isLocked) {"""

new_logic = """        if (this.hitTargets && this.hitTargets.has(enemy)) continue;
        
        let actualDamage = this.damage;
        let isLocked = false;
        if (this.shooter && this.shooter.type === 'restrictor') {
            isLocked = enemy.stunType === 'restrict' && Date.now() < enemy.stunnedUntil;
            if (isLocked) {
                actualDamage *= 2;
                gameState.animations.push(new FloatingText("CRIT!", enemy.x, enemy.y - 20, "#ef4444"));
            }
        }
        
        enemy.takeDamage(actualDamage, this.shooter);
        
        // Custom restrictor logic
        if (this.shooter && this.shooter.type === 'restrictor') {
            if (!isLocked) {"""

text = text.replace(old_logic, new_logic)

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(text)
print('Projectiles.js updated for double damage on locked targets.')
