import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
utils_path = os.path.join(base_dir, 'js', 'utils.js')

with open(utils_path, 'r', encoding='utf-8') as f:
    utils_js = f.read()

# Add console logs to play function
old_play = """    play: function(name) {
        if(this.sounds[name]) {
            let sound = this.sounds[name].cloneNode();"""

new_play = """    play: function(name) {
        if (name === 'rifle' || name === 'eagle_release' || name === 'eagle_bite') {
            console.log('AudioManager playing:', name, 'Exists:', !!this.sounds[name], 'Audio Src:', this.sounds[name] ? this.sounds[name].src : 'N/A');
        }
        if(this.sounds[name]) {
            let sound = this.sounds[name].cloneNode();"""

utils_js = utils_js.replace(old_play, new_play)

with open(utils_path, 'w', encoding='utf-8') as f:
    f.write(utils_js)
