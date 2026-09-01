import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
html_path = os.path.join(base_dir, 'index.html')

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove the Unique role button
unique_btn = """                    <button data-role="Unique" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Unique Units" data-tooltip-desc="Filter for highly specialized unique units.">
                        <img src="icon/icon_unique.svg" alt="Unique" class="w-5 h-5 pointer-events-none">
                    </button>"""
html = html.replace(unique_btn, "")

# 2. Find and extract abyssal_summoner button
abyssal_btn_pattern = r'                    <button data-unit-type="abyssal_summoner".*?</div>\n                    </button>'
match = re.search(abyssal_btn_pattern, html, re.DOTALL)
if match:
    abyssal_btn = match.group(0)
    html = html.replace(abyssal_btn, "")
    
    # 3. Find the end of unit-list
    end_of_list = "                </div>\n                <div class=\"mt-auto flex-shrink-0\">"
    
    separator = """
                    <div id="unique-separator" class="col-span-full flex items-center gap-2 py-2 mt-2 w-full hidden">
                        <div class="h-px bg-gray-600 flex-grow"></div>
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Unique</span>
                        <div class="h-px bg-gray-600 flex-grow"></div>
                    </div>
"""
    
    html = html.replace(end_of_list, separator + abyssal_btn + "\n" + end_of_list)


with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
