import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# 1. Update constructor
constructor_old = """  constructor(x, y, team, type, relX, relY) {
    this.id = gameState.nextUnitId++;
    this.x = x;
    this.y = y;
    this.relX = relX;
    this.relY = relY;
    this.team = team;
    this.type = type;
    const specs = UNIT_SPECS[type];
    this.hp = specs.hp;
    this.maxHp = specs.hp;
    this.speed = specs.speed;
    this.attackDamage = specs.attackDamage;
    this.attackRange = specs.attackRange;
    this.attackCooldown = specs.attackCooldown;
    this.color = specs.color[team === 1 ? 'team1' : 'team2'];
    this.lastAttackTime = 0;
    this.target = null;
    this.width = specs.size || 20;
    this.height = specs.size || 20;
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.healingDone = 0;
    this.kills = 0;
    this.armor = 0;
    this.coldStacks = 0;
    this.ownedSnakes = [];
    this.isBeingKnockedBack = false;
    this.knockbackTargetX = 0;
    this.knockbackTargetY = 0;
    this.isSlashing = false;
    this.slashAnimDuration = 15;
    this.slashAnimProgress = 0;
    this.deflectAnim = 0;
    this.isThrusting = false;
    this.thrustAnimDuration = 20;
    this.thrustAnimProgress = 0;
    this.isThrowing = false;
    this.throwAnimDuration = 30;
    this.throwAnimProgress = 0;
    this.isSmashing = false;
    this.smashAnimDuration = 40;
    this.smashAnimProgress = 0;
    this.isSwinging = false;
    this.swingAnimDuration = 50;
    this.swingAnimProgress = 0;
    this.basicAttackCounter = 0;
    this.isBursting = false;
    this.burstsLeft = 0;
    this.lastBurstSlashTime = 0;
    this.activeSword = 1;
    this.healAttackCounter = 0;
    this.isMultiHealActive = false;
    this.isReviving = false;
    this.reviveTime = 0;
    this.isShadow = false;
    this.shadowTime = 0;
    this.isInitialStealth = false;
    this.currentMoveAngle = 0;
    this.multiHealEndTime = 0;
    this.isCasting = false;
    this.castAnimProgress = 0;
    this.glowAnimProgress = Math.random() * Math.PI * 2;
    this.buffs = {};
    this.stunnedUntil = 0;
    this.stunType = null;
    if (this.type === 'assassin') {
      this.isShadow = true;
      this.isInitialStealth = true;
      this.shadowTime = Infinity;
    }
  }"""
constructor_new = """  constructor(x, y, team, type, relX, relY) {
    this.id = gameState.nextUnitId++;
    this.x = x;
    this.y = y;
    this.relX = relX;
    this.relY = relY;
    this.team = team;
    this.type = type;
    const specs = UNIT_SPECS[type];
    this.hp = specs.hp;
    this.maxHp = specs.hp;
    this.speed = specs.speed;
    this.attackDamage = specs.attackDamage;
    this.attackRange = specs.attackRange;
    this.attackCooldown = specs.attackCooldown;
    this.color = specs.color[team === 1 ? 'team1' : 'team2'];
    this.lastAttackTime = 0;
    this.target = null;
    this.width = specs.size || 20;
    this.height = specs.size || 20;
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.healingDone = 0;
    this.kills = 0;
    this.armor = 0;
    this.coldStacks = 0;
    this.ownedSnakes = [];
    this.isBeingKnockedBack = false;
    this.knockbackTargetX = 0;
    this.knockbackTargetY = 0;
    this.isSlashing = false;
    this.slashAnimDuration = 15;
    this.slashAnimProgress = 0;
    this.deflectAnim = 0;
    this.isThrusting = false;
    this.thrustAnimDuration = 20;
    this.thrustAnimProgress = 0;
    this.isThrowing = false;
    this.throwAnimDuration = 30;
    this.throwAnimProgress = 0;
    this.isSmashing = false;
    this.smashAnimDuration = 40;
    this.smashAnimProgress = 0;
    this.isSwinging = false;
    this.swingAnimDuration = 50;
    this.swingAnimProgress = 0;
    this.basicAttackCounter = 0;
    this.isBursting = false;
    this.burstsLeft = 0;
    this.lastBurstSlashTime = 0;
    this.activeSword = 1;
    this.healAttackCounter = 0;
    this.isMultiHealActive = false;
    this.isReviving = false;
    this.reviveTime = 0;
    this.isShadow = false;
    this.shadowTime = 0;
    this.isInitialStealth = false;
    this.currentMoveAngle = 0;
    this.battleFrames = 0;
    this.multiHealEndTime = 0;
    this.isCasting = false;
    this.castAnimProgress = 0;
    this.glowAnimProgress = Math.random() * Math.PI * 2;
    this.buffs = {};
    this.stunnedUntil = 0;
    this.stunType = null;
    if (this.type === 'assassin') {
      this.isShadow = false; // Start normal
      this.isInitialStealth = true;
      this.shadowTime = 0;
    }
  }"""
unit_js = unit_js.replace(constructor_old, constructor_new)

# 2. Update findTarget
find_target_old = """      enemies.forEach(e => {
        if (e.isReviving || e.isShadow) return;
        const d = getDistance(this, e);
        // Heavily prefer low HP targets. And a little bit of distance (to go for backliners).
        const score = -e.hp;
        if (score > bestScore) {
          bestScore = score;
          bestTarget = e;
        }
      });"""
find_target_new = """      enemies.forEach(e => {
        if (e.isReviving || e.isShadow) return;
        
        let score = -e.hp; // Prefer lower HP
        
        const tags = UNIT_SPECS[e.type].tags;
        if (tags.includes('Support')) score += 500;
        else if (tags.includes('Magic')) score += 400;
        else if (tags.includes('Ranged')) score += 300;
        
        if (score > bestScore) {
          bestScore = score;
          bestTarget = e;
        }
      });"""
unit_js = unit_js.replace(find_target_old, find_target_new)

# 3. Update update method to handle the 0.5s delay
update_old = """    if (this.isShadow && Date.now() > this.shadowTime) {
      this.isShadow = false;
    }"""
update_new = """    if (this.isShadow && Date.now() > this.shadowTime) {
      this.isShadow = false;
    }
    
    if (this.type === 'assassin' && this.isInitialStealth) {
        if (!this.isShadow && this.battleFrames > 30) {
            this.isShadow = true;
            this.shadowTime = Infinity;
            gameState.animations.push(new FloatingText("STEALTH", this.x, this.y - 30, "#475569"));
        }
        this.battleFrames += 1 * gameState.gameSpeed;
    }"""
unit_js = unit_js.replace(update_old, update_new)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
