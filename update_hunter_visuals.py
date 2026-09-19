import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_draw = """    if (this.type === 'musketeer' || this.type === 'sniper' || this.type === 'hunter') {
      const nozzleLength = this.type === 'sniper' ? 18 : 12;
      const nozzleWidth = 5;
      const startX = this.x + Math.cos(angle) * (this.width / 2);
      const startY = this.y + Math.sin(angle) * (this.width / 2);
      const endX = this.x + Math.cos(angle) * (this.width / 2 + nozzleLength);
      const endY = this.y + Math.sin(angle) * (this.width / 2 + nozzleLength);
      
      // Draw weapon barrel
      uiElements.ctx.strokeStyle = '#9ca3af';
      uiElements.ctx.lineWidth = nozzleWidth;
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(startX, startY);
      uiElements.ctx.lineTo(endX, endY);
      uiElements.ctx.stroke();
      
      // Draw eagle on Hunter's shoulder
      if (this.type === 'hunter') {
          uiElements.ctx.save();
          // Calculate shoulder position (left side of the unit, slightly up)
          const shoulderX = this.x + Math.cos(angle - Math.PI / 2) * (this.width / 2 + 2);
          const shoulderY = this.y + Math.sin(angle - Math.PI / 2) * (this.width / 2 + 2);
          uiElements.ctx.translate(shoulderX, shoulderY);
          uiElements.ctx.rotate(angle);
          
          // Draw resting eagle body
          uiElements.ctx.fillStyle = '#8B4513';
          uiElements.ctx.beginPath();
          uiElements.ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
          uiElements.ctx.fill();
          
          // Draw eagle head (white)
          uiElements.ctx.fillStyle = '#FFFFFF';
          uiElements.ctx.beginPath();
          uiElements.ctx.arc(4, 0, 2.5, 0, Math.PI * 2);
          uiElements.ctx.fill();
          uiElements.ctx.restore();
      }
"""

new_draw = """    if (this.type === 'musketeer' || this.type === 'sniper' || this.type === 'hunter') {
      let nozzleLength = 12;
      let nozzleWidth = 5;
      let weaponColor = '#9ca3af';
      
      if (this.type === 'sniper') nozzleLength = 18;
      if (this.type === 'hunter') {
         nozzleLength = 15;
         nozzleWidth = 2.5; // Slimmer rifle
         weaponColor = '#4b5563'; // Darker, unique metallic
      }
      
      const startX = this.x + Math.cos(angle) * (this.width / 2);
      const startY = this.y + Math.sin(angle) * (this.width / 2);
      const endX = this.x + Math.cos(angle) * (this.width / 2 + nozzleLength);
      const endY = this.y + Math.sin(angle) * (this.width / 2 + nozzleLength);
      
      // Draw weapon barrel
      uiElements.ctx.strokeStyle = weaponColor;
      uiElements.ctx.lineWidth = nozzleWidth;
      uiElements.ctx.lineCap = 'round'; // make it look nicer
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(startX, startY);
      uiElements.ctx.lineTo(endX, endY);
      uiElements.ctx.stroke();
      
      // Draw eagle on Hunter's shoulder
      if (this.type === 'hunter') {
          uiElements.ctx.save();
          // Calculate shoulder position (left side of the unit, slightly up)
          const shoulderX = this.x + Math.cos(angle - Math.PI / 2) * (this.width / 2 + 2);
          const shoulderY = this.y + Math.sin(angle - Math.PI / 2) * (this.width / 2 + 2);
          uiElements.ctx.translate(shoulderX, shoulderY);
          uiElements.ctx.rotate(angle);
          
          // Draw resting eagle body (scaled up)
          uiElements.ctx.fillStyle = '#8B4513';
          uiElements.ctx.beginPath();
          uiElements.ctx.ellipse(0, 0, 7, 4.5, 0, 0, Math.PI * 2);
          uiElements.ctx.fill();
          
          // Draw eagle head (white)
          uiElements.ctx.fillStyle = '#FFFFFF';
          uiElements.ctx.beginPath();
          uiElements.ctx.arc(6, 0, 3.5, 0, Math.PI * 2);
          uiElements.ctx.fill();
          uiElements.ctx.restore();
      }
"""

unit_js = unit_js.replace(old_draw, new_draw)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
