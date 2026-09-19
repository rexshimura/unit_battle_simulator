import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
scratch_unit_path = r'C:\Users\Rexshimura\.gemini\antigravity\brain\4736a5dc-9ebf-49ee-9d98-829c96f1208f\scratch\out\js\entities\Unit.js'

with open(scratch_unit_path, 'r', encoding='utf-8') as f:
    scratch_js = f.read()

start_str = "      const startX = this.x + Math.cos(angle) * (this.width / 2);"
end_str = "    if (this.type === 'cryomancer') {"

start_idx = scratch_js.find(start_str)
end_idx = scratch_js.find(end_str, start_idx)

missing_code = scratch_js[start_idx:end_idx]

# Now, we need to apply our modifications to the missing_code!
# 1. Minigunner barrel lines
# 2. Accelerator glowing core
# 3. Accelerator laser
# 4. Accelerator attack logic
# Wait, accelerator attack logic is already safe inside Unit.js!
# We just need to fix drawEquipment() to include minigunner and accelerator!

# Let's do it cleanly:
# 1. We replace the missing code's `if (this.type === 'sniper' && this.target && this.target.hp > 0)` block
old_sniper_laser = """      // Laser pointer for sniper
      if (this.type === 'sniper' && this.target && this.target.hp > 0) {
        uiElements.ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; // Red transparent laser
        uiElements.ctx.lineWidth = 1;
        uiElements.ctx.beginPath();
        uiElements.ctx.moveTo(endX, endY);
        uiElements.ctx.lineTo(this.target.x, this.target.y);
        uiElements.ctx.stroke();
      }"""

new_laser = """      // Laser pointer for sniper
      if (this.type === 'sniper' && this.target && this.target.hp > 0) {
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

missing_code = missing_code.replace(old_sniper_laser, new_laser)

# 2. Minigunner barrel lines + Accelerator glowing core + flat lineCap for minigun
old_barrel_draw = """      // Draw weapon barrel
      uiElements.ctx.strokeStyle = weaponColor;
      uiElements.ctx.lineWidth = nozzleWidth;
      uiElements.ctx.lineCap = 'round'; // make it look nicer
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(startX, startY);
      uiElements.ctx.lineTo(endX, endY);
      uiElements.ctx.stroke();"""

new_barrel_draw = """      // Draw weapon barrel
      uiElements.ctx.strokeStyle = weaponColor;
      uiElements.ctx.lineWidth = nozzleWidth;
      if (this.type !== 'minigunner') uiElements.ctx.lineCap = 'round'; // make it look nicer
      else uiElements.ctx.lineCap = 'butt'; // minigun flat end
      
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(startX, startY);
      uiElements.ctx.lineTo(endX, endY);
      uiElements.ctx.stroke();
      
      // Draw accelerator glowing core
      if (this.type === 'accelerator') {
          uiElements.ctx.save();
          const coreX = this.x + Math.cos(angle) * (this.width / 2 + nozzleLength/2);
          const coreY = this.y + Math.sin(angle) * (this.width / 2 + nozzleLength/2);
          uiElements.ctx.fillStyle = this.isCharging ? '#60a5fa' : '#4b5563'; // Glow blue when charging
          uiElements.ctx.beginPath();
          uiElements.ctx.arc(coreX, coreY, 3, 0, Math.PI * 2);
          uiElements.ctx.fill();
          uiElements.ctx.restore();
      }
      
      // Draw minigun barrel lines
      if (this.type === 'minigunner') {
          uiElements.ctx.save();
          uiElements.ctx.strokeStyle = '#111827'; // Dark lines
          uiElements.ctx.lineWidth = 1;
          
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

missing_code = missing_code.replace(old_barrel_draw, new_barrel_draw)

# 3. Eagle invisibility (already in current Unit.js, but wait, it's missing in scratch/out because it was before end of drawEquipment)
# Wait, eagle is drawn RIGHT AFTER weapon barrel!
old_eagle = """      // Draw eagle on Hunter's shoulder
      if (this.type === 'hunter') {"""
new_eagle = """      // Draw eagle on Hunter's shoulder
      if (this.type === 'hunter' && !this.eagleOut) {"""
missing_code = missing_code.replace(old_eagle, new_eagle)

# Now inject this missing code back into the current Unit.js
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# We need to find where to inject it.
# The current Unit.js has:
#       if (this.type === 'accelerator') {
#          const specs = UNIT_SPECS.accelerator;
#          if (this.isBursting) {

find_str = """      if (this.type === 'accelerator') {
      const specs = UNIT_SPECS.accelerator;"""

idx = unit_js.find(find_str)
if idx == -1:
    print('Could not find injection point in Unit.js')
else:
    # Everything BEFORE this find_str is the top of Unit.js up to `if (this.type === 'accelerator') {` in drawEquipment (but wait, in the current Unit.js it says `if (this.type === 'accelerator') { const specs ...` so it IS the attack logic!
    # Where does drawEquipment end in current Unit.js?
    # It ends at `weaponColor = '#6b7280'; // Accelerator futuristic gray }`
    find_str2 = "      if (this.type === 'accelerator') {\n         nozzleLength = 18;\n         nozzleWidth = 6; \n         weaponColor = '#6b7280'; // Accelerator futuristic gray\n      }"
    
    idx2 = unit_js.find(find_str2)
    if idx2 != -1:
        # The cut was EXACTLY after find_str2
        # So we want to replace everything from after find_str2 up to find_str with missing_code + find_str
        
        start_cut = idx2 + len(find_str2)
        end_cut = idx
        
        reconstructed = unit_js[:start_cut] + '\n' + missing_code + '\n' + unit_js[end_cut:]
        with open(unit_path, 'w', encoding='utf-8') as f:
            f.write(reconstructed)
        print('Successfully reconstructed Unit.js!')
    else:
        print('Could not find start point')
