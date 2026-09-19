import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
proj_path = os.path.join(base_dir, 'js', 'entities', 'Projectiles.js')

with open(proj_path, 'r', encoding='utf-8') as f:
    proj_js = f.read()

proj_js = proj_js.replace(
    "this.speed = UNIT_SPECS.hunter.eagleSpeed || 6.0; so it reaches targets cleanly with curve",
    "this.speed = UNIT_SPECS.hunter.eagleSpeed || 6.0; // so it reaches targets cleanly with curve"
)

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(proj_js)
