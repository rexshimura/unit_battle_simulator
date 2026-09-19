import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
proj_path = os.path.join(base_dir, 'js', 'entities', 'Projectiles.js')

with open(proj_path, 'r', encoding='utf-8') as f:
    proj_js = f.read()

eagle_class = """
class EagleProjectile {
  constructor(caster, target, damage) {
    this.caster = caster;
    this.target = target;
    this.damage = damage;
    this.x = caster.x;
    this.y = caster.y;
    this.team = caster.team;
    this.speed = 5.0; // Fast eagle
    this.state = 'going'; // 'going' or 'returning'
  }
  update() {
    let destX, destY;
    if (this.state === 'going') {
      if (this.target && this.target.hp > 0) {
        destX = this.target.x;
        destY = this.target.y;
      } else {
        // Target died, return early
        this.state = 'returning';
        destX = this.caster.x;
        destY = this.caster.y;
      }
    } else {
      destX = this.caster.x;
      destY = this.caster.y;
    }
    
    let angle = Math.atan2(destY - this.y, destX - this.x);
    this.x += Math.cos(angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(angle) * this.speed * gameState.gameSpeed;
    
    // Eagle feather/wind trail
    if (Math.random() < 0.2) {
      let p = new Particle(this.x, this.y, this.team, false, 'smoke');
      p.life = 10;
      gameState.particles.push(p);
    }
    
    let dist = Math.hypot(destX - this.x, destY - this.y);
    if (dist < 15) {
      if (this.state === 'going') {
        this.target.takeDamage(this.damage, this.caster);
        AudioManager.play('eagle_bite');
        this.state = 'returning';
      } else {
        // Returned to caster, despawn
        return false;
      }
    }
    return true;
  }
  draw() {
    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    let destX = this.state === 'going' && this.target ? this.target.x : this.caster.x;
    let destY = this.state === 'going' && this.target ? this.target.y : this.caster.y;
    uiElements.ctx.rotate(Math.atan2(destY - this.y, destX - this.x));
    
    // Draw an eagle-like shape
    uiElements.ctx.fillStyle = '#8B4513'; 
    uiElements.ctx.beginPath();
    uiElements.ctx.moveTo(10, 0); // Beak
    uiElements.ctx.lineTo(-6, 8); // Right Wing
    uiElements.ctx.lineTo(-3, 0); // Tail
    uiElements.ctx.lineTo(-6, -8); // Left Wing
    uiElements.ctx.closePath();
    uiElements.ctx.fill();
    
    // Head accent
    uiElements.ctx.fillStyle = '#FFFFFF';
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(4, 0, 3, 0, Math.PI * 2);
    uiElements.ctx.fill();
    
    uiElements.ctx.restore();
  }
}
"""

proj_js += eagle_class

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(proj_js)
