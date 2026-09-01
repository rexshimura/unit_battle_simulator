import { gameState, uiElements } from './state.js';
import { UNIT_SPECS } from './config.js';


// =======================================================
// === BATTLE STATISTICS LOGIC ===
// =======================================================

function updateStatsPanel() {
  const statsPanelContent = document.getElementById('stats-panel-content');
  if (!statsPanelContent) return;
  const blueTeamUnits = gameState.allUnitsThisRound.filter(u => u.team === 1);
  const redTeamUnits = gameState.allUnitsThisRound.filter(u => u.team === 2);
  const blueTotalDamage = blueTeamUnits.reduce((sum, u) => sum + u.damageDealt, 0);
  const redTotalDamage = redTeamUnits.reduce((sum, u) => sum + u.damageDealt, 0);
  const blueTotalHealing = blueTeamUnits.reduce((sum, u) => sum + u.healingDone, 0);
  const redTotalHealing = redTeamUnits.reduce((sum, u) => sum + u.healingDone, 0);
  const totalBattleDamage = Math.max(1, blueTotalDamage + redTotalDamage);
  const totalBattleHealing = Math.max(1, blueTotalHealing + redTotalHealing);
  const totalBattleDamageTaken = Math.max(1, gameState.allUnitsThisRound.reduce((sum, u) => sum + u.damageTaken, 0));
  const blueDamagePercent = blueTotalDamage / totalBattleDamage * 100;
  const redDamagePercent = redTotalDamage / totalBattleDamage * 100;
  const blueHealingPercent = blueTotalHealing / totalBattleHealing * 100;
  const redHealingPercent = redTotalHealing / totalBattleHealing * 100;
  let html = `
                <div class="mb-4">
                    <h3 class="text-lg font-bold text-blue-400 mb-2">Blue Team</h3>
                    <div class="space-y-2 text-xs">
                        <div>
                            <p class="text-gray-300 mb-1 flex justify-between"><span>Damage Dealt: ${blueDamagePercent.toFixed(1)}%</span> <span>${Math.round(blueTotalDamage)}</span></p>
                            <div class="stat-bar-container"><div class="stat-bar bg-blue-500" style="width: ${blueDamagePercent}%"></div></div>
                        </div>
                        <div>
                            <p class="text-gray-300 mb-1 flex justify-between"><span>Healing Done: ${blueHealingPercent.toFixed(1)}%</span> <span>${Math.round(blueTotalHealing)}</span></p>
                            <div class="stat-bar-container"><div class="stat-bar bg-green-500" style="width: ${blueHealingPercent}%"></div></div>
                        </div>
                    </div>
                </div>
                 <div class="mb-4">
                    <h3 class="text-lg font-bold text-red-400 mb-2">Red Team</h3>
                     <div class="space-y-2 text-xs">
                        <div>
                             <p class="text-gray-300 mb-1 flex justify-between"><span>Damage Dealt: ${redDamagePercent.toFixed(1)}%</span> <span>${Math.round(redTotalDamage)}</span></p>
                            <div class="stat-bar-container"><div class="stat-bar bg-red-500" style="width: ${redDamagePercent}%"></div></div>
                        </div>
                        <div>
                             <p class="text-gray-300 mb-1 flex justify-between"><span>Healing Done: ${redHealingPercent.toFixed(1)}%</span> <span>${Math.round(redTotalHealing)}</span></p>
                            <div class="stat-bar-container"><div class="stat-bar bg-green-500" style="width: ${redHealingPercent}%"></div></div>
                        </div>
                    </div>
                </div>
                <div id="unit-performance-section" class="border-t border-gray-600 pt-4">
                     <div class="flex justify-between items-center mb-3">
                         <h3 class="text-lg font-bold">Unit Performance</h3>
                         <div class="flex items-center gap-2">
                            <button class="stats-filter-btn ${gameState.isSummarizedView ? 'selected' : ''}" data-action="toggle-summary">Summarize</button>
                         </div>
                     </div>
                     <div id="stats-filter-controls" class="flex items-center gap-2 mb-3">
                        <button class="stats-filter-btn ${gameState.statsFilter === 'all' ? 'selected' : ''}" data-filter="all">All</button>
                        <button class="stats-filter-btn ${gameState.statsFilter === 'alive' ? 'selected' : ''}" data-filter="alive">Alive</button>
                        <button class="stats-filter-btn ${gameState.statsFilter === 'defeated' ? 'selected' : ''}" data-filter="defeated">Defeated</button>
                     </div>
                    <div class="space-y-3">
            `;
  let filteredUnits = [...gameState.allUnitsThisRound];
  if (gameState.statsFilter === 'alive') {
    filteredUnits = filteredUnits.filter(u => u.hp > 0);
  } else if (gameState.statsFilter === 'defeated') {
    filteredUnits = filteredUnits.filter(u => u.hp <= 0);
  }
  filteredUnits.sort((a, b) => b.damageDealt + b.healingDone - (a.damageDealt + a.healingDone)).forEach(unit => {
    const teamColor = unit.team === 1 ? 'text-blue-300' : 'text-red-300';
    const unitName = UNIT_SPECS[unit.type].name;
    const status = unit.hp > 0 ? '' : ' (Defeated)';
    if (gameState.isSummarizedView) {
      html += `
                    <div class="p-2 rounded-lg bg-gray-800/50">
                        <div class="flex justify-between items-center text-sm">
                           <p class="font-bold ${teamColor}">${unitName}${status}</p>
                           <span class="text-xs text-gray-400">Kills: ${unit.kills}</span>
                        </div>
                        <div class="space-y-1 mt-2 text-xs grid grid-cols-[auto,1fr] gap-x-2 items-center">
                            <span class="text-gray-400">Dealt:</span>
                            <div class="w-full bg-gray-900/50 rounded-full"><div class="summary-bar bg-orange-400" style="width: ${unit.damageDealt / totalBattleDamage * 100}%" title="Damage Dealt: ${Math.round(unit.damageDealt)}"></div></div>
                            <span class="text-gray-400">Taken:</span>
                            <div class="w-full bg-gray-900/50 rounded-full"><div class="summary-bar bg-red-400" style="width: ${unit.damageTaken / totalBattleDamageTaken * 100}%" title="Damage Taken: ${Math.round(unit.damageTaken)}"></div></div>
                             ${unit.healingDone > 0 ? `<span class="text-gray-400">Heal:</span><div class="w-full bg-gray-900/50 rounded-full"><div class="summary-bar bg-green-400" style="width: ${unit.healingDone / totalBattleHealing * 100}%" title="Healing Done: ${Math.round(unit.healingDone)}"></div></div>` : ''}
                        </div>
                    </div>
                    `;
    } else {
      const damageDealtPercent = totalBattleDamage > 1 ? `(${(unit.damageDealt / totalBattleDamage * 100).toFixed(1)}%)` : '';
      const healingDonePercent = totalBattleHealing > 1 ? `(${(unit.healingDone / totalBattleHealing * 100).toFixed(1)}%)` : '';
      const damageTakenPercent = totalBattleDamageTaken > 1 ? `(${(unit.damageTaken / totalBattleDamageTaken * 100).toFixed(1)}%)` : '';
      html += `
                        <div class="p-3 rounded-lg bg-gray-800/50">
                            <p class="font-bold ${teamColor}">${unitName}${status}</p>
                            <div class="text-xs grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-gray-300">
                               <span>Damage Dealt:</span> <span class="text-white font-semibold">${Math.round(unit.damageDealt)} ${damageDealtPercent}</span>
                               <span>Healing Done:</span> <span class="text-white font-semibold">${Math.round(unit.healingDone)} ${healingDonePercent}</span>
                               <span>Damage Taken:</span> <span class="text-white font-semibold">${Math.round(unit.damageTaken)} ${damageTakenPercent}</span>
                               <span>Kills:</span> <span class="text-white font-semibold">${unit.kills}</span>
                            </div>
                        </div>
                    `;
    }
  });
  html += `</div></div>`;
  statsPanelContent.innerHTML = html;
}

