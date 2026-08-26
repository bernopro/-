import json, sys, os
sys.stdout.reconfigure(encoding='utf-8')

base = r'C:\Users\JOE\Desktop\Music School HTML\New'

with open(os.path.join(base, 'listening.html'), 'r', encoding='utf-8') as f:
    html = f.read()

marker = 'id="inlineList"'
start = html.index(marker)
start = html.index('>', start) + 1
end = html.index('</script>', start)
inline_json = html[start:end].strip()
data = json.loads(inline_json)

actual_files = [f for f in os.listdir(os.path.join(base, 'audio')) if f.endswith('.mp3')]

for item in data:
    if item['name'].startswith('57'):
        on_disk = item['name'] in actual_files
        print(f'On disk: {on_disk}')
        if not on_disk:
            matches = [f for f in actual_files if f.startswith('57')]
            for m in matches:
                a = item['name']
                b = m
                for i in range(min(len(a), len(b))):
                    if a[i] != b[i]:
                        print(f'  First diff at pos {i}: inline=U+{ord(a[i]):04X} vs disk=U+{ord(b[i]):04X}')
                        print(f'  Context inline: {repr(a[max(0,i-5):i+15])}')
                        print(f'  Context disk:   {repr(b[max(0,i-5):i+15])}')
                        break
                if a == b:
                    print('  Names are IDENTICAL - something else is wrong')
