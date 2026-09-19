import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
index_path = os.path.join(base_dir, 'index.html')

with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the cost lines
html = re.sub(r'\s*<p class="text-xs text-gray-400">Cost: \d+</p>', '', html)

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(html)
