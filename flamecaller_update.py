import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"

# 1. Update Flamecaller CD in config.js
config_path = os.path.join(base_dir, 'js', 'config.js')
with open(config_path, 'r', encoding='utf-8') as f:
    config = f.read()

config = config.replace('attackCooldown: 5500', 'attackCooldown: 2200')

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config)

# 2. Update Unit.js attack logic and health bar segmented counter
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()


# Add to switch statement in drawHealthBar()
old_troll_case = """        case 'troll':
          specs = UNIT_SPECS.troll;
          counter = this.basicAttackCounter;
          maxCount = specs.smashTriggerCount;
          barColor = '#f97316';
          break;"""
new_troll_case = """        case 'troll':
          specs = UNIT_SPECS.troll;
          counter = this.basicAttackCounter;
          maxCount = specs.smashTriggerCount;
          barColor = '#f97316';
          break;
        case 'flamecaller':
          counter = this.basicAttackCounter || 0;
          maxCount = 3;
          barColor = '#fb923c';
          break;"""
unit_js = unit_js.replace(old_troll_case, new_troll_case)

# Update if check for health bar
old_if_check = "if ((this.type === 'duelist' || this.type === 'druid' || this.type === 'priest' || this.type === 'troll' || this.type === 'cryomancer' || this.type === 'alchemist' || this.type === 'fortress') && gameState.isBattleStarted) {"
new_if_check = "if ((this.type === 'duelist' || this.type === 'druid' || this.type === 'priest' || this.type === 'troll' || this.type === 'cryomancer' || this.type === 'alchemist' || this.type === 'fortress' || this.type === 'flamecaller') && gameState.isBattleStarted) {"
unit_js = unit_js.replace(old_if_check, new_if_check)


# Update attack logic
old_attack_flamecaller = """      } else if (this.type === 'flamecaller') {
        gameState.projectiles.push(new Fireball(this, this.target));"""

new_attack_flamecaller = """      } else if (this.type === 'flamecaller') {
        if (this.basicAttackCounter === undefined) this.basicAttackCounter = 0;
        this.basicAttackCounter++;
        if (this.basicAttackCounter >= 3) {
          this.basicAttackCounter = 0;
          // Shoot 2 small fireballs instead
          gameState.projectiles.push(new Fireball(this, this.target, true, -0.2));
          gameState.projectiles.push(new Fireball(this, this.target, true, 0.2));
        } else {
          gameState.projectiles.push(new Fireball(this, this.target));
        }"""

unit_js = unit_js.replace(old_attack_flamecaller, new_attack_flamecaller)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
