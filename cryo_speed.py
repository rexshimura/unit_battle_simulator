import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
config_path = os.path.join(base_dir, 'js', 'config.js')

with open(config_path, 'r', encoding='utf-8') as f:
    config = f.read()

# Replace cryomancer's attackCooldown from 2000 to 800
config = config.replace("'cryomancer': {description: 'Slows and freezes enemies', name: 'Cryomancer', tags: ['Ranged', 'Support'], hp: 80, speed: 0.6, attackDamage: 15, attackRange: 300, attackCooldown: 2000,",
                        "'cryomancer': {description: 'Slows and freezes enemies', name: 'Cryomancer', tags: ['Ranged', 'Support'], hp: 80, speed: 0.6, attackDamage: 15, attackRange: 300, attackCooldown: 800,")

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config)
