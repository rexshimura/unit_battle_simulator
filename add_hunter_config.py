import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
config_path = os.path.join(base_dir, 'js', 'config.js')

with open(config_path, 'r', encoding='utf-8') as f:
    config_js = f.read()

# Add to UNIT_ROLES
config_js = config_js.replace(
    "Rangers: ['musketeer', 'sniper', 'archer'],",
    "Rangers: ['musketeer', 'sniper', 'archer', 'hunter'],"
)

# Add to UNIT_SPECS
hunter_spec = "  'hunter': {description: 'Shoots a rifle and releases an eagle every 2 shots', name: 'Hunter', hp: 55, speed: 0.6, attackDamage: 16, attackRange: 550, attackCooldown: 1500, color: {team1: '#60a5fa', team2: '#f87171'}, eagleDamage: 12, eagleTriggerCount: 2},\n"

config_js = config_js.replace("const UNIT_SPECS = {\n", "const UNIT_SPECS = {\n" + hunter_spec)

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config_js)
