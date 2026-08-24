import json
import os
import unicodedata
import difflib

BASE = os.path.join(os.path.dirname(__file__), '..', 'audio')
BASE = os.path.normpath(BASE)

def norm(s):
    # Normalize, strip surrounding whitespace
    if not isinstance(s, str):
        return s
    s = unicodedata.normalize('NFC', s).strip()
    return s

def main():
    list_path = os.path.join(BASE, 'list.json')
    if not os.path.exists(list_path):
        print('audio/list.json not found at', list_path)
        return

    with open(list_path, 'r', encoding='utf-8') as f:
        entries = json.load(f)

    files = [f for f in os.listdir(BASE) if os.path.isfile(os.path.join(BASE, f))]

    norm_files = {norm(f): f for f in files}

    missing = []
    for e in entries:
        ne = norm(e)
        if ne not in norm_files:
            missing.append(e)

    if not missing:
        print('All list.json entries have matching files in audio/.')
        return

    print(f'Missing {len(missing)} files from audio/:')
    for m in missing:
        print(' -', m)
        # suggest close matches
        candidates = difflib.get_close_matches(norm(m), list(norm_files.keys()), n=3, cutoff=0.6)
        if candidates:
            print('   possible matches:')
            for c in candidates:
                print('    ->', norm_files[c])

if __name__ == '__main__':
    main()
