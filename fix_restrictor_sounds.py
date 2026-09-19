import os

BASE_DIR = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator'

# 1. Update AudioManager in utils.js
utils_path = os.path.join(BASE_DIR, 'js', 'utils.js')
with open(utils_path, 'r', encoding='utf-8') as f:
    utils_text = f.read()

new_sounds = """        this.sounds.hammer = new Audio('js/sfx/hammer.mp3');
        this.sounds.chain_release = new Audio('js/sfx/chain-release.mp3');
        this.sounds.chain_hit_1 = new Audio('js/sfx/chain-hit-1.mp3');
        this.sounds.chain_hit_2 = new Audio('js/sfx/chain-hit-2.mp3');
        this.sounds.chain_lock = new Audio('js/sfx/chain-lock.mp3');"""
utils_text = utils_text.replace("        this.sounds.hammer = new Audio('js/sfx/hammer.mp3');", new_sounds)
with open(utils_path, 'w', encoding='utf-8') as f:
    f.write(utils_text)


# 2. Update config.js for range
config_path = os.path.join(BASE_DIR, 'js', 'config.js')
with open(config_path, 'r', encoding='utf-8') as f:
    config_text = f.read()

config_text = config_text.replace("attackRange: 300,", "attackRange: 600,")
config_text = config_text.replace("description: 'Throws chains. Every 7th hit locks enemy for 5 seconds.'", "description: 'Throws chains. Every 4th attack locks enemy for 5 seconds.'")
with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config_text)


# 3. Update Unit.js to play chain_release and track restrictorAttacks
unit_path = os.path.join(BASE_DIR, 'js', 'entities', 'Unit.js')
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_text = f.read()

old_restrictor_attack = """} else if (this.type === 'restrictor') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          AudioManager.play('throw');
          this.isThrowing = true;
          this.throwAnimDuration = 300;
          this.throwAnimProgress = this.throwAnimDuration;
          
          // First chain (right)
          gameState.projectiles.push(new ChainProjectile(this, this.target, this.attackDamage, this.team, 1));
          
          // Second chain delayed (left)
          setTimeout(() => {
              if (this.hp > 0 && this.target && this.target.hp > 0) {
                  gameState.projectiles.push(new ChainProjectile(this, this.target, this.attackDamage, this.team, -1));
              }
          }, 200);
        }"""

new_restrictor_attack = """} else if (this.type === 'restrictor') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          AudioManager.play('chain_release');
          this.isThrowing = true;
          this.throwAnimDuration = 300;
          this.throwAnimProgress = this.throwAnimDuration;
          
          this.restrictorAttacks = (this.restrictorAttacks || 0) + 1;
          const isLockingAttack = (this.restrictorAttacks % 4 === 0);
          
          // First chain (right)
          gameState.projectiles.push(new ChainProjectile(this, this.target, this.attackDamage, this.team, 1, isLockingAttack));
          
          // Second chain delayed (left)
          setTimeout(() => {
              if (this.hp > 0 && this.target && this.target.hp > 0) {
                  AudioManager.play('chain_release');
                  gameState.projectiles.push(new ChainProjectile(this, this.target, this.attackDamage, this.team, -1, isLockingAttack));
              }
          }, 200);
        }"""
unit_text = unit_text.replace(old_restrictor_attack, new_restrictor_attack)
with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_text)


# 4. Update Projectiles.js to handle sounds and isLockingAttack
proj_path = os.path.join(BASE_DIR, 'js', 'entities', 'Projectiles.js')
with open(proj_path, 'r', encoding='utf-8') as f:
    proj_text = f.read()

const_old = """  constructor(shooter, target, damage, team, side = 1) {
    super(shooter, target, damage, team);
    this.speed = 16;
    this.radius = 4;
    this.side = side;
  }"""
const_new = """  constructor(shooter, target, damage, team, side = 1, isLockingAttack = false) {
    super(shooter, target, damage, team);
    this.speed = 16;
    this.radius = 4;
    this.side = side;
    this.isLockingAttack = isLockingAttack;
  }"""
proj_text = proj_text.replace(const_old, const_new)

# In ChainProjectile.update
hit_logic_old = """        // Custom restrictor logic
        if (this.shooter && this.shooter.type === 'restrictor') {
            this.shooter.restrictorHits = (this.shooter.restrictorHits || 0) + 1;
            if (this.shooter.restrictorHits >= 7) {
                this.shooter.restrictorHits = 0;
                enemy.stunnedUntil = Date.now() + 5000;
                enemy.stunType = 'restrict';
                gameState.animations.push(new FloatingText("LOCKED!", enemy.x, enemy.y - 30, "#a855f7"));
            }
        }"""

hit_logic_new = """        // Custom restrictor logic
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
proj_text = proj_text.replace(hit_logic_old, hit_logic_new)

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(proj_text)

print('Updated range, locking logic, and audio sounds.')
