import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# Add the assassin attack logic back before ghoul in attack()
ghoul_attack = """} else if (this.type === 'ghoul') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {"""

assassin_attack = """} else if (this.type === 'assassin') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          let dmg = this.attackDamage;
          let isCrit = false;
          if (this.isInitialStealth) {
              dmg *= 2.5; // CRIT!
              isCrit = true;
              this.isInitialStealth = false;
              this.isShadow = false; // Break stealth
              this.shadowTime = 0;
          }
          this.target.takeDamage(dmg, this);
          if (isCrit) {
              gameState.animations.push(new FloatingText(`CRIT! ${Math.round(dmg)}`, this.target.x, this.target.y - 20, '#f97316'));
          }
          gameState.animations.push(new SlashAnimation(this, '71, 85, 105')); // Dark slash
          if (!this.isSlashing) {
            this.isSlashing = true;
            this.slashAnimProgress = this.slashAnimDuration;
          }
        }
} else if (this.type === 'ghoul') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {"""

if ghoul_attack in unit_js:
    unit_js = unit_js.replace(ghoul_attack, assassin_attack)
else:
    print("Could not find ghoul attack")

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
