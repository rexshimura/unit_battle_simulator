import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
effects_path = os.path.join(base_dir, 'js', 'entities', 'Effects.js')

with open(effects_path, 'r', encoding='utf-8') as f:
    effects_js = f.read()

old_logic = """    const waveProgress = 1 - this.duration / this.maxDuration;
    const currentDist = this.specs.attackRange * waveProgress;"""

new_logic = """    const waveProgress = 1 - this.duration / this.maxDuration;
    const maxWaveRange = this.specs.attackRange * 2.0; // Wave travels twice as far as attack range
    const currentDist = maxWaveRange * waveProgress;"""

effects_js = effects_js.replace(old_logic, new_logic)

with open(effects_path, 'w', encoding='utf-8') as f:
    f.write(effects_js)
