import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
proj_path = os.path.join(base_dir, 'js', 'entities', 'Projectiles.js')

with open(proj_path, 'r', encoding='utf-8') as f:
    proj_js = f.read()

old_draw = """  draw() {
    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    uiElements.ctx.rotate(this.angle); // use actual movement angle
    
    // Draw an eagle-like shape
    uiElements.ctx.fillStyle = '#8B4513'; 
    uiElements.ctx.beginPath();
    uiElements.ctx.moveTo(10, 0); // Beak
    uiElements.ctx.lineTo(-6, 8); // Right Wing
    uiElements.ctx.lineTo(-3, 0); // Tail
    uiElements.ctx.lineTo(-6, -8); // Left Wing
    uiElements.ctx.closePath();
    uiElements.ctx.fill();
    
    // Head accent
    uiElements.ctx.fillStyle = '#FFFFFF';
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(4, 0, 3, 0, Math.PI * 2);
    uiElements.ctx.fill();
    
    uiElements.ctx.restore();
  }"""

new_draw = """  draw() {
    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    uiElements.ctx.rotate(this.angle); // use actual movement angle
    
    // Draw an eagle-like shape (scaled up by 1.6x for visibility)
    uiElements.ctx.fillStyle = '#8B4513'; 
    uiElements.ctx.beginPath();
    uiElements.ctx.moveTo(16, 0); // Beak
    uiElements.ctx.lineTo(-10, 13); // Right Wing
    uiElements.ctx.lineTo(-5, 0); // Tail
    uiElements.ctx.lineTo(-10, -13); // Left Wing
    uiElements.ctx.closePath();
    uiElements.ctx.fill();
    
    // Head accent
    uiElements.ctx.fillStyle = '#FFFFFF';
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(6, 0, 4.5, 0, Math.PI * 2);
    uiElements.ctx.fill();
    
    uiElements.ctx.restore();
  }"""

proj_js = proj_js.replace(old_draw, new_draw)

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(proj_js)
