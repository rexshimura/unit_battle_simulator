import re
import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
css_path = os.path.join(base_dir, 'css', 'styles.css')

with open(css_path, 'a', encoding='utf-8') as f:
    f.write("\n")
    f.write("/* Grid View Styles */\n")
    f.write(".unit-list.grid-view {\n")
    f.write("    display: grid !important;\n")
    f.write("    grid-template-columns: repeat(3, minmax(0, 1fr));\n")
    f.write("    gap: 0.5rem !important;\n")
    f.write("}\n")
    f.write(".unit-list.grid-view > .unit-btn {\n")
    f.write("    display: flex !important;\n")
    f.write("    flex-direction: column !important;\n")
    f.write("    align-items: center !important;\n")
    f.write("    justify-content: center !important;\n")
    f.write("    padding: 0.5rem !important;\n")
    f.write("}\n")
    f.write(".unit-list.grid-view > .unit-btn > div {\n")
    f.write("    display: none !important;\n")
    f.write("}\n")

# Update index.html
html_path = os.path.join(base_dir, 'index.html')
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the Place Units header with a toggle
header_str = '<h2 class="text-xl font-bold mb-4 border-b border-gray-600 pb-2 flex-shrink-0">Place Units</h2>'
new_header = '''<div class="flex justify-between items-center mb-4 border-b border-gray-600 pb-2 flex-shrink-0">
                    <h2 class="text-xl font-bold">Place Units</h2>
                    <button id="view-toggle-btn" class="p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors" title="Toggle Grid/List View">
                        <svg id="view-icon-list" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        <svg id="view-icon-grid" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    </button>
                </div>'''

html = html.replace(header_str, new_header)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
