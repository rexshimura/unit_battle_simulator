import re
import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
html_path = os.path.join(base_dir, 'index.html')

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

def replacer(match):
    before_p = match.group(1)
    p_tags = match.group(2)
    unit_type = match.group(3)
    # The class might not be matched properly if we don't adjust it. Let's do it safer.
    return match.group(0)

# Instead of complex regex, let's just use string replace since the format is very consistent.

new_html = html.replace('class="unit-btn w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600"', 'class="unit-btn w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center gap-3"')

# Now we need to wrap the <p> tags in a <div> and prepend the canvas.
# We can find each button by regex:
pattern = re.compile(r'(<button data-unit-type="([^"]+)"[^>]+>)\s*(<p class="font-bold">.*?</p>\s*<p class="text-xs text-gray-400">.*?</p>)\s*(</button>)', re.DOTALL)

def btn_replacer(match):
    start_tag = match.group(1)
    unit_type = match.group(2)
    inner_p = match.group(3)
    end_tag = match.group(4)
    
    new_inner = f'\n                        <canvas width="40" height="40" class="unit-preview-canvas" data-unit-type="{unit_type}"></canvas>\n                        <div>\n                            {inner_p}\n                        </div>\n                    '
    
    return start_tag + new_inner + end_tag

new_html = pattern.sub(btn_replacer, new_html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_html)
