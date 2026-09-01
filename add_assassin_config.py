import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
config_path = os.path.join(base_dir, 'js', 'config.js')

with open(config_path, 'r', encoding='utf-8') as f:
    config_js = f.read()

assassin_config = """  'assassin': {description: 'Targets weak backliners, stealths on kill', name: 'Assassin', tags: ['Melee', 'Unique'], hp: 70, speed: 1.5, attackDamage: 35, attackRange: 35, attackCooldown: 800, color: {team1: '#60a5fa', team2: '#f87171'}},
  'ghoul':"""

config_js = config_js.replace("  'ghoul':", assassin_config)

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config_js)
