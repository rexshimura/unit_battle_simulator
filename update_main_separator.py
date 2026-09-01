import os

base_dir = r"c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator"
main_path = os.path.join(base_dir, 'js', 'main.js')

with open(main_path, 'r', encoding='utf-8') as f:
    main_js = f.read()

old_logic = """    document.querySelectorAll('.unit-btn').forEach(unitBtn => {
      if (selectedRole === 'all') {
        unitBtn.classList.remove('filtered-out');
      } else {
        const unitType = unitBtn.dataset.unitType;
        const unitTags = UNIT_SPECS[unitType].tags;
        unitBtn.classList.toggle('filtered-out', !unitTags.includes(selectedRole));
      }
    });
  }"""

new_logic = """    document.querySelectorAll('.unit-btn').forEach(unitBtn => {
      if (selectedRole === 'all') {
        unitBtn.classList.remove('filtered-out');
      } else {
        const unitType = unitBtn.dataset.unitType;
        const unitTags = UNIT_SPECS[unitType].tags;
        unitBtn.classList.toggle('filtered-out', !unitTags.includes(selectedRole));
      }
    });
    const uniqueSeparator = document.getElementById('unique-separator');
    if (uniqueSeparator) {
       uniqueSeparator.classList.toggle('hidden', selectedRole !== 'all' && selectedRole !== 'Magic');
    }
  }"""

main_js = main_js.replace(old_logic, new_logic)

with open(main_path, 'w', encoding='utf-8') as f:
    f.write(main_js)
