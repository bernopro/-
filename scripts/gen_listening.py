import json, os

base = r'C:\Users\JOE\Desktop\Music School HTML\New'

with open(os.path.join(base, 'audio', 'list.json'), 'r', encoding='utf-8') as f:
    list_data = json.dumps(json.load(f), ensure_ascii=False, indent=2)

h1_arm = 'Listening \u2014 \u0533\u0578\u0582\u0577\u057f\u0578\u057e \u0574\u0565\u0572\u0565\u0564\u056b\u0576'
home_arm = '\u2b05 \u054e\u0565\u0580\u0561\u0564\u0561\u057c\u0576\u0561\u056c \u0563\u056c\u0572\u0561\u057e\u0578\u0580 \u0567\u057d'
footer_arm = '\u00a9 2026 Bernard \u2014 \u054d\u0578\u056c\u057e\u0565\u057b\u0578 \u053d\u0561\u0580\u0584\u0561\u057f\u0565\u0580\u057f\u056b\u056f\u0576\u0565\u0580'
moon = '\U0001F319'

print('Building...')

html_parts = []
html_parts.append('<!DOCTYPE html>')
html_parts.append('<html lang="hy">')
html_parts.append('<head>')
html_parts.append('    <meta charset="UTF-8">')
html_parts.append('    <meta name="viewport" content="width=device-width, initial-scale=1.0">')
html_parts.append('    <title>\u0547\u0578\u0582\u057f\u0578\u057e \u2014 \u054d\u0578\u056c\u057e\u0565\u057b\u0578</title>')
html_parts.append('    <link rel="stylesheet" href="css/style.css">')
html_parts.append('    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Armenian:wght@400;600;700&display=swap" rel="stylesheet">')
html_parts.append('</head>')
html_parts.append('<body>')
html_parts.append('')
html_parts.append('<div class="theme-toggle">')
html_parts.append(f'    <button id="themeToggle" onclick="toggleTheme()">{moon}</button>')
html_parts.append('</div>')
html_parts.append('')
html_parts.append('<div class="main-container">')
html_parts.append('    <div class="quiz-box">')
html_parts.append(f'        <h1>{h1_arm}</h1>')
html_parts.append('')
html_parts.append('        <p class="listening-desc">')
html_parts.append('            Listen to a short clip, then identify the music. No track information is shown during playback.')
html_parts.append('        </p>')
html_parts.append('')
html_parts.append('        <div class="controls">')
html_parts.append('            <button type="button" id="playBtn" class="control-btn">\u25b6\ufe0f Play clip</button>')
html_parts.append('            <button type="button" id="stopBtn" class="control-btn">\u23f8\ufe0f Stop playback</button>')
html_parts.append('            <button type="button" id="nextBtn" class="control-btn">\u23ed Next clip</button>')
html_parts.append('        </div>')
html_parts.append('')
html_parts.append('        <label class="auto-next-label">')
html_parts.append('            <input type="checkbox" id="autoNextToggle" checked>')
html_parts.append('            Auto Next')
html_parts.append('        </label>')
html_parts.append('')
html_parts.append('        <div id="status" class="listening-status"></div>')
html_parts.append('')
html_parts.append('        <div class="show-answer-container">')
html_parts.append('            <button id="showAnswerBtn" type="button">Show Answer</button>')
html_parts.append('        </div>')
html_parts.append('')
html_parts.append('        <div id="answer" class="listening-answer"></div>')
html_parts.append('')
html_parts.append('        <div id="player" class="hidden-player"></div>')
html_parts.append('')
html_parts.append('        <button type="button" onclick="goHome()" class="home-btn">')
html_parts.append(f'            {home_arm}')
html_parts.append('        </button>')
html_parts.append('    </div>')
html_parts.append('')
html_parts.append('    <div class="footer">')
html_parts.append(f'        {footer_arm}')
html_parts.append('    </div>')
html_parts.append('</div>')
html_parts.append('')
html_parts.append('<script src="js/shared.js" defer></script>')
html_parts.append('<script src="js/listening.js" defer></script>')
html_parts.append('')
html_parts.append('<!-- Inline manifest so page works from file:// without a server -->')
html_parts.append('<script id="inlineList" type="application/json">')
html_parts.append(list_data)
html_parts.append('</script>')
html_parts.append('')
html_parts.append('</body>')
html_parts.append('</html>')
html_parts.append('')

html = '\n'.join(html_parts)

with open(os.path.join(base, 'listening.html'), 'w', encoding='utf-8') as f:
    f.write(html)

print('Done - listening.html written successfully')