function initStatsEventListeners() {
  const showStatsBtn = document.getElementById('show-stats-btn');
  const statsPanel = document.getElementById('stats-panel');
  const closeStatsBtn = document.getElementById('close-stats-btn');
  const statsPanelContent = document.getElementById('stats-panel-content');
  showStatsBtn.addEventListener('click', () => {
    updateStatsPanel();
    statsPanel.classList.add('open');
  });
  closeStatsBtn.addEventListener('click', () => {
    statsPanel.classList.remove('open');
  });
  statsPanelContent.addEventListener('click', e => {
    const filterBtn = e.target.closest('[data-filter]');
    const summaryBtn = e.target.closest('[data-action="toggle-summary"]');
    if (filterBtn) {
      gameState.statsFilter = filterBtn.dataset.filter;
    }
    if (summaryBtn) {
      gameState.isSummarizedView = !gameState.isSummarizedView;
    }
    if (filterBtn || summaryBtn) {
      updateStatsPanel();
    }
  });
}

function initHotkeys() {
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    switch (e.key.toLowerCase()) {
      case 'q':
        document.getElementById('inspect-unit-btn').click();
        break;
      case 's':
        const statsPanel = document.getElementById('stats-panel');
        if (statsPanel.classList.contains('open')) {
          document.getElementById('close-stats-btn').click();
        } else {
          document.getElementById('show-stats-btn').click();
        }
        break;
      case 'r':
        document.getElementById('toggle-range-btn').click();
        break;
      case 'x':
        document.getElementById('remove-unit-btn').click();
        break;
    }
  });
}

