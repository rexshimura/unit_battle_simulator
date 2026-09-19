import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_block = "    if (this.type === 'musketeer' || this.type === 'sniper') {"

new_block = """    if (this.type === 'hunter') {
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

unit_js = unit_js.replace(old_block, new_block)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
