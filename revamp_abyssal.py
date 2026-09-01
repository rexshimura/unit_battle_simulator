import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"

# 1. Update config.js
config_path = os.path.join(base_dir, 'js', 'config.js')
with open(config_path, 'r', encoding='utf-8') as f:
    config = f.read()

old_abyssal = r"'abyssal_summoner': \{.*?\},"
new_abyssal = "'abyssal_summoner': {description: 'Sacrifices 50% Max HP to spawn an Evil Snake', name: 'Abyssal Summoner', tags: ['Ranged', 'Support'], hp: 300, speed: 0.2, attackDamage: 0, attackRange: 0, attackCooldown: 3000, color: {team1: '#60a5fa', team2: '#f87171'}, maxSnakes: 1, snakeHp: 400, snakeDamage: 30, snakeSpeed: 1.6, snakeAttackRange: 35},"
config = re.sub(old_abyssal, new_abyssal, config)

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config)

# 2. Update Unit.js
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# Update summoning logic
old_summon_logic = """      if (this.type === 'abyssal_summoner') {
        const specs = UNIT_SPECS.abyssal_summoner;
        this.ownedSnakes = this.ownedSnakes.filter(s => s.hp > 0 && gameState.units.includes(s));
        if (this.ownedSnakes.length < specs.maxSnakes) {
          const sideOffset = this.ownedSnakes.length % 2 === 0 ? 1 : -1;
          const baseAngle = this.team === 1 ? 0 : Math.PI;
          const spawnX = this.x + Math.cos(baseAngle + Math.PI / 2 * sideOffset) * 15;
          const spawnY = this.y + Math.sin(baseAngle + Math.PI / 2 * sideOffset) * 15;
          const snake = new ShadowSnake(spawnX, spawnY, this.team, this);
          gameState.units.push(snake);
          gameState.allUnitsThisRound.push(snake);
          this.ownedSnakes.push(snake);
        }
        return;
      }"""

new_summon_logic = """      if (this.type === 'abyssal_summoner') {
        const specs = UNIT_SPECS.abyssal_summoner;
        this.ownedSnakes = this.ownedSnakes.filter(s => s.hp > 0 && gameState.units.includes(s));
        // Needs at least 50% of MAX HP to sacrifice
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
        }
        return;
      }"""

unit_js = unit_js.replace(old_summon_logic, new_summon_logic)

# Replace ShadowSnake class
old_snake_class_match = re.search(r"class ShadowSnake extends Unit \{[\s\S]*?\}\n\nclass", unit_js)
if not old_snake_class_match:
    # try matching till end of file if it's the last class
    old_snake_class_match = re.search(r"class ShadowSnake extends Unit \{[\s\S]*", unit_js)

old_snake_class = old_snake_class_match.group(0)

new_snake_class = """class ShadowSnake extends Unit {
  constructor(x, y, team, summoner) {
    super(x, y, team, 'swordsman', x / uiElements.canvas.width, y / uiElements.canvas.height);
    const specs = UNIT_SPECS.abyssal_summoner;
    this.hp = specs.snakeHp;
    this.maxHp = specs.snakeHp;
    this.speed = specs.snakeSpeed;
    this.attackDamage = specs.snakeDamage;
    this.attackRange = specs.snakeAttackRange || 35;
    this.summoner = summoner;
    this.width = 24;
    this.height = 24;
    this.color = team === 1 ? '#1e3a8a' : '#7f1d1d'; // dark team colors
    this.wiggleOffset = Math.random() * Math.PI * 2;
    this.attackCooldown = 800; // Attack speed of the snake
  }
  update(friendlies, enemies) {
    if (!this.summoner || this.summoner.hp <= 0) {
      this.hp = 0; // Dies if owner dies
      return;
    }
    
    // Attack cooldown logic
    if (this.lastAttackTime === undefined) this.lastAttackTime = 0;
    
    if (enemies.length > 0) {
      const sortedEnemies = [...enemies].sort((a, b) => getDistance(this, a) - getDistance(this, b));
      this.target = sortedEnemies[0];
      
      if (this.target) {
        const dist = getDistance(this, this.target);
        if (dist <= this.attackRange) {
          const now = Date.now();
          if (now - this.lastAttackTime > this.attackCooldown / gameState.gameSpeed) {
            this.lastAttackTime = now;
            this.target.takeDamage(this.attackDamage, this);
            gameState.animations.push(new SlashAnimation(this));
          }
        } else {
          // Wiggle towards target
          const baseAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
          this.wiggleOffset += 0.15 * gameState.gameSpeed;
          const curveAngle = baseAngle + Math.sin(this.wiggleOffset) * 0.4;
          this.x += Math.cos(curveAngle) * this.speed * gameState.gameSpeed;
          this.y += Math.sin(curveAngle) * this.speed * gameState.gameSpeed;
        }
      }
    }
    
    const radius = this.width / 2;
    this.x = Math.max(radius, Math.min(this.x, uiElements.canvas.width - radius));
    this.y = Math.max(radius, Math.min(this.y, uiElements.canvas.height - radius));
  }
  draw() {
    // Draw link to summoner
    if (this.summoner && this.summoner.hp > 0) {
      uiElements.ctx.save();
      uiElements.ctx.beginPath();
      uiElements.ctx.moveTo(this.x, this.y);
      uiElements.ctx.lineTo(this.summoner.x, this.summoner.y);
      uiElements.ctx.strokeStyle = this.team === 1 ? 'rgba(96, 165, 250, 0.4)' : 'rgba(248, 113, 113, 0.4)';
      uiElements.ctx.lineWidth = 4;
      uiElements.ctx.setLineDash([5, 5]);
      uiElements.ctx.stroke();
      uiElements.ctx.restore();
    }

    uiElements.ctx.save();
    uiElements.ctx.translate(this.x, this.y);
    let angle = 0;
    if (this.target) {
      angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    }
    uiElements.ctx.rotate(angle);
    uiElements.ctx.fillStyle = this.color;
    
    // Draw large evil snake body
    const segments = 6;
    for (let i = 0; i < segments; i++) {
      const segOffset = -i * 6;
      const currentW = Math.max(5, 18 - i * 2);
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(segOffset, Math.sin(Date.now() / 80 + i + this.wiggleOffset) * 6, currentW / 2, 0, Math.PI * 2);
      uiElements.ctx.fill();
    }
    
    // Draw evil eyes
    uiElements.ctx.fillStyle = '#ef4444'; // glowing red eyes
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(4, -4, 2.5, 0, Math.PI * 2);
    uiElements.ctx.fill();
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(4, 4, 2.5, 0, Math.PI * 2);
    uiElements.ctx.fill();
    
    uiElements.ctx.restore();
    super.drawHealthBar();
  }
}
"""

if "class ShadowSnake extends Unit" in old_snake_class:
    unit_js = unit_js.replace(old_snake_class, new_snake_class + ("\n\nclass" if old_snake_class.endswith("class") else ""))
else:
    print("Could not find ShadowSnake class!")

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
