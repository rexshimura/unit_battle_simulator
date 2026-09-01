import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# 1. Update imports in Unit.js
old_import = "import { getDistance, drawLightningBolt } from '../utils.js';"
new_import = "import { getDistance, drawLightningBolt, AudioManager } from '../utils.js';"
unit_js = unit_js.replace(old_import, new_import)

# 2. Add musketeer / sniper sound
old_gun = """    if (this.type === 'musketeer' || this.type === 'sniper') {
        gameState.projectiles.push(new Projectile(this, this.target, this.attackDamage, this.team));"""
new_gun = """    if (this.type === 'musketeer' || this.type === 'sniper') {
        if (this.type === 'musketeer') AudioManager.play('bullet');
        else if (this.type === 'sniper') AudioManager.play('snipe');
        gameState.projectiles.push(new Projectile(this, this.target, this.attackDamage, this.team));"""
unit_js = unit_js.replace(old_gun, new_gun)

# 3. Add archer sound
old_arrow = """      } else if (this.type === 'archer') {
        gameState.projectiles.push(new Arrow(this, this.target));"""
new_arrow = """      } else if (this.type === 'archer') {
        AudioManager.play('arrow');
        gameState.projectiles.push(new Arrow(this, this.target));"""
unit_js = unit_js.replace(old_arrow, new_arrow)

# 4. Add swordsman sound
old_sword = """} else if (this.type === 'swordsman' || this.type === 'guardian') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          this.target.takeDamage(this.attackDamage, this);"""
new_sword = """} else if (this.type === 'swordsman' || this.type === 'guardian') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          if (this.type === 'swordsman') AudioManager.play('slash');
          this.target.takeDamage(this.attackDamage, this);"""
unit_js = unit_js.replace(old_sword, new_sword)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
