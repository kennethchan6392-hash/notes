(function() {
    // ==========================================
    // 核心設定
    // ==========================================
    const CONFIG = {
        // GAS API (needs to be accessible to all)
        API_URL: "https://script.google.com/macros/s/AKfycbzBR4gG3BVVAtySbpV_n21FGlSWtO5C1XTcVOA3CkuoqS24YXZUFJ4LBNlsRo_-plqE/exec",
        
        NOTE_FREQUENCIES: {
            'C2':65.41,'D2':73.42,'E2':82.41,'F2':87.31,'G2':98.00,'A2':110.00,'B2':123.47,
            'C3':130.81,'D3':146.83,'E3':164.81,'F3':174.61,'G3':196.00,'A3':220.00,'B3':246.94,
            'C4':261.63,'D4':293.66,'E4':329.63,'F4':349.23,'G4':392.00,'A4':440.00,'B4':493.88,
            'C5':523.25,'D5':587.33,'E5':659.25,'F5':698.46,'G5':783.99,'A5':880.00,'B5':987.77,
            'C#2':69.30,'D#2':77.78,'F#2':92.50,'G#2':103.83,'A#2':116.54,
            'C#3':138.59,'D#3':155.56,'F#3':185.00,'G#3':207.65,'A#3':233.08,
            'C#4':277.18,'D#4':311.13,'F#4':369.99,'G#4':415.30,'A#4':466.16,
            'C#5':554.37,'D#5':622.25,'F#5':739.99,'G#5':830.61,'A#5':932.33,
            'D♭2':69.30,'E♭2':77.78,'G♭2':92.50,'A♭2':103.83,'B♭2':116.54,
            'D♭3':138.59,'E♭3':155.56,'G♭3':185.00,'A♭3':207.65,'B♭3':233.08,
            'D♭4':277.18,'E♭4':311.13,'G♭4':369.99,'A♭4':415.30,'B♭4':466.16,
            'D♭5':554.37,'E♭5':622.25,'G♭5':739.99,'A♭5':830.61,'B♭5':932.33,
        }
    };

    const MODE_CONFIG = {
        practice: { name:'練習模式', type:'practice', duration:Infinity, maxWrong:Infinity, scoreMulti:0 },
        speed30:  { name:'30秒速衝', type:'challenge', duration:30, maxWrong:Infinity, scoreMulti:1.2 },
        classic60:{ name:'1分鐘經典', type:'challenge', duration:60, maxWrong:Infinity, scoreMulti:1 },
        noMiss:   { name:'無失誤闖關', type:'challenge', duration:Infinity, maxWrong:1, scoreMulti:1.5 }
    };

    const TEXTBOOK_CONFIG = {
        1: { clef:['treble'], accidentalChance:0, noteRange:[2,9], ledgerAbove:false, ledgerBelow:false },
        2: { clef:['treble'], accidentalChance:0, noteRange:[0,11], ledgerAbove:false, ledgerBelow:true },
        3: { clef:['treble'], accidentalChance:0.1, noteRange:[0,12], ledgerAbove:true, ledgerBelow:true },
        4: { clef:['treble','treble','treble','bass'], accidentalChance:0.15, noteRange:[0,10], ledgerAbove:true, ledgerBelow:true },
        5: { clef:['treble','bass'], accidentalChance:0.25, noteRange:[0,10], ledgerAbove:true, ledgerBelow:true },
        6: { clef:['treble','bass'], accidentalChance:0.4, noteRange:[0,10], ledgerAbove:true, ledgerBelow:true }
    };

    const MAPS = {
        treble: [{letter:'C',octave:4,yFactor:5},{letter:'D',octave:4,yFactor:4.5},{letter:'E',octave:4,yFactor:4},{letter:'F',octave:4,yFactor:3.5},{letter:'G',octave:4,yFactor:3},{letter:'A',octave:4,yFactor:2.5},{letter:'B',octave:4,yFactor:2},{letter:'C',octave:5,yFactor:1.5},{letter:'D',octave:5,yFactor:1},{letter:'E',octave:5,yFactor:0.5},{letter:'F',octave:5,yFactor:0},{letter:'G',octave:5,yFactor:-0.5},{letter:'A',octave:5,yFactor:-1}],
        bass: [{letter:'G',octave:2,yFactor:4},{letter:'A',octave:2,yFactor:3.5},{letter:'B',octave:2,yFactor:3},{letter:'C',octave:3,yFactor:2.5},{letter:'D',octave:3,yFactor:2},{letter:'E',octave:3,yFactor:1.5},{letter:'F',octave:3,yFactor:1},{letter:'G',octave:3,yFactor:0.5},{letter:'A',octave:3,yFactor:0},{letter:'B',octave:3,yFactor:-0.5},{letter:'C',octave:4,yFactor:-1}],
        alto: [{letter:'F',octave:3,yFactor:5},{letter:'G',octave:3,yFactor:4.5},{letter:'A',octave:3,yFactor:4},{letter:'B',octave:3,yFactor:3.5},{letter:'C',octave:4,yFactor:3},{letter:'D',octave:4,yFactor:2.5},{letter:'E',octave:4,yFactor:2},{letter:'F',octave:4,yFactor:1.5},{letter:'G',octave:4,yFactor:1},{letter:'A',octave:4,yFactor:0.5},{letter:'B',octave:4,yFactor:0},{letter:'C',octave:5,yFactor:-0.5},{letter:'D',octave:5,yFactor:-1}],
        tenor: [{letter:'D',octave:3,yFactor:5},{letter:'E',octave:3,yFactor:4.5},{letter:'F',octave:3,yFactor:4},{letter:'G',octave:3,yFactor:3.5},{letter:'A',octave:3,yFactor:3},{letter:'B',octave:3,yFactor:2.5},{letter:'C',octave:4,yFactor:2},{letter:'D',octave:4,yFactor:1.5},{letter:'E',octave:4,yFactor:1},{letter:'F',octave:4,yFactor:0.5},{letter:'G',octave:4,yFactor:0},{letter:'A',octave:4,yFactor:-0.5},{letter:'B',octave:4,yFactor:-1}]
    };

    let dom = {};
    let state = {};
    let audio = {};

    // Preload accurate clef SVG images for canvas rendering
    const clefImages = { treble: new Image(), bass: new Image(), cClef: new Image() };
    clefImages.treble.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 130"><g fill="none" stroke="%231E1E2F" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M28,118 C28,124 22,128 17,126 C12,124 11,117 16,113 C21,109 28,112 28,118Z" fill="%231E1E2F" stroke="none"/><path d="M28,115 L28,98 C28,80 26,68 26,55 C26,35 38,18 38,10 C38,-2 30,-8 24,8 C18,24 20,50 26,68 C30,78 32,88 30,100 C28,110 20,114 16,110 C12,106 12,96 18,92 C24,88 30,94 28,102"/></g></svg>');
    clefImages.bass.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 80"><g fill="%231E1E2F"><circle cx="12" cy="28" r="5"/><path d="M12,28 C12,10 30,4 38,16 C46,28 36,48 18,52 C26,44 32,34 28,24 C24,14 16,18 12,28Z"/><circle cx="42" cy="18" r="3"/><circle cx="42" cy="34" r="3"/></g></svg>');
    clefImages.cClef.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 90"><g fill="%231E1E2F"><rect x="2" y="2" width="5" height="86" rx="1"/><rect x="10" y="2" width="2.5" height="86" rx="0.5"/><path d="M14,8 C30,8 30,22 14,26 L14,8Z M14,29 L18,33 L14,37Z M14,52 C30,52 30,66 14,70 L14,52Z M14,75 L18,71 L14,67Z" stroke="none"/><path d="M14,26 C28,26 34,34 34,44.5 C34,55 28,63 14,63" stroke="%231E1E2F" stroke-width="2.2" fill="none" stroke-linecap="round"/></g></svg>');
    // Redraw staff when any clef image finishes loading
    const onClefLoad = () => { if (state.currentNote && dom.ctx) drawStaff(); };
    clefImages.treble.onload = onClefLoad;
    clefImages.bass.onload = onClefLoad;
    clefImages.cClef.onload = onClefLoad;

    function initDOM() {
        dom = {
            screens: document.querySelectorAll('.screen'),
            screenSetup: document.getElementById('screen-setup'),
            screenGame: document.getElementById('screen-game'),
            screenLeaderboard: document.getElementById('screen-leaderboard'),
            
            // Global & Setup
            soundToggle: document.getElementById('soundToggle'), 
            modeCards: document.querySelectorAll('.mode-card'), 
            nameField: document.getElementById('nameField'), 
            idField: document.getElementById('idField'),
            userName: document.getElementById('userName'), 
            userGrade: document.getElementById('userGrade'), 
            userClass: document.getElementById('userClass'), 
            userId: document.getElementById('userId'),
            startBtn: document.getElementById('startBtn'), 
            settingsToggleBtn: document.getElementById('settingsToggleBtn'), 
            settingsContent: document.getElementById('settingsContent'), 
            settingsArrow: document.getElementById('settingsArrow'),
            inputs: document.querySelectorAll('#settingsContent input, #settingsContent select'),
            
            // Game
            canvas: document.getElementById('staffCanvas'), 
            canvasWrapper: document.getElementById('canvasWrapper'), 
            ctx: document.getElementById('staffCanvas').getContext('2d'),
            countdownOverlay: document.getElementById('countdownOverlay'), 
            endBtn: document.getElementById('endBtn'), 
            clefBadge: document.getElementById('clefBadge'), 
            inGameUser: document.getElementById('inGameUser'),
            messageBox: document.getElementById('messageBox'), 
            notesGrid: document.getElementById('notesGrid'), 
            revealBtn: document.getElementById('revealBtn'), 
            skipBtn: document.getElementById('skipBtn'), 
            timeProgress: document.getElementById('timeProgress'), 
            timeDisplay: document.getElementById('timeDisplay'), 
            scoreDisplay: document.getElementById('scoreDisplay'), 
            comboDisplay: document.getElementById('comboDisplay'),
            
            // Leaderboard
            rankList: document.getElementById('rankList'), 
            rankClassFilter: document.getElementById('rankClassFilter'), 
            rankGradeFilter: document.getElementById('rankGradeFilter'), 
            rankModeFilter: document.getElementById('rankModeFilter'),
            reportGrid: document.getElementById('reportGrid'), 
            reportWeakness: document.getElementById('reportWeakness'), 
            backToSetupBtn: document.getElementById('backToSetupBtn')
        };
    }

    function initState() {
        state = { 
            currentMode: 'classic60', 
            modeConfig: MODE_CONFIG.classic60, 
            gameActive: false, 
            timeLeft: 0, 
            timer: null, 
            score: 0, 
            totalQuestions: 0, 
            wrongCount: 0, 
            combo: 0, 
            maxCombo: 0, 
            answered: false, 
            currentUser: { name:'', grade:6, class:'A', id:'' }, 
            currentNote: null, 
            allRanks: [], 
            inputFocused: false, 
            wrongNoteStats: {}, 
            answerTimeList: [], 
            questionStartTime: 0 
        };
    }

    function initAudio() {
        audio = {
            ctx: null, 
            enabled: true, 
            initialized: false,
            init() { 
                if (this.initialized) return; 
                try { 
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)(); 
                    this.initialized = true; 
                } catch (e) { 
                    console.error('Audio context init error:', e);
                } 
            },
            resume() { 
                if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(e=>e); 
            },
            playNote(key) {
                if (!this.ctx || !this.enabled || !CONFIG.NOTE_FREQUENCIES[key]) return;
                this.resume(); 
                const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
                osc.type = 'sine'; 
                osc.frequency.value = CONFIG.NOTE_FREQUENCIES[key];
                osc.connect(gain); 
                gain.connect(this.ctx.destination);
                gain.gain.setValueAtTime(0, this.ctx.currentTime); 
                gain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.05); 
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
                osc.start(this.ctx.currentTime); 
                osc.stop(this.ctx.currentTime + 0.8);
            },
            playEffect(type) {
                if (!this.ctx || !this.enabled) return; 
                this.resume();
                const noteSoundOnlyEl = document.getElementById('noteSoundOnly');
                const countdownSoundEl = document.getElementById('countdownSound');
                if (noteSoundOnlyEl && noteSoundOnlyEl.checked && type !== 'countdown' && type !== 'timeup') return;
                const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
                osc.connect(gain); 
                gain.connect(this.ctx.destination); 
                let dur = 0.3;
                if(type==='countdown'){ 
                    osc.type='sine'; 
                    osc.frequency.value=880; 
                    gain.gain.setValueAtTime(0.2, this.ctx.currentTime); 
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime+0.2); 
                    dur=0.2; 
                }
                else if(type==='timeup'){ 
                    osc.type='triangle'; 
                    osc.frequency.setValueAtTime(440, this.ctx.currentTime); 
                    osc.frequency.setValueAtTime(220, this.ctx.currentTime+0.3); 
                    gain.gain.setValueAtTime(0.3, this.ctx.currentTime); 
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime+0.5); 
                    dur=0.5; 
                }
                else if(type==='wrong'){ 
                    osc.type='sawtooth'; 
                    osc.frequency.setValueAtTime(200, this.ctx.currentTime); 
                    osc.frequency.setValueAtTime(150, this.ctx.currentTime+0.1); 
                    gain.gain.setValueAtTime(0.2, this.ctx.currentTime); 
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime+0.3); 
                }
                else if(type==='warning'){ 
                    if(countdownSoundEl && !countdownSoundEl.checked) return; 
                    osc.type='sine'; 
                    osc.frequency.value=1100; 
                    gain.gain.setValueAtTime(0.15, this.ctx.currentTime); 
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime+0.3); 
                }
                osc.start(this.ctx.currentTime); 
                osc.stop(this.ctx.currentTime + dur);
            }
        };
    }

    // ==========================================
    // 介面切換系統
    // ==========================================
    function switchScreen(screenId) {
        dom.screens.forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        
        // 當切換到遊戲畫面時，需要重新計算 Canvas 的大小
        if (screenId === 'screen-game') {
            setTimeout(() => {
                setupHDPI();
                drawStaff();
            }, 50);
        }
    }

    // ==========================================
    // 繪圖系統 (使用純向量數學繪製)
    // ==========================================
    function setupHDPI() {
        const dpr = window.devicePixelRatio || 1;
        const rect = dom.canvasWrapper.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        dom.canvas.width = rect.width * dpr;
        dom.canvas.height = rect.height * dpr;
        dom.canvas.style.width = `${rect.width}px`;
        dom.canvas.style.height = `${rect.height}px`;
        dom.ctx.scale(dpr, dpr);
        dom.canvas.logicalWidth = rect.width;
        dom.canvas.logicalHeight = rect.height;
    }
    
    function drawTrebleClef(ctx, x, y, ls) {
        // Treble clef: image spans from ~line3 area down to below staff
        // y parameter = baseY + lineSpacing * 3  (bottom reference)
        const imgH = ls * 6.5;  // spans 6.5 line-spacings tall
        const imgW = imgH * (50 / 130); // aspect ratio from viewBox
        const drawX = x - imgW * 0.55;
        const drawY = y - imgH * 0.78; // position so curl sits on lines correctly
        if (clefImages.treble.complete) ctx.drawImage(clefImages.treble, drawX, drawY, imgW, imgH);
    }

    function drawBassClef(ctx, x, y, ls) {
        // Bass clef: y parameter = baseY + lineSpacing * 1  (top reference)
        const imgH = ls * 4;   // spans 4 line-spacings
        const imgW = imgH * (50 / 80);
        const drawX = x - imgW * 0.3;
        const drawY = y - imgH * 0.15;
        if (clefImages.bass.complete) ctx.drawImage(clefImages.bass, drawX, drawY, imgW, imgH);
    }

    function drawCClef(ctx, x, y, ls) {
        // C clef (alto/tenor): centered on the given y (the middle line reference)
        const imgH = ls * 4.5;  // spans about 4.5 line-spacings
        const imgW = imgH * (50 / 90);
        const drawX = x - imgW * 0.3;
        const drawY = y - imgH * 0.5; // vertically centered
        if (clefImages.cClef.complete) ctx.drawImage(clefImages.cClef, drawX, drawY, imgW, imgH);
    }

    function drawSharp(ctx, x, y, ls) {
        ctx.save(); ctx.translate(x, y); const s = ls / 10; ctx.scale(s, s);
        ctx.strokeStyle = '#1E1E2F'; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.lineWidth = 1.5; ctx.moveTo(-2, -12); ctx.lineTo(-2, 12); ctx.moveTo(3, -12); ctx.lineTo(3, 12); ctx.stroke();
        ctx.beginPath(); ctx.lineWidth = 3; ctx.moveTo(-6, -2); ctx.lineTo(7, -6); ctx.moveTo(-6, 6); ctx.lineTo(7, 2); ctx.stroke();
        ctx.restore();
    }

    function drawFlat(ctx, x, y, ls) {
        ctx.save(); ctx.translate(x, y); const s = ls / 10; ctx.scale(s, s);
        ctx.beginPath(); ctx.moveTo(-3, -16); ctx.lineTo(-3, 8); ctx.strokeStyle = '#1E1E2F'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-3, -4); ctx.bezierCurveTo(8, -10, 12, 5, -3, 8); ctx.bezierCurveTo(3, 4, 1, -2, -3, -4); ctx.fillStyle = '#1E1E2F'; ctx.fill();
        ctx.restore();
    }

    function drawStaff() {
        if(!dom.canvas.logicalWidth) setupHDPI();
        const w = dom.canvas.logicalWidth, h = dom.canvas.logicalHeight, ctx = dom.ctx;
        if (!w || !h) return;
        ctx.clearRect(0, 0, w, h);
        
        const lineSpacing = w < 400 ? 18 : 22, baseY = h / 2 - (lineSpacing * 2), centerX = w / 2, middleLineY = baseY + 2*lineSpacing;
        ctx.strokeStyle = '#1E1E2F'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        const startX = w < 400 ? 25 : 50;
        
        for(let i=0; i<5; i++) { ctx.beginPath(); ctx.moveTo(startX, baseY + i*lineSpacing); ctx.lineTo(w - startX, baseY + i*lineSpacing); ctx.stroke(); }
        if (!state.currentNote) return;

        const noteY = baseY + state.currentNote.yFactor * lineSpacing;
        
        const highlightLineEl = document.getElementById('highlightLine');
        if (highlightLineEl && highlightLineEl.checked && !state.answered) {
            ctx.strokeStyle = 'rgba(6, 214, 160, 0.4)'; ctx.lineWidth = lineSpacing * 0.8;
            ctx.beginPath(); ctx.moveTo(centerX-35, noteY); ctx.lineTo(centerX+35, noteY); ctx.stroke();
        }

        const clefX = startX + (w < 400 ? 25 : 35);
        if (state.currentNote.clef === 'treble') { dom.clefBadge.textContent = '高音譜號'; drawTrebleClef(ctx, clefX, baseY + lineSpacing * 3, lineSpacing); }
        else if (state.currentNote.clef === 'bass') { dom.clefBadge.textContent = '低音譜號'; drawBassClef(ctx, clefX, baseY + lineSpacing * 1, lineSpacing); }
        else if (state.currentNote.clef === 'alto') { dom.clefBadge.textContent = '中音譜號'; drawCClef(ctx, clefX, baseY + lineSpacing * 2, lineSpacing); }
        else if (state.currentNote.clef === 'tenor') { dom.clefBadge.textContent = '次中音譜號'; drawCClef(ctx, clefX, baseY + lineSpacing * 1, lineSpacing); }

        ctx.strokeStyle = '#1E1E2F'; ctx.lineWidth = 2.5; const lW = 24;
        if (state.currentNote.yFactor > 4) for(let i=1; i<=Math.floor(state.currentNote.yFactor - 4); i++) { ctx.beginPath(); ctx.moveTo(centerX-lW, baseY + (4+i)*lineSpacing); ctx.lineTo(centerX+lW, baseY + (4+i)*lineSpacing); ctx.stroke(); }
        if (state.currentNote.yFactor < 0) for(let i=1; i<=Math.floor(Math.abs(state.currentNote.yFactor)); i++) { ctx.beginPath(); ctx.moveTo(centerX-lW, baseY - i*lineSpacing); ctx.lineTo(centerX+lW, baseY - i*lineSpacing); ctx.stroke(); }

        if (state.currentNote.accidental) { 
            const accX = centerX - lineSpacing * 2.2;
            if (state.currentNote.accidental === '#') drawSharp(ctx, accX, noteY, lineSpacing);
            else drawFlat(ctx, accX, noteY, lineSpacing);
        }

        const noteHeadStyleEl = document.getElementById('noteHeadStyle');
        const headStyle = noteHeadStyleEl ? noteHeadStyleEl.value : 'filled';
        ctx.fillStyle = '#1E1E2F'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.ellipse(centerX, noteY, lineSpacing*0.65, lineSpacing*0.48, -0.35, 0, Math.PI*2);
        if (headStyle === 'whole') ctx.stroke();
        else {
            if (headStyle === 'half') { ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke(); } else ctx.fill();
            ctx.beginPath();
            if (noteY < middleLineY) { ctx.moveTo(centerX - lineSpacing*0.55, noteY + 2); ctx.lineTo(centerX - lineSpacing*0.55, noteY + lineSpacing*3.5); }
            else { ctx.moveTo(centerX + lineSpacing*0.55, noteY - 2); ctx.lineTo(centerX + lineSpacing*0.55, noteY - lineSpacing*3.5); }
            ctx.stroke();
        }
    }

    // ==========================================
    // 遊戲主邏輯
    // ==========================================
    function toggleCheckboxAppearance() {
        document.querySelectorAll('.checkbox-item').forEach(lbl => {
            const cb = lbl.querySelector('input');
            if(cb && cb.checked) lbl.classList.add('checked'); else lbl.classList.remove('checked');
        });
    }

    function handleTextbookModeChange() {
        const tbModeEl = document.getElementById('textbookMode');
        const tbMode = tbModeEl ? tbModeEl.value : "0";
        const groups = ['clefGroup', 'accidentalGroup', 'ledgerGroup'];
        if (tbMode !== "0") {
            groups.forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('disabled-group'); });
            const cfg = TEXTBOOK_CONFIG[tbMode];
            if (cfg) {
                const clefTrebleEl = document.getElementById('clefTreble'); if (clefTrebleEl) clefTrebleEl.checked = cfg.clef.includes('treble');
                const clefBassEl = document.getElementById('clefBass'); if (clefBassEl) clefBassEl.checked = cfg.clef.includes('bass');
                const clefAltoEl = document.getElementById('clefAlto'); if (clefAltoEl) clefAltoEl.checked = false;
                const clefTenorEl = document.getElementById('clefTenor'); if (clefTenorEl) clefTenorEl.checked = false;
                const accSharpEl = document.getElementById('accidentalSharp'); if (accSharpEl) accSharpEl.checked = cfg.accidentalChance > 0;
                const accFlatEl = document.getElementById('accidentalFlat'); if (accFlatEl) accFlatEl.checked = cfg.accidentalChance > 0;
                const ledgerAboveEl = document.getElementById('ledgerLineAbove'); if (ledgerAboveEl) ledgerAboveEl.checked = cfg.ledgerAbove;
                const ledgerBelowEl = document.getElementById('ledgerLineBelow'); if (ledgerBelowEl) ledgerBelowEl.checked = cfg.ledgerBelow;
            }
        } else {
            groups.forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('disabled-group'); });
        }
        toggleCheckboxAppearance(); buildNoteButtons();
    }

    function saveSettings() {
        const s = {}; dom.inputs.forEach(el => s[el.id] = el.type==='checkbox' ? el.checked : el.value);
        s.lastMode = state.currentMode; localStorage.setItem('musicGameSettingsV4', JSON.stringify(s));
    }

    function loadSavedSettings() {
        const stored = localStorage.getItem('musicGameSettingsV4');
        if (!stored) return;
        try {
            const s = JSON.parse(stored);
            if (s) {
                dom.inputs.forEach(el => { if (s[el.id] !== undefined) { if (el.type==='checkbox') el.checked=s[el.id]; else el.value=s[el.id]; } });
                if (s.lastMode && MODE_CONFIG[s.lastMode]) { state.currentMode = s.lastMode; state.modeConfig = MODE_CONFIG[s.lastMode]; dom.modeCards.forEach(c => c.classList.remove('active')); document.querySelector(`.mode-card[data-mode="${s.lastMode}"]`)?.classList.add('active'); }
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
        handleTextbookModeChange();
    }

    function updateScoreboard() { dom.scoreDisplay.textContent = state.score; dom.comboDisplay.textContent = state.combo; }
    
    function enableGameControls(enabled) { 
        document.querySelectorAll('.note-btn').forEach(btn => btn.disabled = !enabled || state.answered); 
        dom.revealBtn.disabled = !enabled || state.answered; 
        dom.skipBtn.disabled = !enabled || state.answered; 
        dom.endBtn.disabled = !enabled; 
    }

    function generateNote() {
        const tbModeEl = document.getElementById('textbookMode');
        const tbMode = tbModeEl ? tbModeEl.value : "0";
        const config = TEXTBOOK_CONFIG[tbMode];
        let clefOptions = [], accidentalChance = 0, noteRange = [0, 10], allowAbove = true, allowBelow = true;
        
        if (config) { 
            clefOptions = config.clef; accidentalChance = config.accidentalChance; noteRange = config.noteRange; allowAbove = config.ledgerAbove; allowBelow = config.ledgerBelow; 
        } else {
            ['Treble','Bass','Alto','Tenor'].forEach(c => { 
                const el = document.getElementById(`clef${c}`);
                if(el && el.checked) clefOptions.push(c.toLowerCase()); 
            });
            if (!clefOptions.length) clefOptions = ['treble'];
            const accSharpEl = document.getElementById('accidentalSharp');
            const accFlatEl = document.getElementById('accidentalFlat');
            accidentalChance = ((accSharpEl && accSharpEl.checked) || (accFlatEl && accFlatEl.checked)) ? 0.3 : 0;
            
            const ledgerAboveEl = document.getElementById('ledgerLineAbove');
            const ledgerBelowEl = document.getElementById('ledgerLineBelow');
            allowAbove = ledgerAboveEl ? ledgerAboveEl.checked : true; 
            allowBelow = ledgerBelowEl ? ledgerBelowEl.checked : true;
            noteRange = allowBelow ? [0,10] : [2,10]; if (!allowAbove) noteRange[1] = 9;
        }

        const clef = clefOptions[Math.floor(Math.random() * clefOptions.length)], base = MAPS[clef][Math.floor(Math.random() * (noteRange[1]-noteRange[0]+1)) + noteRange[0]];
        let finalName = base.letter, accidental = null;
        if (Math.random() < accidentalChance) {
            const isSharp = Math.random() < 0.5;
            const accSharpEl = document.getElementById('accidentalSharp');
            const accFlatEl = document.getElementById('accidentalFlat');
            if (isSharp && (accSharpEl && accSharpEl.checked) && base.letter !== 'E' && base.letter !== 'B') { finalName += '#'; accidental = '#'; }
            else if (!isSharp && (accFlatEl && accFlatEl.checked) && base.letter !== 'F' && base.letter !== 'C') { finalName += '♭'; accidental = '♭'; }
        }
        return { ...base, clef, accidental, correctName: finalName, freqKey: finalName + base.octave };
    }

    function buildNoteButtons() {
        dom.notesGrid.innerHTML = '';
        const keys = { 'C':'1', 'D':'2', 'E':'3', 'F':'4', 'G':'5', 'A':'6', 'B':'7', 'C#':'Q', 'D#':'W', 'F#':'E', 'G#':'R', 'A#':'T', 'D♭':'A', 'E♭':'S', 'G♭':'D', 'A♭':'F', 'B♭':'G'};
        const buildRow = (notes, cls) => {
            const div = document.createElement('div'); div.className = 'note-row';
            notes.forEach(n => {
                const btn = document.createElement('button'); btn.className = `note-btn ${cls}`; btn.dataset.note = n; btn.disabled = true;
                btn.innerHTML = `${n}<span class="key-hint">${keys[n]}</span>`; btn.addEventListener('click', () => handleAnswer(n)); div.appendChild(btn);
            }); dom.notesGrid.appendChild(div);
        };
        buildRow(['C','D','E','F','G','A','B'], 'natural');
        const accSharpEl = document.getElementById('accidentalSharp');
        const accFlatEl = document.getElementById('accidentalFlat');
        if (accSharpEl && accSharpEl.checked) buildRow(['C#','D#','F#','G#','A#'], 'sharp');
        if (accFlatEl && accFlatEl.checked) buildRow(['D♭','E♭','G♭','A♭','B♭'], 'flat');
    }

    function handleAnswer(answer) {
        if (!state.gameActive || state.answered) return;
        state.answerTimeList.push((Date.now() - state.questionStartTime) / 1000); 
        state.totalQuestions++; 
        audio.resume();
        const correct = answer === state.currentNote.correctName, btn = document.querySelector(`.note-btn[data-note="${answer}"]`);

        if (correct) {
            state.answered = true; 
            state.combo++; 
            if (state.combo > state.maxCombo) state.maxCombo = state.combo;
            if (state.modeConfig.type === 'challenge') state.score += Math.round(10 * state.modeConfig.scoreMulti + state.combo);
            dom.messageBox.textContent = `✅ 太棒了！這是 ${state.currentNote.correctName} | 分數：${state.score}`; 
            dom.messageBox.className = 'message-box correct';
            audio.playNote(state.currentNote.freqKey);
            if (btn) btn.classList.add('correct'); 
            setTimeout(() => { if (btn) btn.classList.remove('correct', 'wrong'); if (state.gameActive) nextQuestion(); }, 500);
        } else {
            const statKey = `${state.currentNote.correctName} (${state.currentNote.clef==='treble'?'高音':'低音'})`;
            state.wrongNoteStats[statKey] = (state.wrongNoteStats[statKey]||0) + 1; 
            state.combo = 0; 
            audio.playEffect('wrong');
            
            const allowRetryEl = document.getElementById('allowRetry');
            if (state.wrongCount + 1 >= state.modeConfig.maxWrong || (allowRetryEl && !allowRetryEl.checked)) {
                state.answered = true; 
                state.wrongCount++; 
                dom.messageBox.textContent = `❌ 答錯了！正確答案是 ${state.currentNote.correctName}`; 
                dom.messageBox.className = 'message-box wrong';
                if (btn) btn.classList.add('wrong'); 
                setTimeout(() => { if (btn) btn.classList.remove('wrong'); if (state.gameActive) { if(state.modeConfig.maxWrong !== Infinity) endGame(); else nextQuestion(); } }, 800);
            } else {
                dom.messageBox.textContent = `❌ 答錯了！再試一次吧！`; 
                dom.messageBox.className = 'message-box warning';
                if (btn) { btn.classList.add('wrong'); setTimeout(() => btn.classList.remove('wrong'), 500); }
            }
        } 
        updateScoreboard();
    }

    function nextQuestion() { 
        state.currentNote = generateNote(); 
        state.answered = false; 
        state.questionStartTime = Date.now(); 
        drawStaff(); 
        enableGameControls(true); 
    }

    function startCountdown(callback) {
        let count = 3; 
        dom.countdownOverlay.textContent = count; 
        dom.countdownOverlay.classList.add('show'); 
        audio.playEffect('countdown');
        const timer = setInterval(() => {
            count--;
            if (count <= 0) { 
                clearInterval(timer); 
                dom.countdownOverlay.classList.remove('show'); 
                callback(); 
            }
            else { 
                dom.countdownOverlay.textContent = count; 
                dom.countdownOverlay.classList.remove('show'); 
                void dom.countdownOverlay.offsetWidth; 
                dom.countdownOverlay.classList.add('show'); 
                audio.playEffect('countdown'); 
            }
        }, 1000);
    }

    function startGame() {
        audio.init(); 
        audio.resume();
        if (!dom.userName.value.trim() || !dom.userId.value.trim()) {
            dom.nameField.classList.toggle('error', !dom.userName.value.trim()); 
            dom.idField.classList.toggle('error', !dom.userId.value.trim());
            alert('⚠️ 請先填寫完整的姓名與座號！');
            return;
        }
        saveSettings();
        state.currentUser = { name: dom.userName.value.trim(), grade: parseInt(dom.userGrade.value), class: dom.userClass.value, id: dom.userId.value.trim() };
        dom.inGameUser.textContent = `👋 ${state.currentUser.name} 加油！模式：${state.modeConfig.name}`;

        state.gameActive = false; 
        state.timeLeft = state.modeConfig.duration; 
        state.score = 0; 
        state.totalQuestions = 0; 
        state.wrongCount = 0; 
        state.combo = 0; 
        state.maxCombo = 0; 
        state.answered = false; 
        state.wrongNoteStats = {}; 
        state.answerTimeList = [];
        
        switchScreen('screen-game');

        startCountdown(() => {
            state.gameActive = true;
            if (state.timeLeft !== Infinity) { 
                state.timer = setInterval(updateTimer, 1000); 
                dom.timeDisplay.textContent = `${state.timeLeft}s`; 
            } else {
                dom.timeDisplay.textContent = '∞';
            }
            dom.timeProgress.style.width = '100%'; 
            dom.timeProgress.style.transition = 'none'; 
            updateScoreboard();
            dom.messageBox.textContent = `🎮 ${state.modeConfig.name} 開始！`; 
            dom.messageBox.className = 'message-box'; 
            nextQuestion();
            if (state.timeLeft !== Infinity) {
                setTimeout(() => { 
                    dom.timeProgress.style.transition = `width ${state.timeLeft}s linear`; 
                    dom.timeProgress.style.width = '0%'; 
                }, 50);
            }
        });
    }

    function updateTimer() {
        if (state.timeLeft === Infinity) return; 
        state.timeLeft--; 
        dom.timeDisplay.textContent = `${state.timeLeft}s`;
        if (state.timeLeft === 10) { 
            dom.timeDisplay.classList.add('warning'); 
            dom.timeProgress.classList.add('warning'); 
            dom.messageBox.textContent = '⚠️ 最後10秒！加快速度！'; 
            dom.messageBox.className = 'message-box warning'; 
        }
        if (state.timeLeft <= 10 && state.timeLeft > 0) audio.playEffect('warning');
        if (state.timeLeft <= 0) { 
            clearInterval(state.timer); 
            dom.timeDisplay.classList.remove('warning'); 
            dom.timeProgress.classList.remove('warning'); 
            audio.playEffect('timeup'); 
            endGame(); 
        }
    }

    function generateReport() {
        const accuracy = state.totalQuestions ? Math.round(((state.totalQuestions - state.wrongCount) / state.totalQuestions) * 100) : 0;
        const avg = state.answerTimeList.length ? (state.answerTimeList.reduce((a,b)=>a+b,0)/state.answerTimeList.length).toFixed(1) : 0;
        dom.reportGrid.innerHTML = `<div class="report-item"><div class="report-label">總答題</div><div class="report-value">${state.totalQuestions}</div></div><div class="report-item"><div class="report-label">得分</div><div class="report-value">${state.score}</div></div><div class="report-item"><div class="report-label">正確率</div><div class="report-value">${accuracy}%</div></div><div class="report-item"><div class="report-label">平均用時</div><div class="report-value">${avg}s</div></div><div class="report-item"><div class="report-label">最高連對</div><div class="report-value">${state.maxCombo}</div></div><div class="report-item"><div class="report-label">錯題</div><div class="report-value" style="color:var(--primary-red)">${state.wrongCount}</div></div>`;
        const sorted = Object.entries(state.wrongNoteStats).sort((a,b)=>b[1]-a[1]);
        dom.reportWeakness.innerHTML = sorted.length ? `<div>最常錯誤的音符：</div><ul>${sorted.slice(0,3).map(([k,v]) => `<li><strong>${k}</strong>：錯了 ${v} 次</li>`).join('')}</ul>` : '<div>太棒了！本次沒有錯題，絕對音感大師！ 🎉</div>';
    }

    // ==========================================
    // 🏆 排行榜與 API 串接
    // ==========================================
    async function submitScore() {
        if (!state.currentUser.name || state.modeConfig.type !== 'challenge') return;
        if (state.score === 0 && state.totalQuestions === 0) return;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const record = {
            name: state.currentUser.name,
            grade: state.currentUser.grade,
            class: state.currentUser.class,
            id: state.currentUser.id,
            mode: state.currentMode,
            mode_name: state.modeConfig.name,
            score: state.score,
            max_combo: state.maxCombo,
            total_questions: state.totalQuestions,
            accuracy: state.totalQuestions ? Math.round(((state.totalQuestions - state.wrongCount) / state.totalQuestions) * 100) : 0,
            timestamp: new Date().toLocaleString('zh-TW')
        };

        try {
            await fetch(CONFIG.API_URL, { 
                method: 'POST', 
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
                body: JSON.stringify(record),
                signal: controller.signal
            });
            setTimeout(loadRanks, 1500);
        } catch (e) {
            console.error("上傳失敗：", e);
        } finally {
            clearTimeout(timeoutId);
        }
    }

    function endGame() { 
        state.gameActive = false; 
        enableGameControls(false); 
        clearInterval(state.timer); 
        dom.timeProgress.style.transition = 'none'; 
        
        generateReport(); 
        if (state.modeConfig.type === 'challenge') submitScore(); 
        
        document.querySelector('.leaderboard-layout').classList.remove('view-only');
        loadRanks();
        switchScreen('screen-leaderboard');
    }

    async function loadRanks() {
        dom.rankList.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-light); font-weight:800;">📡 載入中...</div>';
        try { 
            const res = await fetch(`${CONFIG.API_URL}?v=${Date.now()}`);
            if (!res.ok) throw new Error("伺服器回應錯誤");
            const data = await res.json();
            state.allRanks = Array.isArray(data) ? data.filter(r => r && r.mode) : []; 
            renderRanks(); 
        } catch (e) { 
            dom.rankList.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-light); font-weight:800;">❌ 無法連線至排行榜<br><span style="font-size:0.8rem; font-weight:normal;">請檢查網路或 API 部署權限</span></div>'; 
            console.warn("排行榜載入異常：", e);
        }
    }

    function renderRanks() {
        const fC = dom.rankClassFilter.value, fG = parseInt(dom.rankGradeFilter.value), fM = dom.rankModeFilter.value;
        let f = state.allRanks.filter(r => r.mode === fM); 
        if (fC !== '0') f = f.filter(r => r.class === fC); 
        if (fG !== 0) f = f.filter(r => parseInt(r.grade) === fG);
        f.sort((a,b)=> (parseInt(b.score)||0) - (parseInt(a.score)||0) || (parseInt(b.max_combo)||0) - (parseInt(a.max_combo)||0));
        if (!f.length) { 
            dom.rankList.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-light); font-weight:800;">該模式還沒有挑戰紀錄喔！</div>'; 
            return; 
        }
        dom.rankList.innerHTML = f.slice(0, 50).map((item, i) => {
            const isSelf = state.currentUser.name === item.name && state.currentUser.id === item.id;
            return `<div class="rank-item ${i===0?'first':i===1?'second':i===2?'third':''} ${isSelf?'self':''}">
                <div class="rank-pos">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1+'.'}</div>
                <div class="rank-name"><span>${item.class}班 ${item.name}</span><div class="rank-badges">${isSelf?'<span class="rank-tag" style="background:var(--primary-purple)">你</span>':''} <span class="rank-tag" style="background:#CBD5E1; color:#333;">${item.accuracy}% 正確率</span></div></div>
                <div class="rank-score">${item.score}</div></div>`;
        }).join('');
    }

    function initEvents() {
        window.addEventListener('resize', () => { if(state.gameActive || state.currentNote) { setupHDPI(); drawStaff(); } });
        dom.soundToggle.addEventListener('click', () => { audio.enabled = !audio.enabled; dom.soundToggle.textContent = audio.enabled ? '🔊' : '🔇'; localStorage.setItem('musicGameSoundEnabled', audio.enabled); });
        dom.modeCards.forEach(card => card.addEventListener('click', () => { dom.modeCards.forEach(c => c.classList.remove('active')); card.classList.add('active'); state.currentMode = card.dataset.mode; state.modeConfig = MODE_CONFIG[state.currentMode]; saveSettings(); }));
        
        dom.settingsToggleBtn.addEventListener('click', () => { dom.settingsContent.classList.toggle('show'); dom.settingsArrow.textContent = dom.settingsContent.classList.contains('show') ? '▲ 摺疊' : '▼ 展開'; });
        dom.inputs.forEach(el => el.addEventListener('change', () => { if (el.id === 'textbookMode') handleTextbookModeChange(); toggleCheckboxAppearance(); saveSettings(); if (el.id.startsWith('clef') || el.id.startsWith('accidental')) { buildNoteButtons(); enableGameControls(false); } }));
        
        dom.startBtn.addEventListener('click', startGame); 
        dom.endBtn.addEventListener('click', endGame); 
        dom.backToSetupBtn.addEventListener('click', () => { 
            document.querySelector('.leaderboard-layout').classList.remove('view-only');
            switchScreen('screen-setup'); 
        });
        document.getElementById('viewRanksBtn')?.addEventListener('click', () => {
            document.querySelector('.leaderboard-layout').classList.add('view-only');
            document.getElementById('reportGrid').innerHTML = '';
            document.getElementById('reportWeakness').innerHTML = '';
            loadRanks();
            switchScreen('screen-leaderboard');
        });
        
        dom.revealBtn.addEventListener('click', () => { if (!state.gameActive || state.answered) return; state.answered = true; state.combo = 0; updateScoreboard(); dom.messageBox.textContent = `🔍 答案是：${state.currentNote.correctName}`; dom.messageBox.className = 'message-box warning'; enableGameControls(false); setTimeout(() => { dom.messageBox.className = 'message-box'; nextQuestion(); }, 1500); });
        dom.skipBtn.addEventListener('click', () => { if (!state.gameActive || state.answered) return; state.answered = true; state.combo = 0; updateScoreboard(); dom.messageBox.textContent = '⏩ 跳過這題！'; dom.messageBox.className = 'message-box'; setTimeout(() => nextQuestion(), 400); });
        
        [dom.rankClassFilter, dom.rankGradeFilter, dom.rankModeFilter].forEach(f => f.addEventListener('change', renderRanks));
        const preventInput = () => state.inputFocused = true;
        const allowInput = () => state.inputFocused = false; 
        [dom.userName, dom.userId].forEach(el => { el.addEventListener('focus', preventInput); el.addEventListener('blur', allowInput); });
        
        document.addEventListener('keydown', (e) => { 
            if (state.inputFocused) return; 
            if (!state.gameActive) { 
                if (e.code === 'Enter' && dom.screenSetup.classList.contains('active')) { 
                    e.preventDefault(); 
                    dom.startBtn.click(); 
                } 
                return; 
            } 
            const note = { '1':'C', '2':'D', '3':'E', '4':'F', '5':'G', '6':'A', '7':'B', 'Q':'C#','W':'D#','E':'F#','R':'G#','T':'A#', 'A':'D♭','S':'E♭','D':'G♭','F':'A♭','G':'B♭' }[e.key.toUpperCase()]; 
            if (note) { 
                e.preventDefault(); 
                if (document.querySelector(`.note-btn[data-note="${note}"]`)) handleAnswer(note); 
            } else if (e.code === 'Space') { 
                e.preventDefault(); 
                dom.skipBtn.click(); 
            } 
        });
    }

    // Initialize on DOM ready
    window.addEventListener('DOMContentLoaded', () => {
        initDOM();
        initState();
        initAudio();
        buildNoteButtons(); 
        const storedSound = localStorage.getItem('musicGameSoundEnabled'); 
        if (storedSound !== null) { 
            audio.enabled = storedSound === 'true'; 
            dom.soundToggle.textContent = audio.enabled ? '🔊' : '🔇'; 
        }
        loadSavedSettings(); 
        toggleCheckboxAppearance(); 
        enableGameControls(false); 
        initEvents();
    });
})();
