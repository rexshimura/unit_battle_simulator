import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

bad_lines = """    if (this.isMultiHealActive && Date.now() > this.multiHealEndTime) this.isMultiHealActive = false;
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
    }"""

good_lines = """    if (this.isMultiHealActive && Date.now() > this.multiHealEndTime) this.isMultiHealActive = false;"""

# Wait, let's just do a regex replace to be safe or string replace
if bad_lines in unit_js:
    unit_js = unit_js.replace(bad_lines, good_lines)
else:
    # Print out what's there
    pass

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
