import re
import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
with open(os.path.join(base_dir, 'index.html'), 'r', encoding='utf-8') as f:
    html = f.read()

pattern = re.compile(r'<button data-unit-type="([^"]+)".*?<p class="text-xs text-gray-400">(.*?)</p>', re.DOTALL)
matches = pattern.findall(html)
for m in matches:
    print(f"'{m[0]}': '{m[1]}',")
