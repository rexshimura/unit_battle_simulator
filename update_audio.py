import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
sw_path = os.path.join(base_dir, 'sw.js')
utils_path = os.path.join(base_dir, 'js', 'utils.js')

# Update sw.js
with open(sw_path, 'r', encoding='utf-8') as f:
    sw_js = f.read()

sw_js = sw_js.replace(
    "'./js/sfx/thrust.mp3',",
    "'./js/sfx/thrust.mp3',\n  './js/sfx/eagle-release.mp3',\n  './js/sfx/eagle-bite.mp3',\n  './js/sfx/rifle.mp3',"
)
with open(sw_path, 'w', encoding='utf-8') as f:
    f.write(sw_js)

# Update utils.js
with open(utils_path, 'r', encoding='utf-8') as f:
    utils_js = f.read()

old_audio_init = """    init: function() {
        const files = {
            'slash': 'js/sfx/slash.mp3',
            'arrow': 'js/sfx/arrow.mp3',
            'bullet': 'js/sfx/bullet.mp3',
            'snipe': 'js/sfx/snipe.mp3',
            'slice': 'js/sfx/slice.mp3',
            'bite': 'js/sfx/bite.mp3',
            'thrust': 'js/sfx/thrust.mp3',
            'ice_shards': 'js/sfx/ice-shards.mp3',
            'frostwave': 'js/sfx/frostwave.mp3',
            'freeze': 'js/sfx/freeze.mp3',
            'push': 'js/sfx/push.mp3'
            'eagle_release': 'js/sfx/eagle-release.mp3',
            'eagle_bite': 'js/sfx/eagle-bite.mp3',
            'rifle': 'js/sfx/rifle.mp3'
        };"""

new_audio_init = """    init: function() {
        const files = {
            'slash': 'js/sfx/slash.mp3',
            'arrow': 'js/sfx/arrow.mp3',
            'bullet': 'js/sfx/bullet.mp3',
            'snipe': 'js/sfx/snipe.mp3',
            'slice': 'js/sfx/slice.mp3',
            'bite': 'js/sfx/bite.mp3',
            'thrust': 'js/sfx/thrust.mp3',
            'ice_shards': 'js/sfx/ice-shards.mp3',
            'frostwave': 'js/sfx/frostwave.mp3',
            'freeze': 'js/sfx/freeze.mp3',
            'push': 'js/sfx/push.mp3',
            'eagle_release': 'js/sfx/eagle-release.mp3',
            'eagle_bite': 'js/sfx/eagle-bite.mp3',
            'rifle': 'js/sfx/rifle.mp3'
        };"""

utils_js = utils_js.replace(old_audio_init, new_audio_init)

old_audio_play = """            // Adjust playback rates for specific SFX
            if (name === 'frostwave') {
                sound.playbackRate = 1.8; // play faster
            }
            
            sound.play().catch(e => console.log('Audio play blocked:', e));"""

new_audio_play = """            // Adjust playback rates for specific SFX
            if (name === 'frostwave') {
                sound.playbackRate = 1.8; // play faster
            }
            if (name === 'eagle_release') {
                sound.volume = 0.1; // Make it less audible
            }
            
            sound.play().catch(e => console.log('Audio play blocked:', e));"""

utils_js = utils_js.replace(old_audio_play, new_audio_play)

with open(utils_path, 'w', encoding='utf-8') as f:
    f.write(utils_js)
