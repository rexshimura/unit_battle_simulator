import os

unit_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\entities\Unit.js'
with open(unit_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add shake logic at the top of draw()
old_save = """    uiElements.ctx.save();
    if (this.isRevived) {"""
new_save = """    uiElements.ctx.save();
    
    const isRestricted = this.stunType === 'restrict' && Date.now() < this.stunnedUntil;
    if (isRestricted) {
        uiElements.ctx.translate(Math.random() * 4 - 2, Math.random() * 4 - 2);
    }
    
    if (this.isRevived) {"""
text = text.replace(old_save, new_save)

# 2. Change color to black if restricted
old_color = """      }
      uiElements.ctx.fillStyle = this.color;
    }
    if (this.buffs.druidHeal) {"""
new_color = """      }
      uiElements.ctx.fillStyle = isRestricted ? '#0f172a' : this.color; // very dark/black
    }
    if (this.buffs.druidHeal) {"""
text = text.replace(old_color, new_color)

# Wait, there's another place where fillStyle is set to this.color for units that are not abyssal_summoner
# Let's just grep where `uiElements.ctx.fillStyle = this.color;` is called in draw()
old_color2 = """    uiElements.ctx.fillStyle = this.color;
    if (this.type === 'abyssal_summoner') {"""
new_color2 = """    uiElements.ctx.fillStyle = isRestricted ? '#0f172a' : this.color;
    if (this.type === 'abyssal_summoner') {"""
text = text.replace(old_color2, new_color2)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(text)
print('Unit shake and black color added.')