// =======================================================
// === UI INTERACTION LOGIC ===
// =======================================================

// =======================================================
// === UI INTERACTION LOGIC ===
// =======================================================

function updateInspectTooltip(unit, event) {
  const inspectTooltip = document.getElementById('inspect-tooltip');
  if (!unit || !inspectTooltip) {
    if (inspectTooltip) inspectTooltip.style.display = 'none';
    return;
  }
  const stats = UNIT_SPECS[unit.type];
  const tagsHTML = stats.tags.map(tag => `<span class="bg-gray-600 text-violet-300 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">${tag}</span>`).join('');
  let currentCooldown = unit.attackCooldown;
  let currentDamage = unit.attackDamage;
  if (unit.buffs.bard && Date.now() < unit.buffs.bard.expires) {
    currentCooldown /= 1 + unit.buffs.bard.attackSpeedBoost;
    currentDamage *= 1 + unit.buffs.bard.damageBoost;
  }
  const cooldownProgress = gameState.isBattleStarted ? Math.min(1, (Date.now() - unit.lastAttackTime) / (currentCooldown / gameState.gameSpeed)) * 100 : 0;
  const healthPercentage = unit.hp / unit.maxHp * 100;
  const healthColor = healthPercentage > 50 ? 'bg-green-500' : healthPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500';
  const armorPercentage = unit.armor / unit.maxHp * 100;
  let extraStatsHTML = `
                ${stats.attackDamage > 0 ? `<span class="text-gray-400">Damage:</span> <span class="text-white">${stats.attackDamage}</span>` : ''}
                ${stats.attackRange > 0 ? `<span class="text-gray-400">Range:</span> <span class="text-white">${stats.attackRange}</span>` : ''}
                ${stats.speed > 0 ? `<span class="text-gray-400">Speed:</span> <span class="text-white">${stats.speed}</span>` : ''}
                ${stats.healAmount > 0 ? `<span class="text-gray-400">Heal:</span> <span class="text-white">${stats.healAmount}</span>` : ''}
                ${stats.stunDuration > 0 ? `<span class="text-gray-400">Stun:</span> <span class="text-white">${stats.stunDuration / 1000}s</span>` : ''}
            `;
  inspectTooltip.innerHTML = `
                <div class="flex justify-between items-start">
                    <h3 class="text-lg font-bold ${unit.team === 1 ? 'text-blue-300' : 'text-red-300'} mb-2">${stats.name}</h3>
                     <span class="text-sm font-semibold text-gray-300">${Math.ceil(unit.hp)} + <span class="text-cyan-300">${Math.ceil(unit.armor)}</span> / ${unit.maxHp}</span>
                </div>
                
                <div class="stat-bar-container mb-2 h-3 relative">
                     <div class="stat-bar bg-cyan-500/50 absolute top-0 left-0" style="width: ${armorPercentage}%"></div>
                    <div class="stat-bar ${healthColor}" style="width: ${healthPercentage}%"></div>
                </div>

                <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-2">
                    ${extraStatsHTML}
                </div>
                 <div class="text-sm">
                    <span class="text-gray-400">Cooldown:</span>
                    <div class="progress-bar mt-1">
                        <div class="progress-bar-inner bg-yellow-400" style="width: ${cooldownProgress}%"></div>
                    </div>
                 </div>
                <div class="mt-3 pt-2 border-t border-gray-600">
                    ${tagsHTML}
                </div>
            `;
  inspectTooltip.style.display = 'block';
  if (gameState.trackedUnit) {
    const rect = uiElements.canvas.getBoundingClientRect();
    inspectTooltip.style.left = `${rect.left + unit.x + 20}px`;
    inspectTooltip.style.top = `${rect.top + unit.y - 40}px`;
  } else if (event) {
    inspectTooltip.style.left = `${event.clientX + 15}px`;
    inspectTooltip.style.top = `${event.clientY + 15}px`;
  }
}

