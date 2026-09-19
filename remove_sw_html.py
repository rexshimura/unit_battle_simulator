import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
index_path = os.path.join(base_dir, 'index.html')

with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

sw_script = """    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration failed: ', err));
        });
      }
    </script>"""

if sw_script in html:
    html = html.replace(sw_script, "    <!-- Service Worker registration removed for local development -->")
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(html)
