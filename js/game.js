import { gameState, uiElements } from './state.js';
import { UNIT_SPECS } from './config.js';
import { getDistance } from './utils.js';
import { Unit } from './entities/Unit.js';
import { updateStatsPanel } from './ui.js';

function update() {
  if (!gameState.isBattleStarted) return;
  const team1Units = gameState.units.filter(u => u.team === 1);
  const team2Units = gameState.units.filter(u => u.team === 2);
  gameState.units.forEach(unit => unit.update(unit.team === 1 ? team1Units : team2Units, unit.team === 1 ? team2Units : team1Units));
  gameState.projectiles = gameState.projectiles.filter(p => p.update(p.team === 1 ? team2Units : team1Units));
  gameState.animations = gameState.animations.filter(a => a.update());
  gameState.particles = gameState.particles.filter(p => p.update());
  const unitsAliveBefore = gameState.units.length;
  gameState.units = gameState.units.filter(u => u.hp > 0);
  if (gameState.units.length < unitsAliveBefore) updateUnitCounts();
  const team1Alive = gameState.units.some(u => u.team === 1);
  const team2Alive = gameState.units.some(u => u.team === 2);
  if ((team1Units.length > 0 || team2Units.length > 0) && gameState.isBattleStarted) {
    if (team1Alive && !team2Alive && team2Units.length > 0) endBattle("Blue Team Wins!");else if (!team1Alive && team2Alive && team1Units.length > 0) endBattle("Red Team Wins!");else if (!team1Alive && !team2Alive && team1Units.length > 0 && team2Units.length > 0) endBattle("Draw!");
  }
}

