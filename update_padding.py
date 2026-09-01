import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
html_path = os.path.join(base_dir, 'index.html')

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace `p-2` with `p-1.5` in role-btn
html = html.replace('class="role-btn p-2 rounded-full flex-shrink-0', 'class="role-btn p-1.5 rounded-full flex-shrink-0')
html = html.replace('class="role-btn p-2 rounded-full flex-shrink-0 selected"', 'class="role-btn p-1.5 rounded-full flex-shrink-0 selected"')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
