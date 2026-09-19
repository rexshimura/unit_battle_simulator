import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
config_path = os.path.join(base_dir, 'js', 'config.js')

with open(config_path, 'r', encoding='utf-8') as f:
    config_js = f.read()

old_roles = "Rangers: ['musketeer', 'sniper', 'archer', 'hunter'],"
new_roles = "Rangers: ['musketeer', 'sniper', 'archer', 'hunter', 'minigunner'],"
config_js = config_js.replace(old_roles, new_roles)

old_specs = """const UNIT_SPECS = {"""
new_specs = """const UNIT_SPECS = {
  'minigunner': {description: 'Rapidly fires small bullets', name: 'Minigunner', hp: 120, speed: 0.6, attackDamage: 2.5, attackRange: 300, attackCooldown: 120, color: {team1: '#60a5fa', team2: '#f87171'}},"""
config_js = config_js.replace(old_specs, new_specs)

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config_js)
