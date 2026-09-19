import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
scratch_unit_path = r'C:\Users\Rexshimura\.gemini\antigravity\brain\4736a5dc-9ebf-49ee-9d98-829c96f1208f\scratch\out\js\entities\Unit.js'

with open(scratch_unit_path, 'r', encoding='utf-8') as f:
    scratch_js = f.read()

# EXTRACT MISSING CODE FROM SCRATCH
start_str = "      const startX = this.x + Math.cos(angle) * (this.width / 2);"
start_idx = scratch_js.find(start_str)
cryo_idxs = [m.start() for m in re.finditer(r"    if \(this\.type === 'cryomancer'\) \{", scratch_js)]
end_idx = cryo_idxs[-1]
missing_code = scratch_js[start_idx:end_idx]

# NOW READ CURRENT UNIT.JS
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# FIND THE REGION TO REPLACE IN CURRENT UNIT.JS
find_str1 = """      if (this.type === 'minigunner') {
         nozzleLength = 16;
         nozzleWidth = 8; // THICK barrel for minigun
         weaponColor = '#374151'; 
      }\n"""
idx1 = unit_js.find(find_str1)
cut_start = idx1 + len(find_str1)

cryo_idxs_current = [m.start() for m in re.finditer(r"    if \(this\.type === 'cryomancer'\) \{", unit_js)]
cut_end = cryo_idxs_current[-1] # The cryomancer in attack()

# NOW APPLY MODIFICATIONS TO MISSING_CODE
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

old_eagle = """      // Draw eagle on Hunter's shoulder
      if (this.type === 'hunter') {"""
new_eagle = """      // Draw eagle on Hunter's shoulder
      if (this.type === 'hunter' && !this.eagleOut) {"""
missing_code = missing_code.replace(old_eagle, new_eagle)

# PREPEND ACCELERATOR NOZZLE TO MISSING CODE
accel_nozzle = """      if (this.type === 'accelerator') {
         nozzleLength = 18;
         nozzleWidth = 6; 
         weaponColor = '#6b7280'; // Accelerator futuristic gray
      }\n"""

missing_code = accel_nozzle + missing_code

# APPEND ACCELERATOR ATTACK LOGIC TO MISSING CODE
# Because the regex cut included the place where Accelerator attack logic goes!
# Actually, where does accelerator attack logic go? It goes right before cryomancer in attack()!
# Since cut_end is exactly at cryomancer in attack(), we append accelerator attack logic to missing_code!
accel_attack = """    if (this.type === 'accelerator') {
      const specs = UNIT_SPECS.accelerator;
      if (this.isBursting) {
         if (now - this.lastBurstShotTime > specs.burstDelay / gameState.gameSpeed) {
           this.lastBurstShotTime = now;
           this.burstsLeft--;
           if (this.target) {
             AudioManager.play('beam'); 
             gameState.projectiles.push(new PenetratingBeam(this, this.target, this.attackDamage, this.team));
           }
           if (this.burstsLeft <= 0) {
             this.isBursting = false;
             // Enter Phase 2: Continuous Beam
             this.isContinuous = true;
             this.continuousStartTime = now;
             this.lastContinuousTickTime = 0;
             AudioManager.play('charged_beam'); // Play the long SFX
           }
         }
         return;
      } else if (this.isContinuous) {
         if (now - this.continuousStartTime > specs.continuousBeamDuration / gameState.gameSpeed) {
             this.isContinuous = false;
             this.lastAttackTime = now; // Go on cooldown
         } else {
             // Tick continuous damage laser
             if (now - this.lastContinuousTickTime > 100 / gameState.gameSpeed) { // Tick every 100ms
                 this.lastContinuousTickTime = now;
                 if (this.target) {
                     const tickBeam = new PenetratingBeam(this, this.target, specs.continuousBeamDamage, this.team);
                     tickBeam.radius = 4; // Slightly thinner visually
                     gameState.projectiles.push(tickBeam);
                 }
             }
         }
         return;
      } else if (this.isCharging) {
         if (now - this.chargeStartTime > specs.chargeTime / gameState.gameSpeed) {
             this.isCharging = false;
             this.isBursting = true;
             this.burstsLeft = specs.burstTriggerCount;
             this.lastBurstShotTime = 0; // Trigger instantly
         }
         return;
      }
    }\n"""

missing_code = missing_code + accel_attack

# FINALLY RECONSTRUCT
reconstructed = unit_js[:cut_start] + missing_code + unit_js[cut_end:]
with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(reconstructed)
print('Unit.js completely reconstructed!')
