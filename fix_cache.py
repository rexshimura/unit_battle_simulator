import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
sw_path = os.path.join(base_dir, 'sw.js')
utils_path = os.path.join(base_dir, 'js', 'utils.js')

# 1. Fix sw.js
with open(sw_path, 'r', encoding='utf-8') as f:
    sw_js = f.read()

sw_js = sw_js.replace("const CACHE_NAME = 'battle-sim-v1';", "const CACHE_NAME = 'battle-sim-v2';")

activate_logic = """
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {"""

sw_js = sw_js.replace("self.addEventListener('fetch', (event) => {", activate_logic)

with open(sw_path, 'w', encoding='utf-8') as f:
    f.write(sw_js)

# 2. Fix utils.js volume
with open(utils_path, 'r', encoding='utf-8') as f:
    utils_js = f.read()

old_play = """            if (name === 'eagle_release') {
                sound.volume = 0.8; // Restored audibility
            }"""

new_play = """            if (name === 'eagle_release' || name === 'eagle_bite' || name === 'rifle') {
                sound.volume = 1.0; // Max volume for hunter SFX to ensure they are heard
            }"""

utils_js = utils_js.replace(old_play, new_play)

with open(utils_path, 'w', encoding='utf-8') as f:
    f.write(utils_js)
