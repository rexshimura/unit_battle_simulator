import re
import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
config_path = os.path.join(base_dir, 'js', 'config.js')

with open(config_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
inside_unit = False
unit_str = ""
open_braces = 0

for line in lines:
    if "const UNIT_SPECS = {" in line:
        new_lines.append(line)
        continue
        
    if "};" in line and open_braces == 0:
        new_lines.append(line)
        continue
        
    match = re.match(r"^\s*'([^']+)'\s*:\s*\{", line)
    if match and open_braces == 0:
        inside_unit = True
        unit_str = line.strip()
        open_braces += line.count('{') - line.count('}')
        continue
        
    if inside_unit:
        unit_str += " " + line.strip()
        open_braces += line.count('{') - line.count('}')
        
        if open_braces == 0:
            unit_str = re.sub(r'\s+', ' ', unit_str)
            unit_str = re.sub(r'\s*:\s*', ': ', unit_str)
            unit_str = re.sub(r'\s*,\s*', ', ', unit_str)
            unit_str = unit_str.replace("{ ", "{").replace(" }", "}")
            new_lines.append("  " + unit_str + "\n")
            inside_unit = False
            unit_str = ""
    else:
        new_lines.append(line)

with open(config_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
