import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
utils_path = os.path.join(base_dir, 'js', 'utils.js')

with open(utils_path, 'r', encoding='utf-8') as f:
    utils_js = f.read()

old_init = """    init: function() {
        this.sounds.slash = new Audio('js/sfx/slash.mp3');
        this.sounds.arrow = new Audio('js/sfx/arrow.mp3');
        this.sounds.bullet = new Audio('js/sfx/bullet.mp3');
        this.sounds.snipe = new Audio('js/sfx/snipe.mp3');
    },"""
new_init = """    init: function() {
        this.sounds.slash = new Audio('js/sfx/slash.mp3');
        this.sounds.arrow = new Audio('js/sfx/arrow.mp3');
        this.sounds.bullet = new Audio('js/sfx/bullet.mp3');
        this.sounds.snipe = new Audio('js/sfx/snipe.mp3');
        this.sounds.slice = new Audio('js/sfx/slice.mp3');
        this.sounds.bite = new Audio('js/sfx/bite.mp3');
    },"""

utils_js = utils_js.replace(old_init, new_init)

with open(utils_path, 'w', encoding='utf-8') as f:
    f.write(utils_js)
