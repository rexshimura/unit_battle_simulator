import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
config_path = os.path.join(base_dir, 'js', 'config.js')

with open(config_path, 'r', encoding='utf-8') as f:
    config_js = f.read()

# Replace specialTriggerCount: 2 with specialTriggerCount: 3 for cryomancer
old_line = "'cryomancer': {description: 'Slows and freezes enemies', name: 'Cryomancer', tags: ['Ranged', 'Support', 'Magic'], hp: 80, speed: 0.6, attackDamage: 15, attackRange: 300, attackCooldown: 800, color: {team1: '#60a5fa', team2: '#f87171'}, specialTriggerCount: 2, waveDamage: 3, freezeStacksApplied: 1, freezeTriggerCount: 4, freezeDuration: 2500, chillDuration: 5000},"
new_line = "'cryomancer': {description: 'Slows and freezes enemies', name: 'Cryomancer', tags: ['Ranged', 'Support', 'Magic'], hp: 80, speed: 0.6, attackDamage: 15, attackRange: 300, attackCooldown: 800, color: {team1: '#60a5fa', team2: '#f87171'}, specialTriggerCount: 3, waveDamage: 3, freezeStacksApplied: 1, freezeTriggerCount: 4, freezeDuration: 2500, chillDuration: 5000},"

config_js = config_js.replace(old_line, new_line)

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config_js)
