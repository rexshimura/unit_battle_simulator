import { gameState, uiElements } from './state.js';

function resizeCanvas() {
  const container = uiElements.canvas.parentElement;
  uiElements.canvas.width = container.clientWidth;
  uiElements.canvas.height = container.clientHeight;
  gameState.units.forEach(unit => {
    unit.x = unit.relX * uiElements.canvas.width;
    unit.y = unit.relY * uiElements.canvas.height;
  });
}

function getDistance(obj1, obj2) {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function drawLightningBolt(startX, startY, endX, endY, segments) {
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx, dy * dy);
  const angle = Math.atan2(dy, dx);
  const segmentLength = length / segments;
  uiElements.ctx.beginPath();
  uiElements.ctx.moveTo(startX, startY);
  for (let i = 1; i < segments; i++) {
    const pos = i * segmentLength;
    const offsetX = Math.cos(angle) * pos;
    const offsetY = Math.sin(angle) * pos;
    const perpendicularAngle = angle + Math.PI / 2;
    const randomOffset = (Math.random() - 0.5) * 20 * (1 - Math.abs(i - segments / 2) / (segments / 2));
    const pointX = startX + offsetX + Math.cos(perpendicularAngle) * randomOffset;
    const pointY = startY + offsetY + Math.sin(perpendicularAngle) * randomOffset;
    uiElements.ctx.lineTo(pointX, pointY);
  }
  uiElements.ctx.lineTo(endX, endY);
}

export { resizeCanvas };
export { getDistance };
export { drawLightningBolt };
