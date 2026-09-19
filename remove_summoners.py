import os
import re

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
html_path = os.path.join(base_dir, 'index.html')
config_path = os.path.join(base_dir, 'js', 'config.js')
main_path = os.path.join(base_dir, 'js', 'main.js')

# 1. index.html - Remove the Summoners button
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Use regex to remove the Summoners button
html = re.sub(r'<button data-role="Summoners".*?</button>', '', html, flags=re.DOTALL)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)


# 2. config.js - Change Abyssal Summoner tags
with open(config_path, 'r', encoding='utf-8') as f:
    config = f.read()

config = config.replace(
    "name: 'Abyssal Summoner', tags: ['Summoners']",
    "name: 'Abyssal Summoner', tags: ['Controllers']"
)

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config)


# 3. main.js - Update unique separator check
with open(main_path, 'r', encoding='utf-8') as f:
    main_js = f.read()

main_js = main_js.replace(
    "!['all', 'Sorcerers', 'Breachers', 'Interceptors', 'Summoners', 'Infiltrators'].includes(selectedRole)",
    "!['all', 'Sorcerers', 'Breachers', 'Interceptors', 'Controllers', 'Infiltrators'].includes(selectedRole)"
)

with open(main_path, 'w', encoding='utf-8') as f:
    f.write(main_js)

print("Removed Summoners category.")
