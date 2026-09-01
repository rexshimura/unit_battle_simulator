export const gameState = {
  selectedUnit: null,
  units: [],
  allUnitsThisRound: [],
  projectiles: [],
  animations: [],
  particles: [],
  isBattleStarted: false,
  isPaused: false,
  gameSpeed: 1.0,
  showRangePreview: true,
  isRemoveModeActive: false,
  isInspectModeActive: false,
  trackedUnit: null,
  unitToHighlight: null,
  mousePos: { x: 0, y: 0, onCanvas: false },
  nextUnitId: 0,
  initialUnitPlacement: [],
  statsFilter: 'all',
  isSummarizedView: true,
  statsUpdateCounter: 0,
  STATS_UPDATE_INTERVAL: 30,
};

export const uiElements = {};
export function initUIElements() {
  uiElements.canvas = document.getElementById('gameCanvas');
  uiElements.ctx = uiElements.canvas.getContext('2d');
  uiElements.blueCountDisplay = document.getElementById('blue-count');
  uiElements.redCountDisplay = document.getElementById('red-count');
  uiElements.startBattleBtn = document.getElementById('start-battle-btn');
  uiElements.resetBtn = document.getElementById('reset-btn');
  uiElements.pauseBtn = document.getElementById('pause-btn');
  uiElements.speedControls = document.getElementById('speed-controls');
  uiElements.statusMessage = document.getElementById('status-message');
  uiElements.selectionMessage = document.getElementById('selection-message');
  uiElements.tooltip = document.getElementById('unit-tooltip');
  uiElements.roleSorter = document.getElementById('role-sorter');
  uiElements.playIconSVG = '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  uiElements.stopIconSVG = '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>';
  uiElements.pauseIconSVG = '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
  uiElements.eyeIcon = document.getElementById('eye-icon');
  uiElements.eyeOffIcon = document.getElementById('eye-off-icon');
}
