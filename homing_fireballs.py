import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"

# 1. Update Unit.js for 3 fireballs
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_flame_attack = """        if (this.basicAttackCounter >= 3) {
          this.basicAttackCounter = 0;
          // Shoot 2 small fireballs instead
          gameState.projectiles.push(new Fireball(this, this.target, true, -0.2));
          gameState.projectiles.push(new Fireball(this, this.target, true, 0.2));
        }"""
        
new_flame_attack = """        if (this.basicAttackCounter >= 3) {
          this.basicAttackCounter = 0;
          // Shoot 3 small homing fireballs
          gameState.projectiles.push(new Fireball(this, this.target, true, -0.3));
          gameState.projectiles.push(new Fireball(this, this.target, true, 0));
          gameState.projectiles.push(new Fireball(this, this.target, true, 0.3));
        }"""
        
unit_js = unit_js.replace(old_flame_attack, new_flame_attack)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)

# 2. Update Projectiles.js for homing logic
proj_path = os.path.join(base_dir, 'js', 'entities', 'Projectiles.js')
with open(proj_path, 'r', encoding='utf-8') as f:
    proj_js = f.read()

old_fireball_update = """  update(enemies) {
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;"""
    
new_fireball_update = """  update(enemies) {
    if (this.isSmall && this.target && this.target.hp > 0) {
      const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      const turnSpeed = 0.08 * gameState.gameSpeed;
      let diff = targetAngle - this.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      if (Math.abs(diff) < turnSpeed) {
        this.angle = targetAngle;
      } else {
        this.angle += Math.sign(diff) * turnSpeed;
      }
    }
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;"""

proj_js = proj_js.replace(old_fireball_update, new_fireball_update)

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(proj_js)
