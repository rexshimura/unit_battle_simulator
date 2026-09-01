import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
effects_path = os.path.join(base_dir, 'js', 'entities', 'Effects.js')

with open(effects_path, 'r', encoding='utf-8') as f:
    effects_js = f.read()

old_slash = """class SlashAnimation {
  constructor(caster) {
    this.caster = caster;
    this.angle = Math.atan2(caster.target.y - caster.y, caster.target.x - caster.x);
    this.radius = caster.attackRange * 1.5;
    this.duration = 15;
    this.maxDuration = 15;
  }
  update() {
    this.duration -= 1 * gameState.gameSpeed;
    if (this.duration > this.maxDuration / 2 && Math.random() > 0.5) {
      const progress = 1 - this.duration / this.maxDuration;
      const arcWidth = Math.PI / 1.5;
      const particleAngle = this.angle - arcWidth / 2 + arcWidth * progress;
      const pX = this.caster.x + Math.cos(particleAngle) * this.radius;
      const pY = this.caster.y + Math.sin(particleAngle) * this.radius;
      gameState.particles.push(new Particle(pX, pY, this.caster.team));
    }
    return this.duration > 0;
  }
  draw() {
    const progress = 1 - this.duration / this.maxDuration;
    const alpha = Math.sin(progress * Math.PI);
    const arcWidth = Math.PI / 1.5;
    uiElements.ctx.save();
    uiElements.ctx.translate(this.caster.x, this.caster.y);
    uiElements.ctx.rotate(this.angle - arcWidth / 2);
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(0, 0, this.radius, 0, arcWidth * progress);
    uiElements.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
    uiElements.ctx.lineWidth = 1 + 3 * alpha;
    uiElements.ctx.stroke();
    uiElements.ctx.restore();
  }
}"""

new_slash = """class SlashAnimation {
  constructor(caster, color = '255, 255, 255') {
    this.caster = caster;
    this.color = color;
    this.angle = Math.atan2(caster.target.y - caster.y, caster.target.x - caster.x);
    this.radius = caster.attackRange * 1.5;
    this.duration = 15;
    this.maxDuration = 15;
  }
  update() {
    this.duration -= 1 * gameState.gameSpeed;
    if (this.duration > this.maxDuration / 2 && Math.random() > 0.5) {
      const progress = 1 - this.duration / this.maxDuration;
      const arcWidth = Math.PI / 1.5;
      const particleAngle = this.angle - arcWidth / 2 + arcWidth * progress;
      const pX = this.caster.x + Math.cos(particleAngle) * this.radius;
      const pY = this.caster.y + Math.sin(particleAngle) * this.radius;
      gameState.particles.push(new Particle(pX, pY, this.caster.team));
    }
    return this.duration > 0;
  }
  draw() {
    const progress = 1 - this.duration / this.maxDuration;
    const alpha = Math.sin(progress * Math.PI);
    const arcWidth = Math.PI / 1.5;
    uiElements.ctx.save();
    uiElements.ctx.translate(this.caster.x, this.caster.y);
    uiElements.ctx.rotate(this.angle - arcWidth / 2);
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(0, 0, this.radius, 0, arcWidth * progress);
    uiElements.ctx.strokeStyle = `rgba(${this.color}, ${alpha * 0.8})`;
    uiElements.ctx.lineWidth = 1 + 3 * alpha;
    uiElements.ctx.stroke();
    uiElements.ctx.restore();
  }
}"""

effects_js = effects_js.replace(old_slash, new_slash)

with open(effects_path, 'w', encoding='utf-8') as f:
    f.write(effects_js)
