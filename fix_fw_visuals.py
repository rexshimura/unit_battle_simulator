import os
import re

BASE_DIR = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js"

def fix_force_wall():
    # 1. Update config.js
    config_path = os.path.join(BASE_DIR, 'config.js')
    with open(config_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Change size to 20 (like swordsman)
    content = content.replace("color: {team1: '#60a5fa', team2: '#f87171'}, size: 28}", "color: {team1: '#60a5fa', team2: '#f87171'}, size: 20}")
    
    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(content)


    # 2. Add drawEquipment to Unit.js
    unit_path = os.path.join(BASE_DIR, 'entities', 'Unit.js')
    with open(unit_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the right place to insert in drawEquipment. 
    # We will insert it before "    } else if (this.type === 'fortress') {" inside drawEquipment.
    # To make sure it's drawEquipment, we can find the assassin one which is nearby, or just use re.sub with count=1.
    
    draw_logic = """    } else if (this.type === 'force_wall') {
      const shieldWidth = 10;
      const shieldHeight = 60; // Wide shield
      let shieldOffset = 8;
      if (this.isSlashing) {
         const progress = this.slashAnimProgress / this.slashAnimDuration;
         shieldOffset += Math.sin(progress * Math.PI) * 15;
      }
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      // Holographic glow effect
      uiElements.ctx.shadowBlur = 10;
      uiElements.ctx.shadowColor = this.isReflecting ? 'rgba(244, 114, 182, 0.8)' : 'rgba(56, 189, 248, 0.8)';
      uiElements.ctx.fillStyle = this.isReflecting ? 'rgba(236, 72, 153, 0.5)' : 'rgba(56, 189, 248, 0.4)';
      uiElements.ctx.fillRect(this.width / 2 + shieldOffset, -shieldHeight / 2, shieldWidth, shieldHeight);
      uiElements.ctx.lineWidth = 3;
      uiElements.ctx.strokeStyle = this.isReflecting ? 'rgba(244, 114, 182, 0.9)' : 'rgba(125, 211, 252, 0.8)';
      uiElements.ctx.strokeRect(this.width / 2 + shieldOffset, -shieldHeight / 2, shieldWidth, shieldHeight);
      uiElements.ctx.restore();
"""

    # We will replace the first occurrence of fortress in Unit.js, which is in drawEquipment.
    # Wait, the first occurrence of "    } else if (this.type === 'fortress') {" is indeed in drawEquipment.
    content = content.replace("    } else if (this.type === 'fortress') {", draw_logic + "    } else if (this.type === 'fortress') {", 1)

    with open(unit_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    fix_force_wall()
    print("Force wall visuals fixed.")
