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
                ${unit.type !== 'dummy' && unit.type !== 'boss_dummy' && stats.attackDamage > 0 ? `<span class="text-gray-400">Damage:</span> <span class="text-white">${stats.attackDamage}</span>` : ''}
                ${unit.type === 'shooting_dummy' ? `<span class="text-gray-400">Damage:</span> <span class="text-white">${unit.attackDamage}</span>` : ''}
                ${stats.attackRange > 0 ? `<span class="text-gray-400">Range:</span> <span class="text-white">${stats.attackRange}</span>` : ''}
                ${stats.speed > 0 ? `<span class="text-gray-400">Speed:</span> <span class="text-white">${stats.speed}</span>` : ''}
                ${stats.healAmount > 0 ? `<span class="text-gray-400">Heal:</span> <span class="text-white">${stats.healAmount}</span>` : ''}
                ${stats.stunDuration > 0 ? `<span class="text-gray-400">Stun:</span> <span class="text-white">${stats.stunDuration / 1000}s</span>` : ''}
            `;
            
  let hpDisplay = `<span class="text-sm font-semibold text-gray-300">${Math.ceil(unit.hp)} + <span class="text-cyan-300">${Math.ceil(unit.armor)}</span> / ${unit.maxHp}</span>`;
  let hpBar = `
                <div class="stat-bar-container mb-2 h-3 relative">
                     <div class="stat-bar bg-cyan-500/50 absolute top-0 left-0" style="width: ${armorPercentage}%"></div>
                    <div class="stat-bar ${healthColor}" style="width: ${healthPercentage}%"></div>
                </div>`;
                
  if (unit.type.includes('dummy') && unit.type !== 'boss_dummy') {
      hpDisplay = `<span class="text-sm font-semibold text-gray-300">Immortal</span>`;
      hpBar = ``; // No HP bar for immortal dummies
  }

  inspectTooltip.innerHTML = `
                <div class="flex justify-between items-start">
                    <h3 class="text-lg font-bold ${unit.team === 1 ? 'text-blue-300' : 'text-red-300'} mb-2">${stats.name}</h3>
                     ${hpDisplay}
                </div>
                ${hpBar}

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
  const modifyModeBtn = document.getElementById('modify-mode-btn');
  const oneVOneBtn = document.getElementById('one-v-one-btn');
  const stopTrackingBtn = document.getElementById('stop-tracking-btn');
  const canvas = document.getElementById('gameCanvas');
  const selectionMessage = document.getElementById('selection-message');
  const removeMessage = document.getElementById('remove-message');
  const inspectMessage = document.getElementById('inspect-message');
  toggleRangeBtn.addEventListener('click', () => {
    gameState.showRangePreview = !gameState.showRangePreview;
    uiElements.eyeIcon.classList.toggle('hidden', !gameState.showRangePreview);
    uiElements.eyeOffIcon.classList.toggle('hidden', gameState.showRangePreview);
  });
  
  oneVOneBtn.addEventListener('click', () => {
    gameState.isOneVOneModeActive = !gameState.isOneVOneModeActive;
    oneVOneBtn.classList.toggle('active', gameState.isOneVOneModeActive);
    oneVOneBtn.classList.toggle('bg-violet-600', gameState.isOneVOneModeActive);
    oneVOneBtn.classList.toggle('bg-gray-700', !gameState.isOneVOneModeActive);
    const overlay = document.getElementById('one-v-one-ui');
    if (gameState.isOneVOneModeActive) {
        overlay.classList.remove('hidden');
        selectionMessage.textContent = '1v1 Mode ON: Place exactly 1 unit per side';
        selectionMessage.style.opacity = 1;
        setTimeout(() => selectionMessage.style.opacity = 0, 2000);
    } else {
        overlay.classList.add('hidden');
        gameState.oneVOneBlueUnit = null;
        gameState.oneVOneRedUnit = null;
    }
  });

  modifyModeBtn.addEventListener('click', () => {
    gameState.isModifyModeActive = !gameState.isModifyModeActive;
    modifyModeBtn.classList.toggle('active', gameState.isModifyModeActive);
    modifyModeBtn.classList.toggle('bg-violet-600', gameState.isModifyModeActive);
    modifyModeBtn.classList.toggle('bg-gray-700', !gameState.isModifyModeActive);
    if (gameState.isModifyModeActive) {
        selectionMessage.textContent = 'Modify Mode ON: Placed units will prompt for stats';
        selectionMessage.style.opacity = 1;
        setTimeout(() => selectionMessage.style.opacity = 0, 2000);
    }
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

const WEAPON_NAMES = {
    'swordsman': 'Sword', 'spearman': 'Spear', 'duelist': 'Dual Blades',
    'fortress': 'Shield', 'guardian': 'Shield & Mace', 'rockgolem': 'Stone Fists',
    'troll': 'Giant Club', 'musketeer': 'Musket', 'sniper': 'Sniper Rifle',
    'archer': 'Bow', 'hunter': 'Hunting Rifle', 'minigunner': 'Minigun',
    'accelerator': 'Laser Cannon', 'engineer': 'Nailgun', 'flamecaller': 'Fire Staff',
    'wizard': 'Magic Wand', 'cryomancer': 'Ice Staff', 'necromancer': 'Skull Staff',
    'priest': 'Holy Staff', 'druid': 'Nature Staff', 'alchemist': 'Potions',
    'abyssal_summoner': 'Dark Tome', 'restrictor': 'Chains', 'absorber': 'Gauntlets',
    'assassin': 'Daggers', 'ghoul': 'Claws', 'sledgehammer': 'Sledgehammer',
    'dummy': 'None', 'shooting_dummy': 'Pistol', 'boss_dummy': 'None',
    'sentry': 'Turret', 'force_wall': 'None'
};

export function updateOneVOneUI() {
    if (!gameState.isOneVOneModeActive) return;

    function updatePanel(unit, prefix) {
        const panel = document.getElementById(`ovo-${prefix}-panel`);
        if (!unit || !gameState.units.includes(unit)) {
            panel.style.opacity = '0';
            return;
        }
        panel.style.opacity = '1';
        
        const specs = UNIT_SPECS[unit.type];
        document.getElementById(`ovo-${prefix}-name`).textContent = specs.name;
        document.getElementById(`ovo-${prefix}-hp-text`).textContent = `${Math.ceil(unit.hp)}/${unit.maxHp}`;
        
        const hpPercent = Math.max(0, (unit.hp / unit.maxHp) * 100);
        document.getElementById(`ovo-${prefix}-hp-bar`).style.width = `${hpPercent}%`;
        
        const skillsDiv = document.getElementById(`ovo-${prefix}-skills`);
        let skillsHtml = '';
        skillsHtml += `<div class="text-gray-300 mb-1 border-b border-gray-600 pb-1 flex justify-${prefix==='blue'?'start':'end'} gap-3 text-[10px] tracking-wide uppercase"><span>DMG: <span class="text-red-400 font-bold">${unit.attackDamage}</span></span> <span>WPN: <span class="text-yellow-400 font-bold">${WEAPON_NAMES[unit.type] || 'None'}</span></span></div>`;

        let triggersHtml = '';
        
        if (unit.type === 'hunter') {
            triggersHtml += `<div>Eagle: ${unit.basicAttackCounter || 0}/${specs.eagleTriggerCount}</div>`;
        } else if (unit.type === 'duelist') {
            triggersHtml += `<div>Burst Slash: ${unit.basicAttackCounter || 0}/${specs.burstTriggerCount}</div>`;
            if (unit.isBursting) triggersHtml += `<div class="text-yellow-400">Bursting! (${unit.burstsLeft} left)</div>`;
        } else if (unit.type === 'flamecaller') {
            triggersHtml += `<div>Triple Fire: ${unit.basicAttackCounter || 0}/3</div>`;
        } else if (unit.type === 'cryomancer') {
            triggersHtml += `<div>Freeze Wave: ${unit.basicAttackCounter || 0}/${specs.specialTriggerCount}</div>`;
        } else if (unit.type === 'fortress') {
            triggersHtml += `<div>Shield Bash: ${unit.hitsTaken || 0}/5</div>`;
        } else if (unit.type === 'absorber') {
            triggersHtml += `<div>Absorb: ${unit.hitsTaken || 0}/10</div>`;
            if (unit.isAbsorbing) triggersHtml += `<div class="text-purple-400 font-bold text-[10px]">ABSORBING!</div>`;
        } else if (unit.type === 'restrictor') {
            let hits = unit.target && unit.target.restrictorHitCount ? (unit.target.restrictorHitCount[unit.id] || 0) : 0;
            let lockCount = 4 - Math.floor(hits / 2);
            if (lockCount < 1) lockCount = 1;
            triggersHtml += `<div>Lock In: ${lockCount}</div>`;
            const cd = 5000;
            const remaining = unit.lastPushTime ? Math.max(0, cd - (Date.now() - unit.lastPushTime)) : 0;
            if (remaining > 0) triggersHtml += `<div>Push CD: ${(remaining/1000).toFixed(1)}s</div>`;
            else triggersHtml += `<div class="text-green-400">Push Ready</div>`;
        } else if (unit.type === 'troll') {
            triggersHtml += `<div>Smash: ${unit.basicAttackCounter || 0}/${specs.smashTriggerCount}</div>`;
        } else if (unit.type === 'engineer') {
            triggersHtml += `<div>Sentry: ${unit.basicAttackCounter || 0}/${specs.shotsToBuild}</div>`;
        } else if (unit.type === 'alchemist') {
            triggersHtml += `<div>Anti-Heal Flask: ${unit.basicAttackCounter || 0}/${specs.specialTriggerCount}</div>`;
        } else if (unit.type === 'force_wall') {
            triggersHtml += `<div>Reflect: ${unit.hitsTaken || 0}/4</div>`;
            if (unit.isReflecting) triggersHtml += `<div class="text-pink-400">Reflecting!</div>`;
        } else if (unit.type === 'abyssal_summoner') {
            triggersHtml += `<div>Snake Casts: ${unit.spawnedSnakes || 0}/${specs.maxSnakes}</div>`;
        } else if (unit.type === 'assassin') {
            if (unit.isShadow) triggersHtml += `<div class="text-gray-400">Shadow Stealthed</div>`;
            else if (unit.isFlurrying) triggersHtml += `<div>Flurries Left: ${unit.flurriesLeft}</div>`;
        } else if (unit.type === 'priest') {
            triggersHtml += `<div>Light Heal: ${unit.basicAttackCounter || 0}/${specs.lightHealTriggerCount}</div>`;
        } else if (unit.type === 'druid') {
            triggersHtml += `<div>Multi Heal: ${unit.basicAttackCounter || 0}/${specs.multiHealTriggerCount}</div>`;
        }
        
        if (triggersHtml === '') {
            triggersHtml = '<div class="text-gray-500 italic">No triggers</div>';
        }
        
        skillsHtml += triggersHtml;
        skillsDiv.innerHTML = skillsHtml;
    }
    
    updatePanel(gameState.oneVOneBlueUnit, 'blue');
    updatePanel(gameState.oneVOneRedUnit, 'red');
}
