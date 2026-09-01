import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
config_path = os.path.join(base_dir, 'js', 'config.js')

with open(config_path, 'r', encoding='utf-8') as f:
    config = f.read()

config = config.replace("name: 'Abyssal Summoner', tags: ['Ranged', 'Support']", 
                        "name: 'Abyssal Summoner', tags: ['Magic', 'Unique']")

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config)
