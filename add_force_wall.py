import os
import re

BASE_DIR = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js"

def update_config():
    config_path = os.path.join(BASE_DIR, 'config.js')
    with open(config_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add force_wall to Interceptors
    if "'force_wall'" not in content:
        content = re.sub(
            r"(Interceptors:\s*\[)([^\]]+)(\])",
            r"\1\2, 'force_wall'\3",
            content
        )

    # Add force_wall specs
    if "'force_wall':" not in content:
        specs_injection = "  'force_wall': {description: 'Counters pierce bullets. Reflects projectiles after 8 hits.', name: 'Force Wall', hp: 350, speed: 0.2, attackDamage: 10, attackRange: 40, attackCooldown: 2500, color: {team1: '#60a5fa', team2: '#f87171'}, size: 28},\n  'dummy':"
        content = content.replace("  'dummy':", specs_injection)

    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_unit():
    unit_path = os.path.join(BASE_DIR, 'entities', 'Unit.js')
    with open(unit_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Draw Equipment
    if "this.type === 'force_wall'" not in content:
        draw_equip_injection = """    } else if (this.type === 'force_wall') {
      const shieldWidth = 8;
      const shieldHeight = 40;
      let shieldOffset = 8;
      if (this.isSlashing) {
         const progress = this.slashAnimProgress / this.slashAnimDuration;
         shieldOffset += Math.sin(progress * Math.PI) * 15;
      }
      uiElements.ctx.save();
      uiElements.ctx.translate(this.x, this.y);
      uiElements.ctx.rotate(angle);
      uiElements.ctx.fillStyle = this.isReflecting ? 'rgba(236, 72, 153, 0.7)' : 'rgba(56, 189, 248, 0.5)';
      uiElements.ctx.fillRect(this.width / 2 + shieldOffset, -shieldHeight / 2, shieldWidth, shieldHeight);
      uiElements.ctx.lineWidth = 2;
      uiElements.ctx.strokeStyle = this.isReflecting ? 'rgba(244, 114, 182, 0.9)' : 'rgba(125, 211, 252, 0.8)';
      uiElements.ctx.strokeRect(this.width / 2 + shieldOffset, -shieldHeight / 2, shieldWidth, shieldHeight);
      uiElements.ctx.restore();
"""
        content = content.replace("    } else if (this.type === 'fortress') {", draw_equip_injection + "    } else if (this.type === 'fortress') {")
        
    # Update logic (reflect timeout)
    if "this.isReflecting = false" not in content:
        update_logic = """
    if (this.type === 'force_wall' && this.isReflecting) {
        if (Date.now() > this.reflectEndTime) {
            this.isReflecting = false;
        }
    }
"""
        content = content.replace("    if (this.isMultiHealActive && Date.now() > this.multiHealEndTime) this.isMultiHealActive = false;", "    if (this.isMultiHealActive && Date.now() > this.multiHealEndTime) this.isMultiHealActive = false;\n" + update_logic)

    # Attack logic
    if "this.type === 'force_wall' && this.target" not in content:
        attack_logic = """} else if (this.type === 'force_wall') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          AudioManager.play('push');
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new ShieldBashAnimation(this.x, this.y, 40, this.attackDamage, 30, this.team, gameState.units, this));
          if (!this.isSlashing) {
            this.isSlashing = true;
            this.slashAnimProgress = this.slashAnimDuration;
          }
        }
"""
        content = content.replace("} else if (this.type === 'ghoul') {", attack_logic + "} else if (this.type === 'ghoul') {")

    # Take Damage logic
    if "this.type === 'force_wall' && this.hp > 0" not in content:
        take_damage_logic = """
    if (this.type === 'force_wall' && this.hp > 0 && damageToHp > 0) {
        if (!this.isReflecting) {
            this.hitsTaken = (this.hitsTaken || 0) + 1;
            if (this.hitsTaken >= 8) {
                this.hitsTaken = 0;
                this.isReflecting = true;
                this.reflectEndTime = Date.now() + 5000;
                gameState.animations.push(new FloatingText("REFLECT!", this.x, this.y - 40, "#f472b6"));
            }
        }
    }
"""
        content = content.replace("    // Fortress shield bash logic", take_damage_logic + "    // Fortress shield bash logic")

    # Health bar visual for hits
    if "case 'force_wall':" not in content:
        hb_logic = """        case 'force_wall':
          counter = this.hitsTaken || 0;
          maxCount = 8;
          barColor = this.isReflecting ? '#f472b6' : '#38bdf8';
          if (this.isReflecting) {
             counter = 1;
             maxCount = 1;
          }
          break;
"""
        content = content.replace("        case 'fortress':", hb_logic + "        case 'fortress':")
        content = content.replace("this.type === 'fortress' || this.type === 'flamecaller'", "this.type === 'force_wall' || this.type === 'fortress' || this.type === 'flamecaller'")

    with open(unit_path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_projectiles():
    proj_path = os.path.join(BASE_DIR, 'entities', 'Projectiles.js')
    with open(proj_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Generic Projectile Guardian + Force Wall check
    # We replace the enemyGuardians definition and loop
    if "force_wall" not in content:
        new_proj_guard = """    const enemyGuardians = gameState.units.filter(u => u.team !== this.team && (u.type === 'guardian' || u.type === 'force_wall'));
    for (const guardian of enemyGuardians) {
      if (guardian.type === 'force_wall') {
         if (guardian.isReflecting && getDistance(this, guardian) < guardian.width / 2 + 10) {
             this.team = guardian.team;
             this.target = this.shooter; 
             this.shooter = guardian;
             this.angle += (Math.random() - 0.5) * Math.PI; // scattered
             return true;
         } else if (!guardian.isReflecting && getDistance(this, guardian) < guardian.width / 2 + 10) {
             guardian.takeDamage(this.damage, this.shooter);
             return false;
         }
      } else {
        const specs = UNIT_SPECS.guardian;"""
        content = content.replace("    const enemyGuardians = gameState.units.filter(u => u.team !== this.team && u.type === 'guardian');\n    for (const guardian of enemyGuardians) {\n      const specs = UNIT_SPECS.guardian;", new_proj_guard + "\n      ")
        content = content.replace("guardian.takeDamage(this.damage * 0.5, this.shooter);\n          return false;\n        }\n      }\n    }", "guardian.takeDamage(this.damage * 0.5, this.shooter);\n          return false;\n        }\n      }\n      }\n    }")
        
    # Same for IceShard
    if "enemyGuardians = gameState.units.filter(u => u.team !== this.team && (u.type === 'guardian' || u.type === 'force_wall'));" not in content:
        # IceShard has the exact same block
        pass # Actually the regex above might replace both if we do a regex, but string replace only replaces the exact match. Wait, IceShard has identical text?
        # Let's write a regex to replace both.
        content = re.sub(
            r"const enemyGuardians = gameState\.units\.filter\(u => u\.team !== this\.team && u\.type === 'guardian'\);\n\s*for \(const guardian of enemyGuardians\) {\n\s*const specs = UNIT_SPECS\.guardian;\n\s*if \(getDistance\(this, guardian\) < guardian\.width / 2 \+ 5\) {\n\s*guardian\.deflect\(\);\n\s*if \(Math\.random\(\) < specs\.deflectChance\) {\n\s*this\.team = guardian\.team;\n\s*this\.target = this\.shooter;\n\s*this\.shooter = guardian;\n\s*return true;\n\s*} else {\n\s*guardian\.takeDamage\(this\.damage \* 0\.5, this\.shooter\);\n\s*return false;\n\s*}\n\s*}\n\s*}",
            """const enemyGuardians = gameState.units.filter(u => u.team !== this.team && (u.type === 'guardian' || u.type === 'force_wall'));
    for (const guardian of enemyGuardians) {
      if (guardian.type === 'force_wall') {
         if (guardian.isReflecting && getDistance(this, guardian) < guardian.width / 2 + 10) {
             this.team = guardian.team;
             this.target = this.shooter; 
             this.shooter = guardian;
             this.angle += (Math.random() - 0.5) * Math.PI; // scattered
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
    }""",
            content
        )

    # PenetratingBeam
    # Force Wall blocks pierce bullets. So it shouldn't penetrate.
    if "hitWall" not in content:
        beam_logic = """
    let hitWall = false;
    gameState.units.forEach(unit => {
      if (unit.team !== this.team && unit.hp > 0 && !this.hitTargets.has(unit)) {
        const dx = this.x - unit.x;
        const dy = this.y - unit.y;
        if (Math.sqrt(dx * dx + dy * dy) <= unit.width / 2 + this.radius) {
          if (unit.type === 'force_wall' && unit.isReflecting) {
             this.team = unit.team;
             this.angle += (Math.random() - 0.5) * Math.PI; // scattered
             this.shooter = unit;
             this.hitTargets.clear();
             hitWall = true;
          } else {
             unit.takeDamage(this.damage, this.shooter);
             this.hitTargets.add(unit);
             if (unit.type === 'force_wall') {
                 hitWall = true;
             }
          }
        }
      }
    });

    if (hitWall && !this.hitTargets.has(this.shooter)) return false; // if it hit a wall and wasn't reflected this frame
"""
        content = re.sub(
            r"gameState\.units\.forEach\(unit => \{.*?\n\s*\}\);\n",
            beam_logic,
            content,
            flags=re.DOTALL
        )

    with open(proj_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    update_config()
    update_unit()
    update_projectiles()
    print("Force Wall added successfully.")
