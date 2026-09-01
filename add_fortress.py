import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"

# 1. Update config.js
config_path = os.path.join(base_dir, 'js', 'config.js')
with open(config_path, 'r', encoding='utf-8') as f:
    config = f.read()

fortress_spec = "'fortress': {description: 'Giant shield, blocks hits', name: 'Fortress', tags: ['Tank', 'Melee'], hp: 600, speed: 0.25, attackDamage: 12, attackRange: 45, attackCooldown: 2200, color: {team1: '#60a5fa', team2: '#f87171'}, size: 26},"
config = config.replace("'guardian': {", fortress_spec + "\n  'guardian': {")

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config)

# 2. Update index.html
html_path = os.path.join(base_dir, 'index.html')
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

fortress_html = """
                    <button data-unit-type="fortress" class="unit-btn w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center gap-3">
                        <canvas width="40" height="40" class="unit-preview-canvas" data-unit-type="fortress"></canvas>
                        <div>
                            <p class="text-sm font-bold text-gray-200">Fortress</p>
                        </div>
                    </button>"""

guardian_html = '<button data-unit-type="guardian"'
html = html.replace(guardian_html, fortress_html.strip() + '\n                    ' + guardian_html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

# 3. Update Unit.js
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

fortress_draw = """
    } else if (this.type === 'fortress') {
      const shieldWidth = 12;
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      
      let thrustOffset = 0;
      if (this.isSlashing) {
        const progress = this.slashAnimProgress / this.slashAnimDuration;
        // thrust forward and back
        thrustOffset = Math.sin(progress * Math.PI) * 12;
      }
      
      uiElements.ctx.translate(thrustOffset, 0);

      // Draw a massive curved shield
      uiElements.ctx.strokeStyle = '#334155'; // darker slate
      uiElements.ctx.lineWidth = shieldWidth;
      uiElements.ctx.lineCap = 'round';
      
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(0, 0, this.width / 2 + 6, -Math.PI / 2.2, Math.PI / 2.2, false);
      uiElements.ctx.stroke();

      // Add a metallic highlight
      uiElements.ctx.strokeStyle = '#94a3b8';
      uiElements.ctx.lineWidth = 4;
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(0, 0, this.width / 2 + 6, -Math.PI / 2.2, Math.PI / 2.2, false);
      uiElements.ctx.stroke();
      
      uiElements.ctx.restore();
"""

guardian_draw = "} else if (this.type === 'guardian') {"
unit_js = unit_js.replace(guardian_draw, fortress_draw.strip() + ' ' + guardian_draw)

# also fix attack animation logic to set isSlashing
attack_logic = """
      if (this.type === 'swordsman' || this.type === 'guardian' || this.type === 'sledgehammer' || this.type === 'fortress' || this.type === 'troll') {
"""
old_attack_logic = "if (this.type === 'swordsman' || this.type === 'guardian' || this.type === 'sledgehammer' || this.type === 'troll') {"
unit_js = unit_js.replace(old_attack_logic, attack_logic.strip())

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
