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
const AudioManager = {
    sounds: {},
    init: function() {
        this.sounds.slash = new Audio('js/sfx/slash.mp3');
        this.sounds.arrow = new Audio('js/sfx/arrow.mp3');
        this.sounds.bullet = new Audio('js/sfx/bullet.mp3');
        this.sounds.snipe = new Audio('js/sfx/snipe.mp3');
        this.sounds.slice = new Audio('js/sfx/slice.mp3');
        this.sounds.bite = new Audio('js/sfx/bite.mp3');
        this.sounds.thrust = new Audio('js/sfx/thrust.mp3');
        this.sounds.ice_shards = new Audio('js/sfx/ice-shards.mp3');
        this.sounds.frostwave = new Audio('js/sfx/frostwave.mp3');
        this.sounds.freeze = new Audio('js/sfx/freeze.mp3');
        this.sounds.push = new Audio('js/sfx/push.mp3');
    },
    play: function(name) {
        if(this.sounds[name]) {
            let sound = this.sounds[name].cloneNode();
            sound.volume = 0.3; // keep it a bit quieter so it's not deafening
            
            // Adjust playback rates for specific SFX
            if (name === 'frostwave') {
                sound.playbackRate = 1.8; // play faster
            }
            
            sound.play().catch(e => console.log('Audio play blocked:', e));
        }
    }
};

export { AudioManager };

