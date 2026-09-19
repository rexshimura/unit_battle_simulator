import os

config_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\config.js'
with open(config_path, 'r', encoding='utf-8') as f:
    text = f.read()
    
old_conf = "'restrictor': {description: 'Throws chains. Every 4th attack locks enemy for 5 seconds.', name: 'Restrictor', hp: 120, speed: 0.6, attackDamage: 12, attackRange: 600, attackCooldown: 1400, color: {team1: '#60a5fa', team2: '#f87171'}, size: 20},"
new_conf = "'restrictor': {description: 'Throws chains. Every 4th attack locks enemy for 10 seconds.', name: 'Restrictor', hp: 120, speed: 0.6, attackDamage: 4, attackRange: 600, attackCooldown: 1400, color: {team1: '#60a5fa', team2: '#f87171'}, size: 20},"

text = text.replace(old_conf, new_conf)

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(text)
print('Config updated.')
