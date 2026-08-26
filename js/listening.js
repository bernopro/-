// Listening quiz - local MP3 playback
// Requires: shared.js

let localMode = false;
let localList = [];
let localIndex = 0;
let audioEl = null;
let localTimer = null;
let currentAnswerTitle = '';
let currentAnswerNumber = '';
let currentFilenameKey = '';
let currentAnswer = '';

function shouldAutoNext() {
    const toggle = document.getElementById('autoNextToggle');
    return !toggle || toggle.checked;
}

function formatTitle(name) {
    if (!name) return '';
    let t = String(name).replace(/\.mp3$/i, '');
    t = t.replace(/^\s*\d+\s*[\u2013\u2014\u2012:]\s*/, '');
    return t.trim();
}

function extractNumber(name) {
    if (!name) return '';
    const s = String(name).trim();
    const m = s.match(/^\s*(\d+)\s*[\u2013\u2014\u2012:]/);
    if (m && m[1]) return m[1];
    return '';
}

function filenameOnly(s) {
    if (!s) return '';
    try {
        const full = String(s);
        const maybe = full.indexOf('%') !== -1 ? decodeURIComponent(full) : full;
        const parts = String(maybe).split(/[\\/]/);
        return parts[parts.length - 1];
    } catch (e) {
        try { return decodeURIComponent(String(s)); } catch (e2) { return String(s); }
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    function setStatus(msg) {
        console.log('STATUS:', msg);
        const el = document.getElementById('status');
        if (el) el.textContent = msg;
    }

    try {
        await loadLocalList();
        if (localMode) {
            setStatus('Audio player ready.');
        } else {
            setStatus('No local audio manifest found. Add audio/list.json and MP3s in /audio.');
        }
    } catch (e) {
        console.warn(e);
        setStatus('Failed to load local manifest.');
    }

    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    const nextBtn = document.getElementById('nextBtn');
    const autoNextToggle = document.getElementById('autoNextToggle');

    if (autoNextToggle) autoNextToggle.addEventListener('change', function() {
        setStatus(autoNextToggle.checked ? 'Auto Next enabled.' : 'Auto Next disabled.');
    });

    if (playBtn) playBtn.addEventListener('click', function() {
        if (localMode) {
            startLocalPlayback();
            setStatus('Playing clip...');
        } else {
            setStatus('No local audio manifest found. Add audio/list.json and MP3s in /audio.');
        }
    });

    if (stopBtn) stopBtn.addEventListener('click', function() {
        stopLocalPlayback();
        setStatus('Playback stopped.');
    });

    if (nextBtn) nextBtn.addEventListener('click', function() {
        if (localMode) {
            const ans = document.getElementById('answer');
            if (ans) ans.textContent = '';
            nextLocal();
            setStatus('Playing next clip.');
        }
    });

    function showAnswer() {
        const answerEl = document.getElementById('answer');
        let toShow = '\u2014';
        if (currentAnswer) toShow = currentAnswer;
        let raw = filenameOnly(currentFilenameKey);
        if (!raw && audioEl && audioEl.src) {
            try { raw = filenameOnly(new URL(audioEl.src).pathname); } catch (e) { raw = filenameOnly(audioEl.src); }
            if (raw.startsWith('audio/')) raw = raw.slice(6);
        }
        if (!currentAnswer) {
            if (raw) toShow = raw;
            else if (currentAnswerTitle) toShow = currentAnswerTitle;
            else if (currentAnswerNumber) toShow = currentAnswerNumber;
        }
        if (answerEl) answerEl.textContent = toShow;
    }

    const showAnswerBtn = document.getElementById('showAnswerBtn');
    if (showAnswerBtn) showAnswerBtn.addEventListener('click', showAnswer);
});

async function loadLocalList() {
    try {
        let data = null;
        try {
            const res = await fetch('audio/list.json', { cache: 'no-store' });
            if (res && res.ok) {
                data = await res.json();
            }
        } catch (e) {
            console.warn('fetch audio/list.json failed (file:// or blocked):', e);
        }

        if (!data) {
            const inline = document.getElementById('inlineList');
            if (inline) {
                try { data = JSON.parse(inline.textContent || inline.innerText); } catch (e) { console.warn('inlineList parse failed', e); }
            }
        }

        if (Array.isArray(data) && data.length > 0) {
            localList = data.slice();
            shuffleArray(localList);
            localMode = true;
            console.log('Local audio mode enabled. Files:', localList.length);
            return;
        }

        console.log('No audio/list.json or inline list found; file-picker fallback available.');
    } catch (e) {
        console.warn('No local audio manifest found or failed to load:', e);
    }
}

function startLocalPlayback() {
    if (!localMode || localList.length === 0) {
        alert('No local audio files found. Put audio files in /audio and generate audio/list.json');
        return;
    }
    if (!audioEl) {
        audioEl = new Audio();
        audioEl.preload = 'auto';
        audioEl.addEventListener('ended', function() {
            clearLocalTimer();
            if (shouldAutoNext()) nextLocal();
        });
        audioEl.addEventListener('error', function(ev) {
            console.error('Audio element error', audioEl.error, ev);
        });
    }
    playLocalIndex(localIndex);
}

function playLocalIndex(i) {
    if (!localList || localList.length === 0) return;
    localIndex = i % localList.length;
    const item = localList[localIndex];
    let src;
    if (typeof item === 'string') {
        src = (item.startsWith('http') || item.startsWith('audio/') || item.startsWith('blob:')) ? item : 'audio/' + item;
    } else if (item && typeof item === 'object') {
        src = item.url || ('audio/' + item.name);
    } else {
        src = 'audio/' + String(item);
    }
    audioEl.src = src;
    audioEl.currentTime = 0;
    audioEl.play().catch(function(err) { console.error('Local audio play failed:', err); });

    let nameForAnswer = '';
    if (typeof item === 'string') nameForAnswer = item;
    else if (item && typeof item === 'object') nameForAnswer = item.name || '';
    currentAnswer = item && typeof item === 'object' ? String(item.answer || '') : '';
    currentAnswerTitle = formatTitle(nameForAnswer);
    const num = extractNumber(nameForAnswer);
    currentAnswerNumber = num || '';
    currentFilenameKey = nameForAnswer;

    const answerElLocal = document.getElementById('answer');
    if (answerElLocal) answerElLocal.textContent = '';
    clearLocalTimer();
    localTimer = setTimeout(function() {
        try { audioEl.pause(); } catch (e) {}
        if (shouldAutoNext()) nextLocal();
    }, 30000);
}

function nextLocal() {
    clearLocalTimer();
    localIndex = (localIndex + 1) % localList.length;
    playLocalIndex(localIndex);
}

function stopLocalPlayback() {
    if (audioEl) {
        try { audioEl.pause(); } catch (e) {}
    }
    clearLocalTimer();
}

function clearLocalTimer() {
    if (localTimer) {
        clearTimeout(localTimer);
        localTimer = null;
    }
}
