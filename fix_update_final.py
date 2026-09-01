import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

bad_snippet = """    if (this.isMultiHealActive && Date.now() > this.multiHealEndTime) this.isMultiHealActive = false;
    this.isReviving = false;
    this.reviveTime = 0;
    this.isShadow = false;
    this.shadowTime = 0;
    this.isInitialStealth = false;
    this.currentMoveAngle = 0;
    let currentSpeed = this.speed;"""

good_snippet = """    if (this.isMultiHealActive && Date.now() > this.multiHealEndTime) this.isMultiHealActive = false;
    let currentSpeed = this.speed;"""

unit_js = unit_js.replace(bad_snippet, good_snippet)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
