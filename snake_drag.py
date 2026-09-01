import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"

# 1. Update snakeHp and snakeDamage in config.js
config_path = os.path.join(base_dir, 'js', 'config.js')
with open(config_path, 'r', encoding='utf-8') as f:
    config = f.read()

config = config.replace('snakeHp: 150', 'snakeHp: 100')
config = config.replace('snakeDamage: 30', 'snakeDamage: 5')

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config)

# 2. Update Unit.js (attackCooldown and dragging logic)
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# Change attack cooldown
unit_js = unit_js.replace('this.attackCooldown = 800; // Attack speed of the snake', 'this.attackCooldown = 250; // Attack speed of the snake')

# Update tether logic to drag the summoner
old_tether = """    // Tether to summoner
    if (this.summoner) {
      const tetherRange = 250;
      const distToSummoner = getDistance(this, this.summoner);
      if (distToSummoner > tetherRange) {
        const pullAngle = Math.atan2(this.y - this.summoner.y, this.x - this.summoner.x);
        this.x = this.summoner.x + Math.cos(pullAngle) * tetherRange;
        this.y = this.summoner.y + Math.sin(pullAngle) * tetherRange;
      }
    }"""

new_tether = """    // Tether to summoner (Drags the summoner)
    if (this.summoner) {
      const tetherRange = 250;
      const distToSummoner = getDistance(this, this.summoner);
      if (distToSummoner > tetherRange) {
        const pullAngle = Math.atan2(this.y - this.summoner.y, this.x - this.summoner.x);
        const pullDist = distToSummoner - tetherRange;
        
        // Pull the summoner
        this.summoner.x += Math.cos(pullAngle) * pullDist;
        this.summoner.y += Math.sin(pullAngle) * pullDist;
        
        // Keep summoner in bounds
        const sRadius = this.summoner.width / 2;
        this.summoner.x = Math.max(sRadius, Math.min(this.summoner.x, uiElements.canvas.width - sRadius));
        this.summoner.y = Math.max(sRadius, Math.min(this.summoner.y, uiElements.canvas.height - sRadius));
      }
    }"""

unit_js = unit_js.replace(old_tether, new_tether)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
