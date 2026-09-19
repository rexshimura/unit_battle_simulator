import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
proj_path = os.path.join(base_dir, 'js', 'entities', 'Projectiles.js')

with open(proj_path, 'r', encoding='utf-8') as f:
    proj_js = f.read()

bad_line = "    import { getDistance } from '../utils.js'; // Needed if getDistance isn't in scope, but wait, it is imported at top\n"
proj_js = proj_js.replace(bad_line, "")

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(proj_js)
