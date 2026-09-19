import os

unit_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\entities\Unit.js'
with open(unit_path, 'r', encoding='utf-8') as f:
    text = f.read()

insert_point = """    if (this.coldStacks > 0) {
      uiElements.ctx.fillStyle = '#38bdf8';
      uiElements.ctx.font = 'bold 16px "Roboto Mono"';
      uiElements.ctx.textAlign = 'center';
      uiElements.ctx.textBaseline = 'bottom';
      uiElements.ctx.fillText(`❄️${this.coldStacks}`, this.x - iconSpacing, healthBarY - 15);
    }"""
    
new_mark = """    if (this.coldStacks > 0) {
      uiElements.ctx.fillStyle = '#38bdf8';
      uiElements.ctx.font = 'bold 16px "Roboto Mono"';
      uiElements.ctx.textAlign = 'center';
      uiElements.ctx.textBaseline = 'bottom';
      uiElements.ctx.fillText(`❄️${this.coldStacks}`, this.x - iconSpacing, healthBarY - 15);
    }
    let totalRestrictHits = 0;
    if (this.restrictorHitCount) {
        for (let id in this.restrictorHitCount) {
            totalRestrictHits += this.restrictorHitCount[id];
        }
    }
    if (totalRestrictHits > 0 && Date.now() >= this.stunnedUntil) {
      uiElements.ctx.fillStyle = '#a855f7';
      uiElements.ctx.font = 'bold 14px "Roboto Mono"';
      uiElements.ctx.textAlign = 'center';
      uiElements.ctx.textBaseline = 'bottom';
      uiElements.ctx.fillText(`🔗${totalRestrictHits}`, this.x + iconSpacing * 2, healthBarY - 15);
    }"""

text = text.replace(insert_point, new_mark)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(text)
print('Added restrictor mark to enemies.')
