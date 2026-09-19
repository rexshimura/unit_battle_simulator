import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
html_path = os.path.join(base_dir, 'index.html')

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Find sniper block
sniper_block_regex = r'(<button data-unit-type="sniper" class="unit-btn.*?</div>\s*</button>)'
match = re.search(sniper_block_regex, html, re.DOTALL)

if match:
    sniper_html = match.group(1)
    
    hunter_html = """
                    <button data-unit-type="hunter" class="unit-btn w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center gap-3">
                        <canvas width="40" height="40" class="unit-preview-canvas" data-unit-type="hunter"></canvas>
                        <div>
                            <p class="text-sm font-bold text-gray-200">Hunter</p>
                        </div>
                    </button>"""
                    
    html = html.replace(sniper_html, sniper_html + hunter_html)
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Injected Hunter button.")
else:
    print("Could not find Sniper block.")
