import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
config_path = os.path.join(base_dir, 'js', 'config.js')

with open(config_path, 'r', encoding='utf-8') as f:
    config = f.read()

config = config.replace("name: 'Flamecaller', tags: ['Ranged']", "name: 'Flamecaller', tags: ['Ranged', 'Magic']")
config = config.replace("name: 'Wizard', tags: ['Ranged']", "name: 'Wizard', tags: ['Ranged', 'Magic']")
config = config.replace("name: 'Cryomancer', tags: ['Ranged', 'Support']", "name: 'Cryomancer', tags: ['Ranged', 'Support', 'Magic']")
config = config.replace("name: 'Priest', tags: ['Support']", "name: 'Priest', tags: ['Support', 'Magic']")
config = config.replace("name: 'Druid', tags: ['Support']", "name: 'Druid', tags: ['Support', 'Magic']")

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config)
