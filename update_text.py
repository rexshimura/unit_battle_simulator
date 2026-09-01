import os
import re

html_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace Place Units
html = html.replace('<h2 class="text-xl font-bold side-panel-title">Place Units</h2>', '<h2 class="text-sm font-bold side-panel-title uppercase tracking-widest text-gray-400">Place Units</h2>')

# Replace <p class="font-bold"> inside unit buttons
html = html.replace('<p class="font-bold">', '<p class="text-sm font-bold text-gray-200">')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
