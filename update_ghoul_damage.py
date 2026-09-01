import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
config_path = os.path.join(base_dir, 'js', 'config.js')

with open(config_path, 'r', encoding='utf-8') as f:
    config_js = f.read()

config_js = config_js.replace("name: 'Ghoul', tags: ['Melee', 'Unique'], hp: 120, speed: 1.2, attackDamage: 12,", 
                              "name: 'Ghoul', tags: ['Melee', 'Unique'], hp: 120, speed: 1.2, attackDamage: 8,")

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config_js)
