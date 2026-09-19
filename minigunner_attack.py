import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_shoot = """      } else if (this.type === 'archer') {"""
new_shoot = """      } else if (this.type === 'minigunner') {
        AudioManager.play('bullet');
        const proj = new Projectile(this, this.target, this.attackDamage, this.team);
        proj.radius = 2; // smaller bullet
        proj.speed = 18; // faster bullet
        gameState.projectiles.push(proj);
        // less smoke for minigun to not lag
        for (let i = 0; i < 2; i++) {
          gameState.particles.push(new Particle(this.x, this.y, this.team, false, 'smoke'));
        }
      } else if (this.type === 'archer') {"""

unit_js = unit_js.replace(old_shoot, new_shoot)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
