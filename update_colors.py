import re
import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
config_path = os.path.join(base_dir, 'js', 'config.js')

with open(config_path, 'r', encoding='utf-8') as f:
    config_content = f.read()

# Replace all color: {team1: '...', team2: '...'} with the standard ones
new_config = re.sub(r"color:\s*\{team1:\s*'[^']+',\s*team2:\s*'[^']+'\}", "color: {team1: '#60a5fa', team2: '#f87171'}", config_content)

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(new_config)
