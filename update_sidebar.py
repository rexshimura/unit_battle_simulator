import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
html_path = os.path.join(base_dir, 'index.html')

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Make sidebar wider
html = html.replace('id="side-panel" class="glass-panel p-6 w-full md:w-64 flex flex-col"', 'id="side-panel" class="glass-panel p-6 w-full md:w-72 flex flex-col"')

# Update role sorter container
html = html.replace('id="role-sorter" class="flex justify-around mb-4 border-b border-gray-600 pb-2"', 'id="role-sorter" class="flex justify-between gap-1 mb-4 border-b border-gray-600 pb-2"')

# Update all role buttons
old_button_pattern = r'<button data-role="(.*?)" class="role-btn p-2 rounded-full(.*?)">\s*<img src="(.*?)" alt="(.*?)" class="w-6 h-6 pointer-events-none">\s*</button>'
new_button_replacement = r'<button data-role="\1" class="role-btn p-2 rounded-full flex-shrink-0\2">\n                        <img src="\3" alt="\4" class="w-5 h-5 pointer-events-none">\n                    </button>'

html = re.sub(old_button_pattern, new_button_replacement, html)


with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
