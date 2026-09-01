import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_tether = """    // Tether to summoner (Drags the summoner)
    if (this.summoner) {
      const tetherRange = 250;
      const distToSummoner = getDistance(this, this.summoner);
      if (distToSummoner > tetherRange) {
        const pullAngle = Math.atan2(this.y - this.summoner.y, this.x - this.summoner.x);
        const pullDist = distToSummoner - tetherRange;
        
        // Pull the summoner
        this.summoner.x += Math.cos(pullAngle) * pullDist;
        this.summoner.y += Math.sin(pullAngle) * pullDist;
        
        // Keep summoner in bounds
        const sRadius = this.summoner.width / 2;
        this.summoner.x = Math.max(sRadius, Math.min(this.summoner.x, uiElements.canvas.width - sRadius));
        this.summoner.y = Math.max(sRadius, Math.min(this.summoner.y, uiElements.canvas.height - sRadius));
      }
    }"""

new_tether = """    // Tether to summoner (Drags the summoner, but summoner resists!)
    if (this.summoner) {
      const tetherRange = 250;
      const distToSummoner = getDistance(this, this.summoner);
      if (distToSummoner > tetherRange) {
        const pullAngle = Math.atan2(this.y - this.summoner.y, this.x - this.summoner.x);
        const pullDist = distToSummoner - tetherRange;
        
        // The summoner is heavy and resists! 
        // Snake only manages to drag the summoner 15% of the excess distance, 
        // while the snake is held back by the remaining 85%.
        const summonerDragFactor = 0.15;
        const snakePullBackFactor = 1 - summonerDragFactor;
        
        // Drag the summoner forward
        this.summoner.x += Math.cos(pullAngle) * pullDist * summonerDragFactor;
        this.summoner.y += Math.sin(pullAngle) * pullDist * summonerDragFactor;
        
        // Yank the snake back (so the tether doesn't exceed 250px)
        this.x -= Math.cos(pullAngle) * pullDist * snakePullBackFactor;
        this.y -= Math.sin(pullAngle) * pullDist * snakePullBackFactor;
        
        // Keep summoner in bounds
        const sRadius = this.summoner.width / 2;
        this.summoner.x = Math.max(sRadius, Math.min(this.summoner.x, uiElements.canvas.width - sRadius));
        this.summoner.y = Math.max(sRadius, Math.min(this.summoner.y, uiElements.canvas.height - sRadius));
      }
    }"""

unit_js = unit_js.replace(old_tether, new_tether)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
