import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

pattern = re.compile(
    r"""    if \(this\.type === 'accelerator'\) \{.*?(?=    if \(this\.type === 'cryomancer'\) \{)""",
    re.DOTALL
)

new_accel_attack = """    if (this.type === 'accelerator') {
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
    }
"""

unit_js = pattern.sub(new_accel_attack, unit_js)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
