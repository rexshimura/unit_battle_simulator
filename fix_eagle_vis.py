import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# Fix the weapon block
old_weapon = """      if (this.type === 'sniper') nozzleLength = 18;
      if (this.type === 'hunter' && !this.eagleOut) {
         nozzleLength = 15;
         nozzleWidth = 2.5; // Slimmer rifle
         weaponColor = '#4b5563'; // Darker, unique metallic
      }"""

new_weapon = """      if (this.type === 'sniper') nozzleLength = 18;
      if (this.type === 'hunter') {
         nozzleLength = 15;
         nozzleWidth = 2.5; // Slimmer rifle
         weaponColor = '#4b5563'; // Darker, unique metallic
      }"""

unit_js = unit_js.replace(old_weapon, new_weapon)

# Fix the eagle drawing block
old_eagle = """      // Draw eagle on Hunter's shoulder
      if (this.type === 'hunter') {"""

new_eagle = """      // Draw eagle on Hunter's shoulder
      if (this.type === 'hunter' && !this.eagleOut) {"""

unit_js = unit_js.replace(old_eagle, new_eagle)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
