import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
effects_path = os.path.join(base_dir, 'js', 'entities', 'Effects.js')
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

# 1. Update Effects.js
with open(effects_path, 'r', encoding='utf-8') as f:
    effects_js = f.read()

old_chain = """class ChainLightning {
  constructor(caster, initialTarget, allUnits) {
    this.caster = caster;
    this.duration = 30;
    this.maxDuration = 30;
    this.team = caster.team;
    const specs = UNIT_SPECS.wizard;
    this.targets = [initialTarget];
    let lastTarget = initialTarget;
    const potentialTargets = allUnits.filter(u => u.team !== this.team && u.hp > 0 && !this.targets.includes(u));
    for (let i = 0; i < specs.chainTargets - 1; i++) {
      let nextTarget = null;
      let minDistance = specs.chainRange;
      for (const p of potentialTargets) {
        const d = getDistance(lastTarget, p);
        if (d < minDistance) {
          minDistance = d;
          nextTarget = p;
        }
      }
      if (nextTarget) {
        this.targets.push(nextTarget);
        potentialTargets.splice(potentialTargets.indexOf(nextTarget), 1);
        lastTarget = nextTarget;
      } else {
        break;
      }
    }
    this.targets.forEach(target => {
      target.takeDamage(specs.attackDamage, this.caster);
    });
  }"""
new_chain = """class ChainLightning {
  constructor(caster, initialTarget, allUnits, isStrong = false) {
    this.caster = caster;
    this.duration = 30;
    this.maxDuration = 30;
    this.team = caster.team;
    this.isStrong = isStrong;
    const specs = UNIT_SPECS.wizard;
    this.targets = [initialTarget];
    let lastTarget = initialTarget;
    const potentialTargets = allUnits.filter(u => u.team !== this.team && u.hp > 0 && !this.targets.includes(u));
    
    let targetsToChain = specs.chainTargets - 1;
    if (this.isStrong) {
      targetsToChain += 3; // Chain more targets!
    }

    for (let i = 0; i < targetsToChain; i++) {
      let nextTarget = null;
      let minDistance = specs.chainRange;
      for (const p of potentialTargets) {
        const d = getDistance(lastTarget, p);
        if (d < minDistance) {
          minDistance = d;
          nextTarget = p;
        }
      }
      if (nextTarget) {
        this.targets.push(nextTarget);
        potentialTargets.splice(potentialTargets.indexOf(nextTarget), 1);
        lastTarget = nextTarget;
      } else {
        break;
      }
    }
    
    this.targets.forEach(target => {
      let dmg = specs.attackDamage;
      if (this.isStrong) dmg *= 1.5;
      target.takeDamage(dmg, this.caster);
      if (this.isStrong) {
        target.stunnedUntil = Date.now() + 1000;
        target.stunType = 'stun';
      }
    });
  }"""

effects_js = effects_js.replace(old_chain, new_chain)

# Let's also change the draw method to make it thicker if isStrong
old_chain_draw = """  draw() {
    uiElements.ctx.save();
    uiElements.ctx.strokeStyle = this.team === 1 ? '#60a5fa' : '#f87171';
    uiElements.ctx.lineWidth = 2;
    uiElements.ctx.globalAlpha = this.duration / this.maxDuration;"""
new_chain_draw = """  draw() {
    uiElements.ctx.save();
    uiElements.ctx.strokeStyle = this.team === 1 ? '#60a5fa' : '#f87171';
    uiElements.ctx.lineWidth = this.isStrong ? 4 : 2;
    if (this.isStrong) uiElements.ctx.strokeStyle = '#c084fc'; // Purple for strong
    uiElements.ctx.globalAlpha = this.duration / this.maxDuration;"""

effects_js = effects_js.replace(old_chain_draw, new_chain_draw)

with open(effects_path, 'w', encoding='utf-8') as f:
    f.write(effects_js)

# 2. Update Unit.js
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# 2a. Wizard attack logic
old_wizard_attack = """      if (this.type === 'wizard') {
        if (this.target) {
          this.isCasting = true;
          this.castAnimProgress = 30;
          gameState.animations.push(new ChainLightning(this, this.target, gameState.units));
        }
        return;
      }"""
new_wizard_attack = """      if (this.type === 'wizard') {
        if (this.target) {
          if (this.basicAttackCounter === undefined) this.basicAttackCounter = 0;
          this.basicAttackCounter++;
          let isStrong = false;
          if (this.basicAttackCounter > 4) {
             this.basicAttackCounter = 0;
             isStrong = true;
          }
          this.isCasting = true;
          this.castAnimProgress = 30;
          gameState.animations.push(new ChainLightning(this, this.target, gameState.units, isStrong));
        }
        return;
      }"""
unit_js = unit_js.replace(old_wizard_attack, new_wizard_attack)

# 2b. Wizard UI logic
old_ui_if = "if ((this.type === 'rockgolem' || this.type === 'duelist' || this.type === 'druid' || this.type === 'priest' || this.type === 'troll' || this.type === 'cryomancer' || this.type === 'alchemist' || this.type === 'fortress' || this.type === 'flamecaller') && gameState.isBattleStarted) {"
new_ui_if = "if ((this.type === 'rockgolem' || this.type === 'duelist' || this.type === 'druid' || this.type === 'priest' || this.type === 'troll' || this.type === 'cryomancer' || this.type === 'alchemist' || this.type === 'fortress' || this.type === 'flamecaller' || this.type === 'wizard') && gameState.isBattleStarted) {"
unit_js = unit_js.replace(old_ui_if, new_ui_if)

old_ui_switch = """        case 'flamecaller':
          counter = this.basicAttackCounter || 0;
          maxCount = 3;
          barColor = '#fb923c';
          break;"""
new_ui_switch = """        case 'flamecaller':
          counter = this.basicAttackCounter || 0;
          maxCount = 3;
          barColor = '#fb923c';
          break;
        case 'wizard':
          counter = this.basicAttackCounter || 0;
          maxCount = 4;
          barColor = '#c084fc';
          break;"""
unit_js = unit_js.replace(old_ui_switch, new_ui_switch)


with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
