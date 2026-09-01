import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# 1. Cryomancer
old_cryomancer = """      if (this.type === 'cryomancer') {
        const specs = UNIT_SPECS.cryomancer;
        this.basicAttackCounter++;
        if (this.basicAttackCounter >= specs.specialTriggerCount) {
          this.basicAttackCounter = 0;
          gameState.animations.push(new ShiverWaveAnimation(this, gameState.units, specs.waveDamage, specs.freezeStacksApplied));
        } else {
          if (this.target) {
            const spreadAngles = [-0.4, -0.2, 0, 0.2, 0.4];"""
new_cryomancer = """      if (this.type === 'cryomancer') {
        const specs = UNIT_SPECS.cryomancer;
        this.basicAttackCounter++;
        if (this.basicAttackCounter >= specs.specialTriggerCount) {
          this.basicAttackCounter = 0;
          AudioManager.play('frostwave');
          gameState.animations.push(new ShiverWaveAnimation(this, gameState.units, specs.waveDamage, specs.freezeStacksApplied));
        } else {
          if (this.target) {
            AudioManager.play('ice_shards');
            const spreadAngles = [-0.4, -0.2, 0, 0.2, 0.4];"""
unit_js = unit_js.replace(old_cryomancer, new_cryomancer)

# 2. Spearman
old_spearman = """      } else if (this.type === 'spearman') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new ThrustAnimation(this, this.target));"""
new_spearman = """      } else if (this.type === 'spearman') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          AudioManager.play('thrust');
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new ThrustAnimation(this, this.target));"""
unit_js = unit_js.replace(old_spearman, new_spearman)

# 3. Fortress
old_fortress = """        if (!this.isSlashing) {
          this.isSlashing = true;
          this.slashAnimProgress = this.slashAnimDuration;
        }

        gameState.animations.push(new ShieldBashAnimation(this.x, this.y, radius, damage, force, this.team, gameState.units, this));
      }
    }"""
new_fortress = """        if (!this.isSlashing) {
          this.isSlashing = true;
          this.slashAnimProgress = this.slashAnimDuration;
        }
        
        AudioManager.play('push');
        gameState.animations.push(new ShieldBashAnimation(this.x, this.y, radius, damage, force, this.team, gameState.units, this));
      }
    }"""
unit_js = unit_js.replace(old_fortress, new_fortress)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
