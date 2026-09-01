import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
config_path = os.path.join(base_dir, 'js', 'config.js')

with open(config_path, 'r', encoding='utf-8') as f:
    config_js = f.read()

# Update ghoul
ghoul_old = "'ghoul': {description: 'Bites enemies, revives faster on death', name: 'Ghoul', tags: ['Melee', 'Unique'], hp: 120, speed: 1.2, attackDamage: 8, attackRange: 40, attackCooldown: 600, color: {team1: '#60a5fa', team2: '#f87171'}, reviveHpMultiplier: 0.5, reviveSpeedMultiplier: 2.5, reviveDamageMultiplier: 1.5, reviveCooldownMultiplier: 0.6},"
ghoul_new = "'ghoul': {description: 'Bites enemies, revives faster on death', name: 'Ghoul', tags: ['Melee', 'Unique'], hp: 100, speed: 1.2, attackDamage: 8, attackRange: 40, attackCooldown: 600, color: {team1: '#60a5fa', team2: '#f87171'}, reviveMaxHp: 150, reviveHpMultiplier: 0.5, reviveSpeedMultiplier: 2.5, reviveDamageMultiplier: 1.5, reviveCooldownMultiplier: 0.6, reviveDelay: 3000},"
config_js = config_js.replace(ghoul_old, ghoul_new)

# Update sledgehammer
sledge_old = "'sledgehammer': {description: 'Crits armored units', name: 'Sledgehammer', tags: ['Melee', 'Tank'], hp: 160, speed: 0.5, attackDamage: 30, attackRange: 45, attackCooldown: 2800, color: {team1: '#60a5fa', team2: '#f87171'}, critMultiplier: 2.5, critTargets: ['guardian', 'rockgolem']},"
sledge_new = "'sledgehammer': {description: 'Crits armored units', name: 'Sledgehammer', tags: ['Melee', 'Tank'], hp: 160, speed: 0.5, attackDamage: 30, attackRange: 45, attackCooldown: 2800, color: {team1: '#60a5fa', team2: '#f87171'}, critMultiplier: 3.0, critTargets: ['guardian', 'rockgolem', 'fortress']},"
config_js = config_js.replace(sledge_old, sledge_new)

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config_js)
