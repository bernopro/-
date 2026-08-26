import json, sys, os
sys.stdout.reconfigure(encoding='utf-8')
base = r'C:\Users\JOE\Desktop\Music School HTML\New'

with open(os.path.join(base, 'audio', 'list.json'), 'r', encoding='utf-8') as f:
    data = json.load(f)

actual = {f for f in os.listdir(os.path.join(base, 'audio')) if f.endswith('.mp3')}

fixed = 0
for item in data:
    name = item['name']
    if name not in actual:
        num = name[:2].strip()
        matches = [f for f in actual if f.startswith(num)]
        if matches:
            old = item['name']
            item['name'] = matches[0]
            print(f'Fixed: {repr(old)} -> {repr(matches[0])}')
            fixed += 1

if fixed:
    with open(os.path.join(base, 'audio', 'list.json'), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'\nFixed {fixed} entries in list.json')
else:
    print('No fixes needed')
