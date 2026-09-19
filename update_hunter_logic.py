import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# 1. Add hunter attack logic
# Let's insert it after sniper logic.
old_sniper_attack = """      if (this.type === 'sniper') {
        if (this.target) {
          AudioManager.play('snipe');
          gameState.projectiles.push(new Bullet(this, this.target));
        }
        return;
      }"""

new_hunter_attack = old_sniper_attack + """
      if (this.type === 'hunter') {
        const specs = UNIT_SPECS.hunter;
        if (this.target) {
          AudioManager.play('rifle');
          gameState.projectiles.push(new Bullet(this, this.target));
          
          if (this.basicAttackCounter === undefined) this.basicAttackCounter = 0;
          this.basicAttackCounter++;
          
          if (this.basicAttackCounter >= specs.eagleTriggerCount) {
             this.basicAttackCounter = 0;
             AudioManager.play('eagle_release');
             gameState.projectiles.push(new EagleProjectile(this, this.target, specs.eagleDamage));
          }
        }
        return;
      }"""

unit_js = unit_js.replace(old_sniper_attack, new_hunter_attack)

# 2. Add UI for hunter eagle tracker
old_ui_if = "|| this.type === 'wizard') && gameState.isBattleStarted) {"
new_ui_if = "|| this.type === 'wizard' || this.type === 'hunter') && gameState.isBattleStarted) {"
unit_js = unit_js.replace(old_ui_if, new_ui_if)

old_ui_switch = """        case 'wizard':
          counter = this.basicAttackCounter || 0;
          maxCount = 4;
          barColor = '#c084fc';
          break;"""

new_ui_switch = """        case 'wizard':
          counter = this.basicAttackCounter || 0;
          maxCount = 4;
          barColor = '#c084fc';
          break;
        case 'hunter':
          specs = UNIT_SPECS.hunter;
          counter = this.basicAttackCounter || 0;
          maxCount = specs.eagleTriggerCount;
          barColor = '#8B4513'; // Brown for eagle
          break;"""

unit_js = unit_js.replace(old_ui_switch, new_ui_switch)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
