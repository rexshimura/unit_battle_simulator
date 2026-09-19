import os

html_path = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\index.html"
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add after guardian
guardian_btn_end = """</button>
                     <button data-unit-type="spearman\""""

force_wall_btn = """</button>
                    <button data-unit-type="force_wall" class="unit-btn w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center gap-3">
                        <canvas width="40" height="40" class="unit-preview-canvas" data-unit-type="force_wall"></canvas>
                        <div>
                            <p class="text-sm font-bold text-gray-200">Force Wall</p>
                        </div>
                    </button>
                     <button data-unit-type="spearman\""""

if 'data-unit-type="force_wall"' not in content:
    content = content.replace(guardian_btn_end, force_wall_btn)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added Force Wall button to index.html")
else:
    print("Force Wall button already exists")
