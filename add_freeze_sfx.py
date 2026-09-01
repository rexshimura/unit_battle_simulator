import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
effects_path = os.path.join(base_dir, 'js', 'entities', 'Effects.js')

with open(effects_path, 'r', encoding='utf-8') as f:
    effects_js = f.read()

# 1. Update imports
effects_js = effects_js.replace("import { getDistance, drawLightningBolt } from '../utils.js';", "import { getDistance, drawLightningBolt, AudioManager } from '../utils.js';")

# 2. Add freeze sound
old_freeze = """          if (enemy.coldStacks >= this.specs.freezeTriggerCount) {
            enemy.coldStacks = 0;
            delete enemy.buffs.chilled;
            enemy.stunnedUntil = Date.now() + this.specs.freezeDuration;
            enemy.stunType = 'freeze';
            for (let i = 0; i < 25; i++) gameState.particles.push(new Particle(enemy.x, enemy.y, this.caster.team, true, 'snow'));
          }"""
new_freeze = """          if (enemy.coldStacks >= this.specs.freezeTriggerCount) {
            enemy.coldStacks = 0;
            delete enemy.buffs.chilled;
            enemy.stunnedUntil = Date.now() + this.specs.freezeDuration;
            enemy.stunType = 'freeze';
            AudioManager.play('freeze');
            for (let i = 0; i < 25; i++) gameState.particles.push(new Particle(enemy.x, enemy.y, this.caster.team, true, 'snow'));
          }"""
effects_js = effects_js.replace(old_freeze, new_freeze)

with open(effects_path, 'w', encoding='utf-8') as f:
    f.write(effects_js)
