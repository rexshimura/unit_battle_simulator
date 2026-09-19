import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
config_path = os.path.join(base_dir, 'js', 'config.js')

with open(config_path, 'r', encoding='utf-8') as f:
    config_js = f.read()

replacements = {
    "name: 'Swordsman', tags: ['Melee', 'Basic']": "name: 'Swordsman', tags: ['Breachers']",
    "name: 'Fortress', tags: ['Tank', 'Melee']": "name: 'Fortress', tags: ['Interceptors']",
    "name: 'Guardian', tags: ['Tank', 'Melee']": "name: 'Guardian', tags: ['Interceptors']",
    "name: 'Spearman', tags: ['Melee']": "name: 'Spearman', tags: ['Breachers']",
    "name: 'Musketeer', tags: ['Ranged', 'Basic']": "name: 'Musketeer', tags: ['Rangers']",
    "name: 'Sniper', tags: ['Ranged', 'Assassin']": "name: 'Sniper', tags: ['Rangers']",
    "name: 'Archer', tags: ['Ranged', 'Basic']": "name: 'Archer', tags: ['Rangers']",
    "name: 'Flamecaller', tags: ['Ranged', 'Magic']": "name: 'Flamecaller', tags: ['Sorcerers']",
    "name: 'Wizard', tags: ['Ranged', 'Magic']": "name: 'Wizard', tags: ['Sorcerers']",
    "name: 'Cryomancer', tags: ['Ranged', 'Support', 'Magic']": "name: 'Cryomancer', tags: ['Controllers', 'Sorcerers']",
    "name: 'Assassin', tags: ['Melee', 'Unique']": "name: 'Assassin', tags: ['Infiltrators']",
    "name: 'Ghoul', tags: ['Melee', 'Unique']": "name: 'Ghoul', tags: ['Breachers']",
    "name: 'Abyssal Summoner', tags: ['Magic', 'Unique']": "name: 'Abyssal Summoner', tags: ['Summoners']",
    "name: 'Priest', tags: ['Support', 'Magic']": "name: 'Priest', tags: ['Sustainers']",
    "name: 'Bard', tags: ['Support']": "name: 'Bard', tags: ['Amplifiers']",
    "name: 'Druid', tags: ['Support', 'Magic']": "name: 'Druid', tags: ['Sustainers']",
    "name: 'Alchemist', tags: ['Ranged', 'Support']": "name: 'Alchemist', tags: ['Tinkerers']",
    "name: 'Sledgehammer', tags: ['Melee', 'Tank']": "name: 'Sledgehammer', tags: ['Breachers', 'Interceptors']",
    "name: 'Duelist', tags: ['Melee']": "name: 'Duelist', tags: ['Infiltrators', 'Breachers']",
    "name: 'Rock Golem', tags: ['Tank', 'Melee', 'Unique']": "name: 'Rock Golem', tags: ['Interceptors']",
    "name: 'Troll', tags: ['Melee', 'Tank']": "name: 'Troll', tags: ['Interceptors', 'Breachers']"
}

for old, new in replacements.items():
    config_js = config_js.replace(old, new)

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config_js)
