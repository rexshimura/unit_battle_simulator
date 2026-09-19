import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
index_path = os.path.join(base_dir, 'index.html')

with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

minigunner_btn = """                    <button data-unit-type="minigunner" class="unit-btn w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center gap-3">
                        <canvas width="40" height="40" class="unit-preview-canvas" data-unit-type="minigunner"></canvas>
                        <div>
                            <p class="text-sm font-bold text-gray-200">Minigunner</p>
                            <p class="text-xs text-gray-400">Cost: 50</p>
                        </div>
                    </button>
"""

# Insert right before the sorcerers role block, or after hunter.
# I'll just insert it by finding the hunter button closing tag
pattern = r'(<button data-unit-type="hunter"[\s\S]*?</button>)'
html = re.sub(pattern, r'\1\n' + minigunner_btn, html)

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(html)
