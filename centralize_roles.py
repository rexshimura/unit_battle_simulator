import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
config_path = os.path.join(base_dir, 'js', 'config.js')

with open(config_path, 'r', encoding='utf-8') as f:
    config_js = f.read()

# 1. Define UNIT_ROLES at the top
unit_roles = """const ARMOR_DAMAGE_REDUCTION_PERCENT = 0.50;

// =========================================================================
// ROLE CONFIGURATION
// Add or remove unit IDs from these arrays to change their UI categories!
// =========================================================================
const UNIT_ROLES = {
    Breachers: ['swordsman', 'spearman', 'ghoul', 'sledgehammer', 'troll', 'duelist'],
    Interceptors: ['fortress', 'guardian', 'rockgolem', 'troll', 'sledgehammer'],
    Rangers: ['musketeer', 'sniper', 'archer'],
    Tinkerers: ['alchemist'],
    Sorcerers: ['flamecaller', 'wizard', 'cryomancer'],
    Sustainers: ['priest', 'druid'],
    Amplifiers: ['bard'],
    Infiltrators: ['assassin', 'duelist'],
    Controllers: ['cryomancer', 'alchemist', 'abyssal_summoner'],
};

const UNIT_SPECS = {"""

config_js = config_js.replace("const ARMOR_DAMAGE_REDUCTION_PERCENT = 0.50;\n\nconst UNIT_SPECS = {", unit_roles)

# 2. Remove "tags: [...]," from every line in UNIT_SPECS
# Use regex to strip it out
config_js = re.sub(r"tags: \['.*?'(?:, '.*?')*\'], ", "", config_js)
config_js = re.sub(r"tags: \['.*?'\], ", "", config_js)

# 3. Add auto-tagging logic at the end of the file
auto_tag_logic = """
// Auto-populate tags based on the UNIT_ROLES config above
for (const [unitId, specs] of Object.entries(UNIT_SPECS)) {
    specs.tags = [];
    for (const [role, unitsInRole] of Object.entries(UNIT_ROLES)) {
        if (unitsInRole.includes(unitId)) {
            specs.tags.push(role);
        }
    }
}
"""

config_js += auto_tag_logic

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config_js)
