import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
html_path = os.path.join(base_dir, 'index.html')

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

old_roles = """                    <button data-role="Support" class="role-btn p-2 rounded-full" data-tooltip-title="Support Units" data-tooltip-desc="Filter for units that heal or support allies.">
                        <img src="icon/icon_support.svg" alt="Support" class="w-6 h-6 pointer-events-none">
                    </button>
                </div>"""

new_roles = """                    <button data-role="Magic" class="role-btn p-2 rounded-full" data-tooltip-title="Magic Units" data-tooltip-desc="Filter for spellcasting units.">
                        <img src="icon/icon_magic.svg" alt="Magic" class="w-6 h-6 pointer-events-none">
                    </button>
                    <button data-role="Support" class="role-btn p-2 rounded-full" data-tooltip-title="Support Units" data-tooltip-desc="Filter for units that heal or support allies.">
                        <img src="icon/icon_support.svg" alt="Support" class="w-6 h-6 pointer-events-none">
                    </button>
                    <button data-role="Unique" class="role-btn p-2 rounded-full" data-tooltip-title="Unique Units" data-tooltip-desc="Filter for highly specialized unique units.">
                        <img src="icon/icon_unique.svg" alt="Unique" class="w-6 h-6 pointer-events-none">
                    </button>
                </div>"""

html = html.replace(old_roles, new_roles)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
