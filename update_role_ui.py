import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
html_path = os.path.join(base_dir, 'index.html')

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

old_sorter = re.search(r'<div id="role-sorter".*?</div>', html, re.DOTALL)
if old_sorter:
    old_sorter = old_sorter.group(0)

new_sorter = """<div class="flex flex-col gap-2 mb-4 border-b border-gray-600 pb-2">
                    <div class="flex justify-center w-full">
                        <button data-role="all" class="role-btn p-1.5 rounded-full selected w-full flex justify-center items-center gap-2 bg-gray-700 hover:bg-gray-600" data-tooltip-title="All Units" data-tooltip-desc="Show all available units.">
                            <svg class="w-5 h-5 pointer-events-none" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                            <span class="text-xs font-bold text-gray-300">ALL UNITS</span>
                        </button>
                    </div>
                    <div id="role-sorter" class="grid grid-cols-5 gap-1 justify-items-center w-full">
                        <button data-role="Breachers" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Breachers" data-tooltip-desc="Assault / Offense units.">
                            <svg class="w-5 h-5 pointer-events-none text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </button>
                        <button data-role="Interceptors" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Interceptors" data-tooltip-desc="Defenders and Tanks.">
                            <svg class="w-5 h-5 pointer-events-none text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        </button>
                        <button data-role="Rangers" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Rangers" data-tooltip-desc="Marksmen and Ranged units.">
                            <svg class="w-5 h-5 pointer-events-none text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22a10 10 0 100-20 10 10 0 000 20zm-4-10a4 4 0 118 0 4 4 0 01-8 0z"></path></svg>
                        </button>
                        <button data-role="Tinkerers" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Tinkerers" data-tooltip-desc="Engineers and Tacticians.">
                            <svg class="w-5 h-5 pointer-events-none text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </button>
                        <button data-role="Sorcerers" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Sorcerers" data-tooltip-desc="Magic and Spells.">
                            <svg class="w-5 h-5 pointer-events-none text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zm10 5l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zm-4 6l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"></path></svg>
                        </button>
                        
                        <button data-role="Sustainers" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Sustainers" data-tooltip-desc="Healing units.">
                            <svg class="w-5 h-5 pointer-events-none text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>
                        </button>
                        <button data-role="Amplifiers" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Amplifiers" data-tooltip-desc="Units that buff allies.">
                            <svg class="w-5 h-5 pointer-events-none text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        </button>
                        <button data-role="Infiltrators" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Infiltrators" data-tooltip-desc="Agile Flankers.">
                            <svg class="w-5 h-5 pointer-events-none text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </button>
                        <button data-role="Controllers" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Controllers" data-tooltip-desc="Utility, Traps, and CC.">
                            <svg class="w-5 h-5 pointer-events-none text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </button>
                        <button data-role="Summoners" class="role-btn p-1.5 rounded-full flex-shrink-0" data-tooltip-title="Summoners" data-tooltip-desc="Action Economy and Minions.">
                            <svg class="w-5 h-5 pointer-events-none text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                        </button>
                    </div>
                </div>"""

if old_sorter:
    html = html.replace(old_sorter, new_sorter)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
