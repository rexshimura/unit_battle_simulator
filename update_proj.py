import os

proj_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\entities\Projectiles.js'
with open(proj_path, 'r', encoding='utf-8') as f:
    text = f.read()

old_logic = """        // Custom restrictor logic
        if (this.shooter && this.shooter.type === 'restrictor') {
            if (!enemy.restrictorHitCount) enemy.restrictorHitCount = {};
            enemy.restrictorHitCount[this.shooter.id] = (enemy.restrictorHitCount[this.shooter.id] || 0) + 1;
            
            // 8 hits = 4 full attacks
            if (enemy.restrictorHitCount[this.shooter.id] >= 8) {
                enemy.restrictorHitCount[this.shooter.id] = 0;
                enemy.stunnedUntil = Date.now() + 10000; // 10 seconds!
                enemy.stunType = 'restrict';
                gameState.animations.push(new FloatingText("LOCKED!", enemy.x, enemy.y - 30, "#a855f7"));
                AudioManager.play('chain_lock');
            } else {
                if (Math.random() > 0.5) {
                    AudioManager.play('chain_hit_1');
                } else {
                    AudioManager.play('chain_hit_2');
                }
            }
        }"""

new_logic = """        // Custom restrictor logic
        if (this.shooter && this.shooter.type === 'restrictor') {
            const isLocked = enemy.stunType === 'restrict' && Date.now() < enemy.stunnedUntil;
            if (!isLocked) {
                if (!enemy.restrictorHitCount) enemy.restrictorHitCount = {};
                enemy.restrictorHitCount[this.shooter.id] = (enemy.restrictorHitCount[this.shooter.id] || 0) + 1;
                
                // 8 hits = 4 full attacks
                if (enemy.restrictorHitCount[this.shooter.id] >= 8) {
                    enemy.restrictorHitCount[this.shooter.id] = 0;
                    enemy.stunnedUntil = Date.now() + 10000; // 10 seconds!
                    enemy.stunType = 'restrict';
                    gameState.animations.push(new FloatingText("LOCKED!", enemy.x, enemy.y - 30, "#a855f7"));
                    AudioManager.play('chain_lock');
                } else {
                    if (Math.random() > 0.5) AudioManager.play('chain_hit_1');
                    else AudioManager.play('chain_hit_2');
                }
            } else {
                if (Math.random() > 0.5) AudioManager.play('chain_hit_1');
                else AudioManager.play('chain_hit_2');
            }
        }"""

text = text.replace(old_logic, new_logic)

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(text)
print('Projectiles.js updated to prevent counting when locked.')
