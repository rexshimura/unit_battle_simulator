import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
main_path = os.path.join(base_dir, 'js', 'main.js')

with open(main_path, 'r', encoding='utf-8') as f:
    main_js = f.read()

main_js = main_js.replace(
    "!['all', 'Magic', 'Melee', 'Tank'].includes(selectedRole)",
    "!['all', 'Sorcerers', 'Breachers', 'Interceptors', 'Summoners', 'Infiltrators'].includes(selectedRole)"
)

with open(main_path, 'w', encoding='utf-8') as f:
    f.write(main_js)
