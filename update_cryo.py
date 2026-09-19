import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# 1. Remove the old cryomancer logic
old_cryo = """      if (this.type === 'cryomancer') {
        const specs = UNIT_SPECS.cryomancer;
        this.basicAttackCounter++;
        if (this.basicAttackCounter >= specs.specialTriggerCount) {
          this.basicAttackCounter = 0;
          AudioManager.play('frostwave');
          gameState.animations.push(new ShiverWaveAnimation(this, gameState.units, specs.waveDamage, specs.freezeStacksApplied));
        } else {
          if (this.target) {
            AudioManager.play('ice_shards');
            const spreadAngles = [-0.4, -0.2, 0, 0.2, 0.4];
            for (let i = 0; i < 5; i++) {
               gameState.projectiles.push(new IceShard(this, this.target, spreadAngles[i]));
            }
          }
        }
        return;
      }"""

unit_js = unit_js.replace(old_cryo, "")

# 2. Insert new cryomancer logic before the general attack cooldown block
insertion_point = "if (now - this.lastAttackTime > currentCooldown / gameState.gameSpeed) {"

new_cryo = """    if (this.type === 'cryomancer') {
      const specs = UNIT_SPECS.cryomancer;
      if (this.isBursting) {
        if (now - this.lastBurstSlashTime > 60 / gameState.gameSpeed) { // shoot fast (60ms between shots)
          this.lastBurstSlashTime = now;
          this.burstsLeft--;
          if (this.target) {
            AudioManager.play('ice_shards');
            const spreadAngles = [-0.4, -0.2, 0, 0.2, 0.4];
            // burstsLeft goes from 4 down to 0
            const angle = spreadAngles[4 - this.burstsLeft]; 
            gameState.projectiles.push(new IceShard(this, this.target, angle));
          }
          if (this.burstsLeft <= 0) {
            this.isBursting = false;
            this.lastAttackTime = now;
          }
        }
      } else if (now - this.lastAttackTime > currentCooldown / gameState.gameSpeed) {
        this.basicAttackCounter++;
        if (this.basicAttackCounter >= specs.specialTriggerCount) {
          this.basicAttackCounter = 0;
          this.lastAttackTime = now;
          AudioManager.play('frostwave');
          gameState.animations.push(new ShiverWaveAnimation(this, gameState.units, specs.waveDamage, specs.freezeStacksApplied));
        } else {
          this.isBursting = true;
          this.burstsLeft = 5;
          this.lastBurstSlashTime = now - 60 / gameState.gameSpeed; // trigger first shot instantly
        }
      }
      return;
    }
    """

# We only want to replace the FIRST occurrence in the attack() function, which is the main block.
# Actually, `insertion_point` might occur multiple times (e.g. duelist).
# I will use a precise replace.
precise_insertion = """    }
    if (now - this.lastAttackTime > currentCooldown / gameState.gameSpeed) {
      this.lastAttackTime = now;
      if (this.type === 'abyssal_summoner') {"""

new_precise = """    }
""" + new_cryo + """if (now - this.lastAttackTime > currentCooldown / gameState.gameSpeed) {
      this.lastAttackTime = now;
      if (this.type === 'abyssal_summoner') {"""

unit_js = unit_js.replace(precise_insertion, new_precise)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