function initInteractionEventListeners() {
  const toggleRangeBtn = document.getElementById('toggle-range-btn');
  const eyeIcon = document.getElementById('eye-icon');
  const eyeOffIcon = document.getElementById('eye-off-icon');
  const removeUnitBtn = document.getElementById('remove-unit-btn');
  const inspectUnitBtn = document.getElementById('inspect-unit-btn');
  const stopTrackingBtn = document.getElementById('stop-tracking-btn');
  const canvas = document.getElementById('gameCanvas');
  const removeMessage = document.getElementById('remove-message');
  const inspectMessage = document.getElementById('inspect-message');
  toggleRangeBtn.addEventListener('click', () => {
    gameState.showRangePreview = !gameState.showRangePreview;
    uiElements.eyeIcon.classList.toggle('hidden', !gameState.showRangePreview);
    uiElements.eyeOffIcon.classList.toggle('hidden', gameState.showRangePreview);
  });
  removeUnitBtn.addEventListener('click', () => {
    gameState.isRemoveModeActive = !gameState.isRemoveModeActive;
    removeUnitBtn.classList.toggle('active', gameState.isRemoveModeActive);
    uiElements.canvas.style.cursor = gameState.isRemoveModeActive ? 'pointer' : 'crosshair';
    if (gameState.isRemoveModeActive) {
      if (gameState.isInspectModeActive) inspectUnitBtn.click();
      gameState.selectedUnit = null;
      document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('selected'));
      removeMessage.textContent = 'Click a unit to remove';
      removeMessage.style.opacity = 1;
    } else {
      removeMessage.style.opacity = 0;
      gameState.unitToHighlight = null;
    }
  });
  inspectUnitBtn.addEventListener('click', () => {
    gameState.isInspectModeActive = !gameState.isInspectModeActive;
    inspectUnitBtn.classList.toggle('active', gameState.isInspectModeActive);
    uiElements.canvas.style.cursor = gameState.isInspectModeActive ? 'pointer' : 'crosshair';
    if (gameState.isInspectModeActive) {
      if (gameState.isRemoveModeActive) removeUnitBtn.click();
      inspectMessage.textContent = 'Hover or Click a unit to observe';
      inspectMessage.style.opacity = 1;
    } else {
      inspectMessage.style.opacity = 0;
      gameState.trackedUnit = null;
      stopTrackingBtn.classList.add('hidden');
      document.getElementById('inspect-tooltip').style.display = 'none';
    }
  });
  stopTrackingBtn.addEventListener('click', () => {
    gameState.trackedUnit = null;
    stopTrackingBtn.classList.add('hidden');
    inspectMessage.style.opacity = 1;
    document.getElementById('inspect-tooltip').style.display = 'none';
  });
}

// =======================================================
// === MAIN GAME LOGIC ===
// =======================================================

function selectUnit(type) {
  if (gameState.isRemoveModeActive || gameState.isInspectModeActive) return;
  if (gameState.selectedUnit === type) {
    gameState.selectedUnit = null;
    document.querySelector(`[data-unit-type="${type}"]`).classList.remove('selected');
    uiElements.selectionMessage.style.opacity = 0;
    return;
  }
  gameState.selectedUnit = type;
  document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`[data-unit-type="${type}"]`).classList.add('selected');
  uiElements.selectionMessage.textContent = 'Currently selecting: ' + UNIT_SPECS[type].name;
  uiElements.selectionMessage.style.opacity = 1;
}

export { updateStatsPanel };
export { initStatsEventListeners };
export { initHotkeys };
export { updateInspectTooltip };
export { initInteractionEventListeners };
export { selectUnit };
