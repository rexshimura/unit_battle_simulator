import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
html_path = os.path.join(base_dir, 'index.html')

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

old_sorter = re.search(r'<div class="flex flex-col gap-2 mb-4 border-b border-gray-600 pb-2">.*?</div>\s*</div>', html, re.DOTALL)
if old_sorter:
    old_sorter = old_sorter.group(0)
else:
    print("Could not find new sorter.")

new_sorter = """<div id="role-sorter" class="flex flex-wrap justify-center gap-1.5 mb-4 border-b border-gray-600 pb-2">
                    <!-- Original 6 Icons using IMGs -->
                    <button data-role="all" class="role-btn p-1.5 rounded-full flex-shrink-0 selected" data-tooltip-title="All Units" data-tooltip-desc="Show all available units.">
                        <img src="icon/icon_all.svg" alt="All" class="w-5 h-5 pointer-events-none">
                    </button>
                    <button data-role="Breachers" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Breachers" data-tooltip-desc="Assault / Offense units.">
                        <img src="icon/icon_melee.svg" alt="Breachers" class="w-5 h-5 pointer-events-none">
                    </button>
                    <button data-role="Interceptors" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Interceptors" data-tooltip-desc="Defenders and Tanks.">
                        <img src="icon/icon_tank.svg" alt="Interceptors" class="w-5 h-5 pointer-events-none">
                    </button>
                    <button data-role="Rangers" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Rangers" data-tooltip-desc="Marksmen and Ranged units.">
                        <img src="icon/icon_range.svg" alt="Rangers" class="w-5 h-5 pointer-events-none">
                    </button>
                    <button data-role="Sorcerers" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Sorcerers" data-tooltip-desc="Magic and Spells.">
                        <img src="icon/icon_magic.svg" alt="Sorcerers" class="w-5 h-5 pointer-events-none">
                    </button>
                    <button data-role="Sustainers" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Sustainers" data-tooltip-desc="Healing units.">
                        <img src="icon/icon_support.svg" alt="Sustainers" class="w-5 h-5 pointer-events-none">
                    </button>
                    
                    <!-- New 5 Icons using matching Solid SVGs -->
                    <button data-role="Tinkerers" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Tinkerers" data-tooltip-desc="Engineers and Tacticians.">
                        <svg class="w-5 h-5 pointer-events-none text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path></svg>
                    </button>
                    <button data-role="Amplifiers" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Amplifiers" data-tooltip-desc="Units that buff allies.">
                        <svg class="w-5 h-5 pointer-events-none text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 6.414V15a1 1 0 11-2 0V6.414L4.707 10.707a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                    </button>
                    <button data-role="Infiltrators" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Infiltrators" data-tooltip-desc="Agile Flankers.">
                        <svg class="w-5 h-5 pointer-events-none text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path></svg>
                    </button>
                    <button data-role="Controllers" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Controllers" data-tooltip-desc="Utility, Traps, and CC.">
                        <svg class="w-5 h-5 pointer-events-none text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v5a7 7 0 11-14 0V9a1 1 0 012 0v2.5a.5.5 0 001 0V4a1 1 0 012 0v4.5a.5.5 0 001 0V3z" clip-rule="evenodd"></path></svg>
                    </button>
                    <button data-role="Summoners" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Summoners" data-tooltip-desc="Action Economy and Minions.">
                        <svg class="w-5 h-5 pointer-events-none text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    </button>
                </div>"""

if old_sorter:
    html = html.replace(old_sorter, new_sorter)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
        print("Updated HTML.")
else:
    print("Could not find the block to replace.")
