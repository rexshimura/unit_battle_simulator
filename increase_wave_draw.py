import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
effects_path = os.path.join(base_dir, 'js', 'entities', 'Effects.js')

with open(effects_path, 'r', encoding='utf-8') as f:
    effects_js = f.read()

old_draw_logic = """    const progress = 1 - this.duration / this.maxDuration;
    const currentRadius = this.specs.attackRange * progress;"""

new_draw_logic = """    const progress = 1 - this.duration / this.maxDuration;
    const maxWaveRange = this.specs.attackRange * 2.0; // Draw out to twice the attack range
    const currentRadius = maxWaveRange * progress;"""

effects_js = effects_js.replace(old_draw_logic, new_draw_logic)

with open(effects_path, 'w', encoding='utf-8') as f:
    f.write(effects_js)
