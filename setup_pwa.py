import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"

# 1. Create manifest.json
manifest_content = """{
  "name": "Unit Battle Simulator",
  "short_name": "Battle Sim",
  "description": "An offline auto-battler simulation game.",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#111827",
  "theme_color": "#111827",
  "orientation": "landscape",
  "icons": [
    {
      "src": "icon.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}"""
with open(os.path.join(base_dir, 'manifest.json'), 'w', encoding='utf-8') as f:
    f.write(manifest_content)

# 2. Create sw.js (Service Worker)
sw_content = """const CACHE_NAME = 'battle-sim-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/config.js',
  './js/game.js',
  './js/main.js',
  './js/state.js',
  './js/ui.js',
  './js/utils.js',
  './js/entities/Effects.js',
  './js/entities/Projectiles.js',
  './js/entities/Unit.js',
  './js/sfx/arrow.mp3',
  './js/sfx/bite.mp3',
  './js/sfx/bullet.mp3',
  './js/sfx/freeze.mp3',
  './js/sfx/frostwave.mp3',
  './js/sfx/ice-shards.mp3',
  './js/sfx/push.mp3',
  './js/sfx/slash.mp3',
  './js/sfx/slice.mp3',
  './js/sfx/snipe.mp3',
  './js/sfx/thrust.mp3',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});"""
with open(os.path.join(base_dir, 'sw.js'), 'w', encoding='utf-8') as f:
    f.write(sw_content)

# 3. Update index.html
html_path = os.path.join(base_dir, 'index.html')
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Add manifest
if '<link rel="manifest"' not in html:
    html = html.replace('<head>', '<head>\n    <link rel="manifest" href="manifest.json">')

# Add service worker registration
sw_script = """
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration failed: ', err));
        });
      }
    </script>
</body>"""
if "'serviceWorker' in navigator" not in html:
    html = html.replace('</body>', sw_script)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
