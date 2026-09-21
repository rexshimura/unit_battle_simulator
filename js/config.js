const ARMOR_DAMAGE_REDUCTION_PERCENT = 0.50;

// =========================================================================
// ROLE CONFIGURATION
// Add or remove unit IDs from these arrays to change their UI categories!
// =========================================================================
const UNIT_ROLES = {
    Breachers: ['swordsman', 'spearman', 'ghoul', 'sledgehammer', 'troll', 'duelist', 'spartan', 'lunger'],
    Interceptors: ['fortress', 'guardian', 'rockgolem', 'force_wall', 'absorber', 'spartan'],
    Rangers: ['musketeer', 'sniper', 'archer', 'hunter', 'minigunner', 'accelerator', 'engineer'],
    Tinkerers: ['alchemist', 'accelerator', 'engineer', 'restrictor'],
    Sorcerers: ['flamecaller', 'wizard', 'cryomancer', 'necromancer'],
    Sustainers: ['priest', 'druid', 'acolyte'],
    Amplifiers: ['bard'],
    Infiltrators: ['assassin', 'duelist'],
    Controllers: ['abyssal_summoner', 'necromancer'],
    Dummies: ['dummy', 'shooting_dummy', 'boss_dummy'],
};

const UNIT_SPECS = {
  'absorber': {description: 'After 10 hits, absorbs projectiles for 5s. Stomp range depends on absorbed damage.', name: 'Absorber', hp: 250, speed: 0.5, attackDamage: 5, attackRange: 40, attackCooldown: 1500, color: {team1: '#a855f7', team2: '#d946ef'}, size: 22},
  'abyssal_summoner': {description: 'Sacrifices 50% Max HP to spawn an Evil Snake', name: 'Abyssal Summoner', hp: 300, speed: 0.2, attackDamage: 0, attackRange: 0, attackCooldown: 3000, color: {team1: '#60a5fa', team2: '#f87171'}, maxSnakes: 1, snakeHp: 100, snakeDamage: 5, snakeSpeed: 1.6, snakeAttackRange: 35}, 
  'accelerator': {description: 'Aims and fires a continuous accelerating laser', name: 'Accelerator', hp: 80, speed: 0.5, attackDamage: 1, attackRange: 800, attackCooldown: 1500, color: {team1: '#60a5fa', team2: '#f87171'}},
  'acolyte': {description: 'Constantly heals allies for 3% Max HP (5% for Interceptors)', name: 'Acolyte', hp: 90, speed: 0.6, attackDamage: 0, attackRange: 0, attackCooldown: 1000, color: {team1: '#60a5fa', team2: '#f87171'}, healRadius: 350, healPercent: 0.03},
  'alchemist': {description: 'Throws debilitating potions', name: 'Alchemist', hp: 85, speed: 0.7, attackDamage: 5, attackRange: 320, attackCooldown: 2200, color: {team1: '#60a5fa', team2: '#f87171'}, poisonDuration: 5000, dps: 5, poisonAoeRadius: 40, specialTriggerCount: 2, antiHealTargets: 3, healReductionAmount: 0.99, healReductionDuration: 8000}, 
  'archer': {description: 'Shoots sharp arrows', name: 'Archer', hp: 60, speed: 0.7, attackDamage: 8, attackRange: 420, attackCooldown: 900, color: {team1: '#60a5fa', team2: '#f87171'}}, 
  'assassin': {description: 'Targets weak backliners, stealths on kill', name: 'Assassin', hp: 70, speed: 1.5, attackDamage: 12, attackRange: 35, attackCooldown: 800, color: {team1: '#60a5fa', team2: '#f87171'}},
  'bard': {description: 'Boosts nearby allies', name: 'Bard', hp: 80, speed: 0.8, attackDamage: 0, attackRange: 0, attackCooldown: 2000, color: {team1: '#60a5fa', team2: '#f87171'}, buffRadius: 250, damageBoost: 0.20, attackSpeedBoost: 0.50, buffDuration: 2200}, 
  'boss_dummy': {description: 'Huge dummy with huge HP. Gets knocked back slightly on hit.', name: 'Boss Dummy', hp: 50000, speed: 0, attackDamage: 0, attackRange: 0, attackCooldown: 1000, color: {team1: '#6b7280', team2: '#6b7280'}, size: 50},
  'cryomancer': {description: 'Slows and freezes enemies', name: 'Cryomancer', hp: 80, speed: 0.6, attackDamage: 15, attackRange: 600, attackCooldown: 800, color: {team1: '#60a5fa', team2: '#f87171'}, specialTriggerCount: 3, waveDamage: 3, freezeStacksApplied: 1, freezeTriggerCount: 4, freezeDuration: 2500, chillDuration: 5000}, 
  'druid': {description: 'Links to heal frontlines strongly, weak multiheal', name: 'Druid', hp: 90, speed: 0.7, attackDamage: 0, attackRange: 600, attackCooldown: 800, color: {team1: '#60a5fa', team2: '#f87171'}, healAmount: 20, multiHealTriggerCount: 8, multiHealTargets: 3, multiHealDuration: 4000, multiHealAmount: 2}, 
  'duelist': {description: 'Fast, with burst attacks', name: 'Duelist', hp: 90, speed: 1.1, attackDamage: 12, attackRange: 40, attackCooldown: 680, color: {team1: '#60a5fa', team2: '#f87171'}, burstTriggerCount: 3, burstSlashCount: 3, burstSlashCooldown: 120}, 
  'dummy': {description: 'Takes damage and shows DPS', name: 'Target Dummy', hp: 999999, speed: 0, attackDamage: 0, attackRange: 0, attackCooldown: 1000, color: {team1: '#a1a1aa', team2: '#a1a1aa'}},
  'engineer': {description: 'Shoots nails, builds sentries', name: 'Engineer', hp: 90, speed: 0.6, attackDamage: 10, attackRange: 450, attackCooldown: 2000, color: {team1: '#60a5fa', team2: '#f87171'}, maxSentries: 6, shotsToBuild: 2, buildDuration: 2500, sentryHp: 70, sentryDamage: 2, sentryRange: 600, sentryCooldown: 450},
  'flamecaller': {description: 'Ranged, AOE damage', name: 'Flamecaller', hp: 60, speed: 0.6, attackDamage: 25, attackRange: 350, attackCooldown: 2200, color: {team1: '#60a5fa', team2: '#f87171'}, aoeRadius: 80, aoeDamage: 25}, 
  'force_wall': {description: 'Counters pierce bullets. Reflects projectiles after 4 hits.', name: 'Forcefield', hp: 350, speed: 1.5, attackDamage: 10, attackRange: 40, attackCooldown: 2500, color: {team1: '#60a5fa', team2: '#f87171'}, size: 20},
  'fortress': {description: 'Takes hits, then unleashes a knockback bash', name: 'Fortress', hp: 600, speed: 0.25, attackDamage: 12, attackRange: 45, attackCooldown: 2200, color: {team1: '#60a5fa', team2: '#f87171'}, size: 26},
  'ghoul': {description: 'Bites enemies, revives faster on death', name: 'Ghoul', hp: 100, speed: 1.2, attackDamage: 8, attackRange: 40, attackCooldown: 600, color: {team1: '#60a5fa', team2: '#f87171'}, reviveMaxHp: 150, reviveHpMultiplier: 0.5, reviveSpeedMultiplier: 2.5, reviveDamageMultiplier: 1.5, reviveCooldownMultiplier: 0.6, reviveDelay: 3000},
  'guardian': {description: 'Tough, hits and deflects', name: 'Guardian', hp: 200, speed: 0.4, attackDamage: 10, attackRange: 35, attackCooldown: 1200, color: {team1: '#60a5fa', team2: '#f87171'}, deflectChance: 0.5}, 
  'hunter': {description: 'Shoots a rifle and releases an eagle every 2 shots', name: 'Hunter', hp: 55, speed: 0.8, attackDamage: 30, attackRange: 550, attackCooldown: 6000, color: {team1: '#60a5fa', team2: '#f87171'}, eagleDamage: 12, eagleTriggerCount: 1, eagleSpeed: 3.0},
  'lunger': {description: 'Charges for 2.7s, then rushes forward to pierce armor.', name: 'Lunger', hp: 160, speed: 0.7, attackDamage: 60, attackRange: 300, attackCooldown: 2000, color: {team1: '#60a5fa', team2: '#f87171'}, ignoresArmor: true},
  'minigunner': {description: 'Rapidly fires small bullets', name: 'Minigunner', hp: 120, speed: 0.8, attackDamage: 2, attackRange: 350, attackCooldown: 150, color: {team1: '#60a5fa', team2: '#f87171'}},
  'musketeer': {description: 'Slow, Ranged Shot', name: 'Musketeer', hp: 50, speed: 0.5, attackDamage: 18, attackRange: 600, attackCooldown: 2450, color: {team1: '#60a5fa', team2: '#f87171'}}, 
  'necromancer': {description: 'Shoots green fireballs. Revives fallen allies over 3s.', name: 'Necromancer', hp: 90, speed: 0.6, attackDamage: 15, attackRange: 450, attackCooldown: 4000, color: {team1: '#60a5fa', team2: '#f87171'}, reviveRange: 500, reviveCastTime: 3000, reviveCooldown: 3000},
  'priest': {description: 'Provides powerful shields and light AoE healing', name: 'Priest', hp: 70, speed: 0.7, attackDamage: 0, attackRange: 0, attackCooldown: 2000, color: {team1: '#60a5fa', team2: '#f87171'}, healAmount: 20, healRadius: 300, lightHealTriggerCount: 4, lightHealArmorBonus: 40, lightHealArmorDuration: 6000},
  'restrictor': {description: 'Throws chains. Every 4th attack locks enemy for 10 seconds.', name: 'Restrictor', hp: 120, speed: 0.6, attackDamage: 2, attackRange: 600, attackCooldown: 1600, color: {team1: '#60a5fa', team2: '#f87171'}, size: 20},
  'rockgolem': {description: 'Tanky, AOE stun, Massive Smash', name: 'Rock Golem', hp: 360, speed: 0.3, attackDamage: 8, attackRange: 50, attackCooldown: 4500, color: {team1: '#60a5fa', team2: '#f87171'}, aoeRadius: 100, aoeDamage: 10, stunDuration: 850, size: 28}, 
  'sentry': {description: 'Stationary automated turret', name: 'Sentry', hp: 150, speed: 0.3, attackDamage: 2, attackRange: 600, attackCooldown: 700, color: {team1: '#60a5fa', team2: '#f87171'}},
  'shooting_dummy': {description: 'Stationary. Shoots straight to test unit defenses. Right-click to change damage.', name: 'Shooting Dummy', hp: 999999, speed: 0, attackDamage: 10, attackRange: 2000, attackCooldown: 500, color: {team1: '#a1a1aa', team2: '#a1a1aa'}},
  'sledgehammer': {description: 'Crits armored units', name: 'Sledgehammer', hp: 160, speed: 0.5, attackDamage: 30, attackRange: 45, attackCooldown: 2800, color: {team1: '#60a5fa', team2: '#f87171'}, critMultiplier: 3.0, critTargets: ['guardian', 'rockgolem', 'fortress']}, 
  'sniper': {description: 'Deadly long range, points laser', name: 'Sniper', hp: 40, speed: 0.4, attackDamage: 150, attackRange: 1000, attackCooldown: 7000, color: {team1: '#60a5fa', team2: '#f87171'}}, 
  'spartan': {description: 'Fast interceptor, deflects and knocks back enemies', name: 'Spartan', hp: 195, speed: 0.55, attackDamage: 8, attackRange: 80, attackCooldown: 1100, color: {team1: '#60a5fa', team2: '#f87171'}, deflectChance: 0.5},
  'spearman': {description: 'Melee, long reach', name: 'Spearman', hp: 90, speed: 0.9, attackDamage: 9, attackRange: 80, attackCooldown: 450, color: {team1: '#60a5fa', team2: '#f87171'}}, 
  'swordsman': {description: 'Fast, Melee Attack', name: 'Swordsman', hp: 100, speed: 1.0, attackDamage: 13.5, attackRange: 40, attackCooldown: 720, color: {team1: '#60a5fa', team2: '#f87171'}}, 
  'troll': {description: 'Huge, ignores defense', name: 'Troll', hp: 250, speed: 0.35, attackDamage: 55, attackRange: 60, attackCooldown: 3500, color: {team1: '#60a5fa', team2: '#f87171'}, size: 35, alwaysCrit: true, smashTriggerCount: 3, smashAoeRadius: 120, smashStunDuration: 1500, smashKnockback: 150, smashSlowDuration: 3000, smashSlowAmount: 0.5},
  'wizard': {description: 'Ranged, chain electric', name: 'Wizard', hp: 70, speed: 0.7, attackDamage: 1, attackRange: 350, attackCooldown: 400, color: {team1: '#60a5fa', team2: '#f87171'}, chainTargets: 15, chainRange: 200}
};

export { UNIT_SPECS };
export { UNIT_ROLES };
export { ARMOR_DAMAGE_REDUCTION_PERCENT };

// Auto-populate tags based on the UNIT_ROLES config above
for (const [unitId, specs] of Object.entries(UNIT_SPECS)) {
    specs.tags = [];
    for (const [role, unitsInRole] of Object.entries(UNIT_ROLES)) {
        if (unitsInRole.includes(unitId)) {
            specs.tags.push(role);
        }
    }
}
