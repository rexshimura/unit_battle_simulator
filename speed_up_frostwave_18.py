import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
utils_path = os.path.join(base_dir, 'js', 'utils.js')

with open(utils_path, 'r', encoding='utf-8') as f:
    utils_js = f.read()

old_play = "sound.playbackRate = 1.5; // play faster"
new_play = "sound.playbackRate = 1.8; // play faster"

utils_js = utils_js.replace(old_play, new_play)

with open(utils_path, 'w', encoding='utf-8') as f:
    f.write(utils_js)
