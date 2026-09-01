import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
proj_path = os.path.join(base_dir, 'js', 'entities', 'Projectiles.js')

with open(proj_path, 'r', encoding='utf-8') as f:
    proj_js = f.read()

# Add creationTime to Fireball constructor
old_constructor = """  constructor(shooter, target, isSmall = false, angleOffset = 0) {
    const specs = UNIT_SPECS.flamecaller;
    super(shooter, target, isSmall ? specs.attackDamage / 2 : specs.attackDamage, shooter.team);
    this.speed = isSmall ? 4.5 : 3;
    this.radius = isSmall ? 4 : 8;
    this.isSmall = isSmall;
    this.angle += angleOffset;
  }"""

new_constructor = """  constructor(shooter, target, isSmall = false, angleOffset = 0) {
    const specs = UNIT_SPECS.flamecaller;
    super(shooter, target, isSmall ? specs.attackDamage / 2 : specs.attackDamage, shooter.team);
    this.speed = isSmall ? 4.5 : 3;
    this.radius = isSmall ? 4 : 8;
    this.isSmall = isSmall;
    this.angle += angleOffset;
    this.creationTime = Date.now();
  }"""

proj_js = proj_js.replace(old_constructor, new_constructor)

# Add delay to homing logic
old_homing = """  update(enemies) {
    if (this.isSmall && this.target && this.target.hp > 0) {"""

new_homing = """  update(enemies) {
    if (this.isSmall && this.target && this.target.hp > 0 && Date.now() - this.creationTime > 250) {"""

proj_js = proj_js.replace(old_homing, new_homing)

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(proj_js)
