import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
sw_path = os.path.join(base_dir, 'sw.js')

with open(sw_path, 'r', encoding='utf-8') as f:
    sw_js = f.read()

old_cache_logic = """self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});"""

new_cache_logic = """self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Fetch and cache individually so one missing file doesn't crash the whole worker
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => {
            console.warn('SW failed to cache:', url, err);
          });
        })
      );
    })
  );
});"""

sw_js = sw_js.replace(old_cache_logic, new_cache_logic)

with open(sw_path, 'w', encoding='utf-8') as f:
    f.write(sw_js)
