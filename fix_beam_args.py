import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
proj_path = os.path.join(base_dir, 'js', 'entities', 'Projectiles.js')

with open(proj_path, 'r', encoding='utf-8') as f:
    proj_js = f.read()

old_update = "  update(uiElements, gameState) {"
new_update = "  update(enemies) {"
proj_js = proj_js.replace(old_update, new_update)

old_draw = "  draw(uiElements) {"
new_draw = "  draw() {"
proj_js = proj_js.replace(old_draw, new_draw)

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(proj_js)
