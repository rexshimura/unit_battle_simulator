import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
utils_path = os.path.join(base_dir, 'js', 'utils.js')

# 1. Update Unit.js imports
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_import = "import { Projectile, IceShard, HealingOrb, Arrow, Fireball, PoisonPotion, AntiHealDart, EagleProjectile } from './Projectiles.js';"
new_import = "import { Projectile, IceShard, HealingOrb, Arrow, Fireball, PoisonPotion, AntiHealDart, EagleProjectile, PenetratingBeam } from './Projectiles.js';"
unit_js = unit_js.replace(old_import, new_import)

# 2. Update Unit.js beam sound
old_sound = "AudioManager.play('snipe'); // Laser shot SFX"
new_sound = "AudioManager.play('beam');"
unit_js = unit_js.replace(old_sound, new_sound)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)

# 3. Update utils.js AudioManager
with open(utils_path, 'r', encoding='utf-8') as f:
    utils_js = f.read()

old_init = "        this.sounds.rifle = new Audio('js/sfx/rifle.mp3');\n    },"
new_init = """        this.sounds.rifle = new Audio('js/sfx/rifle.mp3');
        this.sounds.beam = new Audio('js/sfx/beam.mp3');
    },"""
utils_js = utils_js.replace(old_init, new_init)

old_vol = "if (name === 'eagle_release' || name === 'eagle_bite' || name === 'rifle') {"
new_vol = "if (name === 'eagle_release' || name === 'eagle_bite' || name === 'rifle' || name === 'beam') {"
utils_js = utils_js.replace(old_vol, new_vol)

with open(utils_path, 'w', encoding='utf-8') as f:
    f.write(utils_js)
