import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

old_logic = """        // Needs at least 50% of MAX HP to sacrifice
        if (this.ownedSnakes.length < specs.maxSnakes && this.hp > this.maxHp * 0.5) {
          this.hp -= this.maxHp * 0.5;
          gameState.animations.push(new FloatingText(`-50% HP (Sacrifice)`, this.x, this.y - 10, '#ef4444'));

          const baseAngle = this.team === 1 ? 0 : Math.PI;
          const spawnX = this.x + Math.cos(baseAngle) * 20;
          const spawnY = this.y + Math.sin(baseAngle) * 20;
          const snake = new ShadowSnake(spawnX, spawnY, this.team, this);
          gameState.units.push(snake);
          gameState.allUnitsThisRound.push(snake);
          this.ownedSnakes.push(snake);
        }"""

new_logic = """        if (this.ownedSnakes.length < specs.maxSnakes) {
          if (this.snakesSummoned === undefined) this.snakesSummoned = 0;
          
          let cost = 0;
          let label = '';
          const onePercent = Math.max(1, this.maxHp * 0.01);
          
          if (this.snakesSummoned === 0) {
            if (this.hp > this.maxHp * 0.5) {
              cost = this.maxHp * 0.5;
              label = '-50% HP (Sacrifice)';
            }
          } else {
            if (this.hp > onePercent) {
              cost = this.hp - onePercent;
              label = 'Final Sacrifice!';
            }
          }
          
          if (cost > 0) {
            this.hp -= cost;
            this.snakesSummoned++;
            gameState.animations.push(new FloatingText(label, this.x, this.y - 10, '#ef4444'));

            const baseAngle = this.team === 1 ? 0 : Math.PI;
            const spawnX = this.x + Math.cos(baseAngle) * 20;
            const spawnY = this.y + Math.sin(baseAngle) * 20;
            const snake = new ShadowSnake(spawnX, spawnY, this.team, this);
            gameState.units.push(snake);
            gameState.allUnitsThisRound.push(snake);
            this.ownedSnakes.push(snake);
          }
        }"""

unit_js = unit_js.replace(old_logic, new_logic)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
