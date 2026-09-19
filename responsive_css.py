import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
css_path = os.path.join(base_dir, 'css', 'styles.css')

with open(css_path, 'a', encoding='utf-8') as f:
    f.write("\n/* Responsive Scaling for Tablets and Mobile */\n")
    f.write("@media (max-width: 1024px) {\n")
    f.write("    html {\n")
    f.write("        font-size: 14px;\n")
    f.write("    }\n")
    f.write("}\n")
    f.write("@media (max-width: 768px) {\n")
    f.write("    html {\n")
    f.write("        font-size: 12px;\n")
    f.write("    }\n")
    f.write("}\n")
