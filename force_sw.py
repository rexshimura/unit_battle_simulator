import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
sw_path = os.path.join(base_dir, 'sw.js')

with open(sw_path, 'r', encoding='utf-8') as f:
    sw_js = f.read()

# Bump version to v3
sw_js = sw_js.replace("const CACHE_NAME = 'battle-sim-v2';", "const CACHE_NAME = 'battle-sim-v3';")

# Add self.skipWaiting() to install
old_install = """self.addEventListener('install', (event) => {
  event.waitUntil("""

new_install = """self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the new service worker to activate immediately
  event.waitUntil("""

sw_js = sw_js.replace(old_install, new_install)

# Add clients.claim() to activate
old_activate = """self.addEventListener('activate', (event) => {
  event.waitUntil("""

new_activate = """self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim()); // Take control of all open pages immediately
  event.waitUntil("""

sw_js = sw_js.replace(old_activate, new_activate)

with open(sw_path, 'w', encoding='utf-8') as f:
    f.write(sw_js)
