
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}
import { gameState, uiElements, initUIElements } from './state.js';
import { UNIT_SPECS } from './config.js';
import { getDistance } from './utils.js';
import { Unit } from './entities/Unit.js';
import { resizeCanvas, AudioManager } from './utils.js';
import { initInteractionEventListeners, initStatsEventListeners, initHotkeys, updateInspectTooltip, selectUnit } from './ui.js';
import { setup, gameLoop, updateUnitCounts, endBattle, resetBattlefield } from './game.js';

initUIElements();
AudioManager.init();

let pendingUnitPlacement = null;

document.getElementById('unit-cancel-btn').addEventListener('click', () => {
    document.getElementById('unit-settings-modal').classList.add('hidden');
    pendingUnitPlacement = null;
});

function placeUnit(newUnit, team) {
    if (gameState.isOneVOneModeActive) {
        const existingUnit = team === 1 ? gameState.oneVOneBlueUnit : gameState.oneVOneRedUnit;
        if (existingUnit) {
            gameState.units = gameState.units.filter(u => u !== existingUnit);
            gameState.allUnitsThisRound = gameState.allUnitsThisRound.filter(u => u.id !== existingUnit.id);
        }
        if (team === 1) gameState.oneVOneBlueUnit = newUnit;
        else gameState.oneVOneRedUnit = newUnit;
    }
    
    gameState.units.push(newUnit);
    gameState.allUnitsThisRound.push(newUnit);
    updateUnitCounts();
}

document.getElementById('unit-confirm-btn').addEventListener('click', () => {
    document.getElementById('unit-settings-modal').classList.add('hidden');
    if (pendingUnitPlacement) {
        const { x, y, team, relX, relY, type } = pendingUnitPlacement;
        let customHp = parseFloat(document.getElementById('unit-hp-input').value);
        if (isNaN(customHp)) customHp = UNIT_SPECS[type].hp;
        let customDamage = parseFloat(document.getElementById('unit-damage-input').value);
        if (isNaN(customDamage)) customDamage = UNIT_SPECS[type].attackDamage;
        let customCooldown = parseFloat(document.getElementById('unit-cooldown-input').value);
        if (isNaN(customCooldown)) customCooldown = UNIT_SPECS[type].attackCooldown;
        let followTarget = document.getElementById('unit-follow-input').checked;
        
        AudioManager.play('game_place_unit');
        let newUnit = new Unit(x, y, team, type, relX, relY);
        newUnit.maxHp = customHp;
        newUnit.hp = customHp;
        newUnit.attackDamage = customDamage;
        newUnit.attackCooldown = customCooldown;
        if (type === 'shooting_dummy') newUnit.followTarget = followTarget;
        
        placeUnit(newUnit, team);
        
        pendingUnitPlacement = null;
    }
});

document.querySelectorAll('.unit-preview-canvas').forEach(canvas => {
  const unitType = canvas.dataset.unitType;
  const ctx = canvas.getContext('2d');
  const originalCtx = uiElements.ctx;
  uiElements.ctx = ctx;
  const dummy = new Unit(20, 20, 1, unitType, 0, 0);
  dummy.color = '#ffffff'; // user requested base color to be white
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dummy.draw();
  uiElements.ctx = originalCtx;
});

window.addEventListener('resize', resizeCanvas);


const collapseBtn = document.getElementById('collapse-btn');
const sidePanel = document.getElementById('side-panel');
if (collapseBtn) {
  collapseBtn.addEventListener('click', () => {
    sidePanel.classList.toggle('collapsed');
  });
}

const viewToggleBtn = document.getElementById('view-toggle-btn');
const viewIconList = document.getElementById('view-icon-list');
const viewIconGrid = document.getElementById('view-icon-grid');
const unitList = document.querySelector('.unit-list');

if (viewToggleBtn) {
  viewToggleBtn.addEventListener('click', () => {
    unitList.classList.toggle('grid-view');
    const isGrid = unitList.classList.contains('grid-view');
    viewIconList.classList.toggle('hidden', !isGrid);
    viewIconGrid.classList.toggle('hidden', isGrid);
  });
}

