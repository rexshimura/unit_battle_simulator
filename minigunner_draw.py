import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_draw = """    if (this.type === 'musketeer' || this.type === 'sniper' || this.type === 'hunter') {
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
      uiElements.ctx.stroke();"""

new_draw = """    if (this.type === 'musketeer' || this.type === 'sniper' || this.type === 'hunter' || this.type === 'minigunner') {
      let nozzleLength = 12;
      let nozzleWidth = 5;
      let weaponColor = '#9ca3af';
      
      if (this.type === 'sniper') nozzleLength = 18;
      if (this.type === 'hunter') {
         nozzleLength = 15;
         nozzleWidth = 2.5; // Slimmer rifle
         weaponColor = '#4b5563'; // Darker, unique metallic
      }
      if (this.type === 'minigunner') {
         nozzleLength = 16;
         nozzleWidth = 8; // THICK barrel for minigun
         weaponColor = '#374151'; 
      }
      
      const startX = this.x + Math.cos(angle) * (this.width / 2);
      const startY = this.y + Math.sin(angle) * (this.width / 2);
      const endX = this.x + Math.cos(angle) * (this.width / 2 + nozzleLength);
      const endY = this.y + Math.sin(angle) * (this.width / 2 + nozzleLength);
      
      // Draw weapon barrel
      uiElements.ctx.strokeStyle = weaponColor;
      uiElements.ctx.lineWidth = nozzleWidth;
      if (this.type !== 'minigunner') uiElements.ctx.lineCap = 'round'; // make it look nicer
      else uiElements.ctx.lineCap = 'butt'; // minigun flat end
      
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(startX, startY);
      uiElements.ctx.lineTo(endX, endY);
      uiElements.ctx.stroke();
      
      // Draw minigun barrel lines
      if (this.type === 'minigunner') {
          uiElements.ctx.save();
          uiElements.ctx.strokeStyle = '#111827'; // Dark lines
          uiElements.ctx.lineWidth = 1;
          
          // Draw three lines along the thick barrel to simulate multiple rotating barrels
          for (let offset of [-2, 0, 2]) {
              const dx = Math.cos(angle + Math.PI/2) * offset;
              const dy = Math.sin(angle + Math.PI/2) * offset;
              uiElements.ctx.beginPath();
              uiElements.ctx.moveTo(startX + dx, startY + dy);
              uiElements.ctx.lineTo(endX + dx, endY + dy);
              uiElements.ctx.stroke();
          }
          uiElements.ctx.restore();
      }"""

unit_js = unit_js.replace(old_draw, new_draw)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
