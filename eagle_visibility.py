import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
proj_path = os.path.join(base_dir, 'js', 'entities', 'Projectiles.js')

# 1. Update Unit.js
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# Update draw logic
old_draw = "if (this.type === 'hunter') {"
new_draw = "if (this.type === 'hunter' && !this.eagleOut) {"

# We only want to replace the FIRST occurrence which is in drawEquipment
unit_js = unit_js.replace(old_draw, new_draw, 1)

# Update attack logic
old_attack = """           this.basicAttackCounter = 0;
           AudioManager.play('eagle_release');
           gameState.projectiles.push(new EagleProjectile(this, this.target, specs.eagleDamage));"""

new_attack = """           this.basicAttackCounter = 0;
           this.eagleOut = true;
           AudioManager.play('eagle_release');
           gameState.projectiles.push(new EagleProjectile(this, this.target, specs.eagleDamage));"""

unit_js = unit_js.replace(old_attack, new_attack)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)


# 2. Update Projectiles.js
with open(proj_path, 'r', encoding='utf-8') as f:
    proj_js = f.read()

old_despawn = """      } else {
        // Returned to caster, despawn
        return false;
      }"""

new_despawn = """      } else {
        // Returned to caster, despawn
        this.caster.eagleOut = false;
        return false;
      }"""

proj_js = proj_js.replace(old_despawn, new_despawn)

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(proj_js)
