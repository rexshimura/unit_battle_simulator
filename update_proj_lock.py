import os

proj_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\entities\Projectiles.js'
with open(proj_path, 'r', encoding='utf-8') as f:
    text = f.read()

const_old = """  constructor(shooter, target, damage, team, side = 1, isLockingAttack = false) {
    super(shooter, target, damage, team);
    this.speed = 16;
    this.radius = 4;
    this.side = side;
    this.isLockingAttack = isLockingAttack;
  }"""
const_new = """  constructor(shooter, target, damage, team, side = 1) {
    super(shooter, target, damage, team);
    this.speed = 16;
    this.radius = 4;
    this.side = side;
  }"""
text = text.replace(const_old, const_new)

hit_logic_old = """        // Custom restrictor logic
        if (this.shooter && this.shooter.type === 'restrictor') {
            if (this.isLockingAttack) {
                enemy.stunnedUntil = Date.now() + 5000;
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
        
hit_logic_new = """        // Custom restrictor logic
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
text = text.replace(hit_logic_old, hit_logic_new)

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(text)
print('Projectiles.js updated for target-based lock count and 10 second duration.')
