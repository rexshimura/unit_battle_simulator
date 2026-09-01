import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# Fix the shadow drawing (opacity should apply to the whole unit)
draw_start_old = """  draw() {
    if (this.isReviving) {"""
draw_start_new = """  draw() {
    uiElements.ctx.save();
    if (this.isShadow) {
        uiElements.ctx.globalAlpha = 0.4;
        uiElements.ctx.filter = 'brightness(0.2)';
    }
    
    if (this.isReviving) {"""
unit_js = unit_js.replace(draw_start_old, draw_start_new)

# Remove the old shadow application inside the body drawing
old_shadow_body = """    if (this.isShadow) {
      uiElements.ctx.globalAlpha = 0.4;
      uiElements.ctx.filter = 'brightness(0.2)';
    }"""
unit_js = unit_js.replace(old_shadow_body, "")

# And at the end of draw(), restore the top level save
draw_end_old = """    if (this.isRevived || this.isShadow) {
      uiElements.ctx.filter = 'none'; // reset filter
    }
    this.drawHealthBar();
  }"""
draw_end_new = """    if (this.isRevived) {
      uiElements.ctx.filter = 'none'; // reset filter (this one was applied outside of the old save, actually wait, no, the whole thing is in the save now)
    }
    this.drawHealthBar();
    uiElements.ctx.restore(); // Restore globalAlpha and filter from shadow mode
  }"""
unit_js = unit_js.replace(draw_end_old, draw_end_new)


# Remove the old isRevived reset since it's handled by restore
unit_js = unit_js.replace("""    if (this.isRevived) {
      uiElements.ctx.filter = 'none'; // reset filter (this one was applied outside of the old save, actually wait, no, the whole thing is in the save now)
    }""", "")

# Add stealth bar to drawHealthBar
stealth_bar_old = """    const specialBarHeight = 4;
    if ((this.type === 'duelist' || this.type === 'druid' || this.type === 'priest' || this.type === 'troll' || this.type === 'cryomancer' || this.type === 'alchemist' || this.type === 'fortress' || this.type === 'flamecaller') && gameState.isBattleStarted) {"""
stealth_bar_new = """    const specialBarHeight = 4;
    
    if (this.type === 'assassin' && gameState.isBattleStarted) {
        if (this.isShadow) {
           uiElements.ctx.fillStyle = 'rgba(75, 85, 99, 0.5)';
           uiElements.ctx.fillRect(healthBarX, specialBarY, barWidth, specialBarHeight);
           let stealthProgress = 1;
           if (this.shadowTime !== Infinity) {
               stealthProgress = Math.max(0, (this.shadowTime - Date.now()) / 2000);
           }
           uiElements.ctx.fillStyle = '#94a3b8'; // Slate lighter
           uiElements.ctx.fillRect(healthBarX, specialBarY, stealthProgress * barWidth, specialBarHeight);
           specialBarY += specialBarHeight + 1;
        } else if (this.isInitialStealth) {
           uiElements.ctx.fillStyle = 'rgba(75, 85, 99, 0.5)';
           uiElements.ctx.fillRect(healthBarX, specialBarY, barWidth, specialBarHeight);
           let stealthProgress = Math.min(1, this.battleFrames / 30);
           uiElements.ctx.fillStyle = '#475569'; // Slate dark
           uiElements.ctx.fillRect(healthBarX, specialBarY, stealthProgress * barWidth, specialBarHeight);
           specialBarY += specialBarHeight + 1;
        }
    }
    
    if ((this.type === 'duelist' || this.type === 'druid' || this.type === 'priest' || this.type === 'troll' || this.type === 'cryomancer' || this.type === 'alchemist' || this.type === 'fortress' || this.type === 'flamecaller') && gameState.isBattleStarted) {"""
unit_js = unit_js.replace(stealth_bar_old, stealth_bar_new)


with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
