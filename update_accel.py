import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
utils_path = os.path.join(base_dir, 'js', 'utils.js')
config_path = os.path.join(base_dir, 'js', 'config.js')

# 1. Update config.js
with open(config_path, 'r', encoding='utf-8') as f:
    config_js = f.read()

old_accel_spec = """'accelerator': {description: 'Charges up and fires 3 penetrating lasers', name: 'Accelerator', hp: 80, speed: 0.5, attackDamage: 12, attackRange: 800, attackCooldown: 3000, color: {team1: '#60a5fa', team2: '#f87171'}, burstTriggerCount: 3, burstDelay: 150, chargeTime: 1200}"""
new_accel_spec = """'accelerator': {description: 'Charges up, fires 3 lasers, then blasts a continuous beam', name: 'Accelerator', hp: 80, speed: 0.5, attackDamage: 12, attackRange: 800, attackCooldown: 3000, color: {team1: '#60a5fa', team2: '#f87171'}, burstTriggerCount: 3, burstDelay: 150, chargeTime: 1200, continuousBeamDuration: 3000, continuousBeamDamage: 1}"""
config_js = config_js.replace(old_accel_spec, new_accel_spec)

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config_js)


# 2. Update utils.js (AudioManager)
with open(utils_path, 'r', encoding='utf-8') as f:
    utils_js = f.read()

old_init = """        this.sounds.beam = new Audio('js/sfx/beam.mp3');
    },"""
new_init = """        this.sounds.beam = new Audio('js/sfx/beam.mp3');
        this.sounds.charged_beam = new Audio('js/sfx/charged_beam.mp3');
    },"""
utils_js = utils_js.replace(old_init, new_init)

old_vol = """if (name === 'eagle_release' || name === 'eagle_bite' || name === 'rifle' || name === 'beam') {"""
new_vol = """if (name === 'eagle_release' || name === 'eagle_bite' || name === 'rifle' || name === 'beam' || name === 'charged_beam') {"""
utils_js = utils_js.replace(old_vol, new_vol)

with open(utils_path, 'w', encoding='utf-8') as f:
    f.write(utils_js)


# 3. Update Unit.js attack block
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_accel_attack = """    if (this.type === 'accelerator') {
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
             this.lastAttackTime = now;
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
    }"""

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
    }"""

unit_js = unit_js.replace(old_accel_attack, new_accel_attack)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
