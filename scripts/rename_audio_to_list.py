import os
import json
import re
import argparse
from pathlib import Path

BASE = Path(__file__).resolve().parents[1] / 'audio'

def extract_leading_number(name):
    m = re.match(r'^(\d+)', name)
    if m:
        return int(m.group(1))
    # try digits after leading zeros like '01 - '
    m = re.match(r'^(0*\d+)', name)
    if m:
        return int(m.group(1))
    return None

def safe_name(s):
    # strip surrounding whitespace
    return s.strip()

def main(dry_run=True, do_rename=False):
    if not BASE.exists():
        print('audio/ folder not found at', BASE)
        return

    files = [f for f in os.listdir(BASE) if os.path.isfile(BASE / f) and f.lower().endswith('.mp3')]
    # exclude list.json if any
    files = [f for f in files if f.lower() != 'list.json']

    # sort by leading number if present, else by name
    def sort_key(f):
        n = extract_leading_number(f)
        return (n if n is not None else 9999, f)

    files_sorted = sorted(files, key=sort_key)

    list_path = BASE / 'list.json'
    if not list_path.exists():
        print('audio/list.json not found; run make_list.py first')
        return

    with open(list_path, 'r', encoding='utf-8') as fh:
        entries = json.load(fh)

    # take first N entries from list.json
    N = len(files_sorted)
    if len(entries) < N:
        print(f'Warning: list.json has only {len(entries)} entries but {N} audio files found; will map {len(entries)} files')
        N = len(entries)

    selected = entries[:N]

    mapping = []
    for i, old in enumerate(files_sorted[:N], start=1):
        entry = selected[i-1]
        # create new name preserving numeric prefix (two-digit)
        num = extract_leading_number(old)
        if num is None:
            num = i
        prefix = f"{num:02d}"
        new_name = f"{prefix} - {safe_name(entry)}"
        mapping.append((old, new_name))

    # show mapping
    print('Proposed renames (dry-run):')
    for old, new in mapping:
        print(f"{old} -> {new}")

    # write mapping file
    out = BASE / 'rename_mapping.json'
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(mapping, fh, ensure_ascii=False, indent=2)
    print('\nMapping written to', out)

    if do_rename:
        # perform renames (atomic: use temp names first)
        temp_suffix = '.renametmp'
        try:
            # rename to temp names
            for old, new in mapping:
                src = BASE / old
                tmp = BASE / (old + temp_suffix)
                src.rename(tmp)
            # now rename temps to final
            for old, new in mapping:
                tmp = BASE / (old + temp_suffix)
                dst = BASE / new
                tmp.rename(dst)
        except Exception as e:
            print('Error during rename:', e)
            print('Attempting to roll back...')
            # try rollback
            for old, new in mapping:
                tmp = BASE / (old + temp_suffix)
                if tmp.exists():
                    tmp.rename(BASE / old)
            print('Rollback complete')
            return
        print('Renames complete')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--do', action='store_true', dest='do', help='Perform renames. Without this flag runs dry-run and writes mapping.')
    args = parser.parse_args()
    main(dry_run=not args.do, do_rename=args.do)
