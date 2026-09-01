import os

effects_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\entities\Effects.js'
with open(effects_path, 'r', encoding='utf-8') as f:
    effects = f.read()

effects += "\nexport { ShieldBashAnimation };\n"

with open(effects_path, 'w', encoding='utf-8') as f:
    f.write(effects)

# also import it in Unit.js
unit_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\entities\Unit.js'
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

if "ShieldBashAnimation" not in unit_js.split("from './Effects.js'")[0]:
    unit_js = unit_js.replace("Particle } from './Effects.js';", "Particle, ShieldBashAnimation } from './Effects.js';")

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
