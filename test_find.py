
with open('index.html', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()
for i, l in enumerate(lines):
    if '<script' in l and 'src=' not in l and 'tailwind' not in l:
        print(f'Main script line: {i+1}')
    if '</script>' in l:
        print(f'Script end line: {i+1}')