function draw() {
  uiElements.ctx.clearRect(0, 0, uiElements.canvas.width, uiElements.canvas.height);
  uiElements.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
  uiElements.ctx.fillRect(0, 0, uiElements.canvas.width / 3, uiElements.canvas.height);
  uiElements.ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
  uiElements.ctx.fillRect(uiElements.canvas.width - uiElements.canvas.width / 3, 0, uiElements.canvas.width / 3, uiElements.canvas.height);
  if (gameState.showRangePreview && !gameState.isInspectModeActive) {
    gameState.units.forEach(unit => {
      const specs = UNIT_SPECS[unit.type];
      let range = specs.attackRange;
      if (unit.type === 'priest' || unit.type === 'druid') range = specs.healRadius || specs.attackRange;
      if (unit.type === 'bard') range = specs.buffRadius;
      let color = unit.team === 1 ? '#60a5fa' : '#f87171';
      if (range > 0) {
        uiElements.ctx.beginPath();
        uiElements.ctx.arc(unit.x, unit.y, range, 0, Math.PI * 2);
        uiElements.ctx.globalAlpha = 0.05;
        uiElements.ctx.fillStyle = color;
        uiElements.ctx.fill();
        uiElements.ctx.globalAlpha = 0.2;
        uiElements.ctx.strokeStyle = color;
        uiElements.ctx.lineWidth = 1;
        uiElements.ctx.setLineDash([5, 10]);
        uiElements.ctx.stroke();
        uiElements.ctx.setLineDash([]);
        uiElements.ctx.globalAlpha = 1.0;
      }
      
      if (unit.type === 'assassin') {
        uiElements.ctx.beginPath();
        uiElements.ctx.arc(unit.x, unit.y, 200, 0, Math.PI * 2);
        uiElements.ctx.globalAlpha = 0.15;
        uiElements.ctx.strokeStyle = '#475569';
        uiElements.ctx.lineWidth = 2;
        uiElements.ctx.setLineDash([4, 8]);
        uiElements.ctx.stroke();
        uiElements.ctx.setLineDash([]);
        uiElements.ctx.globalAlpha = 1.0;
      }
    });
  }
  gameState.projectiles.forEach(p => p.draw());
  gameState.particles.forEach(p => p.draw());
  gameState.animations.forEach(a => a.draw());
  gameState.units.forEach(unit => unit.draw());
  if (gameState.selectedUnit && gameState.mousePos.onCanvas && !gameState.isBattleStarted) {
    const specs = UNIT_SPECS[gameState.selectedUnit];
    uiElements.ctx.fillStyle = gameState.mousePos.x < uiElements.canvas.width / 3 ? specs.color.team1 : specs.color.team2;
    uiElements.ctx.globalAlpha = 0.6;
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(gameState.mousePos.x, gameState.mousePos.y, 10, 0, Math.PI * 2);
    uiElements.ctx.fill();
    let range = specs.attackRange;
    if (specs.healRadius) range = specs.healRadius;
    if (specs.buffRadius) range = specs.buffRadius;
    if (gameState.showRangePreview && range > 0) {
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(gameState.mousePos.x, gameState.mousePos.y, range, 0, Math.PI * 2);
      uiElements.ctx.setLineDash([8, 12]);
      uiElements.ctx.strokeStyle = gameState.mousePos.x < uiElements.canvas.width / 3 ? 'rgba(96, 165, 250, 0.4)' : 'rgba(248, 113, 113, 0.4)';
      uiElements.ctx.lineWidth = 1.5;
      uiElements.ctx.stroke();
      uiElements.ctx.setLineDash([]);
      uiElements.ctx.globalAlpha = 1.0;
    }
  }
  const unitUnderMouse = gameState.trackedUnit || gameState.isInspectModeActive && gameState.unitToHighlight || gameState.isRemoveModeActive && gameState.unitToHighlight;
  if (unitUnderMouse) {
    const isInspecting = gameState.isInspectModeActive || gameState.trackedUnit;
    const highlightColor = isInspecting ? 'rgba(167, 139, 250, 0.8)' : 'rgba(239, 68, 68, 0.8)';
    uiElements.ctx.save();
    uiElements.ctx.globalCompositeOperation = 'lighter';
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(unitUnderMouse.x, unitUnderMouse.y, unitUnderMouse.width / 2 + 8, 0, Math.PI * 2);
    uiElements.ctx.fillStyle = highlightColor.replace('0.8', '0.7');
    uiElements.ctx.filter = 'blur(8px)';
    uiElements.ctx.fill();
    uiElements.ctx.restore();
    uiElements.ctx.beginPath();
    uiElements.ctx.arc(unitUnderMouse.x, unitUnderMouse.y, unitUnderMouse.width / 2 + 4, 0, Math.PI * 2);
    uiElements.ctx.strokeStyle = highlightColor;
    uiElements.ctx.lineWidth = 3;
    uiElements.ctx.stroke();
    const specs = UNIT_SPECS[unitUnderMouse.type];
    let range = specs.attackRange;
    if (specs.healRadius) range = specs.healRadius;
    if (specs.buffRadius) range = specs.buffRadius;
    if (isInspecting && range > 0) {
      uiElements.ctx.beginPath();
      uiElements.ctx.arc(unitUnderMouse.x, unitUnderMouse.y, range, 0, Math.PI * 2);
      uiElements.ctx.setLineDash([8, 12]);
      uiElements.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      uiElements.ctx.lineWidth = 1.5;
      uiElements.ctx.stroke();
      uiElements.ctx.setLineDash([]);
    }
  }
  if (gameState.isPaused && gameState.isBattleStarted) {
    uiElements.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    uiElements.ctx.fillRect(0, 0, uiElements.canvas.width, uiElements.canvas.height);
    uiElements.ctx.fillStyle = 'white';
    uiElements.ctx.font = '50px "Roboto Mono"';
    uiElements.ctx.textAlign = 'center';
    uiElements.ctx.textBaseline = 'middle';
    uiElements.ctx.fillText('PAUSED', uiElements.canvas.width / 2, uiElements.canvas.height / 2);
  }
}

