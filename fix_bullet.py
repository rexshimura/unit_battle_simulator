import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# Fix the Bullet bug in sniper and hunter
# Wait, let's see what I injected exactly.
old_sniper_hunter_block = """      if (this.type === 'sniper') {
        if (this.target) {
          AudioManager.play('snipe');
          gameState.projectiles.push(new Bullet(this, this.target));
        }
        return;
      }
      if (this.type === 'hunter') {
        const specs = UNIT_SPECS.hunter;
        if (this.target) {
          AudioManager.play('rifle');
          gameState.projectiles.push(new Bullet(this, this.target));
          
          if (this.basicAttackCounter === undefined) this.basicAttackCounter = 0;
          this.basicAttackCounter++;
          
          if (this.basicAttackCounter >= specs.eagleTriggerCount) {
             this.basicAttackCounter = 0;
             AudioManager.play('eagle_release');
             gameState.projectiles.push(new EagleProjectile(this, this.target, specs.eagleDamage));
          }
        }
        return;
      }"""

new_sniper_hunter_block = """      if (this.type === 'sniper') {
        if (this.target) {
          AudioManager.play('snipe');
          gameState.projectiles.push(new Projectile(this, this.target, this.attackDamage, this.team));
        }
        return;
      }
      if (this.type === 'hunter') {
        const specs = UNIT_SPECS.hunter;
        if (this.target) {
          AudioManager.play('rifle');
          gameState.projectiles.push(new Projectile(this, this.target, this.attackDamage, this.team));
          
          if (this.basicAttackCounter === undefined) this.basicAttackCounter = 0;
          this.basicAttackCounter++;
          
          if (this.basicAttackCounter >= specs.eagleTriggerCount) {
             this.basicAttackCounter = 0;
             AudioManager.play('eagle_release');
             gameState.projectiles.push(new EagleProjectile(this, this.target, specs.eagleDamage));
          }
        }
        return;
      }"""

# Actually, did Sniper already have new Bullet or did I inject that too?
# Let's check my previous script for update_hunter_logic.py
