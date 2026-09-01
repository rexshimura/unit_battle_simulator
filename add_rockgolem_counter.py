import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_if = "if ((this.type === 'duelist' || this.type === 'druid' || this.type === 'priest' || this.type === 'troll' || this.type === 'cryomancer' || this.type === 'alchemist' || this.type === 'fortress' || this.type === 'flamecaller') && gameState.isBattleStarted) {"
new_if = "if ((this.type === 'rockgolem' || this.type === 'duelist' || this.type === 'druid' || this.type === 'priest' || this.type === 'troll' || this.type === 'cryomancer' || this.type === 'alchemist' || this.type === 'fortress' || this.type === 'flamecaller') && gameState.isBattleStarted) {"
unit_js = unit_js.replace(old_if, new_if)

old_switch = """        case 'alchemist':
          specs = UNIT_SPECS.alchemist;
          counter = this.basicAttackCounter;
          maxCount = specs.specialTriggerCount;
          barColor = '#bef264';
          break;
      }"""
new_switch = """        case 'alchemist':
          specs = UNIT_SPECS.alchemist;
          counter = this.basicAttackCounter;
          maxCount = specs.specialTriggerCount;
          barColor = '#bef264';
          break;
        case 'rockgolem':
          counter = this.basicAttackCounter || 0;
          maxCount = 3;
          barColor = '#eab308';
          break;
      }"""
unit_js = unit_js.replace(old_switch, new_switch)

old_multiheal = """      if (this.isMultiHealActive) {
        const progress = (activeEndTime - Date.now()) / activeDuration;
        uiElements.ctx.fillStyle = activeColor;
        uiElements.ctx.fillRect(healthBarX, specialBarY, barWidth * progress, specialBarHeight);
      } else if (counter > 0) {"""
new_multiheal = """      if (this.isMultiHealActive) {
        const progress = (activeEndTime - Date.now()) / activeDuration;
        uiElements.ctx.fillStyle = activeColor;
        uiElements.ctx.fillRect(healthBarX, specialBarY, barWidth * progress, specialBarHeight);
      } else if (this.type === 'rockgolem' && this.isCharging) {
        const progress = Math.max(0, this.chargeDuration / 45);
        uiElements.ctx.fillStyle = '#fde047'; // Bright yellow
        uiElements.ctx.fillRect(healthBarX, specialBarY, barWidth * progress, specialBarHeight);
      } else if (counter > 0) {"""
unit_js = unit_js.replace(old_multiheal, new_multiheal)


with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
