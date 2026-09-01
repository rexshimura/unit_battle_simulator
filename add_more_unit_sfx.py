import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
unit_path = os.path.join(base_dir, 'js', 'entities', 'Unit.js')

with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# 1. Duelist burst
old_duelist_burst = """          if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
            this.target.takeDamage(this.attackDamage, this);
            gameState.animations.push(new SlashAnimation(this));"""
new_duelist_burst = """          if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
            this.target.takeDamage(this.attackDamage, this);
            AudioManager.play('slice');
            gameState.animations.push(new SlashAnimation(this));"""
unit_js = unit_js.replace(old_duelist_burst, new_duelist_burst)

# 2. Duelist normal attack
old_duelist_normal = """          if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
            this.target.takeDamage(this.attackDamage, this);
            gameState.animations.push(new SlashAnimation(this));
            if (!this.isSlashing) {"""
new_duelist_normal = """          if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
            this.target.takeDamage(this.attackDamage, this);
            AudioManager.play('slice');
            gameState.animations.push(new SlashAnimation(this));
            if (!this.isSlashing) {"""
unit_js = unit_js.replace(old_duelist_normal, new_duelist_normal)

# 3. Assassin
old_assassin = """      if (this.type === 'assassin') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          this.isInitialStealth = false;
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new SlashAnimation(this, '71, 85, 105')); // Dark slash"""
new_assassin = """      if (this.type === 'assassin') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          this.isInitialStealth = false;
          AudioManager.play('slice');
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new SlashAnimation(this, '71, 85, 105')); // Dark slash"""
unit_js = unit_js.replace(old_assassin, new_assassin)

# 4. Ghoul
old_ghoul = """} else if (this.type === 'ghoul') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new SlashAnimation(this, '239, 68, 68')); // Red bite slash"""
new_ghoul = """} else if (this.type === 'ghoul') {
        if (this.target && getDistance(this, this.target) <= this.attackRange + 5) {
          AudioManager.play('bite');
          this.target.takeDamage(this.attackDamage, this);
          gameState.animations.push(new SlashAnimation(this, '239, 68, 68')); // Red bite slash"""
unit_js = unit_js.replace(old_ghoul, new_ghoul)

with open(unit_path, 'w', encoding='utf-8') as f:
    f.write(unit_js)
