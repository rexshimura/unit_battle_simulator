import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
main_path = os.path.join(base_dir, 'js', 'main.js')

with open(main_path, 'r', encoding='utf-8') as f:
    main_js = f.read()

unreg_code = """
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}
"""

if "registration.unregister()" not in main_js:
    main_js = unreg_code + main_js
    with open(main_path, 'w', encoding='utf-8') as f:
        f.write(main_js)
