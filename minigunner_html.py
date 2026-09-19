import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
index_path = os.path.join(base_dir, 'index.html')

with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

hunter_html = """                    <button data-unit-type="hunter" class="unit-btn w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center gap-3">
                        <canvas width="40" height="40" class="unit-preview-canvas" data-unit-type="hunter"></canvas>
                        <div>
                            <p class="text-sm font-bold text-gray-200">Hunter</p>
                            <p class="text-xs text-gray-400">Cost: 50</p>
                        </div>
                    </button>"""

minigunner_html = """                    <button data-unit-type="hunter" class="unit-btn w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center gap-3">
                        <canvas width="40" height="40" class="unit-preview-canvas" data-unit-type="hunter"></canvas>
                        <div>
                            <p class="text-sm font-bold text-gray-200">Hunter</p>
                            <p class="text-xs text-gray-400">Cost: 50</p>
                        </div>
                    </button>
                    
                    <button data-unit-type="minigunner" class="unit-btn w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center gap-3">
                        <canvas width="40" height="40" class="unit-preview-canvas" data-unit-type="minigunner"></canvas>
                        <div>
                            <p class="text-sm font-bold text-gray-200">Minigunner</p>
                            <p class="text-xs text-gray-400">Cost: 50</p>
                        </div>
                    </button>"""

html = html.replace(hunter_html, minigunner_html)

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(html)
