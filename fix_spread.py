import os
import re

BASE_DIR = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js"

def fix_spread():
    proj_path = os.path.join(BASE_DIR, 'entities', 'Projectiles.js')
    with open(proj_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Increase the spread from 0.5 radians to a full PI radians (180 degrees backwards cone)
    content = content.replace("this.angle += Math.PI + (Math.random() - 0.5); // deflected back", "this.angle += Math.PI + (Math.random() - 0.5) * Math.PI; // deflected back with wide spread")

    with open(proj_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    fix_spread()
    print("Spread fixed.")
