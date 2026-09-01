import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
html_path = os.path.join(base_dir, 'index.html')

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

ghoul_btn = """                    <button data-unit-type="ghoul" class="unit-btn w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center gap-3">
                        <canvas width="40" height="40" class="unit-preview-canvas" data-unit-type="ghoul"></canvas>
                        <div>
                            <p class="text-sm font-bold text-gray-200">Ghoul</p>
                        </div>
                    </button>
                    <button data-unit-type="abyssal_summoner\""""

html = html.replace('                    <button data-unit-type="abyssal_summoner"', ghoul_btn)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
