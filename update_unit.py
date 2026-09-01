import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# 1. Update constructor to add isReviving and reviveTime
if "this.isReviving = false;" not in unit_js:
    unit_js = unit_js.replace("this.isMultiHealActive = false;", "this.isMultiHealActive = false;\n    this.isReviving = false;\n    this.reviveTime = 0;")

# 2. Update findTarget
find_target_old = """    enemies.forEach(e => {
      const d = getDistance(this, e);"""
find_target_new = """    enemies.forEach(e => {
      if (e.isReviving) return;
      const d = getDistance(this, e);"""
unit_js = unit_js.replace(find_target_old, find_target_new)

# 3. Update update method to handle revive timer and stop moving
update_old = """  update(friendlies, enemies) {
    if (this.isBeingKnockedBack) {"""
update_new = """  update(friendlies, enemies) {
    if (this.target && this.target.isReviving) this.target = null;
    
    if (this.isReviving) {
      if (Date.now() >= this.reviveTime) {
        this.isReviving = false;
        this.isRevived = true;
        const specs = UNIT_SPECS.ghoul;
        this.maxHp = specs.reviveMaxHp;
        this.hp = this.maxHp * specs.reviveHpMultiplier;
        this.speed *= specs.reviveSpeedMultiplier;
        this.attackDamage *= specs.reviveDamageMultiplier;
        this.attackCooldown *= specs.reviveCooldownMultiplier;
        for (let i = 0; i < 20; i++) gameState.particles.push(new Particle(this.x, this.y, this.team, true, 'poison'));
        gameState.animations.push(new FloatingText("REVIVED!", this.x, this.y - 30, "#ef4444"));
      }
      return;
    }
    
    if (this.isBeingKnockedBack) {"""
unit_js = unit_js.replace(update_old, update_new)

# 4. Update draw to handle drawing bone and being darker
draw_old = """  draw() {
    uiElements.ctx.save();
    if (this.stunType === 'freeze' && Date.now() < this.stunnedUntil) {"""
draw_new = """  draw() {
    if (this.isReviving) {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(this.team === 1 ? 0 : Math.PI);
      
      // Draw a simple bone
      uiElements.ctx.fillStyle = '#f3f4f6';
      uiElements.ctx.beginPath();
      uiElements.ctx.roundRect(-8, -3, 16, 6, 2);
      uiElements.ctx.fill();
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(-8, -4, 4, 0, Math.PI * 2);
      uiElements.ctx.arc(-8, 4, 4, 0, Math.PI * 2);
      uiElements.ctx.arc(8, -4, 4, 0, Math.PI * 2);
      uiElements.ctx.arc(8, 4, 4, 0, Math.PI * 2);
      uiElements.ctx.fill();
      
      uiElements.ctx.restore();
      return;
    }

    uiElements.ctx.save();
    if (this.isRevived) {
      uiElements.ctx.filter = 'brightness(0.6)'; // darker when revived
    }
    if (this.stunType === 'freeze' && Date.now() < this.stunnedUntil) {"""
unit_js = unit_js.replace(draw_old, draw_new)

# Restore filter for draw
draw_end_old = """    uiElements.ctx.lineWidth = 2;
    uiElements.ctx.strokeStyle = uiElements.ctx.fillStyle;
    uiElements.ctx.stroke();"""
draw_end_new = """    uiElements.ctx.lineWidth = 2;
    uiElements.ctx.strokeStyle = uiElements.ctx.fillStyle;
    uiElements.ctx.stroke();
    
    if (this.isRevived) {
      uiElements.ctx.filter = 'none'; // reset filter
    }"""
unit_js = unit_js.replace(draw_end_old, draw_end_new)

# 5. Update takeDamage logic for revive
take_damage_old = """    if (this.hp <= 0 && this.type === 'ghoul' && !this.isRevived) {
      this.isRevived = true;
      const specs = UNIT_SPECS.ghoul;
      this.hp = this.maxHp * specs.reviveHpMultiplier;
      this.speed *= specs.reviveSpeedMultiplier;
      this.attackDamage *= specs.reviveDamageMultiplier;
      this.attackCooldown *= specs.reviveCooldownMultiplier;
      for (let i = 0; i < 20; i++) gameState.particles.push(new Particle(this.x, this.y, this.team, true, 'poison'));
      gameState.animations.push(new FloatingText("REVIVED!", this.x, this.y - 30, "#ef4444"));
      return;
    }"""
take_damage_new = """    if (this.hp <= 0 && this.type === 'ghoul' && !this.isRevived && !this.isReviving) {
      this.isReviving = true;
      this.hp = 1; // keep alive
      this.reviveTime = Date.now() + UNIT_SPECS.ghoul.reviveDelay;
      return;
    }"""
unit_js = unit_js.replace(take_damage_old, take_damage_new)

# Add immune check to takeDamage
immune_old = """  takeDamage(damage, attacker = null, bypassesArmor = false) {
    let modifiedDamage = damage;"""
immune_new = """  takeDamage(damage, attacker = null, bypassesArmor = false) {
    if (this.isReviving) return;
    let modifiedDamage = damage;"""
unit_js = unit_js.replace(immune_old, immune_new)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
