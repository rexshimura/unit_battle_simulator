import re

unit_path = r'c:\Users\Rexshimura\Desktop\[JULY]-SIDE-PROJECTS\unit_battle_simulator\js\entities\Unit.js'
with open(unit_path, 'r', encoding='utf-8') as f:
    text = f.read()

start_idx = text.find('drawHealthBar() {')
end_idx = text.find('drawEquipment() {', start_idx)
sub = text[start_idx:end_idx]

match = re.search(r'uiElements\.ctx\.fillText\(this\.stunType === \'freeze\' \? \'FROZEN\' : \(this\.stunType === \'restrict\' \? \'LOCKED\' : \'STUN\'\), this\.x, healthBarY - 2\);[^}]*\}', sub)
if match:
    insert_pos = start_idx + match.end()
    
    new_ui = """
    let nextY = healthBarY + healthBarHeight + 3;
    if (this.type === 'restrictor') {
        const lockCount = 4 - ((this.restrictorAttacks || 0) % 4);
        uiElements.ctx.fillStyle = '#a855f7';
        uiElements.ctx.font = 'bold 9px Arial';
        uiElements.ctx.textAlign = 'center';
        uiElements.ctx.fillText(`LOCK IN: ${lockCount}`, this.x, nextY + 7);
        nextY += 10;
        
        const PUSH_COOLDOWN = 5000;
        if (this.lastPushTime && Date.now() - this.lastPushTime < PUSH_COOLDOWN) {
            const cdProgress = 1 - ((Date.now() - this.lastPushTime) / PUSH_COOLDOWN);
            uiElements.ctx.fillStyle = 'rgba(75, 85, 99, 0.5)';
            uiElements.ctx.fillRect(this.x - 15, nextY, 30, 3);
            uiElements.ctx.fillStyle = '#a855f7';
            uiElements.ctx.fillRect(this.x - 15, nextY, 30 * cdProgress, 3);
        } else {
            uiElements.ctx.fillStyle = '#a855f7';
            uiElements.ctx.font = 'bold 8px Arial';
            uiElements.ctx.textAlign = 'center';
            uiElements.ctx.fillText("PUSH READY", this.x, nextY + 6);
        }
    }
"""
    text = text[:insert_pos] + new_ui + text[insert_pos:]
    with open(unit_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print('Successfully appended to drawHealthBar.')
else:
    print('Could not match end of drawHealthBar')
