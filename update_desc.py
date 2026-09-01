import re
import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
html_path = os.path.join(base_dir, 'index.html')
config_path = os.path.join(base_dir, 'js', 'config.js')

descriptions = {
    'swordsman': 'Fast, Melee Attack',
    'guardian': 'Tough, hits and deflects',
    'spearman': 'Melee, long reach',
    'musketeer': 'Slow, Ranged Shot',
    'sniper': 'Deadly long range, points laser',
    'archer': 'Shoots sharp arrows',
    'cryomancer': 'Slows and freezes enemies',
    'flamecaller': 'Ranged, AOE damage',
    'wizard': 'Ranged, chain electric',
    'abyssal_summoner': 'Spawns fierce shadow snakes',
    'priest': 'Heals & armors allies',
    'bard': 'Boosts nearby allies',
    'druid': 'Links to heal allies',
    'alchemist': 'Throws debilitating potions',
    'sledgehammer': 'Crits armored units',
    'duelist': 'Fast, with burst attacks',
    'rockgolem': 'Tanky, AOE stun',
    'troll': 'Huge, ignores defense',
}

# 1. Update config.js
with open(config_path, 'r', encoding='utf-8') as f:
    config_lines = f.readlines()

for i, line in enumerate(config_lines):
    match = re.match(r"^\s*'([^']+)'\s*:", line)
    if match:
        unit_type = match.group(1)
        if unit_type in descriptions:
            desc = descriptions[unit_type]
            # Insert desc: '...', into the unit config object
            # Find the opening brace
            line = line.replace("{name:", f"{{description: '{desc}', name:")
            config_lines[i] = line

with open(config_path, 'w', encoding='utf-8') as f:
    f.writelines(config_lines)


# 2. Update index.html
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the description paragraph from index.html completely
html = re.sub(r'<p class="text-xs text-gray-400">.*?</p>', '', html)
html = html.replace('</div>\n                    </button>', '</div>\n                    </button>')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
