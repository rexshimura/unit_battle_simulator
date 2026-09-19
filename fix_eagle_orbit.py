import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
proj_path = os.path.join(base_dir, 'js', 'entities', 'Projectiles.js')
config_path = os.path.join(base_dir, 'js', 'config.js')
utils_path = os.path.join(base_dir, 'js', 'utils.js')

# 1. Update Projectiles.js
with open(proj_path, 'r', encoding='utf-8') as f:
    proj_js = f.read()

old_eagle_update = """    let desiredAngle = Math.atan2(destY - this.y, destX - this.x);
    let diff = desiredAngle - this.angle;
    
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    
    // Curve smoothly towards the target
    this.angle += diff * 0.08 * gameState.gameSpeed;
    
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;
    
    // Eagle feather/wind trail
    if (Math.random() < 0.2) {
      let p = new Particle(this.x, this.y, this.team, false, 'smoke');
      p.life = 10;
      gameState.particles.push(p);
    }
    
    let dist = Math.hypot(destX - this.x, destY - this.y);
    if (dist < 20) {"""

new_eagle_update = """    let desiredAngle = Math.atan2(destY - this.y, destX - this.x);
    let diff = desiredAngle - this.angle;
    
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    
    let dist = Math.hypot(destX - this.x, destY - this.y);
    
    // Sharpen the curve aggressively as it gets closer so it never orbits
    let turnRate = 0.08;
    if (dist < 150) turnRate = 0.15;
    if (dist < 80) turnRate = 0.4;
    
    this.angle += diff * turnRate * gameState.gameSpeed;
    
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;
    
    // Eagle feather/wind trail
    if (Math.random() < 0.2) {
      let p = new Particle(this.x, this.y, this.team, false, 'smoke');
      p.life = 10;
      gameState.particles.push(p);
    }
    
    let hitDist = this.state === 'going' && this.target ? (this.target.width / 2 + 10) : 20;
    if (dist < hitDist) {"""

proj_js = proj_js.replace(old_eagle_update, new_eagle_update)
proj_js = proj_js.replace("this.speed = 6.0; // Slightly faster", "this.speed = UNIT_SPECS.hunter.eagleSpeed || 6.0;")

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(proj_js)


# 2. Update config.js
with open(config_path, 'r', encoding='utf-8') as f:
    config_js = f.read()

config_js = config_js.replace(
    "eagleDamage: 12, eagleTriggerCount: 2",
    "eagleDamage: 12, eagleTriggerCount: 2, eagleSpeed: 6.0"
)

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config_js)


# 3. Update utils.js (fix volume)
with open(utils_path, 'r', encoding='utf-8') as f:
    utils_js = f.read()

utils_js = utils_js.replace(
    "sound.volume = 0.1; // Make it less audible",
    "sound.volume = 0.8; // Restored audibility"
)

with open(utils_path, 'w', encoding='utf-8') as f:
    f.write(utils_js)