document.querySelectorAll('.unit-btn').forEach(btn => {
  const unitType = btn.dataset.unitType;
  btn.addEventListener('click', () => selectUnit(unitType));
  btn.addEventListener('mouseenter', () => {
    AudioManager.play('game_hover');
    const stats = UNIT_SPECS[unitType];
    if (!stats) return;
    const tagsHTML = stats.tags.map(tag => `<span class="bg-gray-600 text-violet-300 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">${tag}</span>`).join('');
    let statsHTML = `
                    <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <span class="text-gray-400">HP:</span> <span class="text-white">${stats.hp}</span>
                        <span class="text-gray-400">Speed:</span> <span class="text-white">${stats.speed}</span>
                        <span class="text-gray-400">Damage:</span> <span class="text-white">${stats.attackDamage > 0 ? stats.attackDamage : 'N/A'}</span>
                        <span class="text-gray-400">Heal:</span> <span class="text-white">${stats.healAmount > 0 ? stats.healAmount : 'N/A'}</span>
                        <span class="text-gray-400">Cooldown:</span> <span class="text-white">${stats.attackCooldown > 0 ? stats.attackCooldown + 'ms' : 'N/A'}</span>
                    </div>`;
    uiElements.tooltip.innerHTML = `
                    <h3 class="text-lg font-bold text-violet-300">${stats.name}</h3>
                    <p class="text-xs text-gray-400 mb-3">${stats.description || ''}</p>
                    ${statsHTML}
                    <div class="mt-3 pt-2 border-t border-gray-600">
                        ${tagsHTML}
                    </div>
                `;
    uiElements.tooltip.style.display = 'block';
  });
  btn.addEventListener('mouseleave', () => {
    uiElements.tooltip.style.display = 'none';
  });
});

document.addEventListener('mousemove', e => {
  if (uiElements.tooltip.style.display === 'block') {
    uiElements.tooltip.style.left = `${e.clientX + 15}px`;
    uiElements.tooltip.style.top = `${e.clientY + 15}px`;
  }
});

document.querySelectorAll('[data-tooltip-title]').forEach(el => {
  el.addEventListener('mouseenter', e => {
    AudioManager.play('game_hover');
    const title = el.dataset.tooltipTitle;
    const desc = el.dataset.tooltipDesc;
    uiElements.tooltip.innerHTML = `
                    <h3 class="text-lg font-bold text-violet-300 mb-2">${title}</span>
                    <p class="text-sm text-gray-300">${desc}</p>
                `;
    uiElements.tooltip.style.display = 'block';
  });
  el.addEventListener('mouseleave', () => {
    uiElements.tooltip.style.display = 'none';
  });
});

uiElements.canvas.addEventListener('click', e => {
  const rect = uiElements.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (gameState.isRemoveModeActive) {
    let unitToRemove = null;
    let closestDist = Infinity;
    gameState.units.forEach(unit => {
      const dist = getDistance({
        x,
        y
      }, unit);
      if (dist < unit.width / 2 + 5 && dist < closestDist) {
        unitToRemove = unit;
        closestDist = dist;
      }
    });
    if (unitToRemove) {
      AudioManager.play('game_remove_unit');
      gameState.units = gameState.units.filter(u => u !== unitToRemove);
      gameState.allUnitsThisRound = gameState.allUnitsThisRound.filter(u => u.id !== unitToRemove.id);
      updateUnitCounts();
      gameState.unitToHighlight = null;
    }
    return;
  }
  if (gameState.isInspectModeActive) {
    let unitToTrack = null;
    let closestDist = Infinity;
    gameState.units.forEach(unit => {
      const dist = getDistance({
        x,
        y
      }, unit);
      if (dist < unit.width / 2 + 5 && dist < closestDist) {
        unitToTrack = unit;
        closestDist = dist;
      }
    });
    if (unitToTrack) {
      if (gameState.trackedUnit === unitToTrack) {
        gameState.trackedUnit = null;
        document.getElementById('stop-tracking-btn').classList.add('hidden');
        document.getElementById('inspect-message').style.opacity = 1;
      } else {
        gameState.trackedUnit = unitToTrack;
        document.getElementById('stop-tracking-btn').classList.remove('hidden');
        document.getElementById('inspect-message').style.opacity = 0;
      }
    }
    return;
  }
  if (gameState.isBattleStarted || !gameState.selectedUnit || gameState.isPaused) return;
  const relX = x / uiElements.canvas.width;
  const relY = y / uiElements.canvas.height;
  let newUnit;
  
  if (x < uiElements.canvas.width / 3 || x > uiElements.canvas.width - uiElements.canvas.width / 3) {
      const team = x < uiElements.canvas.width / 3 ? 1 : 2;
      
      if (gameState.isModifyModeActive || gameState.selectedUnit === 'shooting_dummy') {
          pendingUnitPlacement = { x, y, team, relX, relY, type: gameState.selectedUnit };
          const specs = UNIT_SPECS[gameState.selectedUnit];
          document.getElementById('unit-settings-title').textContent = specs.name + ' Settings';
          document.getElementById('unit-hp-input').value = specs.hp;
          document.getElementById('unit-damage-input').value = specs.attackDamage;
          document.getElementById('unit-cooldown-input').value = specs.attackCooldown;
          document.getElementById('unit-follow-container').style.display = gameState.selectedUnit === 'shooting_dummy' ? 'flex' : 'none';
          document.getElementById('unit-settings-modal').classList.remove('hidden');
          return;
      }
      
      AudioManager.play('game_place_unit');
      newUnit = new Unit(x, y, team, gameState.selectedUnit, relX, relY);
      
      placeUnit(newUnit, team);
  }
});

