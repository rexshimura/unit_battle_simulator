import os
import re

BASE_DIR = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js"

def fix_unit_js():
    unit_path = os.path.join(BASE_DIR, 'entities', 'Unit.js')
    with open(unit_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove the bad force_wall attack block from drawEquipment
    bad_attack_in_draw = """    } else if (this.type === 'force_wall') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          AudioManager.play('push');
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new ShieldBashAnimation(this.x, this.y, 40, this.attackDamage, 30, this.team, gameState.units, this));
          if (!this.isSlashing) {
            this.isSlashing = true;
            this.slashAnimProgress = this.slashAnimDuration;
          }
        }
} else if (this.type === 'ghoul') {"""
    content = content.replace(bad_attack_in_draw, "} else if (this.type === 'ghoul') {")

    # 2. Remove the bad force_wall draw block from attack
    bad_draw_in_attack = """    } else if (this.type === 'force_wall') {
      const shieldWidth = 8;
      const shieldHeight = 40;
      let shieldOffset = 8;
      if (this.isSlashing) {
         const progress = this.slashAnimProgress / this.slashAnimDuration;
         shieldOffset += Math.sin(progress * Math.PI) * 15;
      }
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      uiElements.ctx.fillStyle = this.isReflecting ? 'rgba(236, 72, 153, 0.7)' : 'rgba(56, 189, 248, 0.5)';
      uiElements.ctx.fillRect(this.width / 2 + shieldOffset, -shieldHeight / 2, shieldWidth, shieldHeight);
      uiElements.ctx.lineWidth = 2;
      uiElements.ctx.strokeStyle = this.isReflecting ? 'rgba(244, 114, 182, 0.9)' : 'rgba(125, 211, 252, 0.8)';
      uiElements.ctx.strokeRect(this.width / 2 + shieldOffset, -shieldHeight / 2, shieldWidth, shieldHeight);
      uiElements.ctx.restore();
    } else if (this.type === 'fortress') {"""
    content = content.replace(bad_draw_in_attack, "    } else if (this.type === 'fortress') {")

    # 3. Change 8 hits to 4 hits in takeDamage
    content = content.replace("this.hitsTaken >= 8", "this.hitsTaken >= 4")
    
    # 4. Change 8 hits to 4 hits in Health Bar visual
    content = content.replace("maxCount = 8;", "maxCount = 4;")

    with open(unit_path, 'w', encoding='utf-8') as f:
        f.write(content)


def fix_config_js():
    config_path = os.path.join(BASE_DIR, 'config.js')
    with open(config_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Change description from 8 hits to 4 hits
    content = content.replace("after 8 hits", "after 4 hits")

    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(content)


def fix_projectiles_js():
    proj_path = os.path.join(BASE_DIR, 'entities', 'Projectiles.js')
    with open(proj_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix generic projectile deflection to deflect back
    # Replace scattered with deflected back
    content = content.replace("this.angle += (Math.random() - 0.5) * Math.PI; // scattered",
                              "this.angle += Math.PI + (Math.random() - 0.5); // deflected back")

    with open(proj_path, 'w', encoding='utf-8') as f:
        f.write(content)


if __name__ == '__main__':
    fix_unit_js()
    fix_config_js()
    fix_projectiles_js()
    print("Fixes applied successfully.")
