import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"

unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# 1. Hide CD bar for Fortress
unit_js = unit_js.replace(
    "if (gameState.isBattleStarted && this.attackCooldown > 0) {",
    "if (gameState.isBattleStarted && this.attackCooldown > 0 && this.type !== 'fortress') {"
)

# 2. Add Fortress to segmented counter list
unit_js = unit_js.replace(
    "if ((this.type === 'duelist' || this.type === 'druid' || this.type === 'priest' || this.type === 'troll' || this.type === 'cryomancer' || this.type === 'alchemist') && gameState.isBattleStarted) {",
    "if ((this.type === 'duelist' || this.type === 'druid' || this.type === 'priest' || this.type === 'troll' || this.type === 'cryomancer' || this.type === 'alchemist' || this.type === 'fortress') && gameState.isBattleStarted) {"
)

# 3. Add the actual counter logic
fortress_counter = """        case 'fortress':
          counter = this.hitsTaken || 0;
          maxCount = 5;
          barColor = '#94a3b8'; // Slate metallic color
          break;
"""
unit_js = unit_js.replace("case 'troll':", fortress_counter + "        case 'troll':")

# 4. Lower the bash damage
unit_js = unit_js.replace("const damage = 20;", "const damage = 5;")

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
