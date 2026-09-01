import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_logic = """    let currentSpeed = this.speed;
    if (this.type === 'troll' && this.hp <= this.maxHp * 0.5) {
      currentSpeed *= 2.5; // Rage mode, 2.5x faster!
    }"""
    
new_logic = """    let currentSpeed = this.speed;
    if (this.type === 'troll' && this.hp <= this.maxHp * 0.5) {
      currentSpeed *= 2.5; // Rage mode, 2.5x faster!
    }
    if (this.type === 'assassin' && this.isShadow) {
      currentSpeed *= 3.0; // 3x movement speed in shadow mode!
    }"""

unit_js = unit_js.replace(old_logic, new_logic)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
