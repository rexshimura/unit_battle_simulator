const fs = require('fs');
const path = 'c:/Users/Rexshimura/Desktop/[JULY]-SIDE-PROJECTS/unit_battle_simulator/';

// 1. Modify index.html
let html = fs.readFileSync(path + 'index.html', 'utf8');
const spartanBtn = `
<button data-unit-type="spartan" class="unit-btn w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center gap-3">
    <canvas width="40" height="40" class="unit-preview-canvas" data-unit-type="spartan"></canvas>
    <div>
        <p class="text-sm font-bold text-gray-200">Spartan</p>
    </div>
</button>
`;
html = html.replace(/<button data-unit-type="spearman"/, spartanBtn + '<button data-unit-type="spearman"');
fs.writeFileSync(path + 'index.html', html);

// 2. Modify config.js
let config = fs.readFileSync(path + 'js/config.js', 'utf8');
const spartanDef = `
  'spartan': {description: 'Tough, deflects and knocks back enemies', name: 'Spartan', hp: 200, speed: 0.4, attackDamage: 10, attackRange: 80, attackCooldown: 1200, color: {team1: '#60a5fa', team2: '#f87171'}, deflectChance: 0.5},`;
config = config.replace(/'spearman': {/, spartanDef.trim() + "\n  'spearman': {");

// Add to Interceptors
config = config.replace(/Interceptors: \['fortress', 'guardian', 'rockgolem', 'force_wall', 'absorber'\]/, "Interceptors: ['fortress', 'guardian', 'rockgolem', 'force_wall', 'absorber', 'spartan']");

fs.writeFileSync(path + 'js/config.js', config);
