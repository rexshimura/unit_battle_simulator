import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
main_path = os.path.join(base_dir, 'js', 'main.js')

with open(main_path, 'r', encoding='utf-8') as f:
    main_js = f.read()

old_logic = "uniqueSeparator.classList.toggle('hidden', selectedRole !== 'all' && selectedRole !== 'Magic');"
new_logic = "uniqueSeparator.classList.toggle('hidden', !['all', 'Magic', 'Melee'].includes(selectedRole));"

main_js = main_js.replace(old_logic, new_logic)

with open(main_path, 'w', encoding='utf-8') as f:
    f.write(main_js)
