import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
main_path = os.path.join(base_dir, 'js', 'main.js')

with open(main_path, 'r', encoding='utf-8') as f:
    main_js = f.read()

main_js = main_js.replace("import { resizeCanvas } from './utils.js';", "import { resizeCanvas, AudioManager } from './utils.js';")
main_js = main_js.replace("initUIElements();", "initUIElements();\nAudioManager.init();")

with open(main_path, 'w', encoding='utf-8') as f:
    f.write(main_js)
