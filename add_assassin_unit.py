import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# 1. Constructor
if "this.isShadow = false;" not in unit_js:
    unit_js = unit_js.replace("this.reviveTime = 0;", "this.reviveTime = 0;\n    this.isShadow = false;\n    this.shadowTime = 0;")

# 2. findTarget
find_target_old = """  findTarget(enemies) {
    if (enemies.length === 0) {
      this.target = null;
      return;
    }
    let closestEnemy = null;
    let minDistance = Infinity;
    enemies.forEach(e => {
      if (e.isReviving) return;
      const d = getDistance(this, e);
      if (d < minDistance) {
        minDistance = d;
        closestEnemy = e;
      }
    });
    this.target = closestEnemy;
  }"""
find_target_new = """  findTarget(enemies) {
    if (enemies.length === 0) {
      this.target = null;
      return;
    }
    let bestTarget = null;
    if (this.type === 'assassin') {
      let bestScore = -Infinity;
      enemies.forEach(e => {
        if (e.isReviving || e.isShadow) return;
        const d = getDistance(this, e);
        // Heavily prefer low HP targets. And a little bit of distance (to go for backliners).
        const score = -e.hp;
        if (score > bestScore) {
          bestScore = score;
          bestTarget = e;
        }
      });
    } else {
      let minDistance = Infinity;
      enemies.forEach(e => {
        if (e.isReviving || e.isShadow) return;
        const d = getDistance(this, e);
        if (d < minDistance) {
          minDistance = d;
          bestTarget = e;
        }
      });
    }
    this.target = bestTarget;
  }"""
unit_js = unit_js.replace(find_target_old, find_target_new)

# 3. update (drop shadow target, handle shadow timer)
update_old = """  update(friendlies, enemies) {
    if (this.target && this.target.isReviving) this.target = null;"""
update_new = """  update(friendlies, enemies) {
    if (this.target && (this.target.isReviving || this.target.isShadow)) this.target = null;
    
    if (this.isShadow && Date.now() > this.shadowTime) {
      this.isShadow = false;
    }"""
unit_js = unit_js.replace(update_old, update_new)

# 4. update attack logic (add assassin)
attack_old = """} else if (this.type === 'ghoul') {"""
attack_new = """} else if (this.type === 'assassin') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new SlashAnimation(this, '71, 85, 105')); // Dark slash
          if (!this.isSlashing) {
            this.isSlashing = true;
            this.slashAnimProgress = this.slashAnimDuration;
          }
        }
} else if (this.type === 'ghoul') {"""
unit_js = unit_js.replace(attack_old, attack_new)

# 5. takeDamage (kill logic triggers stealth)
take_damage_old = """    if (this.hp <= 0 && attacker) {
      attacker.kills++;
    }"""
take_damage_new = """    if (this.hp <= 0 && attacker) {
      attacker.kills++;
      if (attacker.type === 'assassin') {
        attacker.isShadow = true;
        attacker.shadowTime = Date.now() + 2000; // 2 seconds stealth
        gameState.animations.push(new FloatingText("STEALTH", attacker.x, attacker.y - 30, "#475569"));
      }
    }"""
unit_js = unit_js.replace(take_damage_old, take_damage_new)

# 6. draw (shadow effect)
draw_old = """    uiElements.ctx.save();
    if (this.isRevived) {
      uiElements.ctx.filter = 'brightness(0.6)'; // darker when revived
    }"""
draw_new = """    uiElements.ctx.save();
    if (this.isRevived) {
      uiElements.ctx.filter = 'brightness(0.6)'; // darker when revived
    }
    if (this.isShadow) {
      uiElements.ctx.globalAlpha = 0.4;
      uiElements.ctx.filter = 'brightness(0.2)';
    }"""
unit_js = unit_js.replace(draw_old, draw_new)

draw_end_old = """    if (this.isRevived) {
      uiElements.ctx.filter = 'none'; // reset filter
    }"""
draw_end_new = """    if (this.isRevived || this.isShadow) {
      uiElements.ctx.filter = 'none'; // reset filter
    }"""
unit_js = unit_js.replace(draw_end_old, draw_end_new)

# 7. drawEquipment (assassin daggers)
draw_equip_old = """    } else if (this.type === 'rockgolem') {"""
draw_equip_new = """    } else if (this.type === 'assassin') {
      const daggerLength = 14;
      const daggerWidth = 3;
      const offsetDistance = 10;
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      
      let thrustOffset = 0;
      if (this.isSlashing) {
          const progress = this.slashAnimProgress / this.slashAnimDuration;
          thrustOffset = Math.sin(progress * Math.PI) * 12;
      }
      
      uiElements.ctx.fillStyle = '#64748b'; // Slate daggers
      // Left dagger
      uiElements.ctx.fillRect(this.width/2 - 5 + thrustOffset, -offsetDistance - daggerWidth/2, daggerLength, daggerWidth);
      // Right dagger
      uiElements.ctx.fillRect(this.width/2 - 5 + thrustOffset, offsetDistance - daggerWidth/2, daggerLength, daggerWidth);
      
      uiElements.ctx.restore();
    } else if (this.type === 'rockgolem') {"""
unit_js = unit_js.replace(draw_equip_old, draw_equip_new)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
