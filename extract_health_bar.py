import os
import re

unit_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\entities\Unit.js'
with open(unit_path, 'r', encoding='utf-8') as f:
    unit_js = f.read()

# We want to extract everything from `    const barWidth = 30;` to the end of `draw() { ... }`
# Wait, draw() ends right before `  drawEquipment() {`
# Let's find the `draw()` block

draw_start = unit_js.find("  draw() {")
draw_equip_start = unit_js.find("  drawEquipment() {")

if draw_start != -1 and draw_equip_start != -1:
    draw_body = unit_js[draw_start:draw_equip_start]
    
    # Inside draw_body, find the split point
    split_point = draw_body.find("    const barWidth = 30;")
    if split_point != -1:
        # The new draw method will just have everything before the split point + this.drawHealthBar()
        new_draw_method = draw_body[:split_point] + "    this.drawHealthBar();\n  }\n"
        
        # The extracted health bar logic will be a new method
        extracted_logic = draw_body[split_point:].strip()
        # Ensure it drops the trailing `}` that closed draw()
        if extracted_logic.endswith("}"):
            extracted_logic = extracted_logic[:-1].strip()
            
        new_drawHealthBar_method = "  drawHealthBar() {\n    " + extracted_logic + "\n  }\n"
        
        # Now replace the old draw method with the two new methods
        unit_js = unit_js[:draw_start] + new_draw_method + new_drawHealthBar_method + unit_js[draw_equip_start:]
        
        with open(unit_path, 'w', encoding='utf-8') as f:
            f.write(unit_js)
        print("Extraction successful.")
    else:
        print("Could not find const barWidth = 30;")
else:
    print("Could not find draw() or drawEquipment()")