uiElements.canvas.addEventListener('mousemove', e => {
  const rect = uiElements.canvas.getBoundingClientRect();
  gameState.mousePos.x = e.clientX - rect.left;
  gameState.mousePos.y = e.clientY - rect.top;
  gameState.mousePos.onCanvas = true;
  gameState.unitToHighlight = null;
  let closestDist = Infinity;
  for (const unit of gameState.units) {
    const dist = getDistance(gameState.mousePos, unit);
    if (dist < unit.width / 2 + 5 && dist < closestDist) {
      gameState.unitToHighlight = unit;
      closestDist = dist;
    }
  }
  if (gameState.isInspectModeActive && gameState.unitToHighlight && !gameState.trackedUnit) {
    updateInspectTooltip(gameState.unitToHighlight, e);
  } else if (!gameState.trackedUnit) {
    document.getElementById('inspect-tooltip').style.display = 'none';
  }
});

uiElements.canvas.addEventListener('mouseleave', () => {
  gameState.mousePos.onCanvas = false;
  gameState.unitToHighlight = null;
  if (!gameState.trackedUnit) document.getElementById('inspect-tooltip').style.display = 'none';
});

uiElements.startBattleBtn.addEventListener('click', () => {
  if (gameState.isBattleStarted) {
    AudioManager.play('game_click');
    endBattle("Battle Stopped");
    setup();
    return;
  }
  if (gameState.units.length === 0) return;
  gameState.initialUnitPlacement = gameState.units.map(u => ({
    x: u.x,
    y: u.y,
    team: u.team,
    type: u.type,
    relX: u.relX,
    relY: u.relY
  }));
  if (gameState.isPaused) {
    gameState.isPaused = false;
    uiElements.pauseBtn.innerHTML = uiElements.pauseIconSVG;
  }
  AudioManager.play('game_start');
  gameState.isBattleStarted = true;
  gameState.units.forEach(u => {
    if (u.type === 'sniper') {
      u.lastAttackTime = Date.now();
    }
  });
  uiElements.startBattleBtn.innerHTML = uiElements.stopIconSVG;
  document.querySelectorAll('.unit-btn').forEach(b => b.disabled = true);
  gameState.isRemoveModeActive = false;
  document.getElementById('remove-unit-btn').classList.remove('active');
  document.getElementById('remove-message').style.opacity = 0;
  gameState.unitToHighlight = null;
  uiElements.canvas.style.cursor = 'crosshair';
  gameState.selectedUnit = null;
  uiElements.selectionMessage.style.opacity = 0;
  document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('selected'));
});

uiElements.pauseBtn.addEventListener('click', () => {
  if (!gameState.isBattleStarted) return;
  AudioManager.play('game_click');
  gameState.isPaused = !gameState.isPaused;
  uiElements.pauseBtn.innerHTML = gameState.isPaused ? uiElements.playIconSVG : uiElements.pauseIconSVG;
});

uiElements.speedControls.addEventListener('click', e => {
  const speedBtn = e.target.closest('.speed-btn');
  if (speedBtn) {
    AudioManager.play('game_click');
    gameState.gameSpeed = parseFloat(speedBtn.dataset.speed);
    document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('selected'));
    speedBtn.classList.add('selected');
  }
});

uiElements.resetBtn.addEventListener('click', () => {
  AudioManager.play('game_click');
  resetBattlefield();
});

uiElements.roleSorter.addEventListener('click', e => {
  const roleBtn = e.target.closest('.role-btn');
  if (roleBtn) {
    const selectedRole = roleBtn.dataset.role;
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('selected'));
    roleBtn.classList.add('selected');
    document.querySelectorAll('.unit-btn').forEach(unitBtn => {
      if (selectedRole === 'all') {
        unitBtn.classList.remove('filtered-out');
      } else {
        const unitType = unitBtn.dataset.unitType;
        const unitTags = UNIT_SPECS[unitType].tags;
        unitBtn.classList.toggle('filtered-out', !unitTags.includes(selectedRole));
      }
    });
    const uniqueSeparator = document.getElementById('unique-separator');
    if (uniqueSeparator) {
       uniqueSeparator.classList.toggle('hidden', !['all', 'Sorcerers', 'Breachers', 'Interceptors', 'Controllers', 'Infiltrators'].includes(selectedRole));
    }
  }
});

initInteractionEventListeners();

initStatsEventListeners();

initHotkeys();

resizeCanvas();

setup();

uiElements.eyeIcon.classList.toggle('hidden', !gameState.showRangePreview);

uiElements.eyeOffIcon.classList.toggle('hidden', gameState.showRangePreview);

gameLoop();

