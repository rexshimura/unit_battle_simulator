import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
html_path = os.path.join(base_dir, 'index.html')

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Remove rockgolem from original position
rockgolem_btn = """                    <button data-unit-type="rockgolem" class="unit-btn w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center gap-3">
                        <canvas width="40" height="40" class="unit-preview-canvas" data-unit-type="rockgolem"></canvas>
                        <div>
                            <p class="text-sm font-bold text-gray-200">Rock Golem</p>
                        </div>
                    </button>\n"""

html = html.replace(rockgolem_btn, "")

# Insert below unique separator
separator = """                    <div id="unique-separator" class="col-span-full flex items-center gap-2 py-2 mt-2 w-full hidden">
                        <div class="h-px bg-gray-600 flex-grow"></div>
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Unique</span>
                        <div class="h-px bg-gray-600 flex-grow"></div>
                    </div>\n"""

html = html.replace(separator, separator + rockgolem_btn)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
