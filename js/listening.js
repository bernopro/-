// Configure your YouTube playlist ID here (replace with your playlist's ID)
// Example playlist ID: 'PLfiYHX1iVMhdv0INaO0KQCxasHiF740vg'
const PLAYLIST_ID = 'PLfiYHX1iVMhdv0INaO0KQCxasHiF740vg'; // <-- set your playlist ID here (no URL, no &si)

let player;
let stopTimer = null;
let userInteracted = false;
// Local audio playback variables
let localMode = false;
let localList = [];
let localIndex = 0;
let audioEl = null;
let localTimer = null;
let currentAnswerTitle = '';
let currentAnswerNumber = '';
let currentFilenameKey = '';
let currentAnswer = '';

function shouldAutoNext(){
	const toggle = document.getElementById('autoNextToggle');
	return !toggle || toggle.checked;
}

function formatTitle(name){
	if (!name) return '';
	let t = String(name).replace(/\.mp3$/i, '');
	t = t.replace(/^\s*\d+\s*[-–—:]\s*/,'');
	return t.trim();
}

function extractNumber(name){
	if (!name) return '';
	const s = String(name).trim();
	const m = s.match(/^\s*(\d+)\s*[-–—:]/);
	if (m && m[1]) return m[1];
	return '';
}

function twoPad(n){ return String(n).padStart(2,'0'); }

function filenameOnly(s){
	if (!s) return '';
	try{
		const full = String(s);
		// If it's a URL-encoded path, decode before returning basename
		const maybe = full.indexOf('%') !== -1 ? decodeURIComponent(full) : full;
		const parts = String(maybe).split(/[\\/]/);
		return parts[parts.length-1];
	} catch(e){ try{ return decodeURIComponent(String(s)); } catch(e2){ return String(s); } }
}

// This page uses local MP3 playback only. YouTube-related code has been removed.

// UI hooks
document.addEventListener('DOMContentLoaded', async () => {
	// visible status helper
	function setStatus(msg) {
		console.log('STATUS:', msg);
		const el = document.getElementById('status');
		if (el) el.textContent = msg;
	}

	// Try to load a local manifest `audio/list.json`. If present, switch to local audio mode.
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

	// Attach Play/Stop/Next handlers to the on-page controls
	const playBtn = document.getElementById('playBtn');
	const stopBtn = document.getElementById('stopBtn');
	const nextBtn = document.getElementById('nextBtn');
	const autoNextToggle = document.getElementById('autoNextToggle');
	if (autoNextToggle) autoNextToggle.addEventListener('change', () => {
		setStatus(autoNextToggle.checked ? 'Auto Next enabled.' : 'Auto Next disabled.');
	});

	if (playBtn) playBtn.addEventListener('click', () => {
		if (localMode) {
			startLocalPlayback();
			setStatus('Playing clip...');
		} else {
			setStatus('No local audio manifest found. Add audio/list.json and MP3s in /audio.');
		}
	});

	if (stopBtn) stopBtn.addEventListener('click', () => {
		stopLocalPlayback();
		setStatus('Playback stopped.');
	});

	if (nextBtn) nextBtn.addEventListener('click', () => {
		if (localMode) {
			// hide shown answer when user advances
			const ans = document.getElementById('answer'); if (ans) ans.textContent = '';
			nextLocal();
			setStatus('Playing next clip.');
		}
	});

    

	function showAnswer(){
		const answerEl = document.getElementById('answer');
		let toShow = '—';
		// Show the answer stored in the manifest, or the raw filename when none is set
		if (currentAnswer) toShow = currentAnswer;
		let raw = filenameOnly(currentFilenameKey);
		// if currentFilenameKey not set, try deriving from audio element src
		if (!raw && audioEl && audioEl.src) {
			try{ raw = filenameOnly(new URL(audioEl.src).pathname); } catch(e){ raw = filenameOnly(audioEl.src); }
			// strip leading 'audio/' if present
			if (raw.startsWith('audio/')) raw = raw.slice(6);
		}
		if (!currentAnswer) {
			if (raw) toShow = raw;
			else if (currentAnswerTitle) toShow = currentAnswerTitle;
			else if (currentAnswerNumber) toShow = currentAnswerNumber;
		}
		if (answerEl) answerEl.textContent = toShow;
		console.log('Show Answer ->', { currentFilenameKey, audioSrc: audioEl?audioEl.src:null, shown: toShow });
	}

	const showAnswerBtn = document.getElementById('showAnswerBtn');
	if (showAnswerBtn) showAnswerBtn.addEventListener('click', showAnswer);

	// mapping table and storage intentionally not used — Show Answer derives answers from filenames

	// file-picker removed; manifest or inline list is used for audio

	// If you want on-page controls again, re-add buttons with ids `playBtn`, `stopBtn`, `nextBtn`
});

// Expose a small API for debugging if needed
window.listeningPlayer = {
	play: () => { if (localMode) startLocalPlayback(); else console.warn('No local mode active'); },
	pause: () => { if (localMode) stopLocalPlayback(); else console.warn('No local mode active'); },
	next: () => { if (localMode) nextLocal(); else console.warn('No local mode active'); }
};

// ---------------------- Local playback functions ----------------------
async function loadLocalList() {
	try {
		// Try network fetch first (works when served via HTTP)
		let data = null;
		try {
			const res = await fetch('audio/list.json', { cache: 'no-store' });
			if (res && res.ok) {
				data = await res.json();
			}
		} catch (e) {
			// fetch may fail on file:// — we'll fall back
			console.warn('fetch audio/list.json failed (file:// or blocked):', e);
		}

		// Fallback: inline JSON embedded in the HTML (script#inlineList)
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

		// No manifest found — leave localMode false and allow file-picker fallback
		console.log('No audio/list.json or inline list found; file-picker fallback available.');
	} catch (e) {
		console.warn('No local audio manifest found or failed to load:', e);
	}
}

// File-picker removed — manifest or inline list is used for audio

function startLocalPlayback() {
	if (!localMode || localList.length === 0) {
		alert('No local audio files found. Put audio files in /audio and generate audio/list.json');
		return;
	}
	if (!audioEl) {
		audioEl = new Audio();
		audioEl.preload = 'auto';
		audioEl.addEventListener('ended', () => {
			clearLocalTimer();
			if (shouldAutoNext()) nextLocal();
		});
		// log playback errors
		audioEl.addEventListener('error', (ev)=>{
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
	console.log('playLocalIndex: set src=', audioEl.src);
	audioEl.currentTime = 0;
	audioEl.play().catch(err => console.error('Local audio play failed:', err));

	// determine and store the current answer title (friendly)
	let nameForAnswer = '';
	if (typeof item === 'string') nameForAnswer = item;
	else if (item && typeof item === 'object') nameForAnswer = item.name || '';
	currentAnswer = item && typeof item === 'object' ? String(item.answer || '') : '';
	currentAnswerTitle = formatTitle(nameForAnswer);
	// prefer the explicit number in the filename
	const num = extractNumber(nameForAnswer);
	currentAnswerNumber = num || '';
	// store raw filename key for mapping lookup
	currentFilenameKey = nameForAnswer;

	// hide any previously shown answer when a new track starts
	const answerElLocal = document.getElementById('answer');
	if (answerElLocal) answerElLocal.textContent = '';
	clearLocalTimer();
	localTimer = setTimeout(() => {
		try { audioEl.pause(); } catch (e){}
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

function shuffleArray(a) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
}