function gameLoop() {
  if (!gameState.isPaused) {
    update();
    gameState.statsUpdateCounter++;
    if (gameState.isBattleStarted && document.getElementById('stats-panel').classList.contains('open') && gameState.statsUpdateCounter >= gameState.STATS_UPDATE_INTERVAL) {
      updateStatsPanel();
      gameState.statsUpdateCounter = 0;
    }
  }
  draw();
  if (gameState.trackedUnit) updateInspectTooltip(gameState.trackedUnit);
  requestAnimationFrame(gameLoop);
}

function setup() {
  gameState.initialUnitPlacement = [];
  gameState.isBattleStarted = false;
  gameState.isPaused = false;
  gameState.gameSpeed = 1.0;
  gameState.isRemoveModeActive = false;
  gameState.isInspectModeActive = false;
  gameState.trackedUnit = null;
  gameState.nextUnitId = 0;
  gameState.statsFilter = 'all';
  gameState.isSummarizedView = false;
  document.getElementById('remove-unit-btn').classList.remove('active');
  document.getElementById('inspect-unit-btn').classList.remove('active');
  document.getElementById('stop-tracking-btn').classList.add('hidden');
  uiElements.canvas.style.cursor = 'crosshair';
  uiElements.startBattleBtn.innerHTML = uiElements.playIconSVG;
  uiElements.pauseBtn.innerHTML = uiElements.pauseIconSVG;
  document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector('.speed-btn[data-speed="1.0"]').classList.add('selected');
  gameState.units = [];
  gameState.allUnitsThisRound = [];
  gameState.projectiles = [];
  gameState.animations = [];
  gameState.particles = [];
  updateUnitCounts();
  gameState.selectedUnit = null;
  document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('.unit-btn').forEach(b => b.disabled = false);
  uiElements.statusMessage.style.opacity = 0;
  uiElements.statusMessage.textContent = '';
  uiElements.selectionMessage.style.opacity = 0;
  uiElements.selectionMessage.textContent = '';
  document.getElementById('remove-message').style.opacity = 0;
  document.getElementById('inspect-message').style.opacity = 0;
  gameState.unitToHighlight = null;
  document.getElementById('stats-panel-content').innerHTML = '';
}

function resetBattlefield() {
  gameState.isBattleStarted = false;
  gameState.isPaused = false;
  gameState.projectiles = [];
  gameState.animations = [];
  gameState.particles = [];
  gameState.units = [];
  gameState.allUnitsThisRound = [];
  gameState.nextUnitId = 0;
  if (gameState.initialUnitPlacement.length > 0) {
    gameState.initialUnitPlacement.forEach(proto => {
      const newUnit = new Unit(proto.x, proto.y, proto.team, proto.type, proto.relX, proto.relY);
      gameState.units.push(newUnit);
      gameState.allUnitsThisRound.push(newUnit);
    });
  }
  uiElements.startBattleBtn.innerHTML = uiElements.playIconSVG;
  uiElements.pauseBtn.innerHTML = uiElements.pauseIconSVG;
  document.querySelectorAll('.unit-btn').forEach(b => b.disabled = false);
  uiElements.statusMessage.style.opacity = 0;
  uiElements.statusMessage.textContent = '';
  updateUnitCounts();
}

function updateUnitCounts() {
  uiElements.blueCountDisplay.textContent = gameState.units.filter(u => u.team === 1).length;
  uiElements.redCountDisplay.textContent = gameState.units.filter(u => u.team === 2).length;
}

function endBattle(message) {
  gameState.isBattleStarted = false;
  uiElements.statusMessage.textContent = message;
  uiElements.statusMessage.style.opacity = 1;
  uiElements.startBattleBtn.innerHTML = uiElements.playIconSVG;
  if (document.getElementById('stats-panel').classList.contains('open')) updateStatsPanel();
}

export { update };
export { draw };
export { gameLoop };
export { setup };
export { resetBattlefield };
export { updateUnitCounts };
export { endBattle };
