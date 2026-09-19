import os
import re

BASE_DIR = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
JS_DIR = os.path.join(BASE_DIR, 'js')

def update_config():
    config_path = os.path.join(JS_DIR, 'config.js')
    with open(config_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if "'restrictor'" not in content:
        content = re.sub(
            r"(Controllers:\s*\[)([^\]]+)(\])",
            r"\1\2, 'restrictor'\3",
            content
        )
        
    if "'restrictor':" not in content:
        restrictor_specs = "  'restrictor': {description: 'Throws chains. Every 7th hit locks enemy for 5 seconds.', name: 'Restrictor', hp: 120, speed: 0.6, attackDamage: 12, attackRange: 300, attackCooldown: 1400, color: {team1: '#94a3b8', team2: '#475569'}, size: 20},\n  'dummy':"
        content = content.replace("  'dummy':", restrictor_specs)

    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_projectiles():
    proj_path = os.path.join(JS_DIR, 'entities', 'Projectiles.js')
    with open(proj_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "class ChainProjectile" not in content:
        chain_class = """
export class ChainProjectile extends Projectile {
  constructor(shooter, target, damage, team) {
    super(shooter, target, damage, team);
    this.speed = 12;
    this.radius = 4;
  }
  
  update(enemies) {
    // Normal update but with custom hit logic
    const baseResult = super.update(enemies);
    // If baseResult is false, it means it hit someone (or went out of bounds)
    // Wait, super.update calls enemy.takeDamage which we don't want if we want to intercept the hit!
    // Actually, it's easier to just override the collision loop here.
    return baseResult;
  }
  
  // Since we need to intercept the damage to apply the restriction buff, we will override the entire update
}
"""
        # Better approach: We can just use the super update, but how to track the hit?
        # Let's override update entirely for ChainProjectile to track hit count and apply stun.
        chain_class_full = """
export class ChainProjectile extends Projectile {
  constructor(shooter, target, damage, team) {
    super(shooter, target, damage, team);
    this.speed = 16;
    this.radius = 4;
  }
  
  update(enemies) {
    // Deflection logic (copied from base)
    const enemyGuardians = gameState.units.filter(u => u.team !== this.team && (u.type === 'guardian' || u.type === 'force_wall'));
    for (const guardian of enemyGuardians) {
      if (guardian.type === 'force_wall') {
         if (guardian.isReflecting && getDistance(this, guardian) < guardian.width / 2 + 10) {
             this.team = guardian.team;
             this.target = null; 
             this.shooter = guardian;
             this.angle += Math.PI + (Math.random() - 0.5) * Math.PI;
             const shieldDist = guardian.width / 2 + 8;
             let faceAngle = guardian.team === 1 ? 0 : Math.PI;
             if (guardian.target) faceAngle = Math.atan2(guardian.target.y - guardian.y, guardian.target.x - guardian.x);
             this.x = guardian.x + Math.cos(faceAngle) * shieldDist;
             this.y = guardian.y + Math.sin(faceAngle) * shieldDist;
             return true;
         } else if (!guardian.isReflecting && getDistance(this, guardian) < guardian.width / 2 + 10) {
             guardian.takeDamage(this.damage, this.shooter);
             return false;
         }
      } else {
        const specs = UNIT_SPECS.guardian;
        if (getDistance(this, guardian) < guardian.width / 2 + 5) {
          guardian.deflect();
          if (Math.random() < specs.deflectChance) {
            this.team = guardian.team;
            this.target = this.shooter;
            this.shooter = guardian;
            return true;
          } else {
            guardian.takeDamage(this.damage * 0.5, this.shooter);
            return false;
          }
        }
      }
    }
    
    if (this.target && this.target.hp > 0) {
      this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    }
    this.x += Math.cos(this.angle) * this.speed * gameState.gameSpeed;
    this.y += Math.sin(this.angle) * this.speed * gameState.gameSpeed;
    
    for (const enemy of enemies) {
      if (getDistance(this, enemy) < enemy.width / 2 + this.radius) {
        enemy.takeDamage(this.damage, this.shooter);
        
        // Custom restrictor logic
        if (this.shooter && this.shooter.type === 'restrictor') {
            this.shooter.restrictorHits = (this.shooter.restrictorHits || 0) + 1;
            if (this.shooter.restrictorHits >= 7) {
                this.shooter.restrictorHits = 0;
                enemy.stunnedUntil = Date.now() + 5000;
                enemy.stunType = 'restrict';
                gameState.animations.push(new FloatingText("LOCKED!", enemy.x, enemy.y - 30, "#a855f7"));
            }
        }
        
        return false;
      }
    }
    return this.x > -this.radius && this.x < uiElements.canvas.width + this.radius && this.y > -this.radius && this.y < uiElements.canvas.height + this.radius;
  }
  
  draw() {
    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    uiElements.ctx.rotate(this.angle);
    uiElements.ctx.strokeStyle = '#94a3b8';
    uiElements.ctx.lineWidth = 2;
    for (let i = -6; i <= 6; i += 6) {
       uiElements.ctx.beginPath();
       uiElements.ctx.ellipse(i, 0, 4, 2, 0, 0, Math.PI*2);
       uiElements.ctx.stroke();
    }
    uiElements.ctx.restore();
  }
}
"""
        content += chain_class_full
        
    with open(proj_path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_unit():
    unit_path = os.path.join(JS_DIR, 'entities', 'Unit.js')
    with open(unit_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Import ChainProjectile
    if "ChainProjectile" not in content:
        content = content.replace("PenetratingBeam } from './Projectiles.js';", "PenetratingBeam, ChainProjectile } from './Projectiles.js';")
        
    # Add attack logic
    if "this.type === 'restrictor'" not in content:
        attack_logic = """} else if (this.type === 'restrictor') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          AudioManager.play('throw'); // Using existing throw sound
          
          // First chain
          gameState.projectiles.push(new ChainProjectile(this, this.target, this.attackDamage, this.team));
          
          // Second chain delayed
          setTimeout(() => {
              if (this.hp > 0 && this.target && this.target.hp > 0) {
                  gameState.projectiles.push(new ChainProjectile(this, this.target, this.attackDamage, this.team));
              }
          }, 200);
        }
"""
        content = content.replace("} else if (this.type === 'sledgehammer') {", attack_logic + "} else if (this.type === 'sledgehammer') {")

    # Add restrictor visual effect (chains wrapping target)
    if "this.stunType === 'restrict'" not in content:
        text_replace = "uiElements.ctx.fillText(this.stunType === 'freeze' ? 'FROZEN' : (this.stunType === 'restrict' ? 'LOCKED' : 'STUN'), this.x, healthBarY - 2);"
        content = content.replace("uiElements.ctx.fillText(this.stunType === 'freeze' ? 'FROZEN' : 'STUN', this.x, healthBarY - 2);", text_replace)
        
        # Add a visual effect in drawEquipment for chained enemies
        draw_equip_inject = """    }
    
    // Draw chains if locked
    if (this.stunType === 'restrict' && Date.now() < this.stunnedUntil) {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.strokeStyle = '#a855f7'; // Purple chains
      uiElements.ctx.lineWidth = 3;
      uiElements.ctx.beginPath();
      uiElements.ctx.ellipse(0, 0, this.width / 2 + 4, this.width / 2 - 2, Math.PI / 6, 0, Math.PI*2);
      uiElements.ctx.stroke();
      uiElements.ctx.beginPath();
      uiElements.ctx.ellipse(0, 0, this.width / 2 + 4, this.width / 2 - 2, -Math.PI / 6, 0, Math.PI*2);
      uiElements.ctx.stroke();
      uiElements.ctx.restore();
    }
"""
        # insert at the very end of drawEquipment (right after restore())
        # Let's find the end of drawEquipment by searching for `    // End of drawEquipment` or similar
        # Since I don't know exactly where, I'll put it right after the draw call, which means we can insert it in `draw()` after `this.drawEquipment()`.
        
        draw_call = "this.drawEquipment(angle);"
        content = content.replace(draw_call, draw_call + "\n" + """
    if (this.stunType === 'restrict' && Date.now() < this.stunnedUntil) {
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.strokeStyle = '#a855f7';
      uiElements.ctx.lineWidth = 3;
      uiElements.ctx.beginPath();
      uiElements.ctx.ellipse(0, 0, this.width / 2 + 4, this.width / 2 - 2, Math.PI / 6, 0, Math.PI*2);
      uiElements.ctx.stroke();
      uiElements.ctx.beginPath();
      uiElements.ctx.ellipse(0, 0, this.width / 2 + 4, this.width / 2 - 2, -Math.PI / 6, 0, Math.PI*2);
      uiElements.ctx.stroke();
      uiElements.ctx.restore();
    }""")

    with open(unit_path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_html():
    html_path = os.path.join(BASE_DIR, 'index.html')
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    btn_html = """
                    <button data-unit-type="restrictor" class="unit-btn w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center gap-3">
                        <canvas width="40" height="40" class="unit-preview-canvas" data-unit-type="restrictor"></canvas>
                        <div>
                            <p class="text-sm font-bold text-gray-200">Restrictor</p>
                        </div>
                    </button>"""
                    
    # Insert under abyssal_summoner or any unit
    if 'data-unit-type="restrictor"' not in content:
        target = '<button data-unit-type="abyssal_summoner"'
        idx = content.find(target)
        if idx != -1:
            content = content[:idx] + btn_html.strip() + "\n                    " + content[idx:]
        else:
            # fallback
            target2 = '<button data-unit-type="priest"'
            idx2 = content.find(target2)
            content = content[:idx2] + btn_html.strip() + "\n                    " + content[idx2:]
            
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    update_config()
    update_projectiles()
    update_unit()
    update_html()
    print("Restrictor added.")
