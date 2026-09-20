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
        this.sounds.eagle_release = new Audio('js/sfx/eagle-release.mp3');
        this.sounds.eagle_bite = new Audio('js/sfx/eagle-bite.mp3');
        this.sounds.rifle = new Audio('js/sfx/rifle.mp3');
        this.sounds.beam = new Audio('js/sfx/beam.mp3');
        this.sounds.charged_beam = new Audio('js/sfx/charged_beam.mp3');
        this.sounds.fireball = new Audio('js/sfx/fireball.mp3');
        this.sounds.small_fireball = new Audio('js/sfx/small-fireball.mp3');
        this.sounds.fireball_hit = new Audio('js/sfx/fireballhit.mp3');
        this.sounds.stomp = new Audio('js/sfx/stomp.mp3');
        this.sounds.rock_smash = new Audio('js/sfx/rock_smash.mp3');
        this.sounds.zap = new Audio('js/sfx/zap.mp3');
        this.sounds.hammer = new Audio('js/sfx/hammer.mp3');
        this.sounds.chain_release = new Audio('js/sfx/chain-release.mp3');
        this.sounds.chain_hit_1 = new Audio('js/sfx/chain-hit-1.mp3');
        this.sounds.chain_hit_2 = new Audio('js/sfx/chain-hit-2.mp3');
        this.sounds.chain_lock = new Audio('js/sfx/chain-lock.mp3');
        this.sounds.snake_release = new Audio('js/sfx/snake_release.mp3');
        this.sounds.snake_crawling = new Audio('js/sfx/snake_crawling.mp3');
        this.sounds.harp = new Audio('js/sfx/harp.mp3');
        this.sounds.harp2 = new Audio('js/sfx/harp2.mp3');
        this.sounds.harp3 = new Audio('js/sfx/harp3.mp3');
        this.sounds.aoe_heal = new Audio('js/sfx/aoe-heal.mp3');
        this.sounds.aoe_applyshield = new Audio('js/sfx/aoe-applyshield.mp3');
        this.sounds.druid_heal = new Audio('js/sfx/druid-heal.mp3');
        this.sounds.druid_aoeheal = new Audio('js/sfx/druid-aoeheal.mp3');
        this.sounds.poison_dart = new Audio('js/sfx/poison-dart.mp3');
        this.sounds.potion_throw = new Audio('js/sfx/potion-throw.mp3');
        this.sounds.game_hover = new Audio('js/sfx/game-hover.mp3');
        this.sounds.game_click = new Audio('js/sfx/game-click.mp3');
        this.sounds.game_start = new Audio('js/sfx/game-start.mp3');
        this.sounds.game_place_unit = new Audio('js/sfx/game-place-unit.mp3');
        this.sounds.game_remove_unit = new Audio('js/sfx/game-remove-unit.mp3');
        this.sounds.shot_nail = new Audio('js/sfx/shot-nail.mp3');
        this.sounds.create_sentry = new Audio('js/sfx/create-sentry.mp3');
        this.sounds.sentry_shot = new Audio('js/sfx/sentry-shot.mp3');
        this.sounds.force_wall_deflect = new Audio('js/sfx/force-wall-deflect.mp3');
        this.sounds.force_wall_hit = new Audio('js/sfx/force-wall-hit.mp3');
        this.sounds.force_wall_deflect_activation = new Audio('js/sfx/force-wall-deflect-activation.mp3');
    },
    stopAll: function() {
        // Pause and reset every registered sound — cleans up lingering SFX on game end
        for (const sound of Object.values(this.sounds)) {
            try {
                sound.pause();
                sound.currentTime = 0;
            } catch(e) {}
        }
    },
    play: function(name) {
        if (name === 'rifle' || name === 'eagle_release' || name === 'eagle_bite') {
            console.log('AudioManager playing:', name, 'Exists:', !!this.sounds[name], 'Audio Src:', this.sounds[name] ? this.sounds[name].src : 'N/A');
        }
        if(this.sounds[name]) {
            let sound = this.sounds[name].cloneNode();
            sound.volume = 0.3; // keep it a bit quieter so it's not deafening
            
            // Adjust playback rates for specific SFX
            if (name === 'frostwave') {
                sound.playbackRate = 1.8; // play faster
            }
            if (name === 'eagle_release' || name === 'eagle_bite' || name === 'rifle' || name === 'beam' || name === 'charged_beam') {
                sound.volume = 1.0; // Max volume for hunter SFX to ensure they are heard
            }
            
            sound.play().catch(e => console.log('Audio play blocked:', e));
        }
    }
};

export { AudioManager };

