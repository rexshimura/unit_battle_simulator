import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
utils_path = os.path.join(base_dir, 'js', 'utils.js')

with open(utils_path, 'r', encoding='utf-8') as f:
    utils_js = f.read()

audio_manager = """
const AudioManager = {
    sounds: {},
    init: function() {
        this.sounds.slash = new Audio('js/sfx/slash.mp3');
        this.sounds.arrow = new Audio('js/sfx/arrow.mp3');
        this.sounds.bullet = new Audio('js/sfx/bullet.mp3');
        this.sounds.snipe = new Audio('js/sfx/snipe.mp3');
    },
    play: function(name) {
        if(this.sounds[name]) {
            let sound = this.sounds[name].cloneNode();
            sound.volume = 0.3; // keep it a bit quieter so it's not deafening
            sound.play().catch(e => console.log('Audio play blocked:', e));
        }
    }
};

export { AudioManager };
"""

if "AudioManager" not in utils_js:
    utils_js = utils_js.replace("export { drawLightningBolt };", "export { drawLightningBolt };" + audio_manager)

with open(utils_path, 'w', encoding='utf-8') as f:
    f.write(utils_js)
