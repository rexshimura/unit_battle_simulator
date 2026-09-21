const fs = require('fs');
const path = 'c:/Users/Rexshimura/Desktop/[JULY]-SIDE-PROJECTS/unit_battle_simulator/';

// 1. Modify index.html
let html = fs.readFileSync(path + 'index.html', 'utf8');
const lungerBtn = `
<button data-unit-type="lunger" class="unit-btn w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center gap-3">
    <canvas width="40" height="40" class="unit-preview-canvas" data-unit-type="lunger"></canvas>
    <div>
        <p class="text-sm font-bold text-gray-200">Lunger</p>
    </div>
</button>
`;
html = html.replace(/<button data-unit-type="minigunner"/, lungerBtn + '<button data-unit-type="minigunner"');
fs.writeFileSync(path + 'index.html', html);

// 2. Modify config.js
let config = fs.readFileSync(path + 'js/config.js', 'utf8');
const lungerDef = `
  'lunger': {description: 'Charges for 2.7s, then rushes forward to pierce armor.', name: 'Lunger', hp: 160, speed: 0.7, attackDamage: 60, attackRange: 300, attackCooldown: 2000, color: {team1: '#60a5fa', team2: '#f87171'}, ignoresArmor: true},`;
config = config.replace(/'minigunner': {/, lungerDef.trim() + "\n  'minigunner': {");

// Add to Breachers
config = config.replace(/Breachers: \['swordsman', 'spearman', 'ghoul', 'sledgehammer', 'troll', 'duelist', 'spartan'\]/, "Breachers: ['swordsman', 'spearman', 'ghoul', 'sledgehammer', 'troll', 'duelist', 'spartan', 'lunger']");

fs.writeFileSync(path + 'js/config.js', config);
