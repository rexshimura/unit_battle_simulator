import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
utils_path = os.path.join(base_dir, 'js', 'utils.js')

with open(utils_path, 'r', encoding='utf-8') as f:
    utils_js = f.read()

old_play = """    play: function(name) {
        if(this.sounds[name]) {
            let sound = this.sounds[name].cloneNode();
            sound.volume = 0.3; // keep it a bit quieter so it's not deafening
            sound.play().catch(e => console.log('Audio play blocked:', e));
        }
    }"""
new_play = """    play: function(name) {
        if(this.sounds[name]) {
            let sound = this.sounds[name].cloneNode();
            sound.volume = 0.3; // keep it a bit quieter so it's not deafening
            
            // Adjust playback rates for specific SFX
            if (name === 'frostwave') {
                sound.playbackRate = 1.5; // play faster
            }
            
            sound.play().catch(e => console.log('Audio play blocked:', e));
        }
    }"""

utils_js = utils_js.replace(old_play, new_play)

with open(utils_path, 'w', encoding='utf-8') as f:
    f.write(utils_js)
