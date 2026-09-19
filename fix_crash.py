import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# 1. Clean up the drawEquipment block (lines ~430-455)
# Find the injected hunter logic in drawEquipment
bad_draw_block = """    if (this.type === 'hunter') {
      const specs = UNIT_SPECS.hunter;
      AudioManager.play('rifle');
      gameState.projectiles.push(new Projectile(this, this.target, this.attackDamage, this.team));
      for (let i = 0; i < 6; i++) {
        gameState.particles.push(new Particle(this.x, this.y, this.team, false, 'smoke'));
      }
      
      if (this.basicAttackCounter === undefined) this.basicAttackCounter = 0;
      this.basicAttackCounter++;
      
      if (this.basicAttackCounter >= specs.eagleTriggerCount) {
         this.basicAttackCounter = 0;
         AudioManager.play('eagle_release');
         gameState.projectiles.push(new EagleProjectile(this, this.target, specs.eagleDamage));
      }
    } else if (this.type === 'musketeer' || this.type === 'sniper') {"""

good_draw_block = "    if (this.type === 'musketeer' || this.type === 'sniper' || this.type === 'hunter') {"
unit_js = unit_js.replace(bad_draw_block, good_draw_block)

# 2. Clean up the attack block (lines ~1550-1580)
# Find the injected hunter logic in attack
bad_attack_block = """    if (this.type === 'hunter') {
      const specs = UNIT_SPECS.hunter;
      AudioManager.play('rifle');
      gameState.projectiles.push(new Projectile(this, this.target, this.attackDamage, this.team));
      for (let i = 0; i < 6; i++) {
        gameState.particles.push(new Particle(this.x, this.y, this.team, false, 'smoke'));
      }
      
      if (this.basicAttackCounter === undefined) this.basicAttackCounter = 0;
      this.basicAttackCounter++;
      
      if (this.basicAttackCounter >= specs.eagleTriggerCount) {
         this.basicAttackCounter = 0;
         AudioManager.play('eagle_release');
         gameState.projectiles.push(new EagleProjectile(this, this.target, specs.eagleDamage));
      }
    } else if (this.type === 'musketeer' || this.type === 'sniper') {"""

good_attack_block = """    if (this.type === 'hunter') {
        const specs = UNIT_SPECS.hunter;
        AudioManager.play('rifle');
        gameState.projectiles.push(new Projectile(this, this.target, this.attackDamage, this.team));
        for (let i = 0; i < 6; i++) {
          gameState.particles.push(new Particle(this.x, this.y, this.team, false, 'smoke'));
        }
        
        if (this.basicAttackCounter === undefined) this.basicAttackCounter = 0;
        this.basicAttackCounter++;
        
        if (this.basicAttackCounter >= specs.eagleTriggerCount) {
           this.basicAttackCounter = 0;
           AudioManager.play('eagle_release');
           gameState.projectiles.push(new EagleProjectile(this, this.target, specs.eagleDamage));
        }
    } else if (this.type === 'musketeer' || this.type === 'sniper') {"""

unit_js = unit_js.replace(bad_attack_block, good_attack_block)

# If bad_attack_block wasn't there (meaning I replaced it twice in drawEquipment by mistake), let's ensure it's in attack.
# Actually, let's just make sure we insert it into attack if it's missing.
if "if (this.type === 'hunter') {" not in unit_js[1000:]: # check second half of file
    old_attack = "    if (this.type === 'musketeer' || this.type === 'sniper') {"
    unit_js = unit_js.replace(old_attack, good_attack_block)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
