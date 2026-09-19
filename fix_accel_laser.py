import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_sniper_laser = """      if (this.type === 'sniper' && this.target && this.target.hp > 0) {
        uiElements.ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; // Red transparent laser
        uiElements.ctx.lineWidth = 1;
        uiElements.ctx.beginPath();
        uiElements.ctx.moveTo(endX, endY);
        uiElements.ctx.lineTo(this.target.x, this.target.y);
        uiElements.ctx.stroke();
      }"""

new_laser = """      if (this.type === 'sniper' && this.target && this.target.hp > 0) {
        uiElements.ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; // Red transparent laser
        uiElements.ctx.lineWidth = 1;
        uiElements.ctx.beginPath();
        uiElements.ctx.moveTo(endX, endY);
        uiElements.ctx.lineTo(this.target.x, this.target.y);
        uiElements.ctx.stroke();
      }
      
      if (this.type === 'accelerator' && this.isCharging && this.target) {
        const specs = UNIT_SPECS.accelerator;
        const chargeProgress = Math.min(1, (Date.now() - this.chargeStartTime) / (specs.chargeTime / gameState.gameSpeed));
        uiElements.ctx.strokeStyle = `rgba(156, 163, 175, ${chargeProgress})`; // Gray line 0 to 1 opacity
        uiElements.ctx.lineWidth = 2;
        uiElements.ctx.beginPath();
        uiElements.ctx.moveTo(endX, endY);
        uiElements.ctx.lineTo(this.target.x, this.target.y);
        uiElements.ctx.stroke();
      }"""

unit_js = unit_js.replace(old_sniper_laser, new_laser)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
