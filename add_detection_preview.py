import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
game_path = os.path.join(base_dir, 'js', 'game.js')

with open(game_path, 'r', encoding='utf-8') as f:
    game_js = f.read()

old_draw_preview = """      if (range > 0) {
        uiElements.ctx.beginPath();
        uiElements.ctx.arc(unit.x, unit.y, range, 0, Math.PI * 2);
        uiElements.ctx.globalAlpha = 0.05;
        uiElements.ctx.fillStyle = color;
        uiElements.ctx.fill();
        uiElements.ctx.globalAlpha = 0.2;
        uiElements.ctx.strokeStyle = color;
        uiElements.ctx.lineWidth = 1;
        uiElements.ctx.setLineDash([5, 10]);
        uiElements.ctx.stroke();
        uiElements.ctx.setLineDash([]);
        uiElements.ctx.globalAlpha = 1.0;
      }"""

new_draw_preview = """      if (range > 0) {
        uiElements.ctx.beginPath();
        uiElements.ctx.arc(unit.x, unit.y, range, 0, Math.PI * 2);
        uiElements.ctx.globalAlpha = 0.05;
        uiElements.ctx.fillStyle = color;
        uiElements.ctx.fill();
        uiElements.ctx.globalAlpha = 0.2;
        uiElements.ctx.strokeStyle = color;
        uiElements.ctx.lineWidth = 1;
        uiElements.ctx.setLineDash([5, 10]);
        uiElements.ctx.stroke();
        uiElements.ctx.setLineDash([]);
        uiElements.ctx.globalAlpha = 1.0;
      }
      
      if (unit.type === 'assassin') {
        uiElements.ctx.beginPath();
        uiElements.ctx.arc(unit.x, unit.y, 200, 0, Math.PI * 2);
        uiElements.ctx.globalAlpha = 0.15;
        uiElements.ctx.strokeStyle = '#475569';
        uiElements.ctx.lineWidth = 2;
        uiElements.ctx.setLineDash([4, 8]);
        uiElements.ctx.stroke();
        uiElements.ctx.setLineDash([]);
        uiElements.ctx.globalAlpha = 1.0;
      }"""

game_js = game_js.replace(old_draw_preview, new_draw_preview)

with open(game_path, 'w', encoding='utf-8') as f:
    f.write(game_js)
