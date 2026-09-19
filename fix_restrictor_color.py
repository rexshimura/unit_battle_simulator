import os

config_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\config.js'
with open(config_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("color: {team1: '#94a3b8', team2: '#475569'}", "color: {team1: '#60a5fa', team2: '#f87171'}")

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Config updated for restrictor colors.')
