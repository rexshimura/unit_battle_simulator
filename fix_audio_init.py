import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
utils_path = os.path.join(base_dir, 'js', 'utils.js')

with open(utils_path, 'r', encoding='utf-8') as f:
    utils_js = f.read()

old_init = "        this.sounds.push = new Audio('js/sfx/push.mp3');\n    },"

new_init = """        this.sounds.push = new Audio('js/sfx/push.mp3');
        this.sounds.eagle_release = new Audio('js/sfx/eagle-release.mp3');
        this.sounds.eagle_bite = new Audio('js/sfx/eagle-bite.mp3');
        this.sounds.rifle = new Audio('js/sfx/rifle.mp3');
    },"""

utils_js = utils_js.replace(old_init, new_init)

with open(utils_path, 'w', encoding='utf-8') as f:
    f.write(utils_js)
