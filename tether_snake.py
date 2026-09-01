import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"

# 1. Update snakeHp in config.js
config_path = os.path.join(base_dir, 'js', 'config.js')
with open(config_path, 'r', encoding='utf-8') as f:
    config = f.read()

config = config.replace('snakeHp: 400', 'snakeHp: 150')
with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config)

# 2. Add tether logic and draw circle in Unit.js
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# Add draw circle to drawEquipment
draw_equip_addition = """
    if (this.type === 'abyssal_summoner') {
      const tetherRange = 250;
      uiElements.ctx.save();
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(this.x, this.y, tetherRange, 0, Math.PI * 2);
      uiElements.ctx.strokeStyle = this.team === 1 ? 'rgba(96, 165, 250, 0.2)' : 'rgba(248, 113, 113, 0.2)';
      uiElements.ctx.lineWidth = 2;
      uiElements.ctx.setLineDash([10, 10]);
      uiElements.ctx.stroke();
      uiElements.ctx.restore();
    }
"""
unit_js = unit_js.replace("    if (this.type === 'musketeer' || this.type === 'sniper') {", draw_equip_addition + "    if (this.type === 'musketeer' || this.type === 'sniper') {")


# Bound snake to tether circle
old_snake_update_end = """    const radius = this.width / 2;
    this.x = Math.max(radius, Math.min(this.x, uiElements.canvas.width - radius));
    this.y = Math.max(radius, Math.min(this.y, uiElements.canvas.height - radius));
  }"""

new_snake_update_end = """    // Tether to summoner
    if (this.summoner) {
      const tetherRange = 250;
      const distToSummoner = getDistance(this, this.summoner);
      if (distToSummoner > tetherRange) {
        const pullAngle = Math.atan2(this.y - this.summoner.y, this.x - this.summoner.x);
        this.x = this.summoner.x + Math.cos(pullAngle) * tetherRange;
        this.y = this.summoner.y + Math.sin(pullAngle) * tetherRange;
      }
    }
    
    const radius = this.width / 2;
    this.x = Math.max(radius, Math.min(this.x, uiElements.canvas.width - radius));
    this.y = Math.max(radius, Math.min(this.y, uiElements.canvas.height - radius));
  }"""

unit_js = unit_js.replace(old_snake_update_end, new_snake_update_end)


with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
