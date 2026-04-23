(function() {
    // ==========================================
    // 核心設定
    // ==========================================
    const CONFIG = {
        // GAS API (needs to be accessible to all)
        API_URL: "https://script.google.com/macros/s/AKfycbybYu8OVufu2t8HxB8nvqRG4z2FUGDdkseMpzFAJn2WLiPYJH5JbLqjlpvPuQycUyRu/exec",
        
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

    // Named constants (extracted from magic numbers)
    const SLOW_ANSWER_MS = 4000;
    const STAFF_LEFT_PAD_NARROW = 30;
    const STAFF_LEFT_PAD_WIDE = 50;
    const MAX_CONFETTI = 25;
    const COMBO_CONFETTI_INTERVAL = 5;

    const MODE_CONFIG = {
        practice: { name:'練習模式', type:'practice', duration:Infinity, maxWrong:Infinity, scoreMulti:0 },
        classic60:{ name:'高音譜號挑戰', type:'challenge', duration:60, maxWrong:Infinity, scoreMulti:1, forceClef:'treble' },
        bass60:   { name:'低音譜號挑戰', type:'challenge', duration:60, maxWrong:Infinity, scoreMulti:1, forceClef:'bass' },
        mixed60:  { name:'混合譜號挑戰', type:'challenge', duration:60, maxWrong:Infinity, scoreMulti:1.2, forceClef:'mixed' },
        noMiss:   { name:'零失誤挑戰', type:'challenge', duration:Infinity, maxWrong:1, scoreMulti:1.5 },
        keysig_practice:  { name:'調號練習', type:'practice', duration:Infinity, maxWrong:Infinity, scoreMulti:0, gameType:'keysig' },
        keysig60:         { name:'調號挑戰', type:'challenge', duration:60, maxWrong:Infinity, scoreMulti:1, gameType:'keysig' },
        solfege_practice: { name:'唱名練習', type:'practice', duration:Infinity, maxWrong:Infinity, scoreMulti:0, gameType:'solfege' },
        solfege60:        { name:'唱名挑戰', type:'challenge', duration:60, maxWrong:Infinity, scoreMulti:1, gameType:'solfege' }
    };

    const TEXTBOOK_CONFIG = {
        1: { clef:['treble'], accidentalChance:0,    noteRange:[0,4],  ledgerAbove:false, ledgerBelow:false },
        2: { clef:['treble'], accidentalChance:0,    noteRange:[0,7],  ledgerAbove:false, ledgerBelow:false },
        3: { clef:['treble'], accidentalChance:0.1,  noteRange:[0,9],  ledgerAbove:false, ledgerBelow:false },
        4: { clef:['treble','bass'], accidentalChance:0.15, noteRange:[0,11], ledgerAbove:true,  ledgerBelow:false },
        5: { clef:['treble','bass'], accidentalChance:0.25, noteRange:[0,12], ledgerAbove:true,  ledgerBelow:true },
        6: { clef:['treble','bass'], accidentalChance:0.4,  noteRange:[0,12], ledgerAbove:true,  ledgerBelow:true }
    };

    // Per-clef, per-grade challenge levels (P1–P6)
    // Bass MAPS: G2(0) A2(1) B2(2) C3(3) D3(4) E3(5) F3(6) G3(7) A3(8) B3(9) C4(10)
    const CHALLENGE_LEVELS = {
        treble: {
            1: { noteRange:[0,4],  accidentalChance:0,    ledgerAbove:false, ledgerBelow:false },
            2: { noteRange:[0,7],  accidentalChance:0,    ledgerAbove:false, ledgerBelow:false },
            3: { noteRange:[0,9],  accidentalChance:0.1,  ledgerAbove:false, ledgerBelow:false },
            4: { noteRange:[0,11], accidentalChance:0.15, ledgerAbove:true,  ledgerBelow:false },
            5: { noteRange:[0,12], accidentalChance:0.25, ledgerAbove:true,  ledgerBelow:true },
            6: { noteRange:[0,12], accidentalChance:0.4,  ledgerAbove:true,  ledgerBelow:true }
        },
        bass: {
            1: { noteRange:[3,7],  accidentalChance:0,    ledgerAbove:false, ledgerBelow:false },
            2: { noteRange:[2,8],  accidentalChance:0,    ledgerAbove:false, ledgerBelow:false },
            3: { noteRange:[1,9],  accidentalChance:0.1,  ledgerAbove:false, ledgerBelow:false },
            4: { noteRange:[0,10], accidentalChance:0.15, ledgerAbove:false, ledgerBelow:true },
            5: { noteRange:[0,10], accidentalChance:0.25, ledgerAbove:true,  ledgerBelow:true },
            6: { noteRange:[0,10], accidentalChance:0.4,  ledgerAbove:true,  ledgerBelow:true }
        }
    };

    const SOLFEGE = {C:'Do',D:'Re',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si'};
    const noteSol = n => { const b = SOLFEGE[n.letter]; if (!b) return ''; return b + (n.accidental==='#'?'♯':n.accidental==='♭'?'♭':''); };

    // ==========================================
    // 調號辨別 + 唱名辨別 資料
    // ==========================================
    const KEY_SIGNATURES = [
        { id:'C',  name:'C大調',  sharps:0, flats:0, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-0n.png', grade:1,
          sharpNotes:[], flatNotes:[], scale:['C','D','E','F','G','A','B'] },
        { id:'G',  name:'G大調',  sharps:1, flats:0, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-1s.png', grade:1,
          sharpNotes:['F'], flatNotes:[], scale:['G','A','B','C','D','E','F#'] },
        { id:'F',  name:'F大調',  sharps:0, flats:1, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-1f.png', grade:1,
          sharpNotes:[], flatNotes:['B'], scale:['F','G','A','B♭','C','D','E'] },
        { id:'D',  name:'D大調',  sharps:2, flats:0, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-2s.png', grade:3,
          sharpNotes:['F','C'], flatNotes:[], scale:['D','E','F#','G','A','B','C#'] },
        { id:'Bb', name:'B♭大調', sharps:0, flats:2, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-2f.png', grade:3,
          sharpNotes:[], flatNotes:['B','E'], scale:['B♭','C','D','E♭','F','G','A'] },
        { id:'A',  name:'A大調',  sharps:3, flats:0, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-3s.png', grade:4,
          sharpNotes:['F','C','G'], flatNotes:[], scale:['A','B','C#','D','E','F#','G#'] },
        { id:'Eb', name:'E♭大調', sharps:0, flats:3, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-3f.png', grade:4,
          sharpNotes:[], flatNotes:['B','E','A'], scale:['E♭','F','G','A♭','B♭','C','D'] },
        { id:'E',  name:'E大調',  sharps:4, flats:0, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-4s.png', grade:5,
          sharpNotes:['F','C','G','D'], flatNotes:[], scale:['E','F#','G#','A','B','C#','D#'] },
        { id:'Ab', name:'A♭大調', sharps:0, flats:4, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-4f.png', grade:5,
          sharpNotes:[], flatNotes:['B','E','A','D'], scale:['A♭','B♭','C','D♭','E♭','F','G'] },
        { id:'B',  name:'B大調',  sharps:5, flats:0, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-5s.png', grade:6,
          sharpNotes:['F','C','G','D','A'], flatNotes:[], scale:['B','C#','D#','E','F#','G#','A#'] },
        { id:'Db', name:'D♭大調', sharps:0, flats:5, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-5f.png', grade:6,
          sharpNotes:[], flatNotes:['B','E','A','D','G'], scale:['D♭','E♭','F','G♭','A♭','B♭','C'] }
    ];

    function getKeysigPool(grade) {
        let pool = KEY_SIGNATURES.filter(k => k.grade <= grade);
        // Ensure at least 2 options for question generation; expand grade if needed
        if (pool.length < 2) {
            for (let g = grade + 1; g <= 6 && pool.length < 2; g++) {
                pool = KEY_SIGNATURES.filter(k => k.grade <= g);
            }
        }
        return pool;
    }

    // 首調唱名法 (moveable Do): maps each key's scale degrees to solfège names
    const SOLFEGE_NAMES = ['Do','Re','Mi','Fa','Sol','La','Si'];

    // For solfège mode: given a key and a note on the staff, find the solfège name
    // noteWithAcc is like 'F#' or 'B♭' or 'C'
    function getSolfege(keySig, noteWithAcc) {
        const idx = keySig.scale.indexOf(noteWithAcc);
        if (idx >= 0) return SOLFEGE_NAMES[idx];
        // Try enharmonic: # ↔ ♭ not needed for diatonic notes within key
        return null;
    }

    // Solfège grade config: which keys available + note range for treble clef
    const SOLFEGE_LEVELS = {
        1: { keys:['C','G','F'],noteRange:[0,7]  },
        2: { keys:['C','G','F'],noteRange:[0,7]  },
        3: { keys:['C','G','F','D','Bb'], noteRange:[0,9]  },
        4: { keys:['C','G','F','D','Bb','A','Eb'], noteRange:[0,9] },
        5: { keys:['C','G','F','D','Bb','A','Eb','E','Ab'], noteRange:[0,11] },
        6: { keys:['C','G','F','D','Bb','A','Eb','E','Ab','B','Db'], noteRange:[0,12] }
    };

    // Key signature drawing positions on treble clef (yFactor values for sharp/flat positions)
    // Sharps order: F C G D A — standard key signature positions
    const KEYSIG_SHARP_POS_TREBLE = [
        { letter:'F', yFactor:0 },    // F5: top line
        { letter:'C', yFactor:1.5 },  // C5: 3rd space
        { letter:'G', yFactor:-0.5 }, // G5: above top line
        { letter:'D', yFactor:1 },    // D5: 4th line
        { letter:'A', yFactor:2.5 }   // A4: 2nd space
    ];
    // Flats order: B E A D G
    const KEYSIG_FLAT_POS_TREBLE = [
        { letter:'B', yFactor:2 },    // B4: 3rd line
        { letter:'E', yFactor:0.5 },  // E5: 4th space
        { letter:'A', yFactor:2.5 },  // A4: 2nd space
        { letter:'D', yFactor:1 },    // D5: 4th line
        { letter:'G', yFactor:3 }     // G4: 2nd line
    ];

    const MAPS = {
        treble: [{letter:'C',octave:4,yFactor:5},{letter:'D',octave:4,yFactor:4.5},{letter:'E',octave:4,yFactor:4},{letter:'F',octave:4,yFactor:3.5},{letter:'G',octave:4,yFactor:3},{letter:'A',octave:4,yFactor:2.5},{letter:'B',octave:4,yFactor:2},{letter:'C',octave:5,yFactor:1.5},{letter:'D',octave:5,yFactor:1},{letter:'E',octave:5,yFactor:0.5},{letter:'F',octave:5,yFactor:0},{letter:'G',octave:5,yFactor:-0.5},{letter:'A',octave:5,yFactor:-1}],
        bass:   [{letter:'G',octave:2,yFactor:4},{letter:'A',octave:2,yFactor:3.5},{letter:'B',octave:2,yFactor:3},{letter:'C',octave:3,yFactor:2.5},{letter:'D',octave:3,yFactor:2},{letter:'E',octave:3,yFactor:1.5},{letter:'F',octave:3,yFactor:1},{letter:'G',octave:3,yFactor:0.5},{letter:'A',octave:3,yFactor:0},{letter:'B',octave:3,yFactor:-0.5},{letter:'C',octave:4,yFactor:-1}],
    };

    // ==========================================
    // 學生名冊 (按年級+班別)
    // ==========================================
    const STUDENT_ROSTER = {
        '1A':['歐卓瑤','區善妤','陳晏霆','陳晞瑜','陳浩軒','陳奕劻','曾皓榮','周逸曦','鄭鈊語','張蔚浠','趙棽悠','蔡昊妍','鍾慧琳','杜子楓','何格霖','許芯賢','黃翊宸','禤鎧霖','林智賢','林煒傑','李俊熹','梁智軒','廖正迎','雷景博','盧思文','吳楚湉','吳楷燁','蘇靖媛','蘇芊悅','鄧凱晴','鄧皓銘','黃思喬'],
        '1B':['區美淇','蔡一一','陳峻銘','陳祉維','鄭弘悅','陳浩銘','陳彥熹','鍾允澄','霍愷琳','侯綺曦','黃思穎','翁詔謙','葉勺瑀','余梓睿','谷可芯','郭明琳','郭玥晞','鄺韋然','李睿詩','李灝諺','李柰葆','呂紀柔','吳鉑樅','吳玥橋','譚崇禧','余佳妍','阮芯渝','黃浠瑜','王紫晴','黃霆睿','黃慧芯','楊景程','鍾毅'],
        '1C':['陳俊諾','曾浩謙','周朗晴','鄒禹丞','謝依琳','陳俊謙','鄭宇哲','趙子宸','蔡芷澄','鍾允賢','杜子臻','傅紫鈺','何冠杰','洪欣彤','甘昕蕎','葛霈妍','古羽婷','林昊霖','劉宸睿','李旻珈','梁熙琳','梁宥延','盧鍶嵐','龍柏宇','黃皓洋','吳泳俙','顏燕朗','邵睿麒','譚貝妍','黃莃晴','黃政朗','黃柏羲'],
        '1D':['陳芷悠','陳浩朗','陳柏熹','陳柏雨','謝韋鴻','陳柏銳','丁聖哲','馮曜辰','付夢希','何樂瑤','何心妍','洪悅芯','葉芯瑜','郭昊謙','鄺韋喬','李焯希','李昕禧','李湘瑤','凌學揚','梁鏸文','呂子瑩','盧浠恩','麥恩庭','吳紫妍','史倩雯','蘇行一','蘇樂宜','謝睎晴','黃子恩','黃翊軒','張浩彥'],
        '1E':['陳政揚','陳綺臻','謝凱欣','張敏','鄭亦螢','莊梓揚','鍾浠宸','傅兆煌','嚴紫鈴','高梓豪','高朗睿','關妤浠','林焯豪','利紫榆','梁凱嵐','梁景睿','梁知行','呂子瑜','呂承熹','吳祉玥','魏飛','柯舒甯','歐陽貝蕎','彭芊穎','任晉承','施茗涵','譚弘熙','謝雅蕎','黃靖恩','黃愷瑩','張皓辰'],
        '1F':['歐陽博','陳宥琋','陳彥晴','陳柏霖','張知行','張銘延','徐靖柔','馮紫曦','傅祺淇','何曉榆','楊斯婷','郭詠昕','林灝天','李昕禧','梁凱晴','李鍶彤','倫曉縈','陸梓瑜','麥子淳','伍梓逸','吳子朗','吳君灝','石浚楷','蘇駿言','蘇雨晴','杜海峰','余澔朗','文子瑜','黃杏言','黃嘉唯','黃妤翹','周語慧','周宏軒'],
        '2A':['歐陽廷亮','陳慶揚','陳雅惠','陳栢埏','陳泰霖','陳韡臻','陳穎瑩','張芯悅','趙熙潼','趙偉諾','蔡沛持','鍾博堯','鍾孟渝','高晨稀','楊愷琳','葉靝瑀','林以淳','林健朗','劉心弦','李羽溋','梁卓嵐','梁雋彥','李芯穎','李鍠林','梁楚恬','吳銘豪','柯芊霖','王卓睿','黃梓烽','黃子浩','黃梓妍','王顥熹'],
        '2B':['陳芊語','陳鐫傑','陳逸烯','周奕臻','鄭柏霖','戚梓恩','蔡靖柔','崔雨正','方志華','關凱豐','何梓樂','何馨玥','洪槿炎','簡煒詩','李政言','李駿宇','李洛儀','李旻佑','梁博延','羅思欣','曲頡銘','沈樂晴','孫子淇','杜安叡','袁梓然','黃卓謙','王旻澔','黃美晨','黃尚銘','胡語庭','于恩朗'],
        '2C':['曹梓恬','陳柏然','曾俊喆','曾柏熙','謝鏵請','鄭承晉','鄭妤曦','張亦然','楊子皓','黎梓燊','賴心逸','林嘉蕊','劉承鍇','李卓謙','李俊熙','李灝霖','李旭恩','李思諾','李倩玟','梁峻熙','梁宇軒','梁羽婷','李靖怡','梁栩澄','羅樂桐','倫梓淏','盧芯悅','吳芷蕎','潘淽玥','蕭雅瑩','黃藝濤','王柏霖'],
        '2D':['區裕熙','馬澤晨','周皓然','鄒語霏','鄭采甯','鄭寶叮','鄭詠硏','張焯傑','趙梓朗','蔡禮軒','蔡柏麟','莊柏言','何祉澄','黎芯妍','林宥賢','劉思玥','李曉霖','李沛桓','李思睿','梁灝文','梁承昊','廖倬諾','羅浩朗','駱穎誼','吳翊昕','岑妍','阮梓玥','溫梓妤','王思媛','黃思哲','謝諾臻','庄庭睿'],
        '2E':['陳芊諭','陳愷澄','陳浩宇','陳柏橋','曾穎','周晉霆','張馨雨','張君彥','徐倫飛','崔仲騫','馮熙童','何梓穎','許皓政','楊柏燊','郭盈希','李梓樂','李幸妍','李嘉峻','李羽朗','李穎妍','梁鎧琳','梁語芯','羅芯穎','麥梓峰','吳楚驍','施俊承','蔡依臻','黃天佑','胡驍龍','詹碩庭','鄭錦鵬','鄭瑾寧','鄒悅晴'],
        '2F':['陳洛瑤','周洤宇','張昊暄','張時灝','朱靖熹','馮振諾','郭真希','甘芷瑤','古子駿','黎俊賢','黎文博','劉恩慈','李汶軒','李筱恩','廖栢霖','羅霈帆','羅穎霖','龍俊榮','盧梓聰','魏紫喬','鮑曉睿','岑純曦','孫政賢','譚皓政','徐穎思','黃智謙','黃君廉','黃藝康','徐芯瑜','容凱琪','張家烯'],
        '3A':['陳芊睿','陳叡琪','陳國宇','陳力天','曾穎曦','周謹言','張靖汶','張梓曦','趙俊傑','蔡禮濬','鍾世宥','曹紫昕','鍾日朗','許庭欣','黃珈儀','江希彤','高顯淳','郭銘昊','林頌軒','李芊樂','李樂峒','梁凱甯','梁貝兒','李禹辰','羅俊稀','倪夢詒','區梓盈','彭梓皓','施均融','蘇振維','阮梓瑜','黃子芯','黃康瑅','張語桐'],
        '3B':['歐陽心穎','陳柏熙','陳星如','陳韡匡','曾巧臻','周賢霖','周芷僖','陳思安','張曉嵐','張國棟','朱俊龍','朱汶迪','范譽衡','高顥峰','何芷慧','黃妤宸','楊侑謙','葛舜衡','關穎潼','梁善柔','梁弘健','馬芷禹','伍芷瑜','吳駿希','吳依恩','吳家盈','伍君傑','伍毅恆','潘梓琪','王柏朗','黃書涵','黃天成','溫正軒'],
        '3C':['陳芷綾','陳天宥','陳玥澄','周卓泓','謝鈺婷','鄭宇埕','張詩會','蔡梓希','庄映霏','郭達濠','施宏澤','霍善兒','馮曉嵐','馮妙璇','高世彥','古婷茵','郭姿廷','林子軒','劉倩菲','梁竣宇','梁曉礽','梁維樂','劉古慧','羅淇聰','鮑梓瑜','鄺榆晴','黃秖澄','黃梓溢','王梓霖','黃灝軒','黃泓澔','伍芷晴','胡皓星'],
        '3D':['曾浚峰','周子軒','鄭敬澧','張恩語','鍾雨彤','周嘉兒','霍進禧','馬愷彤','何卓楓','洪浚睿','楊宗昇','葉竣丞','余詠心','蔣思葉','江哲賢','黎浠妤','林浩森','劉卓陽','劉浩賢','李梓曦','李正儒','梁雅斯','林仲賢','雷卓藍','毛藴言','吳穎昕','柯進浩','冼泳堯','蘇永皓','黃澤斌','王皓楓','黃珮娜','王思瑜','蕭楚珞'],
        '3E':['陳彥羲','鄭鈺凝','蔡昊倫','蔡柏浚','符皓喬','許柏翹','胡藝馨','黎政澔','林子穎','林晉賢','劉浠霖','李柏滶','李心瑤','梁婧琪','梁文俊','梁弘康','林俊諾','龍璟月','吳子琦','吳稀媛','魏文妍','蘇駿謙','蘇宇軒','譚澤翔','譚卓桐','杜智賢','余思潞','尹悅澄','王紫嫣','黃柏林','趙浩然','鄭子熙'],
        '3F':['歐梓淇','曾芷柔','曾柏謙','方杺玥','黃柏皓','何梓桓','何俊宇','楊晨悅','關柏睿','林宥熙','林芯悠','林筱玲','劉韻嬟','李祉熙','李梓豪','李嘉浩','李洛怡','李潁蕎','梁子爵','梁曉林','梁皓軒','梁鳴峰','黎梓謙','李佳衡','羅詠荃','吳昊謙','施如詩','謝泓謙','黃焯楓','王圓韶','黃靖涵','黃淏','黃芯穎','胡衍睿'],
        '4A':['陳志霖','陳明李','陳詠恩','張育霖','鍾晉一','高顥恩','葉思樂','鄺子麒','黎立仁','賴柏歌','林嘉汶','李聖己','李語軒','梁玥晴','林子軒','連曉琳','倫筱喬','龍政謙','盧芷瀅','伍柏濠','蕭寶賢','蕭穎浠','孫梓軒','余禧琳','黃梓軒','王芯穎','殷虹晴','袁俊愷','張以林','張子矜'],
        '4B':['陳浩賢','陳彥諾','陳泓孝','周灝言','鄭霖希','詹沛熹','蔡沇錡','黃悠凡','柯宗廷','高晙銘','劉柏暚','李梓茵','梁妙晴','梁碩軒','梁玥禧','李依宸','羅芷萱','呂世泓','盧文諾','萬湉','孟六然','梅柏珩','吳澤亨','吳若玲','鮑曉盈','岑梓晴','鄧凱妍','杜靜姚','黃浚軒','黃彥婷','庄梓謙'],
        '4C':['歐陽樂澄','蔡方睿','陳駿謙','陳忠耀','陳昊謙','陳愷樂','張可欣','蔡鍶甄','韓尚臻','黃慧芯','鄺子樂','黎文皓','李芊慧','羅君月','呂曉林','駱天朗','莫書怡','吳晞琳','吳昕蕎','吳翊曈','羅菲澄','鄧策軒','鄧卓猷','唐思睿','黃靖博','黃凱琪','黃愷琳','胡浠媱','楊禮謙','葉濠廷','鄭業熹'],
        '4D':['陳柏翰','周睿澄','鄭淏謙','鄭言樂','張諾昕','方凱澄','郝一諾','何幸堯','許濬鏗','洪鈞澄','李焯盈','李俊澔','李承峻','李泳琳','梁依彤','梁彥熙','廖瀚森','雷穎妍','勞啟睿','麥浩楓','吳希瑜','布晞琳','施如心','蘇衍峰','袁天賜','黃子煊','胡肇舶','謝諾恆','徐子清','許敬和'],
        '4E':['歐陽婧琳','陳熙元','陳喬惠','鄭宗謙','鍾羨榆','周旻靜','賈曉晴','蘇奕伃','何振瑋','何穎詩','蔣立葉','藍焯盈','李逸軒','李思諾','梁芷悠','梁浚彥','梁天朗','梁莃渝','羅承進','倫添翔','麥芯瑜','吳朗賢','潘欣琪','施洛希','司徒令菲','蘇柏晨','蘇健盈','孫顥誠','譚皓藍','曾懿臻','張沐宸'],
        '4F':['歐栢言','陳莃桐','陳愷凝','陳栢僖','陳姵殷','周毅軒','鄭伊貽','張梓程','張瑋廷','張霖','朱傲晴','狄珉宇','馮健睿','高崎翔','高德明','郭禮謙','林泳熹','李柏熹','李昊頤','李欣桓','梁洛潼','梁弘浩','羅君亮','吳俊宇','魏敏喬','任梓頤','譚韻淇','鄧皓然','王瑋珽','黃詠熙','徐安瑜'],
        '5A':['布愷盈','周思汶','蔡俊熹','鍾世澄','范煒佳','何芊妤','楊嵐曦','葉衍晉','梁焯謙','梁芷晴','梁芷柔','梁勇荇','梁文博','梁靖朗','李梓浩','廖妤睿','羅芷昕','龍浚賢','馬梓喬','文靖','文儆揚','吳芊穎','白雨澄','鮑梓滺','龐雅之','岑珺灝','施賢殷','冼鈺熙','蘇健茹','阮梓淇','黃梓信','張牧也'],
        '5B':['歐芷盈','歐陽守航','謝睿莛','張芯瑜','趙熙昕','施惠然','馮妙儀','何仲言','何天瀅','許琇瑋','楊善晴','關億安','林澤宏','林芷潼','李思熹','李曉茵','李浩正','梁鉦琳','梁皓嘉','廖柏柔','呂世濠','莫千悠','吳振華','伍珀熹','施仲蕎','鄧睿峰','余雋永','黃卓麒','黃紫晴','黃思茹','張俊鳴'],
        '5C':['陳浚賢','陳筠蕾','陳諾言','鄒樂柔','鄭卓瑩','朱梓瑜','鍾晴','馮振霆','馮瀚霖','馮奕龍','傅海鋒','關子茵','何芷穎','何昭姸','黎駿逸','林芊昕','林俊熙','林洛瑤','李浩僖','梁灝峰','梁綺桐','連千妤','陸皓朗','伍梓蕎','吳俊賢','岑政陽','岑駿禧','黃卓濠','黃熙廉','黃翌軒'],
        '5D':['陳奕蓁','陳思頴','周澄','張卓錡','鍾澤希','迪孝渡','何芯睿','項詩雅','楊駿亨','鍾博瀚','郭昕潼','林柏宇','李曉澄','李樂潼','李廷譽','梁千霈','梁逸楠','梁珈頤','林暉淇','繆圓圓','蒙芷媃','吳浠頤','孫立珩','譚家竣','唐藹炫','杜慧婷','袁梓熙','王卓譽','黃博瑜','黃偉航'],
        '5E':['陳賢馨','陳啓宙','陳悅圓','鄭鎧欣','陳思行','符皓程','何天蕊','何譽恆','楊茜婷','關躍宏','鄺頌楠','李心陶','李承澔','李倩榆','梁梓琪','李城熠','林暉淳','羅斯睿','繆思朗','吳梓琪','吳梓瑜','吳愷原','伍若慈','伍琛琛','吳沅瞳','潘柏昊','岑沛慈','施允熒','蕭溢騫','湯智謙','張雪珺'],
        '5F':['歐愷兒','陳祉曦','陳思霖','程梓軒','張子晴','張曉朗','徐紫悠','馮浩霖','賀韋舜','許駿霖','楊靖綸','江栢然','林懿嘉','劉柏正','李芷滺','李俊霆','梁鉦楠','呂心兒','呂埦熒','吳梓誠','吳君諾','伍悅','施荻瀅','孫靖珩','譚尚恩','余詩靜','黃焯昱','王莞韶','黃柏濤','王詩晴','吳抒涵','蕭楚晴'],
        '6A':['陳澤武','陳祉樺','陳梓維','陳玥玟','陳鈞文','張楚沂','蔡善凝','張鈺溋','馮頌凱','何樂恆','許子樂','許汶翰','黃巧翎','易迪信','楊心悠','郭子睿','黎諾瑤','李靖冰','梁梓駿','梁子浚','馬昭和','孟碧南','吳嘉盈','歐陽貝兒','潘天愉','蕭幗湣','譚卓言','譚家茵','王禮賢','黃穎怡','吳潁蕎'],
        '6B':['歐泳淇','曹溢淇','陳嘉悅','周沚悠','鄭芷妍','鄭楚霖','陳俊熹','陳逸軒','蔡曉盈','蔡柏鎬','鍾穎芊','狄歆然','杜子蕎','任芷穎','楊晨曦','高汶芯','鄺韋霖','劉乙鏗','梁梓橦','梁韻儀','廖學賢','羅嘉曜','雷嘉茗','勞梓恩','吳仕暉','吳韋利','阮敏晴','王正朗','謝卓均','庄卓謙'],
        '6C':['陳梓琳','陳司浚','陳予芊','周逸群','鄭鈺霖','鄭敬堯','詹皓鉦','鍾沛妤','鍾允晴','鍾巽瑜','蘇梓儒','何芷昕','洪浚豪','易乾峰','容子睿','高彥駿','郭芷如','林劍鋒','劉恩銘','李芊淘','梁心語','李浩銘','連曉萱','廖巧澄','盧芯妤','潘梓涵','蘇鼎睿','譚筱柔','黃政禧','黃筱靖','胡穎琳'],
        '6D':['區柏豪','古卓賢','陳展瑤','曾加恩','鄭言藝','張睿嘉','張翱怡','蔡芷妍','曹凱瑤','馮梓瑜','傅偉庭','劉雋熙','劉珊妤','劉健業','李柏渝','梁浩鈞','梁珮芝','梁碩軒','羅唯槿','毛俊謙','歐陽芊語','石晉銘','譚詩姵','湯浩暉','唐穎沁','余芷瑩','黃浠喬','黃心悅','楊梓炫','楊茜而'],
        '6E':['陳洛希','陳朗月','陳思潼','陳悅寧','鄭庭亨','韓昕諾','甘浩澤','郭心悅','林凱晴','藍正軒','劉錦龍','劉承熹','梁堯晴','李佩凌','林俊熹','廖心悅','羅承治','羅雪瑩','呂孝謙','馬梓舜','蒙逸軒','司徒雪怡','薛霈兒','蘇佩悅','譚諾琪','譚善揚','溫心悠','黃梓滔','王皓楊','蕭子鴻','容煒庭'],
        '6F':['陳芊蘊','陳欣濠','鄭奕弘','鄭宇桐','程奕森','張梓萱','張嘉嘉','何昊霖','何昕熹','何昱言','楊梓軒','郭芷睿','賴愷瑜','林爔樂','劉承謙','劉乙鏘','凌曦','梁嗣劻','梁康澄','廖心悠','駱天佑','吳沛洳','區瑞君','潘曉銦','湯穎欣','謝兆騏','黃芷淇','黃宇軒','楊博然','鄭媛元','朱芸熙']
    };

    function getStudentList(grade, cls) {
        return STUDENT_ROSTER[grade + cls] || [];
    }

    function populateNameDropdown() {
        const grade = dom.userGrade.value;
        const cls = dom.userClass.value;
        const students = getStudentList(grade, cls);
        const nameEl = dom.userName;
        const prev = nameEl.value;
        const frag = document.createDocumentFragment();
        const firstOpt = document.createElement('option');
        firstOpt.value = ''; firstOpt.textContent = '選擇你的名字';
        frag.appendChild(firstOpt);
        students.forEach((name, i) => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            opt.dataset.seat = i + 1;
            frag.appendChild(opt);
        });
        const otherOpt = document.createElement('option');
        otherOpt.value = '__other__';
        otherOpt.textContent = '✏️ 其他（自行輸入）';
        frag.appendChild(otherOpt);
        nameEl.innerHTML = '';
        nameEl.appendChild(frag);
        if (prev && (students.includes(prev) || prev === '__other__')) nameEl.value = prev;
        else { nameEl.value = ''; dom.userId.value = ''; hideCustomName(); }
    }

    function showCustomName() {
        if (!_customNameInput) {
            const inp = document.createElement('input');
            inp.type = 'text'; inp.id = 'customNameInput'; inp.placeholder = '輸入名字';
            inp.autocomplete = 'off';
            inp.style.cssText = 'background:transparent; border:none; outline:none; color:var(--text-dark); font-weight:800; width:100%; font-size:1rem; font-family:inherit; margin-top:6px;';
            dom.userName.parentNode.appendChild(inp);
            inp.addEventListener('focus', () => state.inputFocused = true);
            inp.addEventListener('blur', () => state.inputFocused = false);
            _customNameInput = inp;
        }
        _customNameInput.style.display = ''; _customNameInput.focus();
    }
    function hideCustomName() {
        if (_customNameInput) _customNameInput.style.display = 'none';
    }
    function getPlayerName() {
        if (dom.userName.value === '__other__') {
            return _customNameInput ? _customNameInput.value.trim() : '';
        }
        return dom.userName.value;
    }

    let _customNameInput = null;
    let dom = {};
    let state = {};
    let audio = {};
    let noteBtnMap = new Map();
    // Canvas offscreen cache for static staff lines + clef
    let _staffCache = null;
    // Note buttons: visibility-only after first build
    let _noteRowsBuilt = false, _sharpRow = null, _flatRow = null;
    // Countdown timer ID for cleanup on screen switch
    let _countdownTimerId = null;

    // ── Toast notification helper ──
    function _showToast(msg, type) {
        const el = document.createElement('div');
        el.className = 'app-toast ' + (type || 'info');
        el.textContent = msg;
        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('show'));
        setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 3000);
    }

    // ==========================================
    // 🎯 難度系統 (Difficulty System)
    // ==========================================
    const DIFFICULTY_CONFIG = {
        easy:   { tokenSet: 'basic',    bpm: 60,  winScale: 1.4, label: 'Easy',   emoji: '⭐' },
        normal: { tokenSet: 'basic',    bpm: 72,  winScale: 1.2, label: 'Normal', emoji: '⭐⭐' },
        hard:   { tokenSet: 'medium',   bpm: 84,  winScale: 1.0, label: 'Hard',   emoji: '⭐⭐⭐' },
        expert: { tokenSet: 'advanced', bpm: 96,  winScale: 0.9, label: 'Expert', emoji: '⭐⭐⭐⭐' },
        p1:     { label: '小一', emoji: '🌱' },
        p2:     { label: '小二', emoji: '🌿' },
        p3:     { label: '小三', emoji: '🌳' },
        p4:     { label: '小四', emoji: '⭐' },
        p5:     { label: '小五', emoji: '⭐⭐' },
        p6:     { label: '小六', emoji: '🏆' },
    };

    // ==========================================
    // 👤 玩家個人檔案系統 (Player Profile)
    // ==========================================
    const PROFILE_AVATARS = [
      // 🎶 樂器 Instruments
      {emoji:'🎸', name:'結他手',     bg:'linear-gradient(135deg,#FF6B35,#FF8F65)', cat:'inst'},
      {emoji:'🥁', name:'鼓手',       bg:'linear-gradient(135deg,#FFB800,#FFD54F)', cat:'inst'},
      {emoji:'🎻', name:'小提琴手',   bg:'linear-gradient(135deg,#E040FB,#EA80FC)', cat:'inst'},
      {emoji:'🎹', name:'鋼琴家',     bg:'linear-gradient(135deg,#536DFE,#8C9EFF)', cat:'inst'},
      {emoji:'🎺', name:'小號手',     bg:'linear-gradient(135deg,#FFC107,#FFE082)', cat:'inst'},
      {emoji:'🎷', name:'色士風手',   bg:'linear-gradient(135deg,#FF8A65,#FFAB91)', cat:'inst'},
      {emoji:'🎤', name:'歌手',       bg:'linear-gradient(135deg,#EC407A,#F48FB1)', cat:'inst'},
      {emoji:'🎧', name:'DJ',         bg:'linear-gradient(135deg,#7C4DFF,#B388FF)', cat:'inst'},
      // 🌟 角色 Characters
      {emoji:'🎵', name:'音符精靈',   bg:'linear-gradient(135deg,#8B66FF,#B39DFF)', cat:'char'},
      {emoji:'🎶', name:'和聲仙子',   bg:'linear-gradient(135deg,#FF65A3,#FF8EC4)', cat:'char'},
      {emoji:'🎼', name:'樂譜大師',   bg:'linear-gradient(135deg,#00A6ED,#4FC3F7)', cat:'char'},
      {emoji:'🎙️', name:'錄音師',     bg:'linear-gradient(135deg,#78909C,#B0BEC5)', cat:'char'},
      // 🐾 動物夥伴 Animal Pals
      {emoji:'🦊', name:'狐狸指揮',   bg:'linear-gradient(135deg,#FF7043,#FF8A65)', cat:'animal'},
      {emoji:'🐱', name:'貓咪鋼琴家', bg:'linear-gradient(135deg,#FFB74D,#FFCC80)', cat:'animal'},
      {emoji:'🐶', name:'汪汪鼓手',   bg:'linear-gradient(135deg,#8D6E63,#A1887F)', cat:'animal'},
      {emoji:'🦁', name:'獅王指揮家', bg:'linear-gradient(135deg,#FFA726,#FFB74D)', cat:'animal'},
      {emoji:'🐰', name:'兔兔長笛手', bg:'linear-gradient(135deg,#F48FB1,#F8BBD0)', cat:'animal'},
      {emoji:'🦄', name:'獨角獸歌姬', bg:'linear-gradient(135deg,#CE93D8,#E1BEE7)', cat:'animal'},
      // 🧸 奇幻夥伴 Fantasy Friends (inspired by reference)
      {emoji:'🧸', name:'玩具熊',     bg:'linear-gradient(135deg,#8BC34A,#AED581)', cat:'fantasy'},
      {emoji:'🤖', name:'積木機械人', bg:'linear-gradient(135deg,#FF7043,#FFAB91)', cat:'fantasy'},
      {emoji:'✨', name:'魔法星精靈', bg:'linear-gradient(135deg,#7E57C2,#B39DDB)', cat:'fantasy'},
      {emoji:'🐤', name:'海盜鴨鴨',   bg:'linear-gradient(135deg,#FFD600,#FFEE58)', cat:'fantasy'},
      {emoji:'🚂', name:'火車長',     bg:'linear-gradient(135deg,#42A5F5,#90CAF9)', cat:'fantasy'},
      {emoji:'🖍️', name:'彩色怪獸',   bg:'linear-gradient(135deg,#AB47BC,#CE93D8)', cat:'fantasy'},
      {emoji:'🚀', name:'火箭齒輪頭', bg:'linear-gradient(135deg,#66BB6A,#A5D6A7)', cat:'fantasy'},
      {emoji:'🪁', name:'風箏少年',   bg:'linear-gradient(135deg,#29B6F6,#81D4FA)', cat:'fantasy'},
      // ☁️ 夢幻系列 Dreamy (inspired by reference)
      {emoji:'☁️', name:'雲朵綿羊',   bg:'linear-gradient(135deg,#E1BEE7,#F3E5F5)', cat:'dreamy'},
      {emoji:'🦕', name:'積木恐龍',   bg:'linear-gradient(135deg,#AED581,#DCEDC8)', cat:'dreamy'},
      {emoji:'🧜', name:'月亮美人魚', bg:'linear-gradient(135deg,#4DD0E1,#80DEEA)', cat:'dreamy'},
      {emoji:'🎈', name:'氣球兔兔',   bg:'linear-gradient(135deg,#F48FB1,#F8BBD0)', cat:'dreamy'},
      {emoji:'🐱‍🚀', name:'太空貓',   bg:'linear-gradient(135deg,#EF5350,#EF9A9A)', cat:'dreamy'},
      {emoji:'🐭', name:'海盜鼠',     bg:'linear-gradient(135deg,#8D6E63,#BCAAA4)', cat:'dreamy'},
      {emoji:'🍄', name:'蘑菇小屋',   bg:'linear-gradient(135deg,#EF5350,#FFCDD2)', cat:'dreamy'},
      {emoji:'🌴', name:'叢林樂隊',   bg:'linear-gradient(135deg,#4CAF50,#81C784)', cat:'dreamy'},
      // 🏅 成就 Achievement
      {emoji:'🌟', name:'閃亮之星',   bg:'linear-gradient(135deg,#FFD740,#FFEE58)', cat:'item'},
      {emoji:'🔥', name:'熱力全開',   bg:'linear-gradient(135deg,#FF5722,#FF8A65)', cat:'item'},
      {emoji:'💎', name:'寶石收藏家', bg:'linear-gradient(135deg,#4DD0E1,#80DEEA)', cat:'item'},
      {emoji:'🏆', name:'冠軍',       bg:'linear-gradient(135deg,#FFC107,#FFD54F)', cat:'item'},
      {emoji:'👑', name:'音樂王者',   bg:'linear-gradient(135deg,#FFB300,#FFCA28)', cat:'item'},
    ];
    const AVATAR_CATEGORIES = [
      {key:'all', label:'全部'},
      {key:'inst', label:'🎶 樂器'},
      {key:'char', label:'🌟 角色'},
      {key:'animal', label:'🐾 動物'},
      {key:'fantasy', label:'🧸 奇幻'},
      {key:'dreamy', label:'☁️ 夢幻'},
      {key:'item', label:'🏅 成就'},
    ];
    function _avatarLookup(emoji) { return PROFILE_AVATARS.find(a => a.emoji === emoji) || {emoji, name:'', bg:'linear-gradient(135deg,#8B66FF,#B39DFF)', cat:'char'}; }
    const PROFILE_STORAGE_KEY = 'musicGameProfile';
    const PROFILE_HISTORY_KEY = 'musicGameProfileHistory';

    function _getProfileKey(user) {
        if (!user || !user.name) return null;
        return `${PROFILE_STORAGE_KEY}_${user.grade}_${user.class}_${user.name}`;
    }

    function loadProfile(user) {
        const key = _getProfileKey(user);
        if (!key) return _defaultProfile(user);
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const p = JSON.parse(saved);
                // Ensure all fields exist (backward compat)
                return Object.assign(_defaultProfile(user), p);
            }
        } catch(e) { console.warn('Profile load error, resetting:', e); }
        return _defaultProfile(user);
    }

    function saveProfile(profile) {
        const key = `${PROFILE_STORAGE_KEY}_${profile.grade}_${profile.class}_${profile.name}`;
        try { localStorage.setItem(key, JSON.stringify(profile)); } catch(e) { _showToast('⚠️ 儲存空間不足，個人資料可能未能保存', 'warn'); }
    }

    function _defaultProfile(user) {
        return {
            name: user ? user.name : '',
            grade: user ? user.grade : 0,
            class: user ? user.class : '',
            seat: user ? (user.seat || user.id || '') : '',
            avatar: '🎵',
            signature: '',
            registeredAt: new Date().toISOString(),
            totalPlayTime: 0,
            level: 1,
            exp: 0,
            stats: {
                totalPlayed: 0, cleared: 0, totalScore: 0,
                totalAccuracy: 0, accuracyCount: 0,
                maxCombo: 0, fcCount: 0, apCount: 0,
            },
            diffClears: { easy: 0, normal: 0, hard: 0, expert: 0 },
            gameBests: { game1: 0, game2: 0, game3: 0, game4: 0 },
        };
    }

    function _expForLevel(lvl) { return lvl * 100; }

    // Derive basic stats from allRanks (leaderboard data) for a student
    function _statsFromRanks(name, grade, cls) {
        const rows = state.allRanks.filter(r =>
            String(r.name || '').trim() === String(name).trim() &&
            String(r.grade || '') === String(grade) &&
            String(r.class || '').trim().toUpperCase() === String(cls).trim().toUpperCase()
        );
        if (!rows.length) return null;
        let totalScore = 0, maxCombo = 0, totalAcc = 0;
        const bests = {};
        rows.forEach(r => {
            const sc = parseInt(r.score) || 0;
            const mc = parseInt(r.max_combo) || 0;
            const acc = parseInt(r.accuracy) || 0;
            totalScore += sc;
            if (mc > maxCombo) maxCombo = mc;
            totalAcc += acc;
            const gk = r.game || '';
            if (gk && sc > (bests[gk] || 0)) bests[gk] = sc;
        });
        return {
            totalPlayed: rows.length,
            totalScore,
            maxCombo,
            avgAccuracy: rows.length ? Math.round(totalAcc / rows.length) : 0,
            gameBests: bests
        };
    }

    function addProfileExp(profile, expGain) {
        profile.exp += expGain;
        while (profile.exp >= _expForLevel(profile.level)) {
            profile.exp -= _expForLevel(profile.level);
            profile.level++;
        }
    }

    function recordGameResult(user, gameKey, score, accuracy, maxCombo, difficulty, hitCounts) {
        const profile = loadProfile(user);
        profile.stats.totalPlayed++;
        profile.stats.totalScore += score;
        profile.stats.totalAccuracy += accuracy;
        profile.stats.accuracyCount++;
        if (maxCombo > profile.stats.maxCombo) profile.stats.maxCombo = maxCombo;
        if (score > (profile.gameBests[gameKey] || 0)) profile.gameBests[gameKey] = score;

        // FC / AP detection
        if (hitCounts) {
            const totalNotes = (hitCounts.perfect || 0) + (hitCounts.great || 0) + (hitCounts.good || 0) + (hitCounts.miss || 0);
            if (totalNotes > 0 && hitCounts.miss === 0) {
                profile.stats.fcCount++;
                profile.stats.cleared++;
                if (hitCounts.perfect === totalNotes) profile.stats.apCount++;
            } else if (accuracy >= 60) {
                profile.stats.cleared++;
            }
        } else if (accuracy >= 60) {
            profile.stats.cleared++;
        }

        // Difficulty clears
        if (difficulty && profile.diffClears.hasOwnProperty(difficulty)) {
            if (accuracy >= 60) profile.diffClears[difficulty]++;
        }

        // EXP gain: base 50 + score/10 + accuracy bonus
        const expGain = Math.floor(50 + score / 10 + (accuracy >= 90 ? 30 : accuracy >= 70 ? 15 : 0));
        addProfileExp(profile, expGain);

        saveProfile(profile);
        submitProfileResultToGAS(gameKey, user, score, accuracy, maxCombo, profile);
        return profile;
    }

    const _profileSyncingKeys = new Set();

    async function syncProfileFromGAS(user) {
        const key = _getProfileKey(user);
        if (!key || _profileSyncingKeys.has(key)) return;
        _profileSyncingKeys.add(key);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const url = `${CONFIG.API_URL}?action=getProfile&grade=${encodeURIComponent(user.grade)}&class=${encodeURIComponent(user.class)}&name=${encodeURIComponent(user.name)}&v=${Date.now()}`;
            const res = await fetch(url, {
                method: 'GET',
                redirect: 'follow',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!res.ok) return;

            const rows = await res.json();
            if (!Array.isArray(rows) || rows.length === 0) return;

            const existing = loadProfile(user);
            const profile = _defaultProfile(user);
            profile.avatar = existing.avatar || profile.avatar;
            profile.signature = existing.signature || profile.signature;
            profile.registeredAt = existing.registeredAt || rows[0].timestamp || profile.registeredAt;
            profile.totalPlayTime = existing.totalPlayTime || 0;

            let latestLevel = 1;
            let latestExp = 0;
            let latestTotalPlayed = 0;
            let latestCleared = 0;
            let latestFcCount = 0;
            let latestApCount = 0;

            rows.forEach(row => {
                const score = parseInt(row.score, 10) || 0;
                const accuracy = parseInt(row.accuracy, 10) || 0;
                const maxCombo = parseInt(row.max_combo, 10) || 0;
                const gameKey = String(row.game || '').trim();

                profile.stats.totalScore += score;
                profile.stats.totalAccuracy += accuracy;
                profile.stats.accuracyCount++;
                profile.stats.maxCombo = Math.max(profile.stats.maxCombo, maxCombo);
                profile.gameBests[gameKey] = Math.max(profile.gameBests[gameKey] || 0, score);

                latestLevel = parseInt(row.level, 10) || latestLevel;
                latestExp = parseInt(row.exp, 10) || latestExp;
                latestTotalPlayed = parseInt(row.total_played, 10) || latestTotalPlayed;
                latestCleared = parseInt(row.cleared, 10) || latestCleared;
                latestFcCount = parseInt(row.fc_count, 10) || latestFcCount;
                latestApCount = parseInt(row.ap_count, 10) || latestApCount;
            });

            profile.level = latestLevel;
            profile.exp = latestExp;
            profile.stats.totalPlayed = latestTotalPlayed || rows.length;
            profile.stats.cleared = latestCleared || rows.filter(row => (parseInt(row.accuracy, 10) || 0) >= 60).length;
            profile.stats.fcCount = latestFcCount;
            profile.stats.apCount = latestApCount;

            saveProfile(profile);
        } catch (e) {
            console.error('Profile 讀取失敗：', e);
        } finally {
            _profileSyncingKeys.delete(key);
        }
    }

    // Batch-sync all profiles for a grade+class from GAS in one request
    let _allProfilesSyncing = false;
    async function syncAllProfiles(grade, cls, callback) {
        if (_allProfilesSyncing) return;
        _allProfilesSyncing = true;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            const url = `${CONFIG.API_URL}?action=getAllProfiles&grade=${encodeURIComponent(grade)}&class=${encodeURIComponent(cls)}&v=${Date.now()}`;
            const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal });
            clearTimeout(timeoutId);
            if (!res.ok) return;
            const allRows = await res.json();
            if (!Array.isArray(allRows) || !allRows.length) return;

            // Group rows by student name
            const byStudent = {};
            allRows.forEach(row => {
                const n = String(row.name || '').trim();
                if (!n) return;
                if (!byStudent[n]) byStudent[n] = [];
                byStudent[n].push(row);
            });

            // Update each student's local profile
            Object.entries(byStudent).forEach(([name, rows]) => {
                const user = { name, grade, class: cls };
                const existing = loadProfile(user);
                const profile = _defaultProfile(user);
                profile.avatar = existing.avatar || profile.avatar;
                profile.signature = existing.signature || profile.signature;
                profile.registeredAt = existing.registeredAt || rows[0].timestamp || profile.registeredAt;
                profile.totalPlayTime = existing.totalPlayTime || 0;

                let latestLevel = 1, latestExp = 0, latestTotalPlayed = 0;
                let latestCleared = 0, latestFcCount = 0, latestApCount = 0;

                rows.forEach(row => {
                    const score = parseInt(row.score, 10) || 0;
                    const accuracy = parseInt(row.accuracy, 10) || 0;
                    const maxCombo = parseInt(row.max_combo, 10) || 0;
                    const gameKey = String(row.game || '').trim();

                    profile.stats.totalScore += score;
                    profile.stats.totalAccuracy += accuracy;
                    profile.stats.accuracyCount++;
                    profile.stats.maxCombo = Math.max(profile.stats.maxCombo, maxCombo);
                    if (gameKey) profile.gameBests[gameKey] = Math.max(profile.gameBests[gameKey] || 0, score);

                    latestLevel = parseInt(row.level, 10) || latestLevel;
                    latestExp = parseInt(row.exp, 10) || latestExp;
                    latestTotalPlayed = parseInt(row.total_played, 10) || latestTotalPlayed;
                    latestCleared = parseInt(row.cleared, 10) || latestCleared;
                    latestFcCount = parseInt(row.fc_count, 10) || latestFcCount;
                    latestApCount = parseInt(row.ap_count, 10) || latestApCount;
                });

                profile.level = latestLevel;
                profile.exp = latestExp;
                profile.stats.totalPlayed = latestTotalPlayed || rows.length;
                profile.stats.cleared = latestCleared || rows.filter(r => (parseInt(r.accuracy, 10) || 0) >= 60).length;
                profile.stats.fcCount = latestFcCount;
                profile.stats.apCount = latestApCount;

                saveProfile(profile);
            });

            console.log(`✅ 已批次同步 ${Object.keys(byStudent).length} 位同學的檔案`);
            if (typeof callback === 'function') callback();
        } catch (e) {
            console.error('批次同步檔案失敗：', e);
        } finally {
            _allProfilesSyncing = false;
        }
    }

    function renderProfileScreen(user) {
        const p = loadProfile(user);
        if (user && user.name && p.stats.totalPlayed === 0) {
            syncProfileFromGAS(user).then(() => {
                const refreshed = loadProfile(user);
                if (refreshed.stats.totalPlayed > 0) renderProfileScreen(user);
            });
        }
        const avInfo = _avatarLookup(p.avatar);
        const avEl = document.getElementById('profileAvatar');
        avEl.textContent = p.avatar;
        avEl.style.background = avInfo.bg;
        document.getElementById('profileName').textContent = p.name + ' 同學';
        document.getElementById('profileSig').textContent = p.signature || '點擊編輯個人簽名...';
        document.getElementById('profileId').textContent = `${p.grade ? '小' + p.grade : ''} ${p.class}班 ${p.seat ? p.seat + '號' : ''}`;
        document.getElementById('profileSince').textContent = '加入日期: ' + (p.registeredAt ? new Date(p.registeredAt).toLocaleDateString() : '---');

        // Level & EXP
        document.getElementById('profileLevel').textContent = 'Lv.' + p.level;
        const needed = _expForLevel(p.level);
        const pct = Math.min(100, Math.round((p.exp / needed) * 100));
        document.getElementById('profileExpFill').style.width = pct + '%';
        document.getElementById('profileExpText').textContent = `${p.exp} / ${needed} EXP`;
        document.getElementById('profilePlaytime').textContent = `🕐 累計遊戲時長：${p.totalPlayTime || 0} 分鐘`;

        // Stats
        const s = p.stats;
        document.getElementById('psTotalPlayed').textContent = s.totalPlayed;
        document.getElementById('psCleared').textContent = s.cleared;
        document.getElementById('psTotalScore').textContent = s.totalScore;
        document.getElementById('psAvgAccuracy').textContent = s.accuracyCount > 0 ? Math.round(s.totalAccuracy / s.accuracyCount) + '%' : '0%';
        document.getElementById('psMaxCombo').textContent = s.maxCombo;
        document.getElementById('psFCCount').textContent = s.fcCount;
        document.getElementById('psAPCount').textContent = s.apCount;

        // Difficulty achievements
        document.getElementById('pdEasy').textContent = (p.diffClears.easy || 0) + ' 次通關';
        document.getElementById('pdNormal').textContent = (p.diffClears.normal || 0) + ' 次通關';
        document.getElementById('pdHard').textContent = (p.diffClears.hard || 0) + ' 次通關';
        document.getElementById('pdExpert').textContent = (p.diffClears.expert || 0) + ' 次通關';

        // Game bests
        document.getElementById('pgbGame1').textContent = p.gameBests.game1 || '---';
        document.getElementById('pgbGame2').textContent = p.gameBests.game2 || '---';
        document.getElementById('pgbGame3').textContent = p.gameBests.game3 || '---';
        const pgb4 = document.getElementById('pgbGame4');
        if (pgb4) pgb4.textContent = p.gameBests.game4 || '---';

        // Avatar grid with category filter
        const grid = document.getElementById('profileAvatarGrid');
        const avSection = grid.closest('.profile-avatars-section');
        let avCatFilter = avSection.querySelector('.avatar-cat-filter');
        if (!avCatFilter) {
            avCatFilter = document.createElement('div');
            avCatFilter.className = 'avatar-cat-filter';
            avCatFilter.innerHTML = AVATAR_CATEGORIES.map(c =>
                `<button class="av-cat-btn${c.key === 'all' ? ' active' : ''}" data-cat="${c.key}">${c.label}</button>`
            ).join('');
            avSection.insertBefore(avCatFilter, grid);
        }
        let _avCat = 'all';
        function _renderAvatarGrid() {
            const filtered = _avCat === 'all' ? PROFILE_AVATARS : PROFILE_AVATARS.filter(a => a.cat === _avCat);
            grid.innerHTML = filtered.map(a =>
                `<div class="profile-avatar-opt${a.emoji === p.avatar ? ' selected' : ''}" data-av="${a.emoji}">
                    <div class="pav-circle" style="background:${a.bg}">${a.emoji}</div>
                    <div class="pav-name">${a.name}</div>
                </div>`
            ).join('');
        }
        _renderAvatarGrid();
        avCatFilter.onclick = (e) => {
            const btn = e.target.closest('.av-cat-btn');
            if (!btn) return;
            _avCat = btn.dataset.cat;
            avCatFilter.querySelectorAll('.av-cat-btn').forEach(b => b.classList.toggle('active', b === btn));
            _renderAvatarGrid();
        };
        grid.onclick = (e) => {
            const opt = e.target.closest('.profile-avatar-opt');
            if (!opt) return;
            const av = opt.dataset.av;
            p.avatar = av;
            saveProfile(p);
            const info = _avatarLookup(av);
            const el = document.getElementById('profileAvatar');
            el.textContent = av;
            el.style.background = info.bg;
            grid.querySelectorAll('.profile-avatar-opt').forEach(el => el.classList.toggle('selected', el.dataset.av === av));
        };

        // Signature
        const sigInput = document.getElementById('profileSigInput');
        sigInput.value = p.signature || '';
        document.getElementById('profileSigSave').onclick = () => {
            const val = sigInput.value.trim().slice(0, 30);
            p.signature = val;
            saveProfile(p);
            document.getElementById('profileSig').textContent = val || '點擊編輯個人簽名...';
        };
    }

    // Preload clef SVG images (path-based for cross-platform consistency)
    const clefImages = { treble: new Image(), bass: new Image() };
    clefImages.treble.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.186 40.768"><path fill="#1E1E2F" d="m12.049 3.5296c0.305 3.1263-2.019 5.6563-4.0772 7.7014-0.9349 0.897-0.155 0.148-0.6437 0.594-0.1022-0.479-0.2986-1.731-0.2802-2.11 0.1304-2.6939 2.3198-6.5875 4.2381-8.0236 0.309 0.5767 0.563 0.6231 0.763 1.8382zm0.651 16.142c-1.232-0.906-2.85-1.144-4.3336-0.885-0.1913-1.255-0.3827-2.51-0.574-3.764 2.3506-2.329 4.9066-5.0322 5.0406-8.5394 0.059-2.232-0.276-4.6714-1.678-6.4836-1.7004 0.12823-2.8995 2.156-3.8019 3.4165-1.4889 2.6705-1.1414 5.9169-0.57 8.7965-0.8094 0.952-1.9296 1.743-2.7274 2.734-2.3561 2.308-4.4085 5.43-4.0046 8.878 0.18332 3.334 2.5894 6.434 5.8702 7.227 1.2457 0.315 2.5639 0.346 3.8241 0.099 0.2199 2.25 1.0266 4.629 0.0925 6.813-0.7007 1.598-2.7875 3.004-4.3325 2.192-0.5994-0.316-0.1137-0.051-0.478-0.252 1.0698-0.257 1.9996-1.036 2.26-1.565 0.8378-1.464-0.3998-3.639-2.1554-3.358-2.262 0.046-3.1904 3.14-1.7356 4.685 1.3468 1.52 3.833 1.312 5.4301 0.318 1.8125-1.18 2.0395-3.544 1.8325-5.562-0.07-0.678-0.403-2.67-0.444-3.387 0.697-0.249 0.209-0.059 1.193-0.449 2.66-1.053 4.357-4.259 3.594-7.122-0.318-1.469-1.044-2.914-2.302-3.792zm0.561 5.757c0.214 1.991-1.053 4.321-3.079 4.96-0.136-0.795-0.172-1.011-0.2626-1.475-0.4822-2.46-0.744-4.987-1.116-7.481 1.6246-0.168 3.4576 0.543 4.0226 2.184 0.244 0.577 0.343 1.197 0.435 1.812zm-5.1486 5.196c-2.5441 0.141-4.9995-1.595-5.6343-4.081-0.749-2.153-0.5283-4.63 0.8207-6.504 1.1151-1.702 2.6065-3.105 4.0286-4.543 0.183 1.127 0.366 2.254 0.549 3.382-2.9906 0.782-5.0046 4.725-3.215 7.451 0.5324 0.764 1.9765 2.223 2.7655 1.634-1.102-0.683-2.0033-1.859-1.8095-3.227-0.0821-1.282 1.3699-2.911 2.6513-3.198 0.4384 2.869 0.9413 6.073 1.3797 8.943-0.5054 0.1-1.0211 0.143-1.536 0.143z"/></svg>');
    clefImages.bass.src  = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><text x="4" y="95" font-size="110" fill="#1E1E2F" font-family="Bravura, Noto Music, Apple Symbols, Segoe UI Symbol, serif">𝄢</text></svg>');
    // Redraw staff when clef image finishes loading
    const onClefLoad = () => { if (state.currentNote && dom.ctx) drawStaff(); };
    clefImages.treble.onload = onClefLoad;
    clefImages.bass.onload  = onClefLoad;

    // Preload note head SVG images for whole and half notes
    const noteImages = { whole: new Image(), half: new Image() };
    noteImages.whole.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 60"><g transform="rotate(-15, 40, 30)"><ellipse cx="40" cy="30" rx="36" ry="24" fill="#1E1E2F"/><ellipse cx="40" cy="30" rx="24" ry="10" fill="white" transform="rotate(45, 40, 30)"/></g></svg>');
    noteImages.half.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 60"><g transform="rotate(-15, 40, 30)"><ellipse cx="40" cy="30" rx="32" ry="22" fill="#1E1E2F"/><ellipse cx="40" cy="30" rx="18" ry="8" fill="white" transform="rotate(45, 40, 30)"/></g></svg>');
    noteImages.whole.onload = onClefLoad;
    noteImages.half.onload = onClefLoad;

    function initDOM() {
        dom = {
            screens: document.querySelectorAll('.screen'),
            screenSetup: document.getElementById('screen-setup'),
            screenGame: document.getElementById('screen-game'),
            screenLeaderboard: document.getElementById('screen-leaderboard'),
            
            // Global & Setup
            soundToggle: document.getElementById('soundToggle'), 
            musicPanel: document.getElementById('musicPanel'),
            musicMuteToggle: document.getElementById('musicMuteToggle'),
            modeCards: document.querySelectorAll('.mode-card'), 
            nameField: document.getElementById('nameField'), 
            idField: document.getElementById('idField'),
            userName: document.getElementById('userName'), 
            userGrade: document.getElementById('userGrade'), 
            userClass: document.getElementById('userClass'), 
            userId: document.getElementById('userId'),
            startBtn: document.getElementById('startBtn'),
            
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
            practiceBadge: document.getElementById('practiceBadge'),
            practiceCount: document.getElementById('practiceCount'),
            
            // Leaderboard
            rankList: document.getElementById('rankList'), 
            rankClassFilter: document.getElementById('rankClassFilter'), 
            rankGradeFilter: document.getElementById('rankGradeFilter'), 
            rankModeFilter: document.getElementById('rankModeFilter'),
            reportGrid: document.getElementById('reportGrid'), 
            reportWeakness: document.getElementById('reportWeakness'), 
            backToSetupBtn: document.getElementById('backToSetupBtn'),
            // Cached settings elements for hot-path access
            highlightLine: document.getElementById('highlightLine'),
            noteHeadStyle: document.getElementById('noteHeadStyle'),
            textbookMode: document.getElementById('textbookMode'),
            clefTreble: document.getElementById('clefTreble'),
            accidentalSharp: document.getElementById('accidentalSharp'),
            accidentalFlat: document.getElementById('accidentalFlat'),
            ledgerLineAbove: document.getElementById('ledgerLineAbove'),
            ledgerLineBelow: document.getElementById('ledgerLineBelow'),
            bgVolume: document.getElementById('bgVolume'),
            sfxVolume: document.getElementById('sfxVolume'),
            bgVolumeVal: document.getElementById('bgVolumeVal'),
            sfxVolumeVal: document.getElementById('sfxVolumeVal'),
            bgMusic: document.getElementById('bgMusic'),
            reportHistory: document.getElementById('reportHistory'),
            studentRankHint: document.getElementById('studentRankHint'),
            viewRanksBtn: document.getElementById('viewRanksBtn'),
            leaderboardLayout: document.querySelector('.leaderboard-layout'),
            noteSoundOnly: document.getElementById('noteSoundOnly'),
            countdownSound: document.getElementById('countdownSound'),
            clefGroup: document.getElementById('clefGroup'),
            accidentalGroup: document.getElementById('accidentalGroup'),
            ledgerGroup: document.getElementById('ledgerGroup'),
            noteRangeGroup: document.getElementById('noteRangeGroup'),
            noteRangeFrom: document.getElementById('noteRangeFrom'),
            noteRangeTo: document.getElementById('noteRangeTo'),
            clefBass: document.getElementById('clefBass'),
            practiceDiffRow: document.getElementById('practiceDiffRow'),
            checkboxItems: document.querySelectorAll('.checkbox-item')
        };
        dom.scoreBadge = dom.scoreDisplay.closest('.stat-badge');
        dom.comboBadge = dom.comboDisplay.closest('.stat-badge');
        dom.modeCardMap = new Map([...dom.modeCards].map(c => [c.dataset.mode, c]));
        dom.screenMap = new Map([...dom.screens].map(s => [s.id, s]));
    }

    function initState() {
        state = { 
            currentMode: 'practice', 
            modeConfig: MODE_CONFIG.practice, 
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
            questionStartTime: 0,
            attemptedThisQuestion: false,
            showAnswerHighlight: false,
            slowNoteStats: {},
            lastNoteLetter: null,
            practiceDiff: '3',
            keysigGrade: 1,
            solfegeGrade: 1
        };
    }

    function initAudio() {
        audio = {
            ctx: null, 
            enabled: true, 
            initialized: false,
            _noteSoundOnlyEl: null,
            _countdownSoundEl: null,
            init() { 
                if (this.initialized) return; 
                try { 
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)(); 
                    this.initialized = true;
                    this._noteSoundOnlyEl = dom.noteSoundOnly;
                    this._countdownSoundEl = dom.countdownSound;
                } catch (e) { 
                    console.error('Audio context init error:', e);
                } 
            },
            async warmUp() {
                if (!this.ctx) return;
                try {
                    if (this.ctx.state === 'suspended') await this.ctx.resume();
                    // Play a silent buffer to fully unlock audio on iOS/Safari
                    const buf = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
                    const src = this.ctx.createBufferSource();
                    src.buffer = buf; src.connect(this.ctx.destination);
                    src.start(0);
                } catch(e) { /* ignore */ }
            },
            bgPlay() {
                if (!dom.bgMusic) return;
                const vol = parseInt(dom.bgVolume?.value ?? 18);
                dom.bgMusic.volume = vol / 100;
                if (this.enabled) dom.bgMusic.play().catch(()=>{});
            },
            bgStop() {
                if (!dom.bgMusic) return;
                dom.bgMusic.pause();
                dom.bgMusic.currentTime = 0;
            },
            bgSetMute(muted) {
                if (!dom.bgMusic) return;
                if (muted) { dom.bgMusic.pause(); } else { dom.bgMusic.volume = parseInt(dom.bgVolume?.value ?? 18) / 100; dom.bgMusic.play().catch(()=>{}); }
            },
            getSfxGain() {
                const v = parseInt(dom.sfxVolume?.value ?? 80);
                return v / 100;
            },
            playClick(type) {
                if (!this.ctx || !this.enabled) return;
                this.resume();
                const g = this.getSfxGain();
                const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
                osc.connect(gain); gain.connect(this.ctx.destination);
                if (type === 'select') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(660, this.ctx.currentTime);
                    osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.06);
                    gain.gain.setValueAtTime(0.18 * g, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
                    osc.start(this.ctx.currentTime); osc.stop(this.ctx.currentTime + 0.18);
                } else {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(380, this.ctx.currentTime + 0.08);
                    gain.gain.setValueAtTime(0.14 * g, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
                    osc.start(this.ctx.currentTime); osc.stop(this.ctx.currentTime + 0.1);
                }
            },
            resume() { 
                if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(e=>e); 
            },
            playNote(key) {
                if (!this.ctx || !this.enabled || !CONFIG.NOTE_FREQUENCIES[key]) return;
                this.resume();
                const g = this.getSfxGain();
                const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
                osc.type = 'sine'; 
                osc.frequency.value = CONFIG.NOTE_FREQUENCIES[key];
                osc.connect(gain); 
                gain.connect(this.ctx.destination);
                gain.gain.setValueAtTime(0, this.ctx.currentTime); 
                gain.gain.linearRampToValueAtTime(0.4 * g, this.ctx.currentTime + 0.05); 
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
                osc.start(this.ctx.currentTime); 
                osc.stop(this.ctx.currentTime + 0.8);
            },
            playEffect(type) {
                if (!this.ctx || !this.enabled) return; 
                this.resume();
                const g = this.getSfxGain();
                if (this._noteSoundOnlyEl && this._noteSoundOnlyEl.checked && type !== 'countdown' && type !== 'timeup') return;
                if (type === 'warning' && this._countdownSoundEl && !this._countdownSoundEl.checked) return;
                const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
                osc.connect(gain); 
                gain.connect(this.ctx.destination); 
                let dur = 0.3;
                if(type==='countdown'){ 
                    osc.type='sine'; 
                    osc.frequency.value=880; 
                    gain.gain.setValueAtTime(0.2*g, this.ctx.currentTime); 
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime+0.2); 
                    dur=0.2; 
                }
                else if(type==='timeup'){ 
                    osc.type='triangle'; 
                    osc.frequency.setValueAtTime(440, this.ctx.currentTime); 
                    osc.frequency.setValueAtTime(220, this.ctx.currentTime+0.3); 
                    gain.gain.setValueAtTime(0.3*g, this.ctx.currentTime); 
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime+0.5); 
                    dur=0.5; 
                }
                else if(type==='wrong'){ 
                    osc.type='sawtooth'; 
                    osc.frequency.setValueAtTime(200, this.ctx.currentTime); 
                    osc.frequency.setValueAtTime(150, this.ctx.currentTime+0.1); 
                    gain.gain.setValueAtTime(0.2*g, this.ctx.currentTime); 
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime+0.3); 
                }
                else if(type==='warning'){ 
                    osc.type='sine'; 
                    osc.frequency.value=1100; 
                    gain.gain.setValueAtTime(0.15*g, this.ctx.currentTime); 
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime+0.3); 
                }
                osc.start(this.ctx.currentTime); 
                osc.stop(this.ctx.currentTime + dur);
            },
            playBeat(strong = false) {
                if (!this.ctx || !this.enabled) return;
                this.resume();
                const g = this.getSfxGain();
                const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
                osc.connect(gain); gain.connect(this.ctx.destination);
                osc.type = 'sine';
                osc.frequency.value = strong ? 1050 : 700;
                gain.gain.setValueAtTime(0.22 * g, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);
                osc.start(this.ctx.currentTime); osc.stop(this.ctx.currentTime + 0.1);
            },
            playTap() {
                if (!this.ctx || !this.enabled) return;
                this.resume();
                const g = this.getSfxGain();
                const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
                osc.connect(gain); gain.connect(this.ctx.destination);
                osc.type = 'triangle';
                osc.frequency.value = 320;
                gain.gain.setValueAtTime(0.28 * g, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.13);
                osc.start(this.ctx.currentTime); osc.stop(this.ctx.currentTime + 0.15);
            },
            // Rhythm challenge judgment sound: perfect=bright chime, great=mid chime, good=low chime, miss/wrong=buzz
            playHit(jClass) {
                if (!this.ctx || !this.enabled) return;
                this.resume();
                const g = this.getSfxGain();
                const now = this.ctx.currentTime;
                if (jClass === 'perfect') {
                    // Two-tone bright chime
                    [880, 1320].forEach((freq, i) => {
                        const o = this.ctx.createOscillator(), gn = this.ctx.createGain();
                        o.type = 'sine'; o.frequency.value = freq;
                        o.connect(gn); gn.connect(this.ctx.destination);
                        gn.gain.setValueAtTime(0, now + i * 0.04);
                        gn.gain.linearRampToValueAtTime(0.22 * g, now + i * 0.04 + 0.01);
                        gn.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.18);
                        o.start(now + i * 0.04); o.stop(now + i * 0.04 + 0.2);
                    });
                } else if (jClass === 'great') {
                    const o = this.ctx.createOscillator(), gn = this.ctx.createGain();
                    o.type = 'sine'; o.frequency.value = 660;
                    o.connect(gn); gn.connect(this.ctx.destination);
                    gn.gain.setValueAtTime(0.2 * g, now);
                    gn.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                    o.start(now); o.stop(now + 0.16);
                } else if (jClass === 'good') {
                    const o = this.ctx.createOscillator(), gn = this.ctx.createGain();
                    o.type = 'triangle'; o.frequency.value = 440;
                    o.connect(gn); gn.connect(this.ctx.destination);
                    gn.gain.setValueAtTime(0.18 * g, now);
                    gn.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                    o.start(now); o.stop(now + 0.13);
                } else if (jClass === 'miss') {
                    const o = this.ctx.createOscillator(), gn = this.ctx.createGain();
                    o.type = 'sine'; o.frequency.value = 200;
                    o.connect(gn); gn.connect(this.ctx.destination);
                    gn.gain.setValueAtTime(0.15 * g, now);
                    gn.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                    o.start(now); o.stop(now + 0.26);
                } else { // wrong
                    const o = this.ctx.createOscillator(), gn = this.ctx.createGain();
                    o.type = 'sawtooth'; o.frequency.setValueAtTime(250, now); o.frequency.exponentialRampToValueAtTime(120, now + 0.15);
                    o.connect(gn); gn.connect(this.ctx.destination);
                    gn.gain.setValueAtTime(0.18 * g, now);
                    gn.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                    o.start(now); o.stop(now + 0.19);
                }
            },
            // Short correct/wrong chime for quiz-style answers
            playAnswer(correct) {
                if (!this.ctx || !this.enabled) return;
                this.resume();
                const g = this.getSfxGain();
                const now = this.ctx.currentTime;
                if (correct) {
                    [523, 659, 784].forEach((freq, i) => {
                        const o = this.ctx.createOscillator(), gn = this.ctx.createGain();
                        o.type = 'sine'; o.frequency.value = freq;
                        o.connect(gn); gn.connect(this.ctx.destination);
                        gn.gain.setValueAtTime(0, now + i * 0.07);
                        gn.gain.linearRampToValueAtTime(0.2 * g, now + i * 0.07 + 0.01);
                        gn.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.18);
                        o.start(now + i * 0.07); o.stop(now + i * 0.07 + 0.2);
                    });
                } else {
                    const o = this.ctx.createOscillator(), gn = this.ctx.createGain();
                    o.type = 'sawtooth'; o.frequency.setValueAtTime(300, now); o.frequency.exponentialRampToValueAtTime(140, now + 0.2);
                    o.connect(gn); gn.connect(this.ctx.destination);
                    gn.gain.setValueAtTime(0.2 * g, now);
                    gn.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                    o.start(now); o.stop(now + 0.23);
                }
            },
            scheduleTick(audioT, strong = false, countdown = false) {
                // Precise AudioContext-scheduled metronome tick
                if (!this.ctx || !this.enabled) return;
                // Route through a shared metronome bus so we can cut all future ticks
                if (!this._metroBus || this._metroBus.context !== this.ctx) {
                    this._metroBus = this.ctx.createGain();
                    this._metroBus.connect(this.ctx.destination);
                }
                const g = this.getSfxGain();
                const sr = this.ctx.sampleRate;

                // Woodblock / mechanical metronome click using noise burst + pitched body
                const clickDur = 0.06;
                const bufLen = Math.floor(sr * clickDur);
                const buf = this.ctx.createBuffer(1, bufLen, sr);
                const data = buf.getChannelData(0);
                // Shape: sharp attack transient (noise) + decaying sine body
                const bodyFreq = strong ? 1800 : 1100; // Hz — higher pitch on beat 1
                for (let i = 0; i < bufLen; i++) {
                    const t = i / sr;
                    const env = Math.exp(-t * (strong ? 55 : 70));
                    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 300); // transient click
                    const body = Math.sin(2 * Math.PI * bodyFreq * t) * env;
                    data[i] = (noise * 0.4 + body * 0.7) * (strong ? 0.95 : 0.72);
                }
                const src = this.ctx.createBufferSource();
                src.buffer = buf;
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(g, audioT);
                src.connect(gain); gain.connect(this._metroBus);
                src.start(audioT); src.stop(audioT + clickDur + 0.01);
            },
            stopAllTicks() {
                // Disconnect the metronome bus to silence all scheduled ticks
                if (this._metroBus) {
                    try { this._metroBus.disconnect(); } catch(e) { /* ignore */ }
                    this._metroBus = null;
                }
            },
            playInstrumentSound(instrId) {
                if (!this.ctx || !this.enabled) return;
                this.resume();
                const g = this.getSfxGain();
                const now = this.ctx.currentTime;
                const inst = typeof INSTRUMENT_BANK !== 'undefined' && INSTRUMENT_BANK.find(i => i.id === instrId);
                if (!inst) return;
                const p = inst.synthParams;

                if (p.noise) {
                    // Unpitched percussion — white noise shaped with filter + envelope
                    const bufLen = this.ctx.sampleRate * (p.dur || 0.3);
                    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
                    const data = buf.getChannelData(0);
                    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
                    const src = this.ctx.createBufferSource();
                    src.buffer = buf;
                    const filt = this.ctx.createBiquadFilter();
                    filt.type = p.filterType || 'bandpass';
                    filt.frequency.value = p.filterFreq || 3000;
                    filt.Q.value = p.filterQ || 1;
                    const gain = this.ctx.createGain();
                    src.connect(filt); filt.connect(gain); gain.connect(this.ctx.destination);
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime((p.vol || 0.3) * g, now + 0.005);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + (p.dur || 0.3));
                    src.start(now); src.stop(now + (p.dur || 0.3));
                    return;
                }

                const osc = this.ctx.createOscillator();
                const gainNode = this.ctx.createGain();
                osc.type = p.wave || 'sine';
                osc.frequency.setValueAtTime(p.freq, now);
                if (p.freqEnd) osc.frequency.exponentialRampToValueAtTime(p.freqEnd, now + (p.dur || 0.8));

                let lastNode = osc;

                // Optional filter
                if (p.filterType) {
                    const filt = this.ctx.createBiquadFilter();
                    filt.type = p.filterType;
                    filt.frequency.value = p.filterFreq || 2000;
                    filt.Q.value = p.filterQ || 1;
                    lastNode.connect(filt);
                    lastNode = filt;
                }

                // Optional vibrato LFO
                if (p.vibRate) {
                    const lfo = this.ctx.createOscillator();
                    const lfoGain = this.ctx.createGain();
                    lfo.frequency.value = p.vibRate;
                    lfoGain.gain.value = p.vibDepth || 3;
                    lfo.connect(lfoGain);
                    lfoGain.connect(osc.frequency);
                    lfo.start(now); lfo.stop(now + (p.dur || 0.8));
                }

                lastNode.connect(gainNode);
                gainNode.connect(this.ctx.destination);

                const vol = (p.vol || 0.3) * g;
                const attack = p.attack || 0.02;
                const dur = p.dur || 0.8;
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(vol, now + attack);
                if (p.sustain) {
                    gainNode.gain.setValueAtTime(vol * (p.sustain), now + attack + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, now + dur);
                } else {
                    gainNode.gain.exponentialRampToValueAtTime(0.001, now + dur);
                }
                osc.start(now); osc.stop(now + dur);
            }
        };
    }

    // ==========================================
    // 介面切換系統
    // ==========================================
    function switchScreen(screenId) {
        const current = [...dom.screens].find(s => s.classList.contains('active'));
        const next = dom.screenMap.get(screenId);

        // Cleanup active games when navigating away from game screens
        if (current && current !== next) {
            const cid = current.id;
            if (cid === 'screen-game' && state.gameActive) { state.gameActive = false; clearInterval(state.timer); state.timer = null; }
            if (_countdownTimerId) { clearInterval(_countdownTimerId); _countdownTimerId = null; dom.countdownOverlay?.classList.remove('show'); }
        }

        if (current && current !== next) {
            current.classList.remove('active');
            current.classList.add('screen-exit');
            current.addEventListener('animationend', function handler() {
                current.classList.remove('screen-exit');
                current.removeEventListener('animationend', handler);
            }, { once: true });
            // Fallback cleanup
            setTimeout(() => current.classList.remove('screen-exit'), 300);
        } else if (current) {
            current.classList.remove('active');
        }
        next?.classList.add('active');
        
        // 當切換到遊戲畫面時，需要重新計算 Canvas 的大小
        if (screenId === 'screen-game') {
            requestAnimationFrame(() => {
                setupHDPI();
                if (state.currentNote) drawStaff();
            });
        }
    }

    // ==========================================
    // 繪圖系統 (使用純向量數學繪製)
    // ==========================================
    function setupHDPI() {
        const dpr = window.devicePixelRatio || 1;
        const rect = dom.canvasWrapper.getBoundingClientRect();
        if (!rect.width || !rect.height) {
            // Container not laid out yet — schedule retry (capped to prevent infinite loop)
            const retries = (setupHDPI._retries || 0) + 1;
            setupHDPI._retries = retries;
            if (retries > 10) { setupHDPI._retries = 0; return; }
            requestAnimationFrame(() => {
                const r2 = dom.canvasWrapper.getBoundingClientRect();
                if (r2.width && r2.height) {
                    setupHDPI._retries = 0;
                    dom.canvas.width = r2.width * dpr;
                    dom.canvas.height = r2.height * dpr;
                    dom.canvas.style.width = `${r2.width}px`;
                    dom.canvas.style.height = `${r2.height}px`;
                    dom.ctx.scale(dpr, dpr);
                    dom.canvas.logicalWidth = r2.width;
                    dom.canvas.logicalHeight = r2.height;
                    _staffCache = null;
                    if (state.currentNote) drawStaff();
                } else {
                    setupHDPI();
                }
            });
            return;
        }
        setupHDPI._retries = 0;
        dom.canvas.width = rect.width * dpr;
        dom.canvas.height = rect.height * dpr;
        dom.canvas.style.width = `${rect.width}px`;
        dom.canvas.style.height = `${rect.height}px`;
        dom.ctx.scale(dpr, dpr);
        dom.canvas.logicalWidth = rect.width;
        dom.canvas.logicalHeight = rect.height;
        _staffCache = null; // invalidate on resize
    }
    
    function drawTrebleClef(ctx, x, y, ls) {
        // y = G line (2nd line from bottom). Path-based SVG: viewBox 0 0 15.186 40.768
        // G line sits at ~62.3% from top of the SVG
        const imgH = ls * 7.8;
        const imgW = imgH * (15.186 / 40.768);
        const drawX = x - imgW * 0.5;
        const drawY = y - imgH * 0.623;
        if (clefImages.treble.complete && clefImages.treble.naturalWidth > 0) {
            ctx.drawImage(clefImages.treble, drawX, drawY, imgW, imgH);
            return;
        }
        // Fallback: draw path directly on canvas
        ctx.save();
        const scale = imgH / 40.768;
        ctx.translate(drawX, drawY);
        ctx.scale(scale, scale);
        ctx.fillStyle = '#1E1E2F';
        ctx.fill(new Path2D('m12.049 3.5296c0.305 3.1263-2.019 5.6563-4.0772 7.7014-0.9349 0.897-0.155 0.148-0.6437 0.594-0.1022-0.479-0.2986-1.731-0.2802-2.11 0.1304-2.6939 2.3198-6.5875 4.2381-8.0236 0.309 0.5767 0.563 0.6231 0.763 1.8382zm0.651 16.142c-1.232-0.906-2.85-1.144-4.3336-0.885-0.1913-1.255-0.3827-2.51-0.574-3.764 2.3506-2.329 4.9066-5.0322 5.0406-8.5394 0.059-2.232-0.276-4.6714-1.678-6.4836-1.7004 0.12823-2.8995 2.156-3.8019 3.4165-1.4889 2.6705-1.1414 5.9169-0.57 8.7965-0.8094 0.952-1.9296 1.743-2.7274 2.734-2.3561 2.308-4.4085 5.43-4.0046 8.878 0.18332 3.334 2.5894 6.434 5.8702 7.227 1.2457 0.315 2.5639 0.346 3.8241 0.099 0.2199 2.25 1.0266 4.629 0.0925 6.813-0.7007 1.598-2.7875 3.004-4.3325 2.192-0.5994-0.316-0.1137-0.051-0.478-0.252 1.0698-0.257 1.9996-1.036 2.26-1.565 0.8378-1.464-0.3998-3.639-2.1554-3.358-2.262 0.046-3.1904 3.14-1.7356 4.685 1.3468 1.52 3.833 1.312 5.4301 0.318 1.8125-1.18 2.0395-3.544 1.8325-5.562-0.07-0.678-0.403-2.67-0.444-3.387 0.697-0.249 0.209-0.059 1.193-0.449 2.66-1.053 4.357-4.259 3.594-7.122-0.318-1.469-1.044-2.914-2.302-3.792zm0.561 5.757c0.214 1.991-1.053 4.321-3.079 4.96-0.136-0.795-0.172-1.011-0.2626-1.475-0.4822-2.46-0.744-4.987-1.116-7.481 1.6246-0.168 3.4576 0.543 4.0226 2.184 0.244 0.577 0.343 1.197 0.435 1.812zm-5.1486 5.196c-2.5441 0.141-4.9995-1.595-5.6343-4.081-0.749-2.153-0.5283-4.63 0.8207-6.504 1.1151-1.702 2.6065-3.105 4.0286-4.543 0.183 1.127 0.366 2.254 0.549 3.382-2.9906 0.782-5.0046 4.725-3.215 7.451 0.5324 0.764 1.9765 2.223 2.7655 1.634-1.102-0.683-2.0033-1.859-1.8095-3.227-0.0821-1.282 1.3699-2.911 2.6513-3.198 0.4384 2.869 0.9413 6.073 1.3797 8.943-0.5054 0.1-1.0211 0.143-1.536 0.143z'));
        ctx.restore();
    }



    function drawSharp(ctx, x, y, ls) {
        ctx.save();
        ctx.fillStyle = '#1E1E2F';
        ctx.font = `900 ${Math.round(ls * 2.2)}px Bravura, "Noto Music", "Apple Symbols", "Segoe UI Symbol", serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('\u266F', x, y);
        ctx.restore();
    }

    function drawBassClef(ctx, x, y, ls) {
        // y = F3 line (4th line from bottom = yFactor 1)
        const img = clefImages.bass;
        const imgH = ls * 4.5;
        const imgW = imgH * (100 / 120);
        if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, x - imgW * 0.12, y - imgH * 0.38, imgW, imgH);
            return;
        }
        ctx.save();
        ctx.fillStyle = '#1E1E2F';
        ctx.font = `${Math.round(ls * 4.2)}px Bravura, "Noto Music", "Apple Symbols", "Segoe UI Symbol", serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillText('\uD834\uDD22', x - ls * 0.2, y + ls * 0.6);
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

        // ---- build / reuse offscreen cache for staff lines + clef ----
        const dpr = window.devicePixelRatio || 1;
        const currentClef = state.currentNote ? state.currentNote.clef : 'treble';
        const clefLoaded = clefImages[currentClef]?.complete && clefImages[currentClef]?.naturalWidth > 0;
        const ls = w < 340 ? 14 : w < 400 ? 16 : 22;
        if (!_staffCache || _staffCache.w !== w || _staffCache.h !== h || _staffCache.dpr !== dpr || _staffCache.clefLoaded !== clefLoaded || _staffCache.clef !== currentClef) {
            const oc = document.createElement('canvas');
            oc.width = w * dpr; oc.height = h * dpr;
            const oc_ctx = oc.getContext('2d');
            oc_ctx.scale(dpr, dpr);
            // Center staff vertically: clef extends ~3.2*ls above baseY, lowest note ~5.5*ls below
            // Content center is at baseY + 1.15*ls, so baseY = h/2 - 1.15*ls
            const _baseY = Math.round(h / 2 - ls * 1.15), _startX = w < 400 ? 30 : 50;
            oc_ctx.strokeStyle = '#1E1E2F'; oc_ctx.lineWidth = 2; oc_ctx.lineCap = 'round';
            oc_ctx.beginPath();
            for (let i = 0; i < 5; i++) { oc_ctx.moveTo(_startX, _baseY + i*ls); oc_ctx.lineTo(w - _startX, _baseY + i*ls); }
            oc_ctx.stroke();
            if (currentClef === 'bass') {
                drawBassClef(oc_ctx, _startX + (w < 400 ? 20 : 35), _baseY + ls * 1, ls);
            } else {
                drawTrebleClef(oc_ctx, _startX + (w < 400 ? 20 : 35), _baseY + ls * 3, ls);
            }
            _staffCache = { canvas: oc, w, h, dpr, ls, clefLoaded, clef: currentClef, baseY: _baseY, startX: _startX };
        }
        ctx.drawImage(_staffCache.canvas, 0, 0, w, h);
        if (dom.clefBadge) dom.clefBadge.textContent = currentClef === 'bass' ? '低音譜號' : '高音譜號';

        const baseY = _staffCache.baseY, startX = _staffCache.startX;
        // Shift note rightward so it never overlaps with the clef
        const clefEndX = startX + (w < 400 ? 20 : 35) + ls * 3;
        const staffEndX = w - startX;
        const centerX = Math.round(clefEndX + (staffEndX - clefEndX) / 2);
        const middleLineY = baseY + 2 * ls;

        if (!state.currentNote) return;

        const noteY = baseY + state.currentNote.yFactor * ls;
        
        const highlightLineEl = dom.highlightLine;
        if (highlightLineEl && highlightLineEl.checked && !state.answered) {
            ctx.strokeStyle = 'rgba(6, 214, 160, 0.4)'; ctx.lineWidth = ls * 0.8;
            ctx.beginPath(); ctx.moveTo(centerX-35, noteY); ctx.lineTo(centerX+35, noteY); ctx.stroke();
        }

        ctx.strokeStyle = '#1E1E2F'; ctx.lineWidth = 2.5; const lW = 24;
        ctx.beginPath();
        if (state.currentNote.yFactor > 4) for(let i=1; i<=Math.floor(state.currentNote.yFactor - 4); i++) { ctx.moveTo(centerX-lW, baseY + (4+i)*ls); ctx.lineTo(centerX+lW, baseY + (4+i)*ls); }
        if (state.currentNote.yFactor < 0) for(let i=1; i<=Math.floor(Math.abs(state.currentNote.yFactor)); i++) { ctx.moveTo(centerX-lW, baseY - i*ls); ctx.lineTo(centerX+lW, baseY - i*ls); }
        ctx.stroke();

        if (state.currentNote.accidental) { 
            const accX = centerX - ls * 1.7;
            if (state.currentNote.accidental === '#') drawSharp(ctx, accX, noteY, ls);
            else drawFlat(ctx, accX, noteY, ls);
        }

        const headStyle = dom.noteHeadStyle ? dom.noteHeadStyle.value : 'filled';
        if (headStyle === 'whole' && noteImages.whole.complete && noteImages.whole.naturalWidth > 0) {
            const nh = ls * 1.15, nw = nh * (80 / 60);
            ctx.drawImage(noteImages.whole, centerX - nw / 2, noteY - nh / 2, nw, nh);
        } else if (headStyle === 'half' && noteImages.half.complete && noteImages.half.naturalWidth > 0) {
            const nh = ls * 1.05, nw = nh * (80 / 60);
            ctx.drawImage(noteImages.half, centerX - nw / 2, noteY - nh / 2, nw, nh);
            ctx.strokeStyle = '#1E1E2F'; ctx.lineWidth = 2.5; ctx.beginPath();
            if (noteY < middleLineY) { ctx.moveTo(centerX - ls*0.55, noteY + 2); ctx.lineTo(centerX - ls*0.55, noteY + ls*3.5); }
            else { ctx.moveTo(centerX + ls*0.55, noteY - 2); ctx.lineTo(centerX + ls*0.55, noteY - ls*3.5); }
            ctx.stroke();
        } else {
            ctx.fillStyle = '#1E1E2F'; ctx.strokeStyle = '#1E1E2F'; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.ellipse(centerX, noteY, ls*0.65, ls*0.48, -0.35, 0, Math.PI*2);
            if (headStyle === 'whole') ctx.stroke();
            else {
                if (headStyle === 'half') { ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke(); } else ctx.fill();
                ctx.beginPath();
                if (noteY < middleLineY) { ctx.moveTo(centerX - ls*0.55, noteY + 2); ctx.lineTo(centerX - ls*0.55, noteY + ls*3.5); }
                else { ctx.moveTo(centerX + ls*0.55, noteY - 2); ctx.lineTo(centerX + ls*0.55, noteY - ls*3.5); }
                ctx.stroke();
            }
        }

        if (state.showAnswerHighlight) {
            ctx.save();
            ctx.strokeStyle = '#FF4A6B'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
            ctx.beginPath(); ctx.arc(centerX, noteY, ls * 1.3, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#FF4A6B';
            ctx.font = `bold ${Math.round(ls * 0.85)}px 'Nunito', 'Noto Sans TC', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = noteY > middleLineY ? 'top' : 'bottom';
            const _solLabel = noteSol(state.currentNote); ctx.fillText(state.currentNote.correctName + (_solLabel ? ' = ' + _solLabel : ''), centerX, noteY > middleLineY ? noteY + ls * 1.6 : noteY - ls * 1.6);
            ctx.restore();
        }
    }

    // ==========================================
    // 遊戲主邏輯
    // ==========================================
    function toggleCheckboxAppearance() {
        dom.checkboxItems.forEach(lbl => {
            const cb = lbl.querySelector('input');
            if(cb && cb.checked) lbl.classList.add('checked'); else lbl.classList.remove('checked');
        });
    }

    function handleTextbookModeChange() {
        const tbMode = dom.textbookMode ? dom.textbookMode.value : "0";
        const groups = [dom.clefGroup, dom.accidentalGroup, dom.ledgerGroup, dom.noteRangeGroup];
        if (tbMode !== "0") {
            groups.forEach(el => { if (el) el.classList.add('disabled-group'); });
            const cfg = TEXTBOOK_CONFIG[tbMode];
            if (cfg) {
                if (dom.clefTreble) dom.clefTreble.checked = cfg.clef.includes('treble');
                if (dom.clefBass)   dom.clefBass.checked   = cfg.clef.includes('bass');
                if (dom.accidentalSharp) dom.accidentalSharp.checked = cfg.accidentalChance > 0;
                if (dom.accidentalFlat) dom.accidentalFlat.checked = cfg.accidentalChance > 0;
                if (dom.ledgerLineAbove) dom.ledgerLineAbove.checked = cfg.ledgerAbove;
                if (dom.ledgerLineBelow) dom.ledgerLineBelow.checked = cfg.ledgerBelow;
                if (dom.noteRangeFrom) dom.noteRangeFrom.value = String(cfg.noteRange[0]);
                if (dom.noteRangeTo) dom.noteRangeTo.value = String(cfg.noteRange[1]);
            }
        } else {
            groups.forEach(el => { if (el) el.classList.remove('disabled-group'); });
        }
        toggleCheckboxAppearance(); buildNoteButtons();
    }

    function saveSettings() {
        const s = {};
        s.lastMode = state.currentMode;
        s.practiceDiff = state.practiceDiff;
        s.keysigGrade = state.keysigGrade;
        s.solfegeGrade = state.solfegeGrade;
        s.savedName = dom.userName.value;
        const customInp = _customNameInput;
        if (dom.userName.value === '__other__' && customInp) s.savedCustomName = customInp.value;
        try { localStorage.setItem('musicGameSettingsV4', JSON.stringify(s)); } catch(e) { /* QuotaExceeded — skip silently */ }
    }

    function loadSavedSettings() {
        const stored = localStorage.getItem('musicGameSettingsV4');
        if (!stored) return;
        try {
            const s = JSON.parse(stored);
            if (s) {

                if (s.practiceDiff) state.practiceDiff = s.practiceDiff;
                if (s.keysigGrade) state.keysigGrade = parseInt(s.keysigGrade);
                if (s.solfegeGrade) state.solfegeGrade = parseInt(s.solfegeGrade);
                if (s.lastMode && MODE_CONFIG[s.lastMode]) {
                    state.currentMode = s.lastMode; state.modeConfig = MODE_CONFIG[s.lastMode];
                    dom.modeCards.forEach(c => c.classList.remove('active'));
                    const isClefChallenge = s.lastMode === 'classic60' || s.lastMode === 'bass60' || s.lastMode === 'mixed60';
                    const isKeysigMode = s.lastMode === 'keysig_practice' || s.lastMode === 'keysig60';
                    const isSolfegeMode = s.lastMode === 'solfege_practice' || s.lastMode === 'solfege60';
                    if (isClefChallenge) { dom.modeCardMap.get('classic60')?.classList.add('active'); }
                    else if (isKeysigMode) { dom.modeCardMap.get('keysig_practice')?.classList.add('active'); }
                    else if (isSolfegeMode) { dom.modeCardMap.get('solfege_practice')?.classList.add('active'); }
                    else { dom.modeCardMap.get(s.lastMode)?.classList.add('active'); }
                }
                // Restore saved student name after populating dropdown
                if (s.savedName) {
                    populateNameDropdown();
                    dom.userName.value = s.savedName;
                    if (s.savedName === '__other__') {
                        showCustomName();
                        dom.userId.readOnly = false;
                        if (_customNameInput && s.savedCustomName) _customNameInput.value = s.savedCustomName;
                        if (s.userId) dom.userId.value = s.userId;
                    } else {
                        const sel = dom.userName.selectedOptions[0];
                        if (sel && sel.dataset.seat) dom.userId.value = sel.dataset.seat;
                    }
                }
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
        buildNoteButtons();
    }

    function updateScoreboard() {
        dom.scoreDisplay.textContent = state.score;
        dom.comboDisplay.textContent = state.combo;
        if (dom.scoreBadge) { dom.scoreBadge.classList.remove('pop'); void dom.scoreBadge.offsetWidth; dom.scoreBadge.classList.add('pop'); }
        if (dom.comboBadge) { dom.comboBadge.classList.remove('pop'); void dom.comboBadge.offsetWidth; dom.comboBadge.classList.add('pop'); }
        if (dom.practiceBadge) {
            const isPractice = state.modeConfig && state.modeConfig.type === 'practice';
            dom.practiceBadge.style.display = isPractice ? '' : 'none';
            if (isPractice && dom.practiceCount) {
                dom.practiceCount.textContent = `${state.totalQuestions - state.wrongCount} / ${state.totalQuestions}`;
            }
        }
    }

    function showComboBurst(combo) {
        const el = document.createElement('div');
        el.className = 'combo-burst';
        el.textContent = combo >= 10 ? `🔥 ${combo} 題連對！太棒了！` : `⚡ ${combo} 題連對！`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 900);
    }

    function spawnConfetti(count) {
        const colors = ['#FF65A3','#FFCB45','#00D28E','#00A6ED','#8B66FF','#FF8C42','#FF4A6B'];
        const frag = document.createDocumentFragment();
        const pieces = new Array(count);
        for (let i = 0; i < count; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = (30 + Math.random() * 40) + 'vw';
            piece.style.top = (35 + Math.random() * 20) + 'vh';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = (Math.random() * 0.3) + 's';
            piece.style.animationDuration = (0.8 + Math.random() * 0.6) + 's';
            piece.style.width = (6 + Math.random() * 8) + 'px';
            piece.style.height = (6 + Math.random() * 8) + 'px';
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            pieces[i] = piece;
            frag.appendChild(piece);
        }
        document.body.appendChild(frag);
        setTimeout(() => { for (let i = 0; i < pieces.length; i++) pieces[i].remove(); }, 1400);
    }

    function showScoreFloat(points, x, y) {
        const el = document.createElement('div');
        el.className = 'score-float';
        el.textContent = '+' + points;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 900);
    }
    
    function enableGameControls(enabled) {
        noteBtnMap.forEach(btn => {
            const rowHidden = btn.closest('.note-row')?.style.display === 'none';
            btn.disabled = rowHidden || !enabled || state.answered;
        });
        dom.revealBtn.disabled = !enabled || state.answered;
        dom.skipBtn.disabled = !enabled || state.answered;
        dom.endBtn.disabled = !enabled;
    }

    function _getPracticeConfig() {
        const DIFF_TB = {'1':'1','2':'2','3':'3','4':'5','5':'6'};
        const tbKey = DIFF_TB[state.practiceDiff] || '3';
        return TEXTBOOK_CONFIG[tbKey];
    }

    function _getEffectiveGrade() {
        const selectedGrade = parseInt(dom.userGrade?.value, 10);
        if (!Number.isNaN(selectedGrade) && selectedGrade > 0) return selectedGrade;
        const userGrade = parseInt(state.currentUser?.grade, 10);
        if (!Number.isNaN(userGrade) && userGrade > 0) return userGrade;
        return 3;
    }

    function _isLowerGradeNoAccidentals() {
        const grade = _getEffectiveGrade();
        return grade === 1 || grade === 2;
    }

    function generateNote() {
        let clefOptions = [], accidentalChance = 0, noteRange = [0, 10], allowAbove = true, allowBelow = true;
        
        // Challenge modes can force a specific clef
        const forceClef = state.modeConfig && state.modeConfig.forceClef;
        
        if (forceClef) {
            // Use per-clef, per-grade challenge levels
            const gradeKey = state.currentUser ? state.currentUser.grade : 3;
            if (forceClef === 'treble') clefOptions = ['treble'];
            else if (forceClef === 'bass') clefOptions = ['bass'];
            else clefOptions = ['treble','bass'];
            // Pick clef first so we can load the right level config
            const clef = clefOptions[Math.floor(Math.random() * clefOptions.length)];
            const lvl = (CHALLENGE_LEVELS[clef] && CHALLENGE_LEVELS[clef][gradeKey]) || CHALLENGE_LEVELS.treble[3];
            accidentalChance = lvl.accidentalChance;
            if (_isLowerGradeNoAccidentals()) accidentalChance = 0;
            allowAbove = lvl.ledgerAbove; allowBelow = lvl.ledgerBelow;
            noteRange = lvl.noteRange;
            // Skip the clef selection below — we already chose
            const maxIdx = Math.min(noteRange[1], MAPS[clef].length - 1);
            const poolSize = maxIdx - noteRange[0] + 1;
            const pickBase = () => MAPS[clef][Math.floor(Math.random() * poolSize) + noteRange[0]];
            let base = pickBase();
            if (poolSize > 1) { let tries = 0; while (base.letter === state.lastNoteLetter && tries < 20) { base = pickBase(); tries++; } }
            let finalName = base.letter, accidental = null;
            if (Math.random() < accidentalChance) {
                const isSharp = Math.random() < 0.5;
                if (isSharp && base.letter !== 'E' && base.letter !== 'B') { finalName += '#'; accidental = '#'; }
                else if (!isSharp && base.letter !== 'F' && base.letter !== 'C') { finalName += '♭'; accidental = '♭'; }
            }
            const note = { ...base, clef, accidental, correctName: finalName, freqKey: finalName + base.octave };
            state.lastNoteLetter = base.letter;
            return note;
        } else {
            // Practice mode — use difficulty-based config
            const config = _getPracticeConfig();
            clefOptions = config.clef; accidentalChance = config.accidentalChance; noteRange = config.noteRange; allowAbove = config.ledgerAbove; allowBelow = config.ledgerBelow;
            if (_isLowerGradeNoAccidentals()) accidentalChance = 0;
        }

        const clef = clefOptions[Math.floor(Math.random() * clefOptions.length)];
        // Bass clef uses its full range; range pickers are treble-only
        const effRange = clef === 'bass' ? [0, MAPS.bass.length - 1] : noteRange;
        const maxIdx = Math.min(effRange[1], MAPS[clef].length - 1);
        const poolSize = maxIdx - effRange[0] + 1;
        const pickBase = () => MAPS[clef][Math.floor(Math.random() * poolSize) + effRange[0]];
        let base = pickBase();
        // Anti-repeat: never repeat the same note letter consecutively
        if (poolSize > 1) { let tries = 0; while (base.letter === state.lastNoteLetter && tries < 20) { base = pickBase(); tries++; } }

        let finalName = base.letter, accidental = null;
        if (Math.random() < accidentalChance) {
            const isSharp = Math.random() < 0.5;
            if (isSharp && base.letter !== 'E' && base.letter !== 'B') { finalName += '#'; accidental = '#'; }
            else if (!isSharp && base.letter !== 'F' && base.letter !== 'C') { finalName += '♭'; accidental = '♭'; }
        }
        const note = { ...base, clef, accidental, correctName: finalName, freqKey: finalName + base.octave };
        state.lastNoteLetter = base.letter;
        return note;
    }

    function buildNoteButtons() {
        // Derive sharp/flat visibility from active config
        const forceClef = state.modeConfig && state.modeConfig.forceClef;
        const gradeKey = state.currentUser ? state.currentUser.grade : 3;
        let hasAccidentals;
        if (forceClef) {
            const clefKey = forceClef === 'mixed' ? 'treble' : forceClef;
            const lvl = (CHALLENGE_LEVELS[clefKey] && CHALLENGE_LEVELS[clefKey][gradeKey]) || CHALLENGE_LEVELS.treble[3];
            hasAccidentals = lvl.accidentalChance > 0;
        } else {
            hasAccidentals = _getPracticeConfig().accidentalChance > 0;
        }
        if (gradeKey === 1 || gradeKey === 2) hasAccidentals = false;
        const showSharp = hasAccidentals;
        const showFlat  = hasAccidentals;

        if (!_noteRowsBuilt) {
            dom.notesGrid.innerHTML = '';
            noteBtnMap.clear();
            const keys = { 'C':'1', 'D':'2', 'E':'3', 'F':'4', 'G':'5', 'A':'6', 'B':'7', 'C#':'Q', 'D#':'W', 'F#':'E', 'G#':'R', 'A#':'T', 'D♭':'A', 'E♭':'S', 'G♭':'D', 'A♭':'F', 'B♭':'G'};
            const gridFrag = document.createDocumentFragment();
            const buildRow = (notes, cls) => {
                const div = document.createElement('div'); div.className = 'note-row';
                notes.forEach(n => {
                    const btn = document.createElement('button'); btn.className = `note-btn ${cls}`; btn.dataset.note = n; btn.disabled = true;
                    const sol = SOLFEGE[n]; btn.innerHTML = `${sol?`<span class="note-sol">${sol}</span>`:''}${n}<span class="key-hint">${keys[n]}</span>`; btn.addEventListener('click', () => handleAnswer(n));
                    noteBtnMap.set(n, btn);
                    div.appendChild(btn);
                }); return div;
            };
            gridFrag.appendChild(buildRow(['C','D','E','F','G','A','B'], 'natural'));
            _sharpRow = buildRow(['C#','D#','F#','G#','A#'], 'sharp'); gridFrag.appendChild(_sharpRow);
            _flatRow  = buildRow(['D♭','E♭','G♭','A♭','B♭'], 'flat');  gridFrag.appendChild(_flatRow);
            dom.notesGrid.appendChild(gridFrag);
            _noteRowsBuilt = true;
        }
        if (_sharpRow) _sharpRow.style.display = showSharp ? '' : 'none';
        if (_flatRow)  _flatRow.style.display  = showFlat  ? '' : 'none';
    }

    function handleAnswer(answer) {
        if (!state.gameActive || state.answered) return;
        // Capture first-attempt flag and elapsed before setting attemptedThisQuestion
        const isFirstAttempt = !state.attemptedThisQuestion;
        const elapsed = Date.now() - state.questionStartTime;
        if (isFirstAttempt) {
            state.answerTimeList.push(elapsed / 1000);
            state.totalQuestions++;
            state.attemptedThisQuestion = true;
        }
        const correct = answer === state.currentNote.correctName, btn = noteBtnMap.get(answer);

        if (correct) {
            state.answered = true; 
            state.combo++; 
            if (state.combo > state.maxCombo) state.maxCombo = state.combo;
            // Track slow-correct: first attempt correct but took > 4 seconds
            if (isFirstAttempt && elapsed > SLOW_ANSWER_MS) {
                state.slowNoteStats[state.currentNote.correctName] = (state.slowNoteStats[state.currentNote.correctName] || 0) + 1;
            }
            const pts = state.modeConfig.type === 'challenge' ? Math.round(10 * state.modeConfig.scoreMulti + state.combo) : 0;
            if (pts) state.score += pts;
            const _sol = noteSol(state.currentNote); const _secs = isFirstAttempt ? ` ⚡ ${(elapsed/1000).toFixed(1)}s` : ''; dom.messageBox.textContent = `✅ 答對了！${state.currentNote.correctName}${_sol?' = '+_sol:''}${_secs} ✨ 得分：${state.score}`; 
            dom.messageBox.className = 'message-box correct';
            audio.playNote(state.currentNote.freqKey);
            if (btn) { btn.classList.add('correct'); if (pts) { const r = btn.getBoundingClientRect(); showScoreFloat(pts, r.left + r.width/2 - 15, r.top - 10); } }
            if (state.combo > 0 && state.combo % COMBO_CONFETTI_INTERVAL === 0) { showComboBurst(state.combo); spawnConfetti(Math.min(state.combo, MAX_CONFETTI)); }
            // Practice mode milestone
            if (state.modeConfig.type === 'practice') {
                const correctCount = state.totalQuestions - state.wrongCount;
                if (correctCount > 0 && correctCount % 20 === 0) {
                    showComboBurst(correctCount); spawnConfetti(MAX_CONFETTI + 5);
                    dom.messageBox.textContent = `🎯 已答對 ${correctCount} 題！你好棒！繼續加油！`;
                }
            }
            setTimeout(() => { if (!state.gameActive) return; if (btn) btn.classList.remove('correct', 'wrong'); nextQuestion(); }, 500);
        } else {
            const clefLabel = state.currentNote.clef === 'bass' ? '低音' : '高音';
            const statKey = `${state.currentNote.correctName} (${clefLabel})`;
            state.wrongNoteStats[statKey] = (state.wrongNoteStats[statKey]||0) + 1; 
            state.combo = 0; 
            audio.playEffect('wrong');
            
            state.answered = true; 
            state.wrongCount++; 
            state.showAnswerHighlight = true; drawStaff();
            const _sol2 = noteSol(state.currentNote); const _secs2 = isFirstAttempt ? `（${(elapsed/1000).toFixed(1)}s）` : ''; dom.messageBox.textContent = `❌ 答錯了！正確答案是 ${state.currentNote.correctName}${_sol2?' ('+_sol2+')':''}${_secs2}，記住了嗎？`; 
            dom.messageBox.className = 'message-box wrong';
            if (btn) btn.classList.add('wrong'); 
            setTimeout(() => { if (!state.gameActive) return; if (btn) btn.classList.remove('wrong'); if(state.modeConfig.maxWrong !== Infinity) endGame(); else nextQuestion(); }, 1500);
        } 
        updateScoreboard();
    }

    function nextQuestion() { 
        state.currentNote = generateNote(); 
        state.answered = false;
        state.attemptedThisQuestion = false;
        state.showAnswerHighlight = false;
        state.questionStartTime = Date.now();
        if (!dom.canvas.logicalWidth) setupHDPI();
        drawStaff();
        // Retry draw after layout if canvas still not ready
        if (!dom.canvas.logicalWidth) requestAnimationFrame(() => { setupHDPI(); drawStaff(); });
        enableGameControls(true); 
    }

    function startCountdown(callback) {
        let count = 3; 
        dom.countdownOverlay.textContent = count; 
        dom.countdownOverlay.classList.add('show'); 
        audio.playEffect('countdown');
        if (_countdownTimerId) clearInterval(_countdownTimerId);
        _countdownTimerId = setInterval(() => {
            count--;
            if (count <= 0) { 
                clearInterval(_countdownTimerId);
                _countdownTimerId = null;
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
        audio.warmUp();
        // Ensure keysig/solfege UI is hidden for normal note-name game
        showKeysigUI(false);
        showSolfegeUI(false);
        if (dom.notesGrid) dom.notesGrid.style.display = '';
        const canvasWrapper = document.getElementById('canvasWrapper');
        if (canvasWrapper) canvasWrapper.style.display = '';
        const clefBadge = document.getElementById('clefBadge');
        if (clefBadge) clefBadge.style.display = '';
        const playerName = getPlayerName();
        if (!playerName) {
            dom.nameField.classList.add('error');
            alert('❗ 請先選擇你的名字才可以開始哦！');
            return;
        }
        dom.nameField.classList.remove('error');
        saveSettings();
        state.currentUser = { name: playerName, grade: parseInt(dom.userGrade.value), class: dom.userClass.value, id: dom.userId.value };
        buildNoteButtons();
        dom.inGameUser.textContent = `👋 ${state.currentUser.name} 同學，加油！模式：${state.modeConfig.name}`;
        dom.endBtn.textContent = state.modeConfig.type === 'practice' ? '📊 結束練習' : '🏁 結束挑戰';

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
        state.slowNoteStats = {};
        state.lastNoteLetter = null;
        state.attemptedThisQuestion = false;
        if (state.timer) { clearInterval(state.timer); state.timer = null; }
        
        // Ensure bg music is playing (may have been stopped after last game)
        audio.bgPlay();
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
            dom.messageBox.textContent = `🎵 ${state.modeConfig.name} — 開始了！加油！`; 
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
            dom.messageBox.textContent = '⚠️ 最後10秒！加油加油！'; 
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

    // ==========================================
    // 調號辨別遊戲
    // ==========================================
    let _keysigCurrentQ = null;

    function showKeysigUI(show) {
        const keysigDisplay = document.getElementById('keysigDisplay');
        const keysigOptions = document.getElementById('keysigOptions');
        const canvasWrapper = document.getElementById('canvasWrapper');
        const clefBadge = document.getElementById('clefBadge');
        if (keysigDisplay) keysigDisplay.style.display = show ? 'flex' : 'none';
        if (keysigOptions) keysigOptions.style.display = show ? 'grid' : 'none';
        if (canvasWrapper) canvasWrapper.style.display = show ? 'none' : '';
        if (clefBadge) clefBadge.style.display = show ? 'none' : '';
        if (dom.notesGrid) dom.notesGrid.style.display = show ? 'none' : '';
    }

    function generateKeysigQuestion(grade) {
        const pool = getKeysigPool(grade);
        if (pool.length < 2) return null;
        const correct = pool[Math.floor(Math.random() * pool.length)];
        // Pick 3 distractors
        const others = pool.filter(k => k.id !== correct.id);
        const shuffled = others.sort(() => Math.random() - 0.5);
        const distractors = shuffled.slice(0, Math.min(3, shuffled.length));
        const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
        return { correct, options, img: correct.img };
    }

    function renderKeysigQuestion(q) {
        _keysigCurrentQ = q;
        const keysigImg = document.getElementById('keysigImg');
        const keysigOptions = document.getElementById('keysigOptions');
        if (keysigImg) { keysigImg.src = q.img; keysigImg.alt = '辨別此調號'; }
        if (!keysigOptions) return;
        keysigOptions.innerHTML = '';
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'keysig-opt-btn';
            btn.textContent = opt.name;
            btn.disabled = false;
            btn.addEventListener('click', () => handleKeysigAnswer(opt, btn));
            keysigOptions.appendChild(btn);
        });
    }

    function handleKeysigAnswer(selected, btn) {
        if (!state.gameActive || state.answered) return;
        const q = _keysigCurrentQ;
        if (!q) return;
        const isFirstAttempt = !state.attemptedThisQuestion;
        const elapsed = Date.now() - state.questionStartTime;
        if (isFirstAttempt) {
            state.answerTimeList.push(elapsed / 1000);
            state.totalQuestions++;
            state.attemptedThisQuestion = true;
        }
        const correct = selected.id === q.correct.id;
        if (correct) {
            state.answered = true;
            state.combo++;
            if (state.combo > state.maxCombo) state.maxCombo = state.combo;
            if (isFirstAttempt && elapsed > SLOW_ANSWER_MS) {
                state.slowNoteStats[q.correct.name] = (state.slowNoteStats[q.correct.name] || 0) + 1;
            }
            const pts = state.modeConfig.type === 'challenge' ? Math.round(10 * state.modeConfig.scoreMulti + state.combo) : 0;
            if (pts) state.score += pts;
            const _secs = isFirstAttempt ? ` ⚡ ${(elapsed/1000).toFixed(1)}s` : '';
            dom.messageBox.textContent = `✅ 答對了！${q.correct.name}${_secs} ✨ 得分：${state.score}`;
            dom.messageBox.className = 'message-box correct';
            if (btn) { btn.classList.add('correct'); if (pts) { const r = btn.getBoundingClientRect(); showScoreFloat(pts, r.left + r.width/2 - 15, r.top - 10); } }
            if (state.combo > 0 && state.combo % COMBO_CONFETTI_INTERVAL === 0) { showComboBurst(state.combo); spawnConfetti(Math.min(state.combo, MAX_CONFETTI)); }
            if (state.modeConfig.type === 'practice') {
                const correctCount = state.totalQuestions - state.wrongCount;
                if (correctCount > 0 && correctCount % 20 === 0) {
                    showComboBurst(correctCount); spawnConfetti(MAX_CONFETTI + 5);
                    dom.messageBox.textContent = `🎯 已答對 ${correctCount} 題！你好棒！繼續加油！`;
                }
            }
            setTimeout(() => { if (!state.gameActive) return; nextKeysigQuestion(); }, 500);
        } else {
            state.wrongNoteStats[q.correct.name] = (state.wrongNoteStats[q.correct.name] || 0) + 1;
            state.combo = 0;
            audio.playEffect('wrong');
            state.answered = true;
            state.wrongCount++;
            dom.messageBox.textContent = `❌ 答錯了！正確答案是 ${q.correct.name}，記住了嗎？`;
            dom.messageBox.className = 'message-box wrong';
            if (btn) btn.classList.add('wrong');
            // Highlight correct
            const opts = document.querySelectorAll('.keysig-opt-btn');
            opts.forEach(b => { if (b.textContent === q.correct.name) b.classList.add('correct'); });
            setTimeout(() => { if (!state.gameActive) return; if (state.modeConfig.maxWrong !== Infinity) endGame(); else nextKeysigQuestion(); }, 1500);
        }
        updateScoreboard();
    }

    function nextKeysigQuestion() {
        const grade = state.keysigGrade || state.currentUser.grade || 3;
        const q = generateKeysigQuestion(grade);
        if (!q) return;
        state.answered = false;
        state.attemptedThisQuestion = false;
        state.questionStartTime = Date.now();
        renderKeysigQuestion(q);
        enableGameControls(true);
    }

    function startKeysigGame() {
        audio.init(); audio.warmUp();
        const playerName = getPlayerName();
        if (!playerName) { dom.nameField.classList.add('error'); alert('❗ 請先選擇你的名字才可以開始哦！'); return; }
        dom.nameField.classList.remove('error');
        saveSettings();
        state.currentUser = { name: playerName, grade: parseInt(dom.userGrade.value), class: dom.userClass.value, id: dom.userId.value };

        showKeysigUI(true);
        showSolfegeUI(false);
        dom.inGameUser.textContent = `👋 ${state.currentUser.name} 同學，加油！模式：${state.modeConfig.name}`;
        dom.endBtn.textContent = state.modeConfig.type === 'practice' ? '📊 結束練習' : '🏁 結束挑戰';

        state.gameActive = false;
        state.timeLeft = state.modeConfig.duration;
        state.score = 0; state.totalQuestions = 0; state.wrongCount = 0;
        state.combo = 0; state.maxCombo = 0; state.answered = false;
        state.wrongNoteStats = {}; state.answerTimeList = []; state.slowNoteStats = {};
        state.attemptedThisQuestion = false;
        if (state.timer) { clearInterval(state.timer); state.timer = null; }

        audio.bgPlay();
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
            dom.messageBox.textContent = `🎼 ${state.modeConfig.name} — 開始了！加油！`;
            dom.messageBox.className = 'message-box';
            nextKeysigQuestion();
            if (state.timeLeft !== Infinity) {
                setTimeout(() => {
                    dom.timeProgress.style.transition = `width ${state.timeLeft}s linear`;
                    dom.timeProgress.style.width = '0%';
                }, 50);
            }
        });
    }

    // ==========================================
    // 唱名辨別遊戲
    // ==========================================
    let _solfegeCurrentAnswer = null;

    function showSolfegeUI(show) {
        const solfegeGrid = document.getElementById('solfegeGrid');
        const canvasWrapper = document.getElementById('canvasWrapper');
        if (solfegeGrid) solfegeGrid.style.display = show ? 'flex' : 'none';
        if (show) {
            if (canvasWrapper) canvasWrapper.style.display = '';
            if (dom.notesGrid) dom.notesGrid.style.display = 'none';
            const keysigDisplay = document.getElementById('keysigDisplay');
            const keysigOptions = document.getElementById('keysigOptions');
            if (keysigDisplay) keysigDisplay.style.display = 'none';
            if (keysigOptions) keysigOptions.style.display = 'none';
        }
    }

    function generateSolfegeNote(grade) {
        const level = SOLFEGE_LEVELS[grade] || SOLFEGE_LEVELS[3];
        // Pick random key
        const keyId = level.keys[Math.floor(Math.random() * level.keys.length)];
        const keySig = KEY_SIGNATURES.find(k => k.id === keyId);
        if (!keySig) return null;

        // Build diatonic note pool from treble MAPS within noteRange
        const noteRange = level.noteRange;
        const mapNotes = MAPS.treble.slice(noteRange[0], noteRange[1] + 1);

        // Filter to only diatonic notes in this key
        const diatonicPool = [];
        mapNotes.forEach(mapNote => {
            // Check if this note letter (with key sig accidental) is in the scale
            const letter = mapNote.letter;
            // Determine what this note sounds like with the key signature applied
            let noteWithAcc = letter;
            if (keySig.sharpNotes.includes(letter)) noteWithAcc = letter + '#';
            else if (keySig.flatNotes.includes(letter)) noteWithAcc = letter + '♭';

            const solName = getSolfege(keySig, noteWithAcc);
            if (solName) {
                diatonicPool.push({ ...mapNote, clef: 'treble', accidental: null, noteWithAcc, correctSolfege: solName });
            }
        });

        if (!diatonicPool.length) return null;

        // Anti-repeat
        let pick = diatonicPool[Math.floor(Math.random() * diatonicPool.length)];
        if (diatonicPool.length > 1) {
            let tries = 0;
            while (pick.letter === state.lastNoteLetter && tries < 20) {
                pick = diatonicPool[Math.floor(Math.random() * diatonicPool.length)];
                tries++;
            }
        }
        state.lastNoteLetter = pick.letter;

        return {
            ...pick,
            correctName: pick.noteWithAcc,
            freqKey: (pick.noteWithAcc.replace('♭','b')) + pick.octave,
            keySig
        };
    }

    function drawStaffWithKeySig() {
        // First draw the normal staff
        if (!dom.canvas.logicalWidth) setupHDPI();
        const w = dom.canvas.logicalWidth, h = dom.canvas.logicalHeight, ctx = dom.ctx;
        if (!w || !h) return;
        ctx.clearRect(0, 0, w, h);

        const dpr = window.devicePixelRatio || 1;
        const currentClef = 'treble';
        const clefLoaded = clefImages[currentClef]?.complete && clefImages[currentClef]?.naturalWidth > 0;
        const ls = w < 340 ? 14 : w < 400 ? 16 : 22;

        // Rebuild staff cache for treble clef
        if (!_staffCache || _staffCache.w !== w || _staffCache.h !== h || _staffCache.dpr !== dpr || _staffCache.clefLoaded !== clefLoaded || _staffCache.clef !== currentClef || _staffCache._isSolfegeCache) {
            const oc = document.createElement('canvas');
            oc.width = w * dpr; oc.height = h * dpr;
            const oc_ctx = oc.getContext('2d');
            oc_ctx.scale(dpr, dpr);
            const _baseY = Math.round(h / 2 - ls * 1.15), _startX = w < 400 ? 30 : 50;
            oc_ctx.strokeStyle = '#1E1E2F'; oc_ctx.lineWidth = 2; oc_ctx.lineCap = 'round';
            oc_ctx.beginPath();
            for (let i = 0; i < 5; i++) { oc_ctx.moveTo(_startX, _baseY + i * ls); oc_ctx.lineTo(w - _startX, _baseY + i * ls); }
            oc_ctx.stroke();
            drawTrebleClef(oc_ctx, _startX + (w < 400 ? 20 : 35), _baseY + ls * 3, ls);
            _staffCache = { canvas: oc, w, h, dpr, ls, clefLoaded, clef: currentClef, baseY: _baseY, startX: _startX, _isSolfegeCache: false };
        }
        ctx.drawImage(_staffCache.canvas, 0, 0, w, h);

        const baseY = _staffCache.baseY, startX = _staffCache.startX;
        const clefEndX = startX + (w < 400 ? 20 : 35) + ls * 3;

        // Draw key signature accidentals after clef
        const keySig = state.currentNote ? state.currentNote.keySig : null;
        let ksWidth = 0;
        if (keySig) {
            const ksStartX = clefEndX + ls * 0.5;
            const spacing = ls * 1.0;
            if (keySig.sharps > 0) {
                for (let i = 0; i < keySig.sharps; i++) {
                    const pos = KEYSIG_SHARP_POS_TREBLE[i];
                    const y = baseY + pos.yFactor * ls;
                    drawSharp(ctx, ksStartX + i * spacing, y, ls);
                }
                ksWidth = keySig.sharps * spacing + ls * 0.5;
            } else if (keySig.flats > 0) {
                for (let i = 0; i < keySig.flats; i++) {
                    const pos = KEYSIG_FLAT_POS_TREBLE[i];
                    const y = baseY + pos.yFactor * ls;
                    drawFlat(ctx, ksStartX + i * spacing, y, ls);
                }
                ksWidth = keySig.flats * spacing + ls * 0.5;
            }
        }

        // Note position: center between key sig end and staff end
        const noteAreaStart = clefEndX + ksWidth + ls;
        const staffEndX = w - startX;
        const centerX = Math.round(noteAreaStart + (staffEndX - noteAreaStart) / 2);
        const middleLineY = baseY + 2 * ls;

        if (!state.currentNote) return;

        const noteY = baseY + state.currentNote.yFactor * ls;

        // Highlight line
        const highlightLineEl = dom.highlightLine;
        if (highlightLineEl && highlightLineEl.checked && !state.answered) {
            ctx.strokeStyle = 'rgba(6, 214, 160, 0.4)'; ctx.lineWidth = ls * 0.8;
            ctx.beginPath(); ctx.moveTo(centerX - 35, noteY); ctx.lineTo(centerX + 35, noteY); ctx.stroke();
        }

        // Ledger lines
        ctx.strokeStyle = '#1E1E2F'; ctx.lineWidth = 2.5; const lW = 24;
        ctx.beginPath();
        if (state.currentNote.yFactor > 4) for (let i = 1; i <= Math.floor(state.currentNote.yFactor - 4); i++) { ctx.moveTo(centerX - lW, baseY + (4 + i) * ls); ctx.lineTo(centerX + lW, baseY + (4 + i) * ls); }
        if (state.currentNote.yFactor < 0) for (let i = 1; i <= Math.floor(Math.abs(state.currentNote.yFactor)); i++) { ctx.moveTo(centerX - lW, baseY - i * ls); ctx.lineTo(centerX + lW, baseY - i * ls); }
        ctx.stroke();

        // Note: NO individual accidental drawn (key signature handles it)

        // Draw note head (always filled for solfège mode)
        ctx.fillStyle = '#1E1E2F'; ctx.strokeStyle = '#1E1E2F'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.ellipse(centerX, noteY, ls * 0.65, ls * 0.48, -0.35, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        if (noteY < middleLineY) { ctx.moveTo(centerX - ls * 0.55, noteY + 2); ctx.lineTo(centerX - ls * 0.55, noteY + ls * 3.5); }
        else { ctx.moveTo(centerX + ls * 0.55, noteY - 2); ctx.lineTo(centerX + ls * 0.55, noteY - ls * 3.5); }
        ctx.stroke();

        // Key name badge
        if (keySig) {
            ctx.save();
            ctx.fillStyle = 'rgba(124, 58, 237, 0.85)';
            ctx.font = `bold ${Math.round(ls * 0.7)}px 'Nunito', 'Noto Sans TC', sans-serif`;
            ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText(keySig.name, startX + 4, baseY + ls * 4.3);
            ctx.restore();
        }

        // Answer highlight
        if (state.showAnswerHighlight) {
            ctx.save();
            ctx.strokeStyle = '#FF4A6B'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
            ctx.beginPath(); ctx.arc(centerX, noteY, ls * 1.3, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#FF4A6B';
            ctx.font = `bold ${Math.round(ls * 0.85)}px 'Nunito', 'Noto Sans TC', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = noteY > middleLineY ? 'top' : 'bottom';
            ctx.fillText(state.currentNote.correctSolfege + ' (' + state.currentNote.correctName + ')', centerX, noteY > middleLineY ? noteY + ls * 1.6 : noteY - ls * 1.6);
            ctx.restore();
        }
    }

    function handleSolfegeAnswer(solName) {
        if (!state.gameActive || state.answered) return;
        if (!state.currentNote || !state.currentNote.correctSolfege) return;

        const isFirstAttempt = !state.attemptedThisQuestion;
        const elapsed = Date.now() - state.questionStartTime;
        if (isFirstAttempt) {
            state.answerTimeList.push(elapsed / 1000);
            state.totalQuestions++;
            state.attemptedThisQuestion = true;
        }

        const correct = solName === state.currentNote.correctSolfege;
        const btn = document.querySelector(`.solfege-btn[data-sol="${solName}"]`);

        if (correct) {
            state.answered = true;
            state.combo++;
            if (state.combo > state.maxCombo) state.maxCombo = state.combo;
            if (isFirstAttempt && elapsed > SLOW_ANSWER_MS) {
                const statKey = state.currentNote.correctSolfege + ' (' + (state.currentNote.keySig ? state.currentNote.keySig.name : '') + ')';
                state.slowNoteStats[statKey] = (state.slowNoteStats[statKey] || 0) + 1;
            }
            const pts = state.modeConfig.type === 'challenge' ? Math.round(10 * state.modeConfig.scoreMulti + state.combo) : 0;
            if (pts) state.score += pts;
            const _secs = isFirstAttempt ? ` ⚡ ${(elapsed/1000).toFixed(1)}s` : '';
            const keyLabel = state.currentNote.keySig ? ` (${state.currentNote.keySig.name})` : '';
            dom.messageBox.textContent = `✅ 答對了！${state.currentNote.correctSolfege} = ${state.currentNote.correctName}${keyLabel}${_secs} ✨ 得分：${state.score}`;
            dom.messageBox.className = 'message-box correct';
            audio.playNote(state.currentNote.freqKey);
            if (btn) { btn.classList.add('correct'); if (pts) { const r = btn.getBoundingClientRect(); showScoreFloat(pts, r.left + r.width/2 - 15, r.top - 10); } }
            if (state.combo > 0 && state.combo % COMBO_CONFETTI_INTERVAL === 0) { showComboBurst(state.combo); spawnConfetti(Math.min(state.combo, MAX_CONFETTI)); }
            if (state.modeConfig.type === 'practice') {
                const correctCount = state.totalQuestions - state.wrongCount;
                if (correctCount > 0 && correctCount % 20 === 0) {
                    showComboBurst(correctCount); spawnConfetti(MAX_CONFETTI + 5);
                    dom.messageBox.textContent = `🎯 已答對 ${correctCount} 題！你好棒！繼續加油！`;
                }
            }
            setTimeout(() => { if (!state.gameActive) return; if (btn) btn.classList.remove('correct', 'wrong'); nextSolfegeQuestion(); }, 500);
        } else {
            const statKey = state.currentNote.correctSolfege + ' (' + (state.currentNote.keySig ? state.currentNote.keySig.name : '') + ')';
            state.wrongNoteStats[statKey] = (state.wrongNoteStats[statKey] || 0) + 1;
            state.combo = 0;
            audio.playEffect('wrong');
            state.answered = true;
            state.wrongCount++;
            state.showAnswerHighlight = true; drawStaffWithKeySig();
            const keyLabel = state.currentNote.keySig ? ` (${state.currentNote.keySig.name})` : '';
            dom.messageBox.textContent = `❌ 答錯了！正確答案是 ${state.currentNote.correctSolfege} = ${state.currentNote.correctName}${keyLabel}，記住了嗎？`;
            dom.messageBox.className = 'message-box wrong';
            if (btn) btn.classList.add('wrong');
            // Highlight correct button
            const correctBtn = document.querySelector(`.solfege-btn[data-sol="${state.currentNote.correctSolfege}"]`);
            if (correctBtn) correctBtn.classList.add('correct');
            setTimeout(() => {
                if (!state.gameActive) return;
                document.querySelectorAll('.solfege-btn').forEach(b => b.classList.remove('correct', 'wrong'));
                if (state.modeConfig.maxWrong !== Infinity) endGame(); else nextSolfegeQuestion();
            }, 1500);
        }
        updateScoreboard();
    }

    function nextSolfegeQuestion() {
        const grade = state.solfegeGrade || state.currentUser.grade || 3;
        const note = generateSolfegeNote(grade);
        if (!note) return;
        state.currentNote = note;
        state.answered = false;
        state.attemptedThisQuestion = false;
        state.showAnswerHighlight = false;
        state.questionStartTime = Date.now();
        // Invalidate staff cache so key sig is redrawn
        _staffCache = null;
        drawStaffWithKeySig();
        // Enable solfege buttons
        document.querySelectorAll('.solfege-btn').forEach(b => { b.disabled = false; });
        enableGameControls(true);
    }

    function startSolfegeGame() {
        audio.init(); audio.warmUp();
        const playerName = getPlayerName();
        if (!playerName) { dom.nameField.classList.add('error'); alert('❗ 請先選擇你的名字才可以開始哦！'); return; }
        dom.nameField.classList.remove('error');
        saveSettings();
        state.currentUser = { name: playerName, grade: parseInt(dom.userGrade.value), class: dom.userClass.value, id: dom.userId.value };

        showKeysigUI(false);
        showSolfegeUI(true);
        if (dom.clefBadge) dom.clefBadge.textContent = '高音譜號';
        dom.inGameUser.textContent = `👋 ${state.currentUser.name} 同學，加油！模式：${state.modeConfig.name}`;
        dom.endBtn.textContent = state.modeConfig.type === 'practice' ? '📊 結束練習' : '🏁 結束挑戰';

        state.gameActive = false;
        state.timeLeft = state.modeConfig.duration;
        state.score = 0; state.totalQuestions = 0; state.wrongCount = 0;
        state.combo = 0; state.maxCombo = 0; state.answered = false;
        state.wrongNoteStats = {}; state.answerTimeList = []; state.slowNoteStats = {};
        state.lastNoteLetter = null; state.attemptedThisQuestion = false;
        state.showAnswerHighlight = false;
        if (state.timer) { clearInterval(state.timer); state.timer = null; }

        audio.bgPlay();
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
            dom.messageBox.textContent = `🎤 ${state.modeConfig.name} — 開始了！加油！`;
            dom.messageBox.className = 'message-box';
            nextSolfegeQuestion();
            if (state.timeLeft !== Infinity) {
                setTimeout(() => {
                    dom.timeProgress.style.transition = `width ${state.timeLeft}s linear`;
                    dom.timeProgress.style.width = '0%';
                }, 50);
            }
        });
    }

    function generateReport() {
        const accuracy = state.totalQuestions ? Math.round(((state.totalQuestions - state.wrongCount) / state.totalQuestions) * 100) : 0;
        const avg = state.answerTimeList.length ? (state.answerTimeList.reduce((a,b)=>a+b,0)/state.answerTimeList.length).toFixed(1) : 0;
        dom.reportGrid.innerHTML = `<div class="report-item"><div class="report-label">答題數</div><div class="report-value">${state.totalQuestions}</div></div><div class="report-item"><div class="report-label">得分</div><div class="report-value">${state.score}</div></div><div class="report-item"><div class="report-label">正確率</div><div class="report-value">${accuracy}%</div></div><div class="report-item"><div class="report-label">平均速度</div><div class="report-value">${avg}秒</div></div><div class="report-item"><div class="report-label">最高連對</div><div class="report-value">${state.maxCombo}</div></div><div class="report-item"><div class="report-label">答錯</div><div class="report-value" style="color:var(--primary-red)">${state.wrongCount}</div></div>`;
        
        const sorted = Object.entries(state.wrongNoteStats).sort((a,b)=>b[1]-a[1]);
        if (!sorted.length) {
            dom.reportWeakness.innerHTML = '<div>🌟 太厲害了！全部答對，你是音樂小天才！ 🎉</div>';
            return;
        }
        // Categorize errors
        let ledgerErrors = 0, staffErrors = 0, accidentalErrors = 0, naturalErrors = 0;
        sorted.forEach(([k, v]) => {
            const noteName = k.split(' (')[0];
            if (noteName.includes('#') || noteName.includes('♭')) accidentalErrors += v;
            else naturalErrors += v;
        });
        // Check if errors are from ledger line notes (yFactor > 4 or < 0)
        Object.entries(state.wrongNoteStats).forEach(([k]) => {
            const noteName = k.split(' (')[0].replace('#','').replace('♭','');
            const clefName = k.match(/\((.+)\)/)?.[1] || '';
            const clefKey = clefName === '高音' ? 'treble' : clefName === '低音' ? 'bass' : null;
            if (clefKey && MAPS[clefKey]) {
                const noteInfo = MAPS[clefKey].find(n => n.letter === noteName);
                if (noteInfo && (noteInfo.yFactor > 4 || noteInfo.yFactor < 0)) ledgerErrors += state.wrongNoteStats[k];
                else staffErrors += state.wrongNoteStats[k];
            }
        });
        // Speed trend
        let speedTrend = '';
        if (state.answerTimeList.length >= 6) {
            const list = state.answerTimeList, len = list.length, half = len >> 1;
            let s1 = 0, s2 = 0;
            for (let i = 0; i < half; i++) s1 += list[i];
            for (let i = half; i < len; i++) s2 += list[i];
            const firstHalf = s1 / half;
            const secondHalf = s2 / (len - half);
            if (secondHalf > firstHalf * 1.3) speedTrend = '<li>⚠️ 後半段反應變慢，可能有點累，記得休息</li>';
            else if (secondHalf < firstHalf * 0.8) speedTrend = '<li>🚀 愈做愈快，進步明顯！</li>';
        }
        let analysis = '<ul>';
        analysis += sorted.slice(0,3).map(([k,v]) => `<li><strong>${k}</strong>：錯了 ${v} 次</li>`).join('');
        if (ledgerErrors > staffErrors && ledgerErrors > 2) analysis += '<li>📏 加線音符出錯較多，可以多練習上下加線範圍</li>';
        if (accidentalErrors > naturalErrors && accidentalErrors > 2) analysis += '<li>🎵 升降號音符出錯較多，需加強升降記號辨認</li>';
        if (speedTrend) analysis += speedTrend;
        analysis += '</ul>';
        dom.reportWeakness.innerHTML = `<div>要加油練習的音符：</div>${analysis}`;

        // Slow-correct notes section
        const slowSorted = Object.entries(state.slowNoteStats).sort((a,b) => b[1] - a[1]);
        if (slowSorted.length) {
            let slowHtml = '<div class="history-summary" style="margin-top:8px;"><strong>🐢 答得較慢的音符（>4秒）：</strong><ul style="margin-left:20px; margin-top:6px;">';
            slowHtml += slowSorted.slice(0, 3).map(([k,v]) => `<li><strong>${k}</strong>：慢了 ${v} 次</li>`).join('');
            slowHtml += '</ul></div>';
            dom.reportWeakness.innerHTML += slowHtml;
        }

        // Save to history
        saveHistory(accuracy, avg);
    }

    // ==========================================
    // 📊 歷史進度追蹤
    // ==========================================
    function saveHistory(accuracy, avgSpeed) {
        try {
            const history = JSON.parse(localStorage.getItem('musicGameHistory') || '[]');
            history.push({
                date: new Date().toLocaleDateString('zh-TW'),
                mode: state.currentMode,
                score: state.score,
                accuracy: parseInt(accuracy),
                avgSpeed: parseFloat(avgSpeed),
                questions: state.totalQuestions,
                maxCombo: state.maxCombo
            });
            // Keep last 20 records
            if (history.length > 20) history.splice(0, history.length - 20);
            localStorage.setItem('musicGameHistory', JSON.stringify(history));
        } catch(e) { /* ignore storage errors */ }
    }

    function getHistorySummary() {
        try {
            const history = JSON.parse(localStorage.getItem('musicGameHistory') || '[]');
            if (history.length < 2) return '';
            const recent = history.slice(-5);
            const older = history.slice(-10, -5);
            if (!older.length) return '';
            const recentAcc = Math.round(recent.reduce((a,r) => a + (r.accuracy||0), 0) / recent.length);
            const olderAcc = Math.round(older.reduce((a,r) => a + (r.accuracy||0), 0) / older.length);
            const recentSpd = (recent.reduce((a,r) => a + (r.avgSpeed||0), 0) / recent.length).toFixed(1);
            const olderSpd = (older.reduce((a,r) => a + (r.avgSpeed||0), 0) / older.length).toFixed(1);
            let html = '<div class="history-summary"><div class="group-title">📈 進度趨勢（近 ' + history.length + ' 次）</div><ul style="margin:8px 0 0 16px; font-size:0.9rem;">';
            const accDiff = recentAcc - olderAcc;
            if (accDiff > 5) html += `<li>✅ 正確率進步中！${olderAcc}% → ${recentAcc}%</li>`;
            else if (accDiff < -5) html += `<li>⚠️ 正確率下降了 ${olderAcc}% → ${recentAcc}%，多練練</li>`;
            else html += `<li>📊 正確率穩定在 ${recentAcc}% 附近</li>`;
            const spdDiff = parseFloat(recentSpd) - parseFloat(olderSpd);
            if (spdDiff < -0.3) html += `<li>🚀 反應速度加快了！${olderSpd}s → ${recentSpd}s</li>`;
            else if (spdDiff > 0.3) html += `<li>🐢 反應變慢了 ${olderSpd}s → ${recentSpd}s</li>`;
            html += '</ul></div>';
            return html;
        } catch(e) { return ''; }
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
            game: 'game1',
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

        // Always save locally as backup
        saveLocalRank('game1', state.currentUser, record.score, record.accuracy, record.max_combo, state.currentMode);
        try {
            await fetch(CONFIG.API_URL, { 
                method: 'POST', 
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
                body: JSON.stringify(record),
                mode: 'no-cors',
                redirect: 'follow',
                signal: controller.signal
            });
            _showToast('✅ 分數已上傳！', 'success');
            setTimeout(loadRanks, 2000);
        } catch (e) {
            console.error("上傳失敗：", e);
            _showToast('⚠️ 網絡問題，分數已儲存在本機', 'warn');
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async function submitScoreToGAS(game, user, score, accuracy, maxCombo, modeName) {
        if (!user || !user.name) return;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const record = {
            game,
            name: user.name,
            grade: user.grade,
            class: user.class,
            id: user.seat || user.id || '',
            mode: modeName || game,
            mode_name: modeName,
            score,
            max_combo: maxCombo,
            accuracy,
            timestamp: new Date().toLocaleString('zh-TW')
        };
        // Always save locally as backup
        saveLocalRank(game, user, score, accuracy, maxCombo, modeName);
        try {
            await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(record),
                mode: 'no-cors',
                redirect: 'follow',
                signal: controller.signal
            });
            _showToast('✅ 分數已上傳！', 'success');
        } catch(e) {
            console.error('上傳失敗：', e);
            _showToast('⚠️ 網絡問題，分數已儲存在本機', 'warn');
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async function submitProfileResultToGAS(game, user, score, accuracy, maxCombo, profile) {
        if (!user || !user.name || !profile) return;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const record = {
            action: 'saveProfileResult',
            game,
            name: user.name,
            grade: user.grade,
            class: user.class,
            id: user.seat || user.id || '',
            score,
            max_combo: maxCombo,
            accuracy,
            level: profile.level,
            exp: profile.exp,
            total_played: profile.stats?.totalPlayed || 0,
            cleared: profile.stats?.cleared || 0,
            fc_count: profile.stats?.fcCount || 0,
            ap_count: profile.stats?.apCount || 0,
            timestamp: new Date().toLocaleString('zh-TW')
        };

        try {
            await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(record),
                mode: 'no-cors',
                redirect: 'follow',
                signal: controller.signal
            });
        } catch (e) {
            console.error('Profile 上傳失敗：', e);
        } finally {
            clearTimeout(timeoutId);
        }
    }

    function endGame() { 
        if (!state.gameActive) return;
        state.gameActive = false; 
        enableGameControls(false); 
        clearInterval(state.timer); 
        state.timer = null;
        // Keep BG music playing on result page
        dom.timeProgress.style.transition = 'none'; 
        
        generateReport(); 
        // Show history trend
        if (dom.reportHistory) dom.reportHistory.innerHTML = getHistorySummary();

        // Record to profile
        const _g1Accuracy = state.totalQuestions ? Math.round(((state.totalQuestions - state.wrongCount) / state.totalQuestions) * 100) : 0;
        if (state.currentUser) {
            recordGameResult(state.currentUser, 'game1', state.score, _g1Accuracy, state.maxCombo, state.currentMode);
        }

        if (state.modeConfig.type === 'challenge') submitScore(); 
        
        dom.leaderboardLayout.classList.remove('view-only');
        const isPracticeEnd = state.modeConfig.type === 'practice';
        if (isPracticeEnd) {
            dom.leaderboardLayout.classList.add('practice-end');
        } else {
            dom.leaderboardLayout.classList.remove('practice-end');
            focusLeaderboardToCurrentStudent();
            loadRanks();
        }
        const reportTitleEl = document.querySelector('.report-title');
        if (reportTitleEl) reportTitleEl.textContent = isPracticeEnd ? '📝 練習完成！做得好！' : '🎉 做得好！挑戰完成！';
        switchScreen('screen-leaderboard');
    }

    function _buildSkeletonRanks(count) {
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `<div class="skeleton-rank-row" style="animation-delay:${i * 0.08}s">
                <div class="skeleton skeleton-circle"></div>
                <div style="flex:1"><div class="skeleton skeleton-text medium"></div><div class="skeleton skeleton-text short"></div></div>
            </div>`;
        }
        return html;
    }

    async function loadRanks(retries) {
        if (retries === undefined) retries = 2;
        dom.rankList.innerHTML = _buildSkeletonRanks(6);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        try { 
            const res = await fetch(`${CONFIG.API_URL}?v=${Date.now()}`, { redirect: 'follow', signal: controller.signal });
            if (!res.ok) throw new Error(`伺服器回應錯誤 (HTTP ${res.status})`);
            const contentType = res.headers.get('content-type') || '';
            const text = await res.text();
            if (!contentType.includes('json') && (text.trimStart().startsWith('<'))) {
                console.error("GAS 回傳 HTML 錯誤頁面，請檢查部署設定：", text.slice(0, 300));
                throw new Error("GAS 部署錯誤：請確認部署權限設為「所有人」");
            }
            const data = JSON.parse(text);
            state.allRanks = Array.isArray(data) ? data.filter(r => r && r.mode && r.name).map(r => {
                r.score = parseInt(r.score) || 0;
                r.max_combo = parseInt(r.max_combo) || 0;
                r.accuracy = parseInt(r.accuracy) || 0;
                r.grade = r.grade ? String(r.grade) : '';
                return r;
            }) : []; 
            renderRanks(); 
        } catch (e) {
            if (retries > 0) {
                console.warn('排行榜載入失敗，重試中...', retries);
                clearTimeout(timeoutId);
                setTimeout(() => loadRanks(retries - 1), 2000);
                return;
            }
            const isTimeout = e.name === 'AbortError';
            const msg = isTimeout ? '網絡連線太慢了，請檢查網絡' : (e.message || '未知錯誤');
            dom.rankList.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-light); font-weight:800;">❌ 無法連線至排行榜<br><span style="font-size:0.8rem; font-weight:normal;">${msg}</span><br><button class="rank-retry-btn" style="margin-top:12px; padding:8px 20px; border-radius:20px; border:2px solid var(--primary-purple); background:white; color:var(--primary-purple-dark); font-weight:900; cursor:pointer;">🔄 重試</button></div>`; 
            const retryBtn = dom.rankList.querySelector('.rank-retry-btn');
            if (retryBtn) retryBtn.addEventListener('click', () => loadRanks());
            console.warn("排行榜載入異常：", e);
        } finally {
            clearTimeout(timeoutId);
        }
    }

    function escHtml(str) {
        return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }
    function isCurrentUserRecord(item) {
        const itemName = String(item?.name || '').trim();
        const userName = String(state.currentUser?.name || '').trim();
        const itemClass = String(item?.class || '');
        const userClass = String(state.currentUser?.class || '');
        const itemGrade = parseInt(item?.grade);
        const userGrade = parseInt(state.currentUser?.grade);
        if (!itemName || !userName) return false;
        if (itemName !== userName || itemClass !== userClass || itemGrade !== userGrade) return false;
        const userId = String(state.currentUser?.id || '').trim();
        const itemId = String(item?.id || '').trim();
        if (userId) return itemId === userId;
        return true;
    }
    
    function _rankRewardBanner() {
        return '<div class="rank-reward-banner">🏆 每級前三名將獲得獎勵！</div>';
    }

    function focusLeaderboardToCurrentStudent() {
        if (!state.currentUser?.name) return;
        if (dom.rankGradeFilter) dom.rankGradeFilter.value = String(state.currentUser.grade || 0);
        if (dom.rankClassFilter) dom.rankClassFilter.value = String(state.currentUser.class || '0');
        if (dom.rankModeFilter && state.modeConfig?.type === 'challenge') dom.rankModeFilter.value = state.currentMode;
    }

    function renderRanks() {
        const gf = document.getElementById('rankGameFilter');
        if (gf && gf.value !== 'game1') { renderRanksForGame(gf.value); return; }
        const fC = dom.rankClassFilter.value, fG = parseInt(dom.rankGradeFilter.value), fM = dom.rankModeFilter.value;
        let f = state.allRanks.filter(r => r.mode === fM); 
        if (fC !== '0') f = f.filter(r => r.class === fC); 
        if (fG !== 0) f = f.filter(r => parseInt(r.grade) === fG);
        f.sort((a,b)=> (parseInt(b.score)||0) - (parseInt(a.score)||0) || (parseInt(b.max_combo)||0) - (parseInt(a.max_combo)||0));
        // Deduplicate: keep only highest score per name+class+id
        const seen = new Set();
        f = f.filter(r => {
            const key = `${String(r.name||'').trim()}|${String(r.class||'')}|${String(r.id||'').trim()}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        const selfIndex = f.findIndex(isCurrentUserRecord);
        if (dom.studentRankHint) {
            if (state.currentUser && state.currentUser.name && fC !== '0' && fG !== 0 && selfIndex >= 0) {
                const safeName = escHtml(state.currentUser.name);
                const gradeTxt = `小${state.currentUser.grade}`;
                const clsTxt = `${state.currentUser.class}班`;
                const rankTxt = selfIndex + 1;
                dom.studentRankHint.innerHTML = `🎯 ${safeName} 同學（${gradeTxt}${clsTxt}）目前排第 <strong>${rankTxt}</strong> 名`;
                dom.studentRankHint.style.display = '';
            } else {
                dom.studentRankHint.style.display = 'none';
                dom.studentRankHint.innerHTML = '';
            }
        }
        if (!f.length) { 
            dom.rankList.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-light); font-weight:800;">這個模式暫時未有紀錄，做第一個挑戰者吧！🚀</div>'; 
            return; 
        }
        const MAX_RENDER = 100;
        const fDisplay = f.slice(0, MAX_RENDER);
        dom.rankList.innerHTML = _rankRewardBanner() + fDisplay.map((item, i) => {
            const isSelf = isCurrentUserRecord(item);
            const cls = escHtml(item.class); const name = escHtml(item.name);
            const accuracy = parseInt(item.accuracy) || 0; const score = parseInt(item.score) || 0;
            const gradeTxt = item.grade ? `小${item.grade}` : '';
            const seatTxt = item.id ? `${item.id}號` : '';
            return `<div class="rank-item ${i===0?'first':i===1?'second':i===2?'third':''} ${isSelf?'self':''}">
                <div class="rank-pos">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1+'.'}</div>
                <div class="rank-name">
                    <span class="rank-student-name">${name}</span>
                    <div class="rank-badges">
                        ${gradeTxt?`<span class="rank-tag rank-grade-tag">${gradeTxt}</span>`:''}
                        <span class="rank-tag rank-class-tag">${cls}班</span>
                        ${seatTxt?`<span class="rank-tag rank-seat-tag">${seatTxt}</span>`:''}
                        ${isSelf?'<span class="rank-tag" style="background:var(--primary-purple)">我</span>':''}
                        <span class="rank-tag" style="background:#CBD5E1;color:#333;">${accuracy}% 正確</span>
                    </div>
                </div>
                <div class="rank-score">${score}</div></div>`;
        }).join('') + (f.length > MAX_RENDER ? `<div style="text-align:center;padding:16px;color:var(--text-light);font-size:0.85rem;">顯示前 ${MAX_RENDER} 名（共 ${f.length} 人）</div>` : '');
    }

    function initTutorial() {
        const modal = document.getElementById('tutorialModal');
        if (!modal) return;
        const dots  = modal.querySelectorAll('.tut-dot');
        const slides = modal.querySelectorAll('.tut-slide');
        const prevBtn = document.getElementById('tutPrev');
        const nextBtn = document.getElementById('tutNext');
        const pageLabel = document.getElementById('tutPage');
        let current = 0;
        const total = slides.length;

        function goTo(n) {
            slides[current].classList.remove('active');
            dots[current].classList.remove('active');
            current = n;
            slides[current].classList.add('active');
            dots[current].classList.add('active');
            prevBtn.disabled = current === 0;
            const isLast = current === total - 1;
            nextBtn.textContent = isLast ? '✓ 完成' : '下一頁 ▶';
            nextBtn.className = 'tut-btn' + (isLast ? ' finish' : '');
            pageLabel.textContent = `${current + 1} / ${total}`;
        }

        document.getElementById('tutorialBtn').addEventListener('click', () => {
            goTo(0);
            modal.style.display = 'flex';
            audio.init();
        });
        document.getElementById('tutClose').addEventListener('click', () => { modal.style.display = 'none'; });
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.style.display !== 'none') modal.style.display = 'none'; });
        prevBtn.addEventListener('click', () => { if (current > 0) goTo(current - 1); });
        nextBtn.addEventListener('click', () => { if (current < total - 1) goTo(current + 1); else modal.style.display = 'none'; });
        dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
    }

    function initEvents() {
        function updateMusicControlsUI() {
            if (dom.soundToggle) {
                dom.soundToggle.classList.toggle('is-muted', !audio.enabled);
                dom.soundToggle.setAttribute('aria-expanded', dom.musicPanel && dom.musicPanel.classList.contains('open') ? 'true' : 'false');
            }
            if (dom.musicMuteToggle) {
                dom.musicMuteToggle.textContent = audio.enabled ? '🔊 已開啟' : '🔇 已靜音';
                dom.musicMuteToggle.style.opacity = audio.enabled ? '1' : '0.78';
            }
        }

        function setMusicPanelOpen(open) {
            if (!dom.musicPanel) return;
            dom.musicPanel.classList.toggle('open', open);
            dom.musicPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
            if (dom.soundToggle) dom.soundToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        setMusicPanelOpen(false);
        updateMusicControlsUI();

        // Pre-warm audio on first user interaction (unlocks AudioContext on iOS/Safari)
        const warmOnce = () => { audio.init(); audio.warmUp(); audio.bgPlay(); document.removeEventListener('pointerdown', warmOnce); };
        document.addEventListener('pointerdown', warmOnce);
        // Try immediate autoplay; if blocked, warmOnce fires on first tap
        setTimeout(() => { audio.init(); audio.bgPlay(); }, 0);

        // Volume sliders
        if (dom.bgVolume) dom.bgVolume.addEventListener('input', () => {
            const v = dom.bgVolume.value;
            if (dom.bgVolumeVal) dom.bgVolumeVal.textContent = v + '%';
            if (dom.bgMusic) dom.bgMusic.volume = v / 100;
            localStorage.setItem('bgVolume', v);
        });
        if (dom.sfxVolume) dom.sfxVolume.addEventListener('input', () => {
            if (dom.sfxVolumeVal) dom.sfxVolumeVal.textContent = dom.sfxVolume.value + '%';
            localStorage.setItem('sfxVolume', dom.sfxVolume.value);
        });

        let _resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(_resizeTimer);
            _resizeTimer = setTimeout(() => { if(state.gameActive || state.currentNote) { setupHDPI(); drawStaff(); } }, 100);
        });
        // Handle orientation change on mobile (debounced resize)
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                setTimeout(() => { if(state.gameActive || state.currentNote) { setupHDPI(); drawStaff(); } }, 200);
            });
        } else {
            window.addEventListener('orientationchange', () => {
                setTimeout(() => { if(state.gameActive || state.currentNote) { setupHDPI(); drawStaff(); } }, 300);
            });
        }
        // Auto-select textbook level when grade changes
        dom.userGrade.addEventListener('change', () => {
            audio.init(); audio.playClick();
            if (dom.textbookMode) { dom.textbookMode.value = dom.userGrade.value; handleTextbookModeChange(); saveSettings(); }
            populateNameDropdown();
        });
        dom.userClass.addEventListener('change', () => {
            audio.init(); audio.playClick();
            populateNameDropdown();
        });
        dom.userName.addEventListener('change', () => {
            audio.init(); audio.playClick();
            if (dom.userName.value === '__other__') {
                showCustomName();
                dom.userId.readOnly = false;
                dom.userId.value = '';
            } else {
                hideCustomName();
                dom.userId.readOnly = true;
                const sel = dom.userName.selectedOptions[0];
                dom.userId.value = (sel && sel.dataset.seat) ? sel.dataset.seat : '';
            }
        });
        dom.soundToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            audio.init();
            audio.warmUp();
            const willOpen = !dom.musicPanel?.classList.contains('open');
            setMusicPanelOpen(willOpen);
            updateMusicControlsUI();
        });
        if (dom.musicMuteToggle) {
            dom.musicMuteToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                audio.init();
                audio.warmUp();
                audio.enabled = !audio.enabled;
                audio.bgSetMute(!audio.enabled);
                localStorage.setItem('musicGameSoundEnabled', audio.enabled);
                updateMusicControlsUI();
            });
        }
        document.addEventListener('click', (e) => {
            if (!dom.musicPanel || !dom.soundToggle) return;
            if (!dom.musicPanel.classList.contains('open')) return;
            if (dom.musicPanel.contains(e.target) || dom.soundToggle.contains(e.target)) return;
            setMusicPanelOpen(false);
            updateMusicControlsUI();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                setMusicPanelOpen(false);
                updateMusicControlsUI();
            }
        });

        // Mode card selection + clef sub-selector
        const clefSelectorRow = document.getElementById('clefSelectorRow');
        const clefSelBtns = document.querySelectorAll('.clef-sel-btn');
        const keysigSubRow = document.getElementById('keysigSubRow');
        const keysigGradeRow = document.getElementById('keysigGradeRow');
        const solfegeSubRow = document.getElementById('solfegeSubRow');
        const solfegeGradeRow = document.getElementById('solfegeGradeRow');

        // Helper to hide all sub-rows
        function hideAllSubRows() {
            if (clefSelectorRow) clefSelectorRow.style.display = 'none';
            if (dom.practiceDiffRow) dom.practiceDiffRow.style.display = 'none';
            if (keysigSubRow) keysigSubRow.style.display = 'none';
            if (keysigGradeRow) keysigGradeRow.style.display = 'none';
            if (solfegeSubRow) solfegeSubRow.style.display = 'none';
            if (solfegeGradeRow) solfegeGradeRow.style.display = 'none';
        }

        dom.modeCards.forEach(card => card.addEventListener('click', () => {
            audio.init(); audio.playClick('select');
            dom.modeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const mode = card.dataset.mode;
            hideAllSubRows();

            if (mode === 'practice' || mode === 'noMiss') {
                state.currentMode = mode;
                state.modeConfig = MODE_CONFIG[mode];
                if (mode === 'practice' && dom.practiceDiffRow) dom.practiceDiffRow.style.display = '';
            } else if (mode === 'classic60') {
                const activeClef = document.querySelector('.clef-sel-btn.active');
                state.currentMode = activeClef ? activeClef.dataset.clef : 'classic60';
                state.modeConfig = MODE_CONFIG[state.currentMode];
                if (clefSelectorRow) clefSelectorRow.style.display = '';
            } else if (mode === 'keysig_practice') {
                // Default to practice; sub-row lets user toggle challenge
                const activeKsMode = document.querySelector('.ks-mode-btn.active');
                const isPractice = !activeKsMode || activeKsMode.dataset.ksmode === 'practice';
                state.currentMode = isPractice ? 'keysig_practice' : 'keysig60';
                state.modeConfig = MODE_CONFIG[state.currentMode];
                if (keysigSubRow) keysigSubRow.style.display = '';
            } else if (mode === 'solfege_practice') {
                const activeSolMode = document.querySelector('.sol-mode-btn.active');
                const isPractice = !activeSolMode || activeSolMode.dataset.solmode === 'practice';
                state.currentMode = isPractice ? 'solfege_practice' : 'solfege60';
                state.modeConfig = MODE_CONFIG[state.currentMode];
                if (solfegeSubRow) solfegeSubRow.style.display = '';
            }
            saveSettings();
        }));

        // Keysig sub-mode buttons (practice / challenge)
        document.querySelectorAll('.ks-mode-btn').forEach(btn => btn.addEventListener('click', () => {
            audio.init(); audio.playClick('select');
            document.querySelectorAll('.ks-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentMode = btn.dataset.ksmode === 'challenge' ? 'keysig60' : 'keysig_practice';
            state.modeConfig = MODE_CONFIG[state.currentMode];
            saveSettings();
        }));
        // Keysig grade buttons
        document.querySelectorAll('.ks-grade-btn').forEach(btn => btn.addEventListener('click', () => {
            audio.init(); audio.playClick('select');
            document.querySelectorAll('.ks-grade-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.keysigGrade = parseInt(btn.dataset.grade);
            saveSettings();
        }));

        // Solfege sub-mode buttons (practice / challenge)
        document.querySelectorAll('.sol-mode-btn').forEach(btn => btn.addEventListener('click', () => {
            audio.init(); audio.playClick('select');
            document.querySelectorAll('.sol-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentMode = btn.dataset.solmode === 'challenge' ? 'solfege60' : 'solfege_practice';
            state.modeConfig = MODE_CONFIG[state.currentMode];
            saveSettings();
        }));
        // Solfege grade buttons
        document.querySelectorAll('.sol-grade-btn').forEach(btn => btn.addEventListener('click', () => {
            audio.init(); audio.playClick('select');
            document.querySelectorAll('.sol-grade-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.solfegeGrade = parseInt(btn.dataset.grade);
            saveSettings();
        }));

        // Solfege answer buttons
        document.querySelectorAll('.solfege-btn').forEach(btn => btn.addEventListener('click', () => {
            if (!state.gameActive || state.answered) return;
            handleSolfegeAnswer(btn.dataset.sol);
        }));

        // Init keysig/solfege grade from student profile
        if (!state.keysigGrade) state.keysigGrade = parseInt(state.currentUser?.grade) || 1;
        if (!state.solfegeGrade) state.solfegeGrade = parseInt(state.currentUser?.grade) || 1;
        document.querySelectorAll('.ks-grade-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.grade) === state.keysigGrade));
        document.querySelectorAll('.sol-grade-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.grade) === state.solfegeGrade));

        clefSelBtns.forEach(btn => btn.addEventListener('click', () => {
            audio.init(); audio.playClick('select');
            clefSelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentMode = btn.dataset.clef;
            state.modeConfig = MODE_CONFIG[state.currentMode];
            saveSettings();
        }));
        // Init visibility
        { const isChallenge = state.currentMode === 'classic60' || state.currentMode === 'bass60' || state.currentMode === 'mixed60';
          const isKeysig = state.currentMode === 'keysig_practice' || state.currentMode === 'keysig60';
          const isSolfege = state.currentMode === 'solfege_practice' || state.currentMode === 'solfege60';
          if (clefSelectorRow) clefSelectorRow.style.display = isChallenge ? '' : 'none';
          if (keysigSubRow) keysigSubRow.style.display = isKeysig ? '' : 'none';
          if (keysigGradeRow) keysigGradeRow.style.display = 'none';
          if (solfegeSubRow) solfegeSubRow.style.display = isSolfege ? '' : 'none';
          if (solfegeGradeRow) solfegeGradeRow.style.display = 'none';
          if (isChallenge) { clefSelBtns.forEach(b => b.classList.toggle('active', b.dataset.clef === state.currentMode));
              const challengeCard = document.querySelector('.mode-card[data-mode="classic60"]');
              if (challengeCard) { dom.modeCards.forEach(c => c.classList.remove('active')); challengeCard.classList.add('active'); }
          }
          if (isKeysig) {
              const ksCard = document.querySelector('.mode-card[data-mode="keysig_practice"]');
              if (ksCard) { dom.modeCards.forEach(c => c.classList.remove('active')); ksCard.classList.add('active'); }
              document.querySelectorAll('.ks-mode-btn').forEach(b => b.classList.toggle('active', (state.currentMode === 'keysig60') === (b.dataset.ksmode === 'challenge')));
          }
          if (isSolfege) {
              const solCard = document.querySelector('.mode-card[data-mode="solfege_practice"]');
              if (solCard) { dom.modeCards.forEach(c => c.classList.remove('active')); solCard.classList.add('active'); }
              document.querySelectorAll('.sol-mode-btn').forEach(b => b.classList.toggle('active', (state.currentMode === 'solfege60') === (b.dataset.solmode === 'challenge')));
          }
        }

        // Practice difficulty selector
        const diffBtns = document.querySelectorAll('.diff-btn');
        diffBtns.forEach(btn => btn.addEventListener('click', () => {
            audio.init(); audio.playClick('select');
            diffBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.practiceDiff = btn.dataset.diff;
            buildNoteButtons();
            saveSettings();
        }));
        if (dom.practiceDiffRow) dom.practiceDiffRow.style.display = state.currentMode === 'practice' ? '' : 'none';
        diffBtns.forEach(b => b.classList.toggle('active', b.dataset.diff === state.practiceDiff));
        
        dom.startBtn.addEventListener('click', () => {
            const gt = state.modeConfig && state.modeConfig.gameType;
            if (gt === 'keysig') startKeysigGame();
            else if (gt === 'solfege') startSolfegeGame();
            else startGame();
        }); 
        dom.endBtn.addEventListener('click', endGame); 
        dom.backToSetupBtn.addEventListener('click', () => { audio.playClick();
            dom.leaderboardLayout.classList.remove('view-only', 'practice-end');
            switchScreen('screen-hub');
        });
        document.getElementById('rankBackBtn')?.addEventListener('click', () => { audio.init(); audio.playClick();
            dom.leaderboardLayout.classList.remove('view-only', 'practice-end');
            switchScreen('screen-hub');
        });
        dom.viewRanksBtn?.addEventListener('click', () => { audio.init(); audio.playClick();
            dom.leaderboardLayout.classList.add('view-only');
            dom.reportGrid.innerHTML = '';
            dom.reportWeakness.innerHTML = '';
            const gf = document.getElementById('rankGameFilter');
            if (gf) { gf.value = 'game1'; const mfRow = dom.rankModeFilter?.closest?.('.rank-filter'); if (mfRow) mfRow.style.display = ''; }
            loadRanks();
            switchScreen('screen-leaderboard');
        });
        
        dom.revealBtn.addEventListener('click', () => { if (!state.gameActive || state.answered) return; const gt = state.modeConfig && state.modeConfig.gameType; if (gt === 'keysig') { state.answered = true; state.combo = 0; updateScoreboard(); if (_keysigCurrentQ) { dom.messageBox.textContent = `🔑 答案是 ${_keysigCurrentQ.correct.name}！記住它！`; } dom.messageBox.className = 'message-box warning'; enableGameControls(false); setTimeout(() => { dom.messageBox.className = 'message-box'; nextKeysigQuestion(); }, 2000); return; } if (gt === 'solfege') { state.answered = true; state.combo = 0; updateScoreboard(); if (state.currentNote) { const solName = getSolfege(state.currentNote.note, state._solfegeKeySig); dom.messageBox.textContent = `🎵 答案是 ${solName}！記住它！`; } dom.messageBox.className = 'message-box warning'; enableGameControls(false); setTimeout(() => { dom.messageBox.className = 'message-box'; nextSolfegeQuestion(); }, 2000); return; } state.answered = true; state.combo = 0; state.showAnswerHighlight = true; drawStaff(); updateScoreboard(); audio.playNote(state.currentNote.freqKey); const _sol3 = noteSol(state.currentNote); dom.messageBox.textContent = `🔊 答案是 ${state.currentNote.correctName}${_sol3?' = '+_sol3:''}，聽聽看！記住位置，下題加油！`; dom.messageBox.className = 'message-box warning'; enableGameControls(false); setTimeout(() => { dom.messageBox.className = 'message-box'; nextQuestion(); }, 2500); });
        dom.skipBtn.addEventListener('click', () => { if (!state.gameActive || state.answered) return; state.answered = true; state.combo = 0; updateScoreboard(); dom.messageBox.textContent = '⏩ 跳過這題，下一題加油！'; dom.messageBox.className = 'message-box'; const gt = state.modeConfig && state.modeConfig.gameType; setTimeout(() => { if (gt === 'keysig') nextKeysigQuestion(); else if (gt === 'solfege') nextSolfegeQuestion(); else nextQuestion(); }, 400); });
        
        document.getElementById('rankGameFilter')?.addEventListener('change', () => {
            const gfVal = document.getElementById('rankGameFilter').value;
            const mfRow = dom.rankModeFilter?.closest?.('.rank-filter');
            if (mfRow) mfRow.style.display = gfVal === 'game1' ? '' : 'none';
            const dfWrap = document.getElementById('rankDiffFilterWrap');
            const dfSel = document.getElementById('rankDiffFilter');
            if (dfWrap && dfSel) {
                if (gfVal === 'game2') {
                    dfWrap.style.display = '';
                    dfSel.innerHTML = '<option value="節奏挑戰">節奏挑戰</option><option value="1分鐘挑戰">1分鐘挑戰</option><option value="時值辨別">時值辨別</option>';
                } else if (gfVal === 'game3') {
                    dfWrap.style.display = '';
                    dfSel.innerHTML = '<option value="0">全部難度</option><option value="Easy">Easy</option><option value="Normal">Normal</option><option value="Hard">Hard</option><option value="Expert">Expert</option>';
                } else {
                    dfWrap.style.display = 'none';
                    dfSel.innerHTML = '<option value="0">全部難度</option>';
                }
            }
            if (!state.allRanks.length) { loadRanks(); return; }
            renderRanks();
        });

        document.getElementById('rankDiffFilter')?.addEventListener('change', renderRanks);

        [dom.rankClassFilter, dom.rankGradeFilter, dom.rankModeFilter].forEach(f => f.addEventListener('change', renderRanks));
        const preventInput = () => state.inputFocused = true;
        const allowInput = () => state.inputFocused = false; 
        [dom.userId].forEach(el => { el.addEventListener('focus', preventInput); el.addEventListener('blur', allowInput); });
        
        document.addEventListener('keydown', (e) => { 
            if (state.inputFocused) return; 
            if (!state.gameActive) { 
                if (e.code === 'Enter' && dom.screenSetup.classList.contains('active')) { 
                    e.preventDefault(); 
                    dom.startBtn.click(); 
                } 
                return; 
            }
            const gt = state.modeConfig && state.modeConfig.gameType;
            if (gt === 'solfege') {
                // 1-7 for Do-Si
                const solMap = { '1':'Do','2':'Re','3':'Mi','4':'Fa','5':'Sol','6':'La','7':'Si' };
                const sol = solMap[e.key];
                if (sol) { e.preventDefault(); handleSolfegeAnswer(sol); }
                else if (e.code === 'Space') { e.preventDefault(); dom.skipBtn.click(); }
                return;
            }
            if (gt === 'keysig') {
                // No keyboard shortcuts for keysig MCQ (use mouse/touch)
                if (e.code === 'Space') { e.preventDefault(); dom.skipBtn.click(); }
                return;
            }
            const note = { '1':'C', '2':'D', '3':'E', '4':'F', '5':'G', '6':'A', '7':'B', 'Q':'C#','W':'D#','E':'F#','R':'G#','T':'A#', 'A':'D♭','S':'E♭','D':'G♭','F':'A♭','G':'B♭' }[e.key.toUpperCase()]; 
            if (note) { 
                e.preventDefault(); 
                const btn = noteBtnMap.get(note); if (btn && !btn.disabled) handleAnswer(note); 
            } else if (e.code === 'Space') { 
                e.preventDefault(); 
                dom.skipBtn.click(); 
            } else if (e.key.toUpperCase() === 'H') { 
                e.preventDefault(); 
                if (!dom.revealBtn.disabled) dom.revealBtn.click(); 
            } 
        });
    }

    // ==========================================
    // 👥 社交功能 (Social Features)
    // ==========================================
    function initSocialFeatures() {
        // Hub buttons
        document.getElementById('hubClassmatesBtn').addEventListener('click', () => {
            if (!state.currentUser || !state.currentUser.name) { alert('請先選擇你的身份！'); return; }
            document.getElementById('cmGrade').value = state.currentUser.grade || '6';
            document.getElementById('cmClass').value = state.currentUser.class || 'A';
            renderClassmateList();
            switchScreen('screen-classmates');
            // Batch-sync all profiles from GAS, then refresh the list
            const g = document.getElementById('cmGrade').value;
            const c = document.getElementById('cmClass').value;
            syncAllProfiles(g, c, () => renderClassmateList());
        });
        // Back buttons
        document.getElementById('classmatesBackBtn').addEventListener('click', () => switchScreen('screen-hub'));
        document.getElementById('viewProfileBackBtn').addEventListener('click', () => switchScreen('screen-classmates'));
        // Classmate filter changes
        document.getElementById('cmGrade').addEventListener('change', () => {
            renderClassmateList();
            const g = document.getElementById('cmGrade').value;
            const c = document.getElementById('cmClass').value;
            syncAllProfiles(g, c, () => renderClassmateList());
        });
        document.getElementById('cmClass').addEventListener('change', () => {
            renderClassmateList();
            const g = document.getElementById('cmGrade').value;
            const c = document.getElementById('cmClass').value;
            syncAllProfiles(g, c, () => renderClassmateList());
        });

        // Sync hub selections into classmate filters
        const cmGrade = document.getElementById('cmGrade');
        const cmClass = document.getElementById('cmClass');
        if (state.currentUser) {
            cmGrade.value = state.currentUser.grade || '6';
            cmClass.value = state.currentUser.class || 'A';
        }

    }

    let _viewingProfile = null;

    // ── Classmates Directory ──
    function renderClassmateList() {
        const grade = document.getElementById('cmGrade').value;
        const cls = document.getElementById('cmClass').value;
        const students = getStudentList(grade, cls);
        const list = document.getElementById('classmateList');
        const countEl = document.getElementById('cmCount');
        if (countEl) countEl.textContent = students.length ? `共 ${students.length} 位同學` : '';

        if (!students.length) {
            list.innerHTML = '<div class="cm-empty">這個班別暫時沒有同學資料 📭</div>';
            return;
        }

        const me = state.currentUser;
        list.innerHTML = students.map((name, i) => {
            const user = { name, grade, class: cls, seat: i + 1 };
            const p = loadProfile(user);
            const rs = _statsFromRanks(name, grade, cls);
            const played = rs ? rs.totalPlayed : p.stats.totalPlayed;
            const score  = rs ? rs.totalScore  : p.stats.totalScore;
            const combo  = rs ? rs.maxCombo    : p.stats.maxCombo;
            const avgAcc = rs ? rs.avgAccuracy : (p.stats.accuracyCount > 0 ? Math.round(p.stats.totalAccuracy / p.stats.accuracyCount) : 0);
            const avInfo = _avatarLookup(p.avatar);
            const isMe = me && me.name === name && me.grade == grade && me.class === cls;
            return `<div class="cm-card${isMe ? ' cm-me' : ''}" data-name="${escHtml(name)}" data-grade="${grade}" data-class="${cls}" data-seat="${i+1}">
                <div class="cm-avatar" style="background:${avInfo.bg}">${p.avatar}</div>
                <div class="cm-info">
                    <div class="cm-name">${escHtml(name)}${isMe ? ' <span class="cm-me-tag">我</span>' : ''}</div>
                    <div class="cm-detail">Lv.${p.level} · ${p.signature || '未設定簽名'}</div>
                    <div class="cm-stats"><span>🎮 ${played}次</span><span>🏆 ${score}分</span><span>🎯 ${avgAcc}%</span><span>🔥 ${combo}連擊</span></div>
                </div>
                <div class="cm-actions">
                    <button class="cm-view-btn" title="查看檔案">📋</button>
                </div>
            </div>`;
        }).join('');

        list.onclick = (e) => {
            const card = e.target.closest('.cm-card');
            if (!card) return;
            const name = card.dataset.name;
            const g = card.dataset.grade;
            const c = card.dataset.class;
            const s = card.dataset.seat;
            const user = { name, grade: g, class: c, seat: s };

            // Default: view profile
            openViewProfile(user);
        };
    }

    // ── View Other Profile ──
    function _renderViewProfile(user) {
        const p = loadProfile(user);
        const rs = _statsFromRanks(user.name, user.grade, user.class);
        const avInfo = _avatarLookup(p.avatar);

        const avEl = document.getElementById('vpAvatar');
        avEl.textContent = p.avatar;
        avEl.style.background = avInfo.bg;

        document.getElementById('vpName').textContent = (user.name || p.name) + ' 同學';
        document.getElementById('vpSig').textContent = p.signature || '尚未設定簽名';
        document.getElementById('vpMeta').textContent = `${user.grade ? '小' + user.grade : ''} ${user.class}班 · ${user.seat ? user.seat + '號' : ''}`;
        document.getElementById('vpLevel').textContent = 'Lv.' + p.level;
        const needed = _expForLevel(p.level);
        const expPct = Math.min(100, Math.round((p.exp / needed) * 100));
        document.getElementById('vpExpFill').style.width = expPct + '%';
        document.getElementById('vpExpText').textContent = `${p.exp} / ${needed} EXP`;

        const played = rs ? rs.totalPlayed : p.stats.totalPlayed;
        const cleared = p.stats.cleared || (rs ? rs.cleared : 0);
        const totalScore = rs ? rs.totalScore : p.stats.totalScore;
        const maxCombo = rs ? rs.maxCombo : p.stats.maxCombo;
        const avgAcc = rs ? rs.avgAccuracy : (p.stats.accuracyCount > 0 ? Math.round(p.stats.totalAccuracy / p.stats.accuracyCount) : 0);
        const fcCount = p.stats.fcCount || 0;
        const apCount = p.stats.apCount || 0;

        document.getElementById('vpTotalPlayed').textContent = played;
        document.getElementById('vpCleared').textContent = cleared;
        document.getElementById('vpTotalScore').textContent = totalScore;
        document.getElementById('vpAvgAccuracy').textContent = avgAcc + '%';
        document.getElementById('vpMaxCombo').textContent = maxCombo;
        document.getElementById('vpFCCount').textContent = fcCount;
        document.getElementById('vpAPCount').textContent = apCount;

        const gb = rs ? rs.gameBests : p.gameBests;
        document.getElementById('vpGame1').textContent = gb.game1 || '---';
        document.getElementById('vpGame2').textContent = gb.game2 || '---';
        document.getElementById('vpGame3').textContent = gb.game3 || '---';
        const vp4 = document.getElementById('vpGame4');
        if (vp4) vp4.textContent = gb.game4 || '---';
    }

    function openViewProfile(user) {
        _viewingProfile = user;
        _renderViewProfile(user);
        switchScreen('screen-view-profile');

        // Also sync from GAS for full profile (level, exp, etc.)
        syncProfileFromGAS(user).then(() => {
            if (_viewingProfile === user) _renderViewProfile(user);
        });
    }


    // Initialize on DOM ready
    window.addEventListener('DOMContentLoaded', () => {
        // Render Lucide icons
        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
        initDOM();
        initState();
        initAudio();
        buildNoteButtons(); 
        const storedSound = localStorage.getItem('musicGameSoundEnabled'); 
        if (storedSound !== null) { 
            audio.enabled = storedSound === 'true'; 
        }
        loadSavedSettings();
        // Populate student name dropdown for current grade/class
        populateNameDropdown();
        // Sync textbook mode to grade on first load if no saved settings override
        if (dom.textbookMode && dom.userGrade) { dom.textbookMode.value = dom.userGrade.value; handleTextbookModeChange(); }
        toggleCheckboxAppearance(); 
        enableGameControls(false);
        // Restore volume slider values
        const savedBg = localStorage.getItem('bgVolume');
        const savedSfx = localStorage.getItem('sfxVolume');
        if (savedBg && dom.bgVolume) { dom.bgVolume.value = savedBg; if (dom.bgVolumeVal) dom.bgVolumeVal.textContent = savedBg + '%'; }
        if (savedSfx && dom.sfxVolume) { dom.sfxVolume.value = savedSfx; if (dom.sfxVolumeVal) dom.sfxVolumeVal.textContent = savedSfx + '%'; }
        if (dom.bgMusic && dom.bgVolume) dom.bgMusic.volume = (parseInt(dom.bgVolume.value, 10) || 18) / 100;
        try { initEvents(); } catch(e) { console.error('initEvents error:', e); }
        try { initTutorial(); } catch(e) { console.error('initTutorial error:', e); }
        try { initHub(); } catch(e) { console.error('initHub error:', e); }
        try { initLightbox(); } catch(e) { console.error('initLightbox error:', e); }
    });

    // ==========================================
    // 📸 Image Lightbox
    // ==========================================
    function initLightbox() {
        const lb = document.getElementById('imgLightbox');
        const lbClose = document.getElementById('imgLightboxClose');
        const lbBackdrop = document.getElementById('imgLightboxBackdrop');
        if (!lb) return;
        const close = () => { lb.style.display = 'none'; };
        lbClose.addEventListener('click', close);
        lbBackdrop.addEventListener('click', close);
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.style.display !== 'none') close(); });
    }

    function openLightbox(src, title) {
        const lb = document.getElementById('imgLightbox');
        const img = document.getElementById('imgLightboxImg');
        const titleEl = document.getElementById('imgLightboxTitle');
        if (!lb || !img) return;
        img.src = src;
        if (titleEl && title) titleEl.textContent = title;
        lb.style.display = 'flex';
    }


    function initHub() {
        const hubGrade = document.getElementById('hubGrade');
        const hubClass = document.getElementById('hubClass');
        const hubName  = document.getElementById('hubName');
        const hubSeat  = document.getElementById('hubSeat');
        const hubNameField = document.getElementById('hubNameField');

        let _hubCustomInput = null;
        let _hubIsGuest = false;

        function populateHub() {
            const grade = hubGrade.value, cls = hubClass.value;
            const students = getStudentList(grade, cls);
            const prev = hubName.value;
            const frag = document.createDocumentFragment();
            const first = document.createElement('option');
            first.value = ''; first.textContent = '選擇你的名字';
            frag.appendChild(first);
            students.forEach((n, i) => {
                const o = document.createElement('option');
                o.value = n; o.textContent = n; o.dataset.seat = i + 1;
                frag.appendChild(o);
            });
            const otherOpt = document.createElement('option');
            otherOpt.value = '__other__'; otherOpt.textContent = '✏️ 其他（自行輸入）';
            frag.appendChild(otherOpt);
            const guestOpt = document.createElement('option');
            guestOpt.value = '__guest__'; guestOpt.textContent = '🧪 訪客 / 測試人員';
            frag.appendChild(guestOpt);
            hubName.innerHTML = ''; hubName.appendChild(frag);
            if (prev && (students.includes(prev) || prev === '__other__' || prev === '__guest__')) { hubName.value = prev; }
            else { hubName.value = ''; hubSeat.value = ''; }
            _handleHubNameMode();
        }

        function _ensureHubCustomInput() {
            if (!_hubCustomInput) {
                const inp = document.createElement('input');
                inp.type = 'text'; inp.id = 'hubCustomNameInput'; inp.placeholder = '輸入你的名字';
                inp.autocomplete = 'off';
                inp.style.cssText = 'background:rgba(255,255,255,0.9); border:2px solid var(--primary-blue); border-radius:10px; outline:none; color:var(--text-dark); font-weight:800; width:100%; font-size:1rem; font-family:inherit; margin-top:6px; padding:8px 12px;';
                hubNameField.appendChild(inp);
                inp.addEventListener('input', () => { hubName.dispatchEvent(new Event('change')); });
                _hubCustomInput = inp;
            }
        }

        function _handleHubNameMode() {
            const val = hubName.value;
            _hubIsGuest = (val === '__guest__');
            if (val === '__other__') {
                _ensureHubCustomInput();
                _hubCustomInput.style.display = '';
                _hubCustomInput.placeholder = '輸入你的名字';
                _hubCustomInput.focus();
            } else if (_hubIsGuest) {
                // Guest mode: no name input needed, hide custom input
                if (_hubCustomInput) _hubCustomInput.style.display = 'none';
            } else if (_hubCustomInput) {
                _hubCustomInput.style.display = 'none';
            }
            // Guest mode: disable grade/class/seat
            hubGrade.closest('.hub-field').style.opacity = _hubIsGuest ? '0.4' : '';
            hubGrade.closest('.hub-field').style.pointerEvents = _hubIsGuest ? 'none' : '';
            hubClass.closest('.hub-field').style.opacity = _hubIsGuest ? '0.4' : '';
            hubClass.closest('.hub-field').style.pointerEvents = _hubIsGuest ? 'none' : '';
            hubSeat.closest('.hub-field').style.opacity = _hubIsGuest ? '0.4' : '';
            hubSeat.closest('.hub-field').style.pointerEvents = _hubIsGuest ? 'none' : '';
            if (_hubIsGuest) hubSeat.value = '';
        }

        function _getHubDisplayName() {
            const val = hubName.value;
            if (val === '__other__' || val === '__guest__') {
                return _hubCustomInput ? _hubCustomInput.value.trim() : '';
            }
            return val;
        }

        function syncFromHub() {
            // Mirror hub values → game-1 (existing) fields
            const displayName = _getHubDisplayName();
            if (dom.userGrade) dom.userGrade.value = hubGrade.value;
            if (dom.userClass) dom.userClass.value = hubClass.value;
            populateNameDropdown();
            if (hubName.value === '__other__' || hubName.value === '__guest__') {
                if (dom.userName) { dom.userName.value = '__other__'; showCustomName(); }
                if (_customNameInput && displayName) _customNameInput.value = displayName;
                if (_hubIsGuest && _customNameInput && !displayName) _customNameInput.value = '訪客';
            } else {
                if (dom.userName && hubName.value) dom.userName.value = hubName.value;
                hideCustomName();
            }
            if (dom.userId) dom.userId.value = _hubIsGuest ? '' : hubSeat.value;
            updateCurrentUserFromHub();
        }

        function updateCurrentUserFromHub() {
            const user = getHubUser();
            if (!user || !user.name) return;
            state.currentUser = {
                name: user.name,
                grade: parseInt(user.grade, 10) || 0,
                class: user.class || '',
                id: user.seat || ''
            };
        }

        hubGrade.addEventListener('change', () => { populateHub(); updateCurrentUserFromHub(); });
        hubClass.addEventListener('change', () => { populateHub(); updateCurrentUserFromHub(); });
        // Defensive: repopulate if user opens the name dropdown and it's still empty
        hubName.addEventListener('mousedown', () => { if (hubName.options.length <= 1) populateHub(); });
        hubName.addEventListener('focus',     () => { if (hubName.options.length <= 1) populateHub(); });
        hubName.addEventListener('change', () => {
            const sel = hubName.selectedOptions[0];
            hubSeat.value = (sel && sel.dataset.seat) ? sel.dataset.seat : '';
            _handleHubNameMode();
            // Show/hide player badge
            const badge = document.getElementById('hubPlayerBadge');
            const badgeText = document.getElementById('hubPlayerBadgeText');
            const loginCard = document.querySelector('.hub-login-card');
            const displayName = _getHubDisplayName();
            if ((hubName.value && hubName.value !== '__other__') || displayName) {
                if (badge && badgeText) {
                    if (_hubIsGuest) {
                        badgeText.textContent = '🧪 測試人員';
                    } else {
                        badgeText.textContent = `${hubGrade.options[hubGrade.selectedIndex].text} ${hubClass.value}班 · ${displayName || hubName.value} 同學`;
                    }
                    badge.classList.add('show');
                    if (loginCard) loginCard.classList.add('player-selected');
                }
            } else if (badge) {
                badge.classList.remove('show');
                if (loginCard) loginCard.classList.remove('player-selected');
            }
            updateCurrentUserFromHub();
        });

        populateHub();

        // Grade/class default from saved Game-1 settings
        const saved = localStorage.getItem('musicGameSettingsV4');
        if (saved) {
            try {
                const s = JSON.parse(saved);
                if (s.userGrade) hubGrade.value = s.userGrade;
                if (s.userClass) hubClass.value = s.userClass;
                populateHub();
                if (s.savedName) { hubName.value = s.savedName; const sel = hubName.selectedOptions[0]; if (sel && sel.dataset.seat) hubSeat.value = sel.dataset.seat; }
                _handleHubNameMode();
                hubName.dispatchEvent(new Event('change'));
            } catch(e) {}
        }

        function getHubUser() {
            const displayName = _getHubDisplayName();
            if (_hubIsGuest) {
                return { name: displayName || '訪客', grade: 0, class: '', seat: '' };
            }
            return { name: displayName || hubName.value, grade: parseInt(hubGrade.value), class: hubClass.value, seat: hubSeat.value };
        }

        function requireHubLogin(nameFieldEl) {
            const val = hubName.value;
            if (!val) {
                if (nameFieldEl) { nameFieldEl.classList.add('error'); setTimeout(() => nameFieldEl.classList.remove('error'), 1200); }
                alert('❗ 請先選擇你的名字才可以進入遊戲！');
                return false;
            }
            if ((val === '__other__') && !_getHubDisplayName()) {
                if (nameFieldEl) { nameFieldEl.classList.add('error'); setTimeout(() => nameFieldEl.classList.remove('error'), 1200); }
                alert('❗ 請輸入你的名字！');
                return false;
            }
            return true;
        }

        // Game 1 entry — sync hub → setup then show setup
        document.getElementById('enterGame1').addEventListener('click', () => {
            if (!requireHubLogin(hubNameField)) return;
            syncFromHub();
            // Auto-sync grade textbook level
            if (dom.textbookMode) { dom.textbookMode.value = hubGrade.value; handleTextbookModeChange(); }
            switchScreen('screen-setup');
        });

        document.getElementById('enterGame2').addEventListener('click', () => {
            if (!requireHubLogin(hubNameField)) return;
            const user = getHubUser();
            state.currentUser = { name: user.name, grade: user.grade || 0, class: user.class || '', id: user.seat || '' };
            // Populate player badge on setup screen
            const badgeText = document.getElementById('g2PlayerBadgeText');
            if (badgeText) badgeText.textContent = `${user.grade ? ['','小一','小二','小三','小四','小五','小六'][user.grade] : ''}${user.class}班 · ${user.name} 同學`;

            let g2SelectedMode = 'practice';
            const g2ModeCards = document.querySelectorAll('#g2ModeCards .mode-card');
            g2ModeCards.forEach(c => {
                c.classList.toggle('active', c.dataset.mode === 'practice');
                c.onclick = () => {
                    g2ModeCards.forEach(x => x.classList.remove('active'));
                    c.classList.add('active');
                    g2SelectedMode = c.dataset.mode;
                };
            });

            document.getElementById('g2StartBtn').onclick = () => {
                if (g2SelectedMode === 'challenge') {
                    startRhythmChallenge(user);
                } else if (g2SelectedMode === '1min') {
                    _omLaunch(user);
                } else if (g2SelectedMode === 'duration') {
                    _durLaunch(user);
                } else {
                    enterRCGame(user);
                }
            };

            // Sub-buttons on 時值辨別 mode card
            const durHelpBtn = document.getElementById('durHelpBtn');
            const durRefBtn = document.getElementById('durRefBtn');
            if (durHelpBtn) durHelpBtn.onclick = (e) => {
                e.stopPropagation();
                const modal = document.getElementById('durHelpModal');
                if (modal) modal.style.display = 'flex';
            };
            if (durRefBtn) durRefBtn.onclick = (e) => {
                e.stopPropagation();
                const modal = document.getElementById('durRefModal');
                if (modal) modal.style.display = 'flex';
            };

            // durHelpModal close
            const durHelpClose = document.getElementById('durHelpClose');
            const durHelpModal = document.getElementById('durHelpModal');
            if (durHelpClose && durHelpModal) {
                durHelpClose.onclick = () => { durHelpModal.style.display = 'none'; };
                durHelpModal.onclick = (e) => { if (e.target === durHelpModal) durHelpModal.style.display = 'none'; };
            }

            // durRefModal close
            const durRefClose = document.getElementById('durRefClose');
            const durRefModal = document.getElementById('durRefModal');
            if (durRefClose && durRefModal) {
                durRefClose.onclick = () => { durRefModal.style.display = 'none'; };
                durRefModal.onclick = (e) => { if (e.target === durRefModal) durRefModal.style.display = 'none'; };
            }

            document.getElementById('g2BackToHubFromSetup').onclick = () => switchScreen('screen-hub');
            document.getElementById('g2SetupViewRanks').onclick = () => {
                dom.leaderboardLayout.classList.add('view-only');
                dom.reportGrid.innerHTML = ''; dom.reportWeakness.innerHTML = '';
                const gf = document.getElementById('rankGameFilter');
                if (gf) { gf.value = 'game2'; gf.dispatchEvent(new Event('change')); }
                loadRanks();
                switchScreen('screen-leaderboard');
            };
            switchScreen('screen-g2-setup');
        });

        document.getElementById('enterGame3').addEventListener('click', () => {
            if (!requireHubLogin(hubNameField)) return;
            const user = getHubUser();
            state.currentUser = { name: user.name, grade: user.grade || 0, class: user.class || '', id: user.seat || '' };
            const badgeText = document.getElementById('g3PlayerBadgeText');
            if (badgeText) badgeText.textContent = `${user.grade ? ['','小一','小二','小三','小四','小五','小六'][user.grade] : ''}${user.class}班 · ${user.name} 同學`;
            let g3SelectedMode = 'practice';
            // Default practice grade to the student's own grade (clamped to p1–p6)
            const defaultGrade = Math.min(6, Math.max(1, parseInt(user.grade) || 1));
            let g3SelectedDiff = 'p' + defaultGrade;
            const g3DiffSel = document.getElementById('g3DiffSelector');
            const g3GradeSel = document.getElementById('g3PracticeGradeSelector');

            function _updateSelectors() {
                const isPractice = g3SelectedMode === 'practice';
                if (g3GradeSel) g3GradeSel.style.display = isPractice ? '' : 'none';
                if (g3DiffSel)  g3DiffSel.style.display  = isPractice ? 'none' : '';
            }

            document.querySelectorAll('#g3ModeCards .mode-card').forEach(c => {
                c.classList.toggle('active', c.dataset.mode === 'practice');
                c.onclick = () => {
                    g3SelectedMode = c.dataset.mode;
                    document.querySelectorAll('#g3ModeCards .mode-card').forEach(x => x.classList.remove('active'));
                    c.classList.add('active');
                    // Reset diff selection when switching modes
                    if (g3SelectedMode === 'practice') {
                        g3SelectedDiff = 'p' + defaultGrade;
                        document.querySelectorAll('#g3PracticeGradeCards .diff-card').forEach(x => x.classList.toggle('active', x.dataset.diff === g3SelectedDiff));
                    } else {
                        g3SelectedDiff = 'easy';
                        document.querySelectorAll('#g3DiffCards .diff-card').forEach(x => x.classList.toggle('active', x.dataset.diff === 'easy'));
                    }
                    _updateSelectors();
                };
            });

            // Practice grade card selection (p1–p6)
            document.querySelectorAll('#g3PracticeGradeCards .diff-card').forEach(c => {
                c.classList.toggle('active', c.dataset.diff === g3SelectedDiff);
                c.onclick = () => {
                    g3SelectedDiff = c.dataset.diff;
                    document.querySelectorAll('#g3PracticeGradeCards .diff-card').forEach(x => x.classList.remove('active'));
                    c.classList.add('active');
                };
            });

            // Challenge difficulty card selection
            document.querySelectorAll('#g3DiffCards .diff-card').forEach(c => {
                c.classList.toggle('active', c.dataset.diff === 'easy');
                c.onclick = () => {
                    g3SelectedDiff = c.dataset.diff;
                    document.querySelectorAll('#g3DiffCards .diff-card').forEach(x => x.classList.remove('active'));
                    c.classList.add('active');
                };
            });
            _updateSelectors();

            document.getElementById('g3StartBtn').onclick = () => startGame3(user, g3SelectedMode, g3SelectedDiff);
            document.getElementById('g3StudyBtn').onclick = () => openStudyScreen();
            document.getElementById('g3BackToHubFromSetup').onclick = () => switchScreen('screen-hub');
            document.getElementById('g3SetupViewRanks').onclick = () => {
                const layout = document.getElementById('g3LeaderboardLayout');
                if (layout) layout.classList.add('view-only');
                const backBtn = document.getElementById('g3ResultBack');
                if (backBtn) { backBtn.style.display = ''; backBtn.onclick = () => { backBtn.style.display = 'none'; switchScreen('screen-g3-setup'); }; }
                renderLocalRankList('game3', 'g3RankList', user, g3SelectedDiff);
                switchScreen('screen-game3-result');
            };
            switchScreen('screen-g3-setup');
        });

        // ── Game 4 Hub Entry ──
        document.getElementById('enterGame4').addEventListener('click', () => {
            if (!requireHubLogin(hubNameField)) return;
            const user = getHubUser();
            state.currentUser = { name: user.name, grade: user.grade || 0, class: user.class || '', id: user.seat || '' };
            const badgeText = document.getElementById('g4PlayerBadgeText');
            if (badgeText) badgeText.textContent = `${user.grade ? ['','小一','小二','小三','小四','小五','小六'][user.grade] : ''}${user.class}班 · ${user.name} 同學`;

            let g4SelectedMode = 'practice';

            document.querySelectorAll('#g4ModeCards .mode-card').forEach(c => {
                c.classList.toggle('active', c.dataset.mode === 'practice');
                c.onclick = () => {
                    g4SelectedMode = c.dataset.mode;
                    document.querySelectorAll('#g4ModeCards .mode-card').forEach(x => x.classList.remove('active'));
                    c.classList.add('active');
                };
            });

            document.getElementById('g4StartBtn').onclick = () => startGame4(user, g4SelectedMode);

            // Study button
            document.getElementById('g4StudyBtn').onclick = () => {
                let studyFamily = 'all';
                let studySearch = '';
                renderG4Study(studyFamily, studySearch);

                // Family tabs
                document.querySelectorAll('#screen-g4-study .study-tab').forEach(tab => {
                    tab.classList.toggle('active', tab.dataset.cat === 'all');
                    tab.onclick = () => {
                        studyFamily = tab.dataset.cat;
                        document.querySelectorAll('#screen-g4-study .study-tab').forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        renderG4Study(studyFamily, studySearch);
                    };
                });

                // Search input
                const searchInput = document.getElementById('g4StudySearch');
                const searchClear = document.getElementById('g4StudySearchClear');
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.oninput = () => {
                        studySearch = searchInput.value;
                        if (searchClear) searchClear.style.display = studySearch ? '' : 'none';
                        renderG4Study(studyFamily, studySearch);
                    };
                }
                if (searchClear) {
                    searchClear.style.display = 'none';
                    searchClear.onclick = () => {
                        studySearch = '';
                        if (searchInput) searchInput.value = '';
                        searchClear.style.display = 'none';
                        renderG4Study(studyFamily, studySearch);
                    };
                }

                document.getElementById('g4StudyBack').onclick = () => switchScreen('screen-g4-setup');
                document.getElementById('g4StudyStartBtn').onclick = () => switchScreen('screen-g4-setup');
                switchScreen('screen-g4-study');
            };

            document.getElementById('g4BackToHubFromSetup').onclick = () => switchScreen('screen-hub');
            document.getElementById('g4SetupViewRanks').onclick = () => {
                const layout = document.getElementById('g4LeaderboardLayout');
                if (layout) layout.classList.add('view-only');
                const backBtn = document.getElementById('g4ResultBack');
                if (backBtn) { backBtn.style.display = ''; backBtn.onclick = () => { backBtn.style.display = 'none'; switchScreen('screen-g4-setup'); }; }
                renderLocalRankList('game4', 'g4RankList', user);
                switchScreen('screen-game4-result');
            };
            switchScreen('screen-g4-setup');
        });

        document.getElementById('hubViewRanksBtn').addEventListener('click', () => {
            dom.leaderboardLayout.classList.add('view-only');
            dom.reportGrid.innerHTML = ''; dom.reportWeakness.innerHTML = '';
            const gf = document.getElementById('rankGameFilter');
            if (gf) gf.value = 'game1';
            const mfRow = dom.rankModeFilter?.closest?.('.rank-filter');
            if (mfRow) mfRow.style.display = '';
            loadRanks();
            switchScreen('screen-leaderboard');
        });

        // ——— 個人檔案按鈕 ———
        document.getElementById('hubProfileBtn').addEventListener('click', () => {
            if (!requireHubLogin(hubNameField)) return;
            updateCurrentUserFromHub();
            if (!state.currentUser || !state.currentUser.name) return;
            renderProfileScreen(state.currentUser);
            switchScreen('screen-profile');
        });
        document.getElementById('profileBackBtn').addEventListener('click', () => switchScreen('screen-hub'));

        // ——— 社交功能 Social Features ———
        initSocialFeatures();

        document.getElementById('backToHubFromSetup').addEventListener('click', () => {
            switchScreen('screen-hub');
        });
    }

    // ==========================================
    // renderRanksForGame — Game 2/3 shared ranks (uses GAS data)
    // ==========================================
    function renderRanksForGame(gameKey) {
        if (!dom.rankList) return;
        const fC = dom.rankClassFilter ? dom.rankClassFilter.value : '0';
        const fG = dom.rankGradeFilter ? parseInt(dom.rankGradeFilter.value) : 0;
        const fD = document.getElementById('rankDiffFilter')?.value || '0';
        let data = state.allRanks.filter(r => r.game === gameKey || r.mode === gameKey);
        if (fC !== '0') data = data.filter(r => r.class === fC);
        if (fG !== 0) data = data.filter(r => parseInt(r.grade) === fG);
        if (fD !== '0') data = data.filter(r => (r.mode_name || '').includes(fD));
        data.sort((a,b) => (b.score||0) - (a.score||0));
        // Dedup: keep highest score per student (when filtering by difficulty, dedup per student+difficulty)
        const seen = new Set();
        const deduped = data.filter(r => {
            const diffKey = fD !== '0' ? `|${fD}` : '';
            const k = `${String(r.name||'').trim()}|${r.grade}|${r.class}|${String(r.id||r.seat||'').trim()}${diffKey}`;
            if (seen.has(k)) return false; seen.add(k); return true;
        });
        // Student rank hint
        const selfIndex = deduped.findIndex(isCurrentUserRecord);
        if (dom.studentRankHint) {
            if (state.currentUser?.name && selfIndex >= 0) {
                dom.studentRankHint.innerHTML = `🎯 ${escHtml(state.currentUser.name)} 同學目前排第 <strong>${selfIndex + 1}</strong> 名`;
                dom.studentRankHint.style.display = '';
            } else {
                dom.studentRankHint.style.display = 'none';
            }
        }
        if (!deduped.length) { dom.rankList.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-light);font-weight:800;">暫時未有紀錄，做第一個挑戰者！🚀</div>'; return; }
        const MAX_RENDER = 100;
        const displayList = deduped.slice(0, MAX_RENDER);
        dom.rankList.innerHTML = _rankRewardBanner() + displayList.map((item, i) => {
            const isSelf = isCurrentUserRecord(item);
            const cls = escHtml(item.class||''); const name = escHtml(item.name||'');
            const score = item.score || 0; const acc = item.accuracy || 0;
            const gradeTxt = item.grade ? `小${item.grade}` : '';
            const seatTxt = (item.id || item.seat) ? `${item.id || item.seat}號` : '';
            // Extract difficulty label from mode_name (e.g. '節奏挑戰·Hard' → 'Hard')
            const diffPart = (item.mode_name || '').split('·')[1] || '';
            const diffColors = { Easy:'#4CAF50', Normal:'#2196F3', Hard:'#FF9800', Expert:'#E91E63' };
            const diffTag = diffPart ? `<span class="rank-tag" style="background:${diffColors[diffPart]||'#888'};color:#fff;">${diffPart}</span>` : '';
            return `<div class="rank-item ${i===0?'first':i===1?'second':i===2?'third':''} ${isSelf?'self':''}">
                <div class="rank-pos">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1+'.'}</div>
                <div class="rank-name">
                    <span class="rank-student-name">${name}</span>
                    <div class="rank-badges">
                        ${gradeTxt?`<span class="rank-tag rank-grade-tag">${gradeTxt}</span>`:''}
                        <span class="rank-tag rank-class-tag">${cls}班</span>
                        ${seatTxt?`<span class="rank-tag rank-seat-tag">${seatTxt}</span>`:''}
                        ${isSelf?'<span class="rank-tag" style="background:var(--primary-purple);color:#fff;">我</span>':''}
                        ${diffTag}
                        <span class="rank-tag" style="background:#CBD5E1;color:#333;">${acc}% 正確</span>
                    </div>
                </div>
                <div class="rank-score">${score}</div></div>`;
        }).join('') + (deduped.length > MAX_RENDER ? `<div style="text-align:center;padding:16px;color:var(--text-light);font-size:0.85rem;">顯示前 ${MAX_RENDER} 名（共 ${deduped.length} 人）</div>` : '');
    }

    function saveLocalRank(gameKey, user, score, accuracy, maxCombo, difficulty) {
        try {
            const all = JSON.parse(localStorage.getItem('musicGameRanks_' + gameKey) || '[]');
            const idx = all.findIndex(r => r.name === user.name && r.class === user.class && r.grade === user.grade && (r.difficulty || '') === (difficulty || ''));
            if (idx >= 0) { if (score > (all[idx].score || 0)) { all[idx].score = score; all[idx].accuracy = accuracy; all[idx].max_combo = maxCombo; } }
            else all.push({ name: user.name, grade: user.grade, class: user.class, id: user.seat || user.id || '', score, accuracy, max_combo: maxCombo, difficulty: difficulty || '' });
            localStorage.setItem('musicGameRanks_' + gameKey, JSON.stringify(all));
        } catch(e) {}
    }

    // ==========================================
    // 🎴 節奏卡練習模式 (40 rhythm cards quiz)
    // ==========================================
    // Each entry: { num, label (correct answer), level, distractors }
    // label uses ta/ti/ti-ti/ti-ri-ti-ri/ta-a/ta-a-a-a notation
    const RC_CARDS = [
        // Level 1 (01-12) — 基礎組合與休止符位移
        { num:1,  label:'ta ta ta ta',           level:1 },
        { num:2,  label:'ta ta ti-ti ta',         level:1 },
        { num:3,  label:'ta ti-ti ta ta',         level:1 },
        { num:4,  label:'ta ti-ti ti-ti ta',      level:1 },
        { num:5,  label:'ti-ti ti-ti 休 ta',      level:1 },
        { num:6,  label:'ta ta 休 ta',            level:1 },
        { num:7,  label:'ta 休 ta ti-ti',         level:1 },
        { num:8,  label:'ta-a ta-a',              level:1 },
        { num:9,  label:'ta ta ta-a',             level:1 },
        { num:10, label:'ti-ti ti-ti ta-a',       level:1 },
        { num:11, label:'ti-ti ti-ti ta ti-ti',   level:1 },
        { num:12, label:'ti-ti ta ti-ti ta',      level:1 },
        // Level 2 (13-24) — 十六分音符與前附點
        { num:13, label:'ta ti-ri-ti-ri ta ta',            level:2 },
        { num:14, label:'ti-ri-ti-ri ta ti-ri-ti-ri ta',   level:2 },
        { num:15, label:'ti-ti ti-ri-ti-ri ti-ti ti-ti',   level:2 },
        { num:16, label:'ti-ri-ti-ri ti-ti ta 休',         level:2 },
        { num:17, label:'ta ti-ri ta ta',                  level:2 },
        { num:18, label:'ti-ri ti-ri ti-ti ti-ti',         level:2 },
        { num:19, label:'ta-i ti ta ta',                   level:2 },
        { num:20, label:'ta-i ti ta-i ti',                 level:2 },
        { num:21, label:'ta-a-a ta',                       level:2 },
        { num:22, label:'ta ti-ti-ri ta ta',               level:2 },
        { num:23, label:'ti-ti-ri ta ti-ti-ri ta',         level:2 },
        { num:24, label:'ti-ti-ri ti-ti ti-ti ti-ti',      level:2 },
        // Level 3 (25-32) — 進階附點與切分節奏
        { num:25, label:'ti-ri ti-ti ti-ti-ri ti-ti',      level:3 },
        { num:26, label:'ti-ri ti-ti-ri ti-ti ta',         level:3 },
        { num:27, label:'ti-ri ta ti-ri-ti-ri ta',         level:3 },
        { num:28, label:'ti-ri-ti-ri ta ti-ti-ri ta',      level:3 },
        { num:29, label:'ti-ri ti-ri-ti-ri ta ta',         level:3 },
        { num:30, label:'ti ta-i ta ta',                   level:3 },
        { num:31, label:'ti ta-i ta-a',                    level:3 },
        { num:32, label:'ti-ti ti-ti ti ta-i',             level:3 },
        // Level 4 (33-40) — 複合切分與易混淆節奏
        { num:33, label:'ti ta ti ta ta',                  level:4 },
        { num:34, label:'ti ta ti ti-ti ta',               level:4 },
        { num:35, label:'ti ta ti ta-a',                   level:4 },
        { num:36, label:'ti-ti ta ri-ti-ri ta',            level:4 },
        { num:37, label:'ri-ti-ri ta ri-ti-ri ti-ti',      level:4 },
        { num:38, label:'ti-ti ri-ti-ri ti-ti ti-ti',      level:4 },
        { num:39, label:'ti-ri-ti ta ti-ri-ti ta',         level:4 },
        { num:40, label:'ti-ti ti-ri-ti ti-ti ti-ti',      level:4 },
    ];

    // ── Rhythm parser: label → tap onset positions (in beats) ──────────────
    function parseRhythmTaps(label) {
        const taps = [];
        let pos = 0;
        for (const tok of label.split(' ')) {
            switch (tok) {
                case '休':          pos += 1;    break;
                case 'ta':          taps.push(pos); pos += 1;    break;
                case 'ta-a':        taps.push(pos); pos += 2;    break;
                case 'ta-a-a':      taps.push(pos); pos += 3;    break;
                case 'ta-i':        taps.push(pos); pos += 1.5;  break;
                case 'ti':          taps.push(pos); pos += 0.5;  break;
                case 'ti-ti':       taps.push(pos); taps.push(pos + 0.5); pos += 1; break;
                case 'ti-ri-ti-ri': taps.push(pos); taps.push(pos+0.25); taps.push(pos+0.5); taps.push(pos+0.75); pos += 1; break;
                case 'ti-ri':       taps.push(pos); taps.push(pos+0.75); pos += 1; break;
                case 'ti-ti-ri':    taps.push(pos); taps.push(pos+0.5); taps.push(pos+0.75); pos += 1; break;
                case 'ti-ri-ti':    taps.push(pos); taps.push(pos+0.25); taps.push(pos+0.5); pos += 1; break;
                case 'ri-ti-ri':    taps.push(pos); taps.push(pos+0.25); taps.push(pos+0.75); pos += 1; break;
                default:            taps.push(pos); pos += 1;    break;
            }
        }
        return { taps, totalBeats: pos };
    }

    function getRhythmTokenDuration(token) {
        switch (token) {
            case '休': return 1;
            case 'ta': return 1;
            case 'ta-a': return 2;
            case 'ta-a-a': return 3;
            case 'ta-i': return 1.5;
            case 'ti': return 0.5;
            case 'ti-ti': return 1;
            case 'ti-ri-ti-ri': return 1;
            case 'ti-ri': return 1;
            case 'ti-ti-ri': return 1;
            case 'ti-ri-ti': return 1;
            case 'ri-ti-ri': return 1;
            default: return 1;
        }
    }

    function formatBeatValue(beats) {
        if (beats === 0.25) return '1/4 拍';
        if (beats === 0.5) return '半拍';
        if (beats === 1.5) return '1.5 拍';
        if (Number.isInteger(beats)) return `${beats} 拍`;
        return `${beats} 拍`;
    }

    function parseRhythmSegments(label) {
        const segments = [];
        let pos = 0;
        label.split(' ').forEach((token, index) => {
            const duration = getRhythmTokenDuration(token);
            segments.push({
                token,
                start: pos,
                duration,
                isRest: token === '休',
                index,
            });
            pos += duration;
        });
        return { segments, totalBeats: pos };
    }

    // Compound-token expansion map: token → [{label, offset, dur}, ...]
    const COMPOUND_TOKENS = {
        'ti-ti':       [{l:'ti',o:0,d:0.5},{l:'ti',o:0.5,d:0.5}],
        'ti-ri-ti-ri': [{l:'ti',o:0,d:0.25},{l:'ri',o:0.25,d:0.25},{l:'ti',o:0.5,d:0.25},{l:'ri',o:0.75,d:0.25}],
        'ti-ri':       [{l:'ti',o:0,d:0.75},{l:'ri',o:0.75,d:0.25}],
        'ti-ti-ri':    [{l:'ti',o:0,d:0.5},{l:'ti',o:0.5,d:0.25},{l:'ri',o:0.75,d:0.25}],
        'ti-ri-ti':    [{l:'ti',o:0,d:0.25},{l:'ri',o:0.25,d:0.25},{l:'ti',o:0.5,d:0.5}],
        'ri-ti-ri':    [{l:'ri',o:0,d:0.25},{l:'ti',o:0.25,d:0.5},{l:'ri',o:0.75,d:0.25}],
    };

    function parseRhythmUnits(label) {
        const { segments, totalBeats } = parseRhythmSegments(label);
        const units = [];

        segments.forEach((segment, segmentIndex) => {
            if (segment.isRest) return;
            const compound = COMPOUND_TOKENS[segment.token];
            if (compound) {
                compound.forEach(sub => {
                    units.push({
                        beatPos: segment.start + sub.o,
                        durationBeats: sub.d,
                        label: sub.l,
                        segmentIndex,
                    });
                });
                return;
            }
            units.push({
                beatPos: segment.start,
                durationBeats: segment.duration,
                label: segment.token,
                segmentIndex,
            });
        });

        return { units, segments, totalBeats };
    }

    // Friendly display names for tokens (used in value chips & game tokens)
    const TOKEN_DISPLAY = {
        'ta':'四分', 'ta-a':'二分', 'ta-a-a':'附點二分', 'ta-i':'附點四分',
        'ti':'八分', 'ti-ti':'兩個八分', 'ti-ri-ti-ri':'四個十六分',
        'ti-ri':'前附點', 'ti-ti-ri':'前八後十六', 'ti-ri-ti':'前十六後八',
        'ri-ti-ri':'小切分', '休':'休止符',
    };

    // Music note symbols for rhythm challenge display
    const TOKEN_NOTE_SYM = {
        'ta':          '𝅘𝅥',          // quarter note
        'ta-a':        '𝅗𝅥',          // half note
        'ta-a-a':      '𝅗𝅥.',         // dotted half
        'ta-i':        '𝅘𝅥.',         // dotted quarter
        'ti':          '♪',           // eighth note
        'ti-ti':       '♫',          // two eighths (beamed)
        'ti-ri-ti-ri': '𝅘𝅥𝅮𝅘𝅥𝅮𝅘𝅥𝅮𝅘𝅥𝅮',      // four sixteenths
        'ti-ri':       '♪.',          // dotted eighth + sixteenth
        'ti-ti-ri':    '♪𝅘𝅥𝅮𝅘𝅥𝅮',       // eighth + two sixteenths
        'ti-ri-ti':    '𝅘𝅥𝅮𝅘𝅥𝅮♪',       // two sixteenths + eighth
        'ri-ti-ri':    '𝅘𝅥𝅮♪𝅘𝅥𝅮',       // sixteenth + eighth + sixteenth
        '休':          '𝄾',           // quarter rest
    };

    function _rcRenderValueChips(card) {
        const row = document.getElementById('rcValueChipRow');
        if (!row) return;

        const { segments } = parseRhythmSegments(card.label);
        row.innerHTML = segments.map(segment => `
            <div class="rc-value-chip">
                <div class="rc-value-token">${escHtml(TOKEN_DISPLAY[segment.token] || segment.token)}</div>
                <div class="rc-value-note">${segment.isRest ? '休止 1 拍' : formatBeatValue(segment.duration)}</div>
            </div>`).join('');
    }

    function _rcRenderGameTokens(card) {
        const lbl = card.bars ? card.bars[0] : card.label;
        const { segments } = parseRhythmSegments(lbl);
        _rcRenderGameTokensFromSegs(segments);
    }

    function _rcRenderGameTokensFromSegs(segs) {
        const row = document.getElementById('rcGameTokenRow');
        if (!row) return;
        row.innerHTML = segs.map((segment, index) => `
            <div class="rc-game-token" data-segment-index="${index}">
                <div class="rc-game-token-text">${escHtml(TOKEN_DISPLAY[segment.token] || segment.token)}</div>
                <div class="rc-game-token-value">${segment.isRest ? '休止 1 拍' : formatBeatValue(segment.duration)}</div>
            </div>`).join('');
    }

    // ==========================================
    // 🎴 RC Canvas Game — 節奏打擊
    // ==========================================
    const WIN_PERFECT = 50;
    const WIN_GREAT   = 115;
    const WIN_GOOD    = 240;
    const REPS        = 4;

    /**
     * Input-latency compensation (ms).
     * Touch devices have ~30-50ms of inherent latency between the physical
     * tap and when the JS handler fires.  We subtract this from the raw
     * elapsed time so that "on-beat" feels correct to the player.
     * Positive = player's taps are treated as if they happened earlier.
     */
    const INPUT_LATENCY_MS = 30;

    /**
     * Human-variance helpers.
     * • Early taps get a wider window (humans naturally anticipate).
     * • Late taps use the base window.
     * • Judgment uses signed error so the bonus only applies to early hits.
     */
    const EARLY_LENIENCY = 1.25;   // early window is 25% wider

    function _compensatedError(rawElapsed, targetMs) {
        const compensated = rawElapsed - INPUT_LATENCY_MS;
        const signed = compensated - targetMs;          // negative = early
        const earlyMul = signed < 0 ? EARLY_LENIENCY : 1.0;
        return { abs: Math.abs(signed) / earlyMul, signed };
    }

    let rcGameState = {};

    // Best grade persistence per card
    function _rcGetBestGrades() {
        try { return JSON.parse(localStorage.getItem('rcBestGrades') || '{}'); } catch(e) { return {}; }
    }
    function _rcSaveBestGrade(cardNum, qualAcc, score) {
        const data = _rcGetBestGrades();
        const key = String(cardNum);
        const prev = data[key];
        if (!prev || score > prev.score) {
            data[key] = { qualAcc, score };
            localStorage.setItem('rcBestGrades', JSON.stringify(data));
        }
    }
    function _rcGetGradeBadge(cardNum) {
        const data = _rcGetBestGrades();
        const best = data[String(cardNum)];
        if (!best) return '';
        const qa = best.qualAcc;
        if (qa >= 90) return '<span class="rc-best-badge rc-best-s">★★★</span>';
        if (qa >= 75) return '<span class="rc-best-badge rc-best-a">★★</span>';
        if (qa >= 60) return '<span class="rc-best-badge rc-best-b">★</span>';
        return '<span class="rc-best-badge rc-best-c">·</span>';
    }

    // ── RC Challenge Mode — randomly generated rhythms ──
    // Lv1 basic: quarter + eighth note patterns
    // Lv2 medium: adds 16th note group (ti-ri-ti-ri) and dotted patterns
    // Lv3 advanced: adds mixed 16th combinations (ti-ti-ri, ti-ri-ti, ri-ti-ri)
    const CHALLENGE_TOKEN_SETS = {
        basic:    [{n:'ta',d:1},{n:'ta',d:1},{n:'ti-ti',d:1},{n:'ta-a',d:2},{n:'休',d:1}],
        medium:   [{n:'ta',d:1},{n:'ta',d:1},{n:'ti-ti',d:1},{n:'ta-a',d:2},{n:'休',d:1},
                   {n:'ti-ri-ti-ri',d:1},{n:'ta-i',d:1.5},{n:'ti',d:0.5}],
        advanced: [{n:'ta',d:1},{n:'ta',d:1},{n:'ti-ti',d:1},{n:'ta-a',d:2},{n:'休',d:1},
                   {n:'ti-ri-ti-ri',d:1},{n:'ta-i',d:1.5},{n:'ti',d:0.5},
                   {n:'ti-ti-ri',d:1},{n:'ti-ri-ti',d:1},{n:'ri-ti-ri',d:1},{n:'ta-a-a',d:3}],
    };

    // Tokens that must start at an integer beat position.
    // Beaming tokens: beam would cross a beat boundary if off-beat.
    // Long notes (ta-a, ta-a-a): a half/dotted-half starting on the "and" of a beat
    //   is non-standard notation in a children's rhythm exercise.
    const _BEAM_TOKENS = new Set(['ti-ti','ti-ri-ti-ri','ti-ri','ti-ti-ri','ti-ri-ti','ri-ti-ri',
                                   'ta-a','ta-a-a']);

    function _generateChallengeRhythm(diff) {
        const tokens = CHALLENGE_TOKEN_SETS[diff] || CHALLENGE_TOKEN_SETS.basic;
        const target = 4;
        let remaining = target;
        const parts = [];
        let safety = 0;
        while (remaining > 0.001 && safety++ < 200) {
            const pos = Math.round((target - remaining) * 1000) / 1000;
            const onBeat = Math.abs(pos - Math.round(pos)) < 0.01; // at integer beat?
            let eligible = tokens.filter(t => t.d <= remaining + 0.001);
            // At non-integer beat positions, only allow non-beaming tokens
            // to ensure beams never cross beat boundaries
            if (!onBeat) eligible = eligible.filter(t => !_BEAM_TOKENS.has(t.n));
            if (!eligible.length) break;
            const tok = eligible[Math.floor(Math.random() * eligible.length)];
            parts.push(tok.n);
            remaining = Math.round((remaining - tok.d) * 1000) / 1000;
        }
        return parts.join(' ');
    }

    const RC_CHALLENGE_COUNT = 5;

    function enterRCGame(user) {
        audio.init();
        audio.warmUp();
        audio.bgStop();
        _rcStopPreview();
        _rcRemoveGameKeyHandler();

        rcGameState = {
            _user: user,
            _card: rcGameState._card || null,
            _bpm: rcGameState._bpm || 60,
            _previewTimers: [],
            _judgeTimer: null,
        };

        const grade = user.grade || 6;
        const badge = document.getElementById('rcPlayerBadgeText');
        if (badge) badge.textContent = `${user.name} 同學 (小${grade})`;

        document.getElementById('rcLevelsBack').onclick = () => { audio.bgPlay(); switchScreen('screen-g2-setup'); };
        _rcRenderLevels();
        switchScreen('screen-rc-levels');
    }

    // ============================================================
    // 🏫 節奏挑戰 — 按年級自動難度 (Grade Rhythm Challenge)
    // ============================================================

    /**
     * Difficulty Map — per-grade config
     * measures: number of measures per round
     * bpm: metronome speed
     * tokenSet: which pool of rhythm tokens to draw from
     * winScale: multiplier on timing window (>1 = more lenient)
     */
    const GRADE_CHALLENGE_CONFIG = {
        1: { tokenSet: 'basic',    bpm: 60,  measures: 4, winScale: 1.4 },
        2: { tokenSet: 'basic',    bpm: 66,  measures: 4, winScale: 1.3 },
        3: { tokenSet: 'medium',   bpm: 72,  measures: 4, winScale: 1.2 },
        4: { tokenSet: 'medium',   bpm: 80,  measures: 4, winScale: 1.1 },
        5: { tokenSet: 'advanced', bpm: 88,  measures: 4, winScale: 1.0 },
        6: { tokenSet: 'advanced', bpm: 96,  measures: 4, winScale: 1.0 },
    };

    /* --- Measure generation --- */
    function _rchgGenerateMeasures(grade) {
        const cfg = GRADE_CHALLENGE_CONFIG[grade] || GRADE_CHALLENGE_CONFIG[6];
        const measures = [];
        for (let i = 0; i < cfg.measures; i++) {
            measures.push(_generateChallengeRhythm(cfg.tokenSet));
        }
        return { measures, bpm: cfg.bpm, winScale: cfg.winScale };
    }

    // ============================================================
    //  節奏挑戰 — DOM-based Rhythm Game
    // ============================================================

    const RCHAL_LEVELS = [
        { id: 1, name: '初級',  icon: '⭐',       bpm: 72,  tokenSet: 'basic',    bars: 16, winScale: 1.4, hpLoss: 10 },
        { id: 2, name: '中級',  icon: '⭐⭐',     bpm: 72,  tokenSet: 'medium',   bars: 16, winScale: 1.3, hpLoss: 12 },
        { id: 3, name: '高級',  icon: '⭐⭐⭐',   bpm: 72,  tokenSet: 'advanced', bars: 16, winScale: 1.2, hpLoss: 14 },
    ];

    const rchalState = {
        user: null,
        level: null,
        phase: 'idle',       // idle | select | preview | countdown | playing | done
        measures: [],
        taps: [],            // expected taps
        score: 0, combo: 0, maxCombo: 0, hp: 100,
        counts: { perfect: 0, great: 0, good: 0, miss: 0, wrong: 0 },
        startTime: 0,
        timers: [],
        stars: {},           // levelId → 0-3
        rowRanges: [],       // per-row y/h for highlighting
        restZones: [],       // [{idx, startMs, endMs}] for rest tap detection
        restNoteMap: {},     // restIdx → {el, bar, row}
    };

    function _rchalGetStars(lvl) { return rchalState.stars[lvl] || 0; }
    function _rchalSetStars(lvl, s) { rchalState.stars[lvl] = Math.max(rchalState.stars[lvl] || 0, s); }
    function _rchalIsUnlocked(lvl) { return true; }

    /* ── Launch from g2-setup ── */
    function startRhythmChallenge(user) {
        rchalState.user = user;
        audio.init(); audio.warmUp(); audio.bgStop();
        switchScreen('screen-rc-grade');
        _rchalShowSelect();
    }

    function _rchalExit() {
        _rchalCleanup();
        audio.bgPlay();
        switchScreen('screen-g2-setup');
    }

    function _rchalCleanup() {
        rchalState.timers.forEach(t => clearTimeout(t));
        rchalState.timers = [];
        rchalState.phase = 'idle';
        rchalState.noteMap = [];
        rchalState.missRafId && cancelAnimationFrame(rchalState.missRafId);
        rchalState.missRafId = 0;
        document.removeEventListener('keydown', _rchalKeyHandler);
        audio.stopAllTicks();
    }

    /* ── Level Select View (like g3 music terms setup) ── */
    function _rchalShowSelect() {
        _rchalCleanup();
        rchalState.phase = 'select';
        rchalState._selectedLevel = rchalState._selectedLevel || RCHAL_LEVELS[0];
        const container = document.getElementById('screen-rc-grade');
        const grade = rchalState.user ? rchalState.user.grade || 1 : 1;
        const gradeName = ['', '小一', '小二', '小三', '小四', '小五', '小六'][grade] || '';
        const userName = rchalState.user ? rchalState.user.name : '';

        container.innerHTML = `
            <div class="rchal-setup-wrap">
                <button class="rchal-setup-back" id="rchalExitBtn">← 返回大廳</button>
                <div class="rchal-setup-title-area">
                    <h1 class="rchal-setup-title">🥁 節奏挑戰</h1>
                    <div class="rchal-setup-subtitle">聽準節拍 · 精確拍打 · 衝排行榜</div>
                </div>
                <div class="rchal-setup-player">
                    <span class="rchal-setup-badge">👋 ${userName} 同學 (${gradeName})</span>
                </div>
                <div class="rchal-diff-section">
                    <div class="rchal-diff-title">🎯 選擇難度</div>
                    <div class="rchal-diff-cards" id="rchalDiffCards"></div>
                </div>
                <button class="rchal-setup-start" id="rchalSetupStart">🚀 準備好了，開始！</button>
                <button class="rchal-setup-ranks" id="rchalSetupRanks">🏆 查看排行榜</button>
            </div>
        `;
        document.getElementById('rchalExitBtn').onclick = _rchalExit;

        const diffGrid = document.getElementById('rchalDiffCards');
        const diffMeta = [
            { cls: 'rchal-diff-easy',   desc: '四分+八分音符<br>基本拍型' },
            { cls: 'rchal-diff-medium', desc: '+十六分音符組<br>附點節奏' },
            { cls: 'rchal-diff-hard',   desc: '+混合十六分<br>切分節奏' },
        ];
        RCHAL_LEVELS.forEach((lvl, i) => {
            const stars = _rchalGetStars(lvl.id);
            const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
            const isActive = rchalState._selectedLevel && rchalState._selectedLevel.id === lvl.id;
            const btn = document.createElement('button');
            btn.className = `rchal-diff-card ${diffMeta[i].cls}${isActive ? ' active' : ''}`;
            btn.innerHTML = `
                <div class="rchal-diff-stars-row">${lvl.icon}</div>
                <div class="rchal-diff-name">Lv.${lvl.id} ${lvl.name}</div>
                <div class="rchal-diff-desc">${lvl.bpm} BPM · ${lvl.bars}小節<br>${diffMeta[i].desc}</div>
                <div class="rchal-diff-record">${starStr}</div>
            `;
            btn.onclick = () => {
                rchalState._selectedLevel = lvl;
                diffGrid.querySelectorAll('.rchal-diff-card').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
            };
            diffGrid.appendChild(btn);
        });

        document.getElementById('rchalSetupStart').onclick = () => {
            if (rchalState._selectedLevel) _rchalStartLevel(rchalState._selectedLevel);
        };
        document.getElementById('rchalSetupRanks').onclick = () => {
            dom.leaderboardLayout.classList.add('view-only');
            dom.reportGrid.innerHTML = ''; dom.reportWeakness.innerHTML = '';
            const gf = document.getElementById('rankGameFilter');
            if (gf) { gf.value = 'game2'; gf.dispatchEvent(new Event('change')); }
            loadRanks();
            switchScreen('screen-leaderboard');
        };
    }

    /* ── Start a Level (preview phase — auto-show 16 bars) ── */
    function _rchalStartLevel(lvl) {
        _rchalCleanup();
        rchalState.user = state.currentUser;
        rchalState.level = lvl;
        rchalState.phase = 'preview';
        rchalState.score = 0; rchalState.combo = 0; rchalState.maxCombo = 0; rchalState.hp = 100;
        rchalState.counts = { perfect: 0, great: 0, good: 0, miss: 0, wrong: 0 };
        rchalState.restZones = []; rchalState.restNoteMap = {};
        _rchalLastTapMs = 0;

        // Generate measures
        const measures = [];
        for (let i = 0; i < lvl.bars; i++) {
            measures.push(_generateChallengeRhythm(lvl.tokenSet));
        }
        rchalState.measures = measures;

        const container = document.getElementById('screen-rc-grade');
        container.innerHTML = `
            <div class="rchal-header">
                <button class="rchal-exit" id="rchalExitBtn">✕</button>
                <div class="rchal-header-center">
                    <div class="rchal-title">Lv.${lvl.id} ${lvl.name}</div>
                    <div class="rchal-meta">${lvl.bpm} BPM · ${lvl.bars}小節</div>
                </div>
                <div class="rchal-score" id="rchalScore">0</div>
            </div>
            <div class="rchal-hp-wrap"><div class="rchal-hp-fill" id="rchalHpFill"></div></div>
            <div class="rchal-track" id="rchalTrack">
                <div class="rchal-notes" id="rchalNotes"></div>
            </div>
            <div class="rchal-feedback">
                <div class="rchal-combo" id="rchalCombo"></div>
                <div class="rchal-judgment" id="rchalJudgment"></div>
            </div>
            <div class="rchal-beats" id="rchalBeats">
                <div class="rchal-beat-dot beat-accent">1</div>
                <div class="rchal-beat-dot">2</div>
                <div class="rchal-beat-dot">3</div>
                <div class="rchal-beat-dot">4</div>
            </div>
            <div class="rchal-tap" id="rchalTap" style="opacity:0;pointer-events:none;">
                <span class="rchal-tap-emoji">🥁</span>
                <span class="rchal-tap-label">拍打這裡</span>
            </div>
            <div class="rchal-status" id="rchalStatus">👀 先看清楚節奏，準備好就按下面按鈕</div>
            <button class="rchal-ready-btn" id="rchalStartBtn">✋ Ready!</button>
            <div class="rchal-overlay" id="rchalOverlay" style="display:none;"></div>
        `;

        document.getElementById('rchalExitBtn').onclick = () => _rchalShowSelect();

        // Build taps for ALL bars (doesn't depend on DOM layout)
        _rchalBuildTaps(measures, lvl);

        // Auto-render 16 bars — use double rAF to ensure layout is computed
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                rchalState.noteMap = [];
                _rchalRenderNotes(measures, lvl.bars);
            });
        });

        // Ready button → 4 ready beats
        document.getElementById('rchalStartBtn').onclick = () => _rchalCountdown();

        // HP bar initial
        _rchalDrawHP();
    }

    /* ── Render notes via VexFlow — adaptive rows ── */
    function _rchalRenderNotes(measures, numBars) {
        const notesEl = document.getElementById('rchalNotes');
        if (!notesEl) return;
        notesEl.innerHTML = '';
        const trackEl = document.getElementById('rchalTrack');
        let W = trackEl.clientWidth;
        if (!W || W < 100) W = trackEl.getBoundingClientRect().width || window.innerWidth - 16;

        // Determine bars-per-row based on complexity
        const lvl = rchalState.level;
        const BARS_PER_ROW = (lvl && lvl.tokenSet === 'basic') ? 4 : 2;
        const numRows = Math.ceil(numBars / BARS_PER_ROW);
        const MIN_ROW_H = (lvl && lvl.tokenSet === 'basic') ? 150 : 180;
        const totalH = Math.max(numRows * MIN_ROW_H, 320);
        const ROW_H = totalH / numRows;

        if (typeof VexFlow === 'undefined') return;
        const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Annotation, Stem, Dot } = VexFlow;

        const renderer = new Renderer(notesEl, Renderer.Backends.SVG);
        renderer.resize(W, totalH);
        const context = renderer.getContext();

        const durMap = { 0.25: '16', 0.5: '8', 0.75: '8', 1: 'q', 1.5: 'q', 2: 'h', 3: 'h' };
        const dotSet = new Set([0.75, 1.5, 3]);
        const PAD = 4;
        const barW = (W - PAD * 2) / BARS_PER_ROW;

        const allNoteMap = [];
        const allRestMap = {};
        let tapIdx = 0;
        let restIdx = 0;

        // Store row boundaries for highlighting during play
        rchalState.rowRanges = [];

        measures.forEach((barLabel, bi) => {
            const row = Math.floor(bi / BARS_PER_ROW);
            const col = bi % BARS_PER_ROW;
            const x = PAD + col * barW;
            const y = row * ROW_H;

            // Track which row each bar belongs to
            if (!rchalState.rowRanges[row]) rchalState.rowRanges[row] = { startBar: bi, endBar: bi, y: y, h: ROW_H };
            rchalState.rowRanges[row].endBar = bi;

            const stave = new Stave(x, y + 40, barW);
            [0, 1, 3, 4].forEach(line => stave.setConfigForLine(line, { visible: false }));
            if (col === 0 && row === 0) stave.addTimeSignature('4/4');
            stave.setContext(context).draw();

            const vfNotes = [];
            const beamGroups = [];
            const noteGameMap = [];
            const barTapStart = tapIdx;
            let eighthRun = [];
            const flushEighthRun = () => { if (eighthRun.length > 1) beamGroups.push([...eighthRun]); eighthRun = []; };

            barLabel.split(' ').forEach(token => {
                const isRest = token === '休';
                const compound = COMPOUND_TOKENS[token];

                if (isRest) {
                    flushEighthRun();
                    const note = new StaveNote({ keys: ['b/4'], duration: 'qr' });
                    note.addModifier(new Annotation('休止').setVerticalJustification(3).setFont('Noto Sans TC', 9));
                    vfNotes.push(note);
                    noteGameMap.push({ rest: true, restIdx: restIdx });
                    restIdx++;
                } else if (compound) {
                    flushEighthRun();
                    const group = [];
                    compound.forEach(sub => {
                        const dur = durMap[sub.d];
                        if (!dur) return;
                        const note = new StaveNote({ keys: ['b/4'], duration: dur, stemDirection: Stem.UP });
                        if (dotSet.has(sub.d)) Dot.buildAndAttach([note], { all: true });
                        note.addModifier(new Annotation(sub.l).setVerticalJustification(3).setFont('Noto Sans TC', 9));
                        vfNotes.push(note);
                        group.push(note);
                        noteGameMap.push([tapIdx]);
                        tapIdx++;
                    });
                    if (group.length > 1) beamGroups.push(group);
                } else {
                    const tokenDur = getRhythmTokenDuration(token);
                    const dur = durMap[tokenDur];
                    if (!dur) return;
                    const note = new StaveNote({ keys: ['b/4'], duration: dur, stemDirection: Stem.UP });
                    if (dotSet.has(tokenDur)) Dot.buildAndAttach([note], { all: true });
                    note.addModifier(new Annotation(token).setVerticalJustification(3).setFont('Noto Sans TC', 9));
                    vfNotes.push(note);
                    noteGameMap.push([tapIdx]);
                    tapIdx++;
                    if (dur === '8') { eighthRun.push(note); } else { flushEighthRun(); }
                }
            });
            flushEighthRun();

            try {
            const nsx = stave.getNoteStartX();
            const voice = new Voice({ numBeats: 4, beatValue: 4 });
            voice.setMode(2);
            voice.addTickables(vfNotes);
            new Formatter().joinVoices([voice]).format([voice], Math.max(barW - (nsx - x) - 16, 40));
            const beams = [];
            beamGroups.forEach(g => {
                try { beams.push(new Beam(g)); }
                catch (e) { beams.push(null); }
            });
            voice.draw(context, stave);
            beams.forEach(b => { if (b) b.setContext(context).draw(); });

            // Map beam SVG elements to their note indices
            const beamElMap = new Map();
            beamGroups.forEach((group, gi) => {
                const bEl = beams[gi] && beams[gi].attrs ? beams[gi].attrs.el : null;
                if (!bEl && beams[gi] && beams[gi].getSVGElement) {
                    beamElMap.set(gi, beams[gi].getSVGElement());
                } else if (bEl) {
                    beamElMap.set(gi, bEl);
                }
            });

            vfNotes.forEach((vfNote, vi) => {
                const gameIndices = noteGameMap[vi];
                const el = vfNote.getSVGElement ? vfNote.getSVGElement() : (vfNote.attrs && vfNote.attrs.el);
                // Map rest SVG elements
                if (gameIndices && gameIndices.rest) {
                    allRestMap[gameIndices.restIdx] = { el: el, bar: bi, row: row };
                    return;
                }
                if (!gameIndices || !gameIndices.length) return;
                // Find which beam group this note belongs to
                let beamEl = null;
                beamGroups.forEach((group, gi) => {
                    if (group.includes(vfNote)) beamEl = beamElMap.get(gi);
                });
                gameIndices.forEach(gi => {
                    allNoteMap[gi] = { el: el, bar: bi, row: row, beamEl: beamEl };
                });
            });
            } catch (err) {
                console.warn('[rchal] bar', bi, 'render failed:', err, '| tokens:', barLabel);
            }
        });

        rchalState.noteMap = allNoteMap;
        rchalState.restNoteMap = allRestMap;
        rchalState.trackW = W;
    }

    /* ── Build expected taps ── */
    function _rchalBuildTaps(measures, lvl) {
        rchalState.taps = [];
        const beatMs = 60000 / lvl.bpm;
        let beatCursor = 0;
        let tapIdx = 0;

        let restIdx = 0;
        measures.forEach((label, mIdx) => {
            const tokens = label.split(' ');
            tokens.forEach(token => {
                const dur = getRhythmTokenDuration(token);
                if (token === '休') {
                    rchalState.restZones.push({
                        idx: restIdx++,
                        startMs: beatCursor * beatMs,
                        endMs: (beatCursor + dur) * beatMs,
                    });
                    beatCursor += dur; return;
                }

                const compound = COMPOUND_TOKENS[token];
                if (compound) {
                    compound.forEach(sub => {
                        rchalState.taps.push({
                            idx: tapIdx,
                            beatPos: beatCursor + sub.o,
                            absTimeMs: (beatCursor + sub.o) * beatMs,
                            consumed: false, hit: false,
                        });
                        tapIdx++;
                    });
                } else {
                    rchalState.taps.push({
                        idx: tapIdx,
                        beatPos: beatCursor,
                        absTimeMs: beatCursor * beatMs,
                        consumed: false, hit: false,
                    });
                    tapIdx++;
                }
                beatCursor += dur;
            });
        });
    }

    /* ── Countdown — 4 Ready Beats with metronome ── */
    function _rchalCountdown() {
        if (rchalState.phase !== 'preview') return;
        rchalState.phase = 'countdown';
        const startBtn = document.getElementById('rchalStartBtn');
        if (startBtn) startBtn.style.display = 'none';
        const statusEl = document.getElementById('rchalStatus');

        // Keep overlay hidden so students can see the rhythm notes during count-in
        const overlay = document.getElementById('rchalOverlay');
        overlay.style.display = 'none';

        const lvl = rchalState.level;
        const beatMs = 60000 / lvl.bpm;
        const beatDots = document.querySelectorAll('#rchalBeats .rchal-beat-dot');

        let beat = 0;
        const totalBeats = 4;
        const tick = () => {
            if (beat >= totalBeats) {
                if (statusEl) statusEl.textContent = '';
                _rchalBeginPlay();
                return;
            }
            // Show beat number in the status bar (no overlay blur)
            if (statusEl) {
                statusEl.textContent = beat === 0 ? '🥁 Ready! 1' : `🥁 ${beat + 1}`;
                statusEl.style.fontWeight = '900';
                statusEl.style.fontSize = '1.4rem';
            }

            // Highlight beat dot
            beatDots.forEach((d, i) => d.classList.toggle('active', i === beat));

            // Play metronome tick sound via Web Audio
            if (audio.ctx && audio.ctx.state === 'suspended') {
                audio.ctx.resume().then(() => audio.scheduleTick(audio.ctx.currentTime + 0.01, beat === 0)).catch(() => {});
            } else {
                audio.resume();
                if (audio.ctx) audio.scheduleTick(audio.ctx.currentTime + 0.01, beat === 0);
            }

            beat++;
            rchalState.timers.push(setTimeout(tick, beatMs));
        };
        tick();
    }

    /* ── Begin Playing ── */
    function _rchalBeginPlay() {
        rchalState.phase = 'playing';
        rchalState.startTime = performance.now();
        rchalState.nextTapIdx = 0;
        const lvl = rchalState.level;
        const beatMs = 60000 / lvl.bpm;
        const totalBeats = lvl.bars * 4;
        const totalMs = totalBeats * beatMs;

        // Show tap zone
        const tapEl = document.getElementById('rchalTap');
        tapEl.style.opacity = '1';
        tapEl.style.pointerEvents = 'auto';
        tapEl.addEventListener('pointerdown', _rchalOnTap);
        tapEl.addEventListener('touchstart', (e) => { e.preventDefault(); _rchalOnTap(); }, { passive: false });

        // Keyboard
        document.addEventListener('keydown', _rchalKeyHandler);

        // Add row highlight overlay
        const trackEl = document.getElementById('rchalTrack');
        const rowHL = document.createElement('div');
        rowHL.id = 'rchalRowHL';
        rowHL.className = 'rchal-row-highlight';
        trackEl.appendChild(rowHL);

        // Schedule row highlighting + smooth auto-scroll to active row
        const rows = rchalState.rowRanges || [];
        let currentRow = -1;
        const updateRow = (barIdx) => {
            const newRow = rows.findIndex(r => r && barIdx >= r.startBar && barIdx <= r.endBar);
            const rowData = newRow >= 0 ? rows[newRow] : null;
            if (newRow !== currentRow && rowData) {
                currentRow = newRow;
                rowHL.style.top = rowData.y + 'px';
                rowHL.style.height = rowData.h + 'px';
                rowHL.style.opacity = '1';
                // Smooth scroll so the active row is visible near the top of the track
                const trackEl = document.getElementById('rchalTrack');
                if (trackEl) {
                    const targetScrollTop = Math.max(0, rowData.y - 8);
                    trackEl.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
                }
            }
        };
        updateRow(0);
        for (let b = 0; b < lvl.bars; b++) {
            const barStartMs = b * 4 * beatMs;
            rchalState.timers.push(setTimeout(() => {
                if (rchalState.phase !== 'playing') return;
                updateRow(b);
            }, barStartMs));
        }

        // Pre-schedule metronome via Web Audio for drift-free timing
        const beatDots = document.querySelectorAll('#rchalBeats .rchal-beat-dot');
        audio.resume();
        if (audio.ctx) {
            const baseTime = audio.ctx.currentTime + 0.02;
            for (let b = 0; b < totalBeats; b++) {
                const t = baseTime + (b * beatMs) / 1000;
                const beatInBar = b % 4;
                audio.scheduleTick(t, beatInBar === 0);
            }
        }
        // Beat dot visuals via setTimeout (visual only, ok to have slight drift)
        for (let b = 0; b < totalBeats; b++) {
            rchalState.timers.push(setTimeout(() => {
                if (rchalState.phase !== 'playing') return;
                const beatInBar = b % 4;
                beatDots.forEach((d, i) => d.classList.toggle('active', i === beatInBar));
            }, b * beatMs));
        }

        // Miss detection loop — uses nextTapIdx pointer for O(1) per frame
        const winLate = beatMs * 0.35 * lvl.winScale;
        const missCheck = () => {
            if (rchalState.phase !== 'playing') return;
            const elapsed = performance.now() - rchalState.startTime;
            const taps = rchalState.taps;
            while (rchalState.nextTapIdx < taps.length) {
                const tap = taps[rchalState.nextTapIdx];
                if (tap.consumed) { rchalState.nextTapIdx++; continue; }
                if (elapsed <= tap.absTimeMs + winLate) break;
                // Miss
                tap.consumed = true;
                tap.hit = false;
                rchalState.counts.miss++;
                rchalState.combo = 0;
                rchalState.hp = Math.max(0, rchalState.hp - lvl.hpLoss);
                _rchalDrawHP();
                _rchalShowJudgment('MISS', 'miss');
                audio.playHit('miss');
                document.getElementById('rchalCombo').textContent = '';
                const nm = rchalState.noteMap && rchalState.noteMap[tap.idx];
                if (nm && nm.el) {
                    _vfColorNote(nm.el, '#EF4444', 0.5);
                    if (nm.beamEl) _vfColorNote(nm.beamEl, '#EF4444', 0.5);
                }
                rchalState.nextTapIdx++;
                if (rchalState.hp <= 0) { _rchalFinish(); return; }
            }
            rchalState.missRafId = requestAnimationFrame(missCheck);
        };
        rchalState.missRafId = requestAnimationFrame(missCheck);

        // End timer
        rchalState.timers.push(setTimeout(() => _rchalFinish(), totalMs + beatMs * 0.5));
    }

    function _rchalKeyHandler(e) {
        if (e.code === 'Space' && rchalState.phase === 'playing') {
            e.preventDefault();
            _rchalOnTap();
        }
    }

    /* ── Tap Handler (optimized effects & scoring) ── */
    let _rchalLastTapMs = 0;
    function _rchalOnTap() {
        if (rchalState.phase !== 'playing') return;
        const now = performance.now();
        if (now - _rchalLastTapMs < 40) return; // debounce: ignore double-fire from touchstart+pointerdown
        _rchalLastTapMs = now;
        const elapsed = now - rchalState.startTime;
        const lvl = rchalState.level;
        const beatMs = 60000 / lvl.bpm;
        const winMs = beatMs * 0.35 * lvl.winScale;

        // Tap ripple effect
        const tapEl = document.getElementById('rchalTap');
        tapEl.classList.add('flash');
        setTimeout(() => tapEl.classList.remove('flash'), 80);

        // Spawn ripple ring
        const ripple = document.createElement('div');
        ripple.className = 'rchal-tap-ripple';
        tapEl.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);

        // Find nearest unhit tap
        let best = null, bestDiff = Infinity;
        rchalState.taps.forEach(tap => {
            if (tap.consumed) return;
            const diff = elapsed - tap.absTimeMs;
            if (diff >= -winMs && diff <= winMs && Math.abs(diff) < bestDiff) {
                best = tap; bestDiff = Math.abs(diff);
            }
        });

        if (!best) {
            // Wrong tap: detect rest zone or generic wrong
            let isRestTap = false;
            let restZoneIdx = -1;
            const restTolerance = winMs * 0.6;
            for (let i = 0; i < rchalState.restZones.length; i++) {
                const rz = rchalState.restZones[i];
                if (elapsed >= rz.startMs - restTolerance && elapsed <= rz.endMs + restTolerance) {
                    isRestTap = true; restZoneIdx = rz.idx; break;
                }
            }
            rchalState.counts.wrong++;
            rchalState.combo = 0;
            document.getElementById('rchalCombo').textContent = '';
            const penalty = Math.ceil(lvl.hpLoss / 2);
            rchalState.hp = Math.max(0, rchalState.hp - penalty);
            _rchalDrawHP();
            if (isRestTap) {
                _rchalShowJudgment('休止符！✗', 'wrong');
                const rm = rchalState.restNoteMap && rchalState.restNoteMap[restZoneIdx];
                if (rm && rm.el) _vfColorNote(rm.el, '#EF4444', 0.7);
            } else {
                _rchalShowJudgment('禁錯！✗', 'wrong');
            }
            audio.playHit('wrong');
            const track = document.getElementById('rchalTrack');
            const float = document.createElement('div');
            float.className = 'rchal-score-float wrong';
            float.textContent = `\u2212${penalty} HP`;
            track.appendChild(float);
            setTimeout(() => float.remove(), 700);
            _rchalScreenShake();
            if (rchalState.hp <= 0) { _rchalFinish(); }
            return;
        }

        best.consumed = true;
        best.hit = true;
        const ratio = bestDiff / winMs;
        let judgment, jClass, points;
        if (ratio < 0.25) { judgment = 'PERFECT ✦'; jClass = 'perfect'; points = 300; }
        else if (ratio < 0.5) { judgment = 'GREAT'; jClass = 'great'; points = 200; }
        else { judgment = 'GOOD'; jClass = 'good'; points = 100; }

        rchalState.combo++;
        if (rchalState.combo > rchalState.maxCombo) rchalState.maxCombo = rchalState.combo;
        const mul = rchalState.combo >= 30 ? 4 : rchalState.combo >= 20 ? 3 : rchalState.combo >= 10 ? 2 : 1;
        const earned = points * mul;
        rchalState.score += earned;
        rchalState.counts[jClass]++;

        audio.playHit(jClass);

        // HP recovery
        if (jClass === 'perfect') rchalState.hp = Math.min(100, rchalState.hp + 5);
        else if (jClass === 'great') rchalState.hp = Math.min(100, rchalState.hp + 2);
        _rchalDrawHP();

        // Animated score counter
        const scoreEl = document.getElementById('rchalScore');
        scoreEl.textContent = rchalState.score;
        scoreEl.classList.add('rchal-score-pop');
        setTimeout(() => scoreEl.classList.remove('rchal-score-pop'), 200);

        _rchalShowJudgment(judgment, jClass);

        // Combo display with milestone effects
        const comboEl = document.getElementById('rchalCombo');
        if (rchalState.combo >= 2) {
            comboEl.textContent = `🔥 ${rchalState.combo} COMBO` + (mul > 1 ? ` ×${mul}` : '');
            comboEl.classList.add('rchal-combo-pop');
            setTimeout(() => comboEl.classList.remove('rchal-combo-pop'), 200);
        }

        // Screen flash on perfect
        if (jClass === 'perfect') {
            const container = document.getElementById('screen-rc-grade');
            container.classList.add('rchal-perfect-flash');
            setTimeout(() => container.classList.remove('rchal-perfect-flash'), 300);
        }

        // Mark note as hit (VexFlow SVG) with glow
        const nm = rchalState.noteMap && rchalState.noteMap[best.idx];
        if (nm && nm.el) {
            const color = jClass === 'perfect' ? '#10B981' : jClass === 'great' ? '#6366F1' : '#F59E0B';
            _vfColorNote(nm.el, color);
            if (nm.beamEl) _vfColorNote(nm.beamEl, color);
        }

        // Score float — position near the note's row
        const track = document.getElementById('rchalTrack');
        const float = document.createElement('div');
        float.className = 'rchal-score-float ' + jClass;
        float.textContent = `+${earned}`;
        if (nm && nm.row !== undefined && rchalState.rowRanges[nm.row]) {
            float.style.top = rchalState.rowRanges[nm.row].y + 'px';
        }
        track.appendChild(float);
        setTimeout(() => float.remove(), 700);
    }

    /* ── Screen shake for wrong taps ── */
    function _rchalScreenShake() {
        const track = document.getElementById('rchalTrack');
        if (!track) return;
        track.style.transition = 'transform 0.06s';
        track.style.transform = 'translateX(4px)';
        setTimeout(() => { track.style.transform = 'translateX(-4px)'; }, 60);
        setTimeout(() => { track.style.transform = ''; track.style.transition = ''; }, 120);
    }

    /* ── Helpers ── */
    function _rchalDrawHP() {
        const fill = document.getElementById('rchalHpFill');
        if (!fill) return;
        const pct = Math.max(0, rchalState.hp);
        fill.style.width = pct + '%';
        fill.className = 'rchal-hp-fill' + (pct > 50 ? '' : pct > 25 ? ' warn' : ' danger');
    }

    function _rchalShowJudgment(text, cls) {
        const el = document.getElementById('rchalJudgment');
        if (!el) return;
        // Reset animation by removing then re-adding class
        el.classList.remove('show');
        el.offsetHeight; // force reflow
        el.textContent = text;
        el.className = 'rchal-judgment show ' + cls;
        clearTimeout(rchalState._judgmentTimer);
        rchalState._judgmentTimer = setTimeout(() => el.classList.remove('show'), 500);
    }

    /* ── Finish ── */
    function _rchalFinish() {
        if (rchalState.phase === 'done') return;
        rchalState.phase = 'done';
        _rchalCleanup();
        const tapEl = document.getElementById('rchalTap');
        if (tapEl) { tapEl.style.opacity = '0.3'; tapEl.style.pointerEvents = 'none'; }

        const total = rchalState.taps.length || 1;
        const hitCount = rchalState.counts.perfect + rchalState.counts.great + rchalState.counts.good;
        const accuracy = Math.round(hitCount / total * 100);

        let stars = 0;
        if (accuracy >= 90 && rchalState.counts.miss <= 2) stars = 3;
        else if (accuracy >= 70) stars = 2;
        else if (accuracy >= 40) stars = 1;

        _rchalSetStars(rchalState.level.id, stars);

        // Save to leaderboard
        if (rchalState.user && rchalState.user.name) {
            saveLocalRank('rchal', rchalState.user, rchalState.score, accuracy, rchalState.maxCombo, 'Lv.' + rchalState.level.id);
            submitScoreToGAS('game2', rchalState.user, rchalState.score, accuracy, rchalState.maxCombo, '節奏挑戰·Lv.' + rchalState.level.id);
        }

        // Record to profile
        if (rchalState.user) {
            recordGameResult(rchalState.user, 'game2', rchalState.score, accuracy, rchalState.maxCombo, null, rchalState.counts);
        }

        let grade, gradeColor;
        if (accuracy >= 95) { grade = 'S'; gradeColor = '#F59E0B'; }
        else if (accuracy >= 85) { grade = 'A'; gradeColor = '#10B981'; }
        else if (accuracy >= 70) { grade = 'B'; gradeColor = '#3B82F6'; }
        else if (accuracy >= 50) { grade = 'C'; gradeColor = '#8B5CF6'; }
        else { grade = 'D'; gradeColor = '#EF4444'; }

        let msg;
        if (stars >= 3) msg = '完美演出！太厲害了！🎉';
        else if (stars >= 2) msg = '很棒！再接再厲！✨';
        else if (stars >= 1) msg = '加油！繼續練習會更好！💪';
        else msg = '沒關係，多練習就會進步！🎵';

        const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        const hpMsg = rchalState.hp <= 0 ? '💔 HP 歸零！' : `❤️ HP ${Math.round(rchalState.hp)}%`;

        // Show result after short delay
        setTimeout(() => {
            const container = document.getElementById('screen-rc-grade');
            container.innerHTML = `
                <div class="rchal-header">
                    <button class="rchal-exit" id="rchalExitBtn">✕</button>
                    <div class="rchal-header-center">
                        <div class="rchal-title">Lv.${rchalState.level.id} ${rchalState.level.name}</div>
                        <div class="rchal-meta">結果</div>
                    </div>
                    <div style="width:36px"></div>
                </div>
                <div class="rchal-result">
                    <div class="rchal-result-stars">${starStr}</div>
                    <div class="rchal-result-grade" style="color:${gradeColor}">${grade}</div>
                    <div class="rchal-result-score">${rchalState.score} 分</div>
                    <div class="rchal-result-stats">
                        <div class="rchal-stat perfect"><div class="rchal-stat-val">${rchalState.counts.perfect}</div><div class="rchal-stat-label">PERFECT</div></div>
                        <div class="rchal-stat great"><div class="rchal-stat-val">${rchalState.counts.great}</div><div class="rchal-stat-label">GREAT</div></div>
                        <div class="rchal-stat good"><div class="rchal-stat-val">${rchalState.counts.good}</div><div class="rchal-stat-label">GOOD</div></div>
                        <div class="rchal-stat miss"><div class="rchal-stat-val">${rchalState.counts.miss}</div><div class="rchal-stat-label">MISS</div></div>
                        <div class="rchal-stat wrong"><div class="rchal-stat-val">${rchalState.counts.wrong}</div><div class="rchal-stat-label">WRONG</div></div>
                    </div>
                    <div class="rchal-result-detail">準確度 ${accuracy}%　·　最高連擊 ${rchalState.maxCombo}　·　禁錯 ${rchalState.counts.wrong}</div>
                    <div class="rchal-result-detail">${hpMsg}</div>
                    <div class="rchal-result-msg">${msg}</div>
                    <div class="rchal-result-btns">
                        <button class="rchal-btn-retry" id="rchalRetry">🔄 再試一次</button>
                        <button class="rchal-btn-back" id="rchalBackToLevels">📋 選擇關卡</button>
                    </div>
                </div>
            `;
            document.getElementById('rchalExitBtn').onclick = () => _rchalShowSelect();
            document.getElementById('rchalRetry').onclick = () => _rchalStartLevel(rchalState.level);
            document.getElementById('rchalBackToLevels').onclick = () => _rchalShowSelect();
        }, 600);
    }

    // ══════════════════════════════════════════
    // ⏱️ 1分鐘挑戰 — Note Value Fill-in Game
    // ══════════════════════════════════════════
    const omState = {
        user: null, score: 0, correct: 0, wrong: 0, total: 0,
        timer: null, startTime: 0, duration: 60000,
        currentAnswer: null, locked: false
    };

    // Note value options: duration in quarter-note beats
    const OM_NOTE_OPTIONS = [
        { id: 'whole', beats: 4, label: '全音符',  vfDur: 'w' },
        { id: 'half',  beats: 2, label: '二分音符', vfDur: 'h' },
        { id: 'dotted-quarter', beats: 1.5, label: '附點四分', vfDur: 'q', dotted: true },
        { id: 'quarter', beats: 1, label: '四分音符', vfDur: 'q' },
        { id: 'eighth', beats: 0.5, label: '八分音符', vfDur: '8' },
        { id: '16th', beats: 0.25, label: '十六分音符', vfDur: '16' },
    ];

    // Note types that must only start on an integer beat position
    const _OM_INTEGER_BEAT_ONLY = new Set(['whole', 'half', 'dotted-quarter']);

    // Generate a random measure for a given time signature
    function _omGenerateMeasure(totalBeats) {
        const pool = OM_NOTE_OPTIONS.filter(n => n.beats <= totalBeats);
        let remaining = totalBeats;
        let pos = 0;
        const notes = [];
        let safety = 0;
        while (remaining > 0.001 && safety++ < 50) {
            const onBeat = Math.abs(pos - Math.round(pos)) < 0.01;
            let eligible = pool.filter(n => n.beats <= remaining + 0.001);
            if (!onBeat) eligible = eligible.filter(n => !_OM_INTEGER_BEAT_ONLY.has(n.id));
            if (!eligible.length) break;
            const pick = eligible[Math.floor(Math.random() * eligible.length)];
            notes.push({ ...pick });
            pos = Math.round((pos + pick.beats) * 1000) / 1000;
            remaining = Math.round((remaining - pick.beats) * 1000) / 1000;
        }
        // Must have at least 2 notes to blank one
        if (notes.length < 2) return _omGenerateMeasure(totalBeats);
        return notes;
    }

    // Render a measure with one note blanked, return the blanked note's info
    function _omRenderQuestion(container, timeSig, notes, blankIdx) {
        container.innerHTML = '';
        if (typeof VexFlow === 'undefined') return;
        const { Renderer, Stave, StaveNote, Voice, Formatter, Stem, Dot } = VexFlow;

        const rawW = container.clientWidth || 340;
        const W = Math.min(rawW, 460);
        const H = 100;
        const renderer = new Renderer(container, Renderer.Backends.SVG);
        renderer.resize(W, H);
        const context = renderer.getContext();

        const stave = new Stave(0, 0, W - 4);
        stave.addClef('percussion');
        stave.addTimeSignature(timeSig);
        stave.setContext(context).draw();

        const durMap = { 4: 'w', 2: 'h', 1.5: 'q', 1: 'q', 0.5: '8', 0.25: '16' };
        const dotBeats = new Set([1.5]);
        const { Beam } = VexFlow;
        const beams = [];
        const vfNotes = [];
        let eighthRun = [];
        const flushRun = () => { if (eighthRun.length > 1) { try { beams.push(new Beam([...eighthRun])); } catch(e) {} } eighthRun = []; };

        notes.forEach((n, i) => {
            const dur = durMap[n.beats] || 'q';
            if (i === blankIdx) {
                flushRun(); // break beam before blank note
                const note = new StaveNote({ keys: ['b/4'], duration: dur, stemDirection: Stem.UP });
                if (dotBeats.has(n.beats)) Dot.buildAndAttach([note], { all: true });
                note.setStyle({ fillStyle: 'transparent', strokeStyle: 'transparent' });
                note.setStemStyle({ fillStyle: 'transparent', strokeStyle: 'transparent' });
                if (note.flag) note.flag.setStyle({ fillStyle: 'transparent', strokeStyle: 'transparent' });
                vfNotes.push(note);
                // blank note is NOT added to eighthRun — beam is broken after it too
            } else {
                const note = new StaveNote({ keys: ['b/4'], duration: dur, stemDirection: Stem.UP });
                if (dotBeats.has(n.beats)) Dot.buildAndAttach([note], { all: true });
                vfNotes.push(note);
                if (n.beats < 1) {
                    eighthRun.push(note);
                } else {
                    flushRun();
                }
            }
        });
        flushRun();

        const [num] = timeSig.split('/').map(Number);
        const voice = new Voice({ numBeats: num, beatValue: 4 });
        voice.setMode(2);
        voice.addTickables(vfNotes);
        const nsx = stave.getNoteStartX();
        new Formatter().joinVoices([voice]).format([voice], W - nsx - 20);
        voice.draw(context, stave);
        beams.forEach(b => b.setContext(context).draw());

        // Draw blank placeholder over the hidden note
        const blankNote = vfNotes[blankIdx];
        const bb = blankNote.getBoundingBox();
        if (bb) {
            const svg = container.querySelector('svg');
            const ns = 'http://www.w3.org/2000/svg';
            const rect = document.createElementNS(ns, 'rect');
            const pad = 6;
            rect.setAttribute('x', bb.x - pad);
            rect.setAttribute('y', bb.y - pad);
            rect.setAttribute('width', bb.w + pad * 2);
            rect.setAttribute('height', bb.h + pad * 2);
            rect.setAttribute('class', 'om-blank-rect');
            svg.appendChild(rect);

            // Question mark inside
            const txt = document.createElementNS(ns, 'text');
            txt.setAttribute('x', bb.x + bb.w / 2);
            txt.setAttribute('y', bb.y + bb.h / 2 + 5);
            txt.setAttribute('text-anchor', 'middle');
            txt.setAttribute('font-size', '18');
            txt.setAttribute('font-weight', '900');
            txt.setAttribute('fill', '#6366f1');
            txt.textContent = '？';
            svg.appendChild(txt);
        }
    }

    // Render a small SVG note icon for option buttons
    function _omRenderNoteIcon(duration, dotted) {
        if (typeof VexFlow === 'undefined') return '';
        const { Renderer, Stave, StaveNote, Voice, Formatter, Stem, Dot } = VexFlow;

        const div = document.createElement('div');
        div.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:60px;height:52px;';
        document.body.appendChild(div);

        const renderer = new Renderer(div, Renderer.Backends.SVG);
        renderer.resize(60, 52);
        const context = renderer.getContext();

        const stave = new Stave(-10, -16, 80);
        [0, 1, 2, 3, 4].forEach(line => stave.setConfigForLine(line, { visible: false }));
        stave.setContext(context).draw();

        const note = new StaveNote({ keys: ['b/4'], duration: duration, stemDirection: Stem.UP });
        if (dotted) Dot.buildAndAttach([note], { all: true });
        const voice = new Voice({ numBeats: 4, beatValue: 4 });
        voice.setMode(2);
        voice.addTickables([note]);
        new Formatter().joinVoices([voice]).format([voice], 40);
        voice.draw(context, stave);

        const svgEl = div.querySelector('svg');
        const svgHTML = svgEl ? svgEl.outerHTML : '';
        document.body.removeChild(div);
        return svgHTML;
    }

    function _omNextQuestion() {
        if (omState.locked) return;
        // Random time signature
        const timeSigs = ['2/4', '3/4', '4/4'];
        const timeSig = timeSigs[Math.floor(Math.random() * timeSigs.length)];
        const totalBeats = parseInt(timeSig);

        const notes = _omGenerateMeasure(totalBeats);
        const blankIdx = Math.floor(Math.random() * notes.length);
        omState.currentAnswer = notes[blankIdx];
        omState.total++;

        // Update time signature display
        const tsEl = document.getElementById('omTimeSig');
        if (tsEl) tsEl.textContent = timeSig;

        // Update question number
        const qnEl = document.getElementById('omQNum');
        if (qnEl) qnEl.textContent = `第 ${omState.total} 題`;

        // Render
        const wrap = document.getElementById('omStaffWrap');
        if (wrap) _omRenderQuestion(wrap, timeSig, notes, blankIdx);

        // Reset option states
        document.querySelectorAll('.om-opt-btn').forEach(b => {
            b.classList.remove('correct', 'wrong');
            b.disabled = false;
        });

        // Clear feedback
        const fb = document.getElementById('omFeedback');
        if (fb) { fb.className = 'om-feedback-text'; fb.textContent = ''; }
    }

    function _omHandleAnswer(optId) {
        if (omState.locked || !omState.currentAnswer) return;
        omState.locked = true;

        const isCorrect = optId === omState.currentAnswer.id;
        const fb = document.getElementById('omFeedback');

        // Highlight buttons
        document.querySelectorAll('.om-opt-btn').forEach(b => {
            b.disabled = true;
            if (b.dataset.id === omState.currentAnswer.id) {
                b.classList.add('correct');
            } else if (b.dataset.id === optId && !isCorrect) {
                b.classList.add('wrong');
            }
        });

        if (isCorrect) {
            omState.correct++;
            omState.score += 10;
            audio.playAnswer(true);
            if (fb) { fb.textContent = '✓ 答對了！'; fb.className = 'om-feedback-text show correct'; }
            const scoreEl = document.getElementById('omScore');
            if (scoreEl) scoreEl.textContent = omState.score;
            // Float +10
            const floater = document.createElement('div');
            floater.className = 'om-score-float';
            floater.textContent = '+10';
            document.querySelector('.om-header').appendChild(floater);
            setTimeout(() => floater.remove(), 750);
        } else {
            omState.wrong++;
            audio.playAnswer(false);
            if (fb) { fb.textContent = '✗ 答錯了'; fb.className = 'om-feedback-text show wrong'; }
        }

        // Next question after brief delay
        setTimeout(() => {
            omState.locked = false;
            if (omState.timer) _omNextQuestion();
        }, 600);
    }

    function _omStartTimer() {
        omState.startTime = performance.now();
        const fill = document.getElementById('omTimerFill');
        const timeText = document.getElementById('omTimeLeft');

        function tick() {
            const elapsed = performance.now() - omState.startTime;
            const remaining = Math.max(0, omState.duration - elapsed);
            const pct = (remaining / omState.duration) * 100;
            if (fill) {
                fill.style.width = pct + '%';
                fill.classList.toggle('warn', pct < 40 && pct >= 15);
                fill.classList.toggle('danger', pct < 15);
            }
            if (timeText) timeText.textContent = Math.ceil(remaining / 1000) + 's';

            if (remaining <= 0) {
                _omEndGame();
                return;
            }
            omState.timer = requestAnimationFrame(tick);
        }
        omState.timer = requestAnimationFrame(tick);
    }

    function _omEndGame() {
        if (omState.timer) { cancelAnimationFrame(omState.timer); omState.timer = null; }
        omState.locked = true;

        // Disable option buttons
        document.querySelectorAll('.om-opt-btn').forEach(b => b.disabled = true);

        const container = document.getElementById('screen-rc-1min');
        const resultDiv = document.createElement('div');
        resultDiv.className = 'om-result';
        const emoji = omState.score >= 80 ? '🏆' : omState.score >= 50 ? '⭐' : '💪';
        const accuracy = omState.total > 0 ? Math.round((omState.correct / omState.total) * 100) : 0;

        // Submit to leaderboard
        if (omState.user && omState.user.name) {
            saveLocalRank('game2', omState.user, omState.score, accuracy, omState.correct, '1分鐘挑戰');
            submitScoreToGAS('game2', omState.user, omState.score, accuracy, omState.correct, '1分鐘挑戰');
        }

        resultDiv.innerHTML = `
            <div class="om-result-emoji">${emoji}</div>
            <div class="om-result-title">挑戰結束！</div>
            <div class="om-result-score">${omState.score}</div>
            <div class="om-result-label">最終得分</div>
            <div class="om-result-stats">
                <div class="om-result-stat"><div class="val">${omState.total}</div><div class="lbl">作答</div></div>
                <div class="om-result-stat"><div class="val" style="color:var(--primary-green-dark)">${omState.correct}</div><div class="lbl">答對</div></div>
                <div class="om-result-stat"><div class="val" style="color:var(--primary-red)">${omState.wrong}</div><div class="lbl">答錯</div></div>
            </div>
            <div class="om-result-btns">
                <button class="om-btn-retry" id="omRetry">🔄 再玩一次</button>
                <button class="om-btn-ranks" id="omViewRanks">🏆 查看排行榜</button>
                <button class="om-btn-back" id="omBack">← 返回</button>
            </div>
        `;
        container.appendChild(resultDiv);
        document.getElementById('omRetry').onclick = () => _omLaunch(omState.user);
        document.getElementById('omViewRanks').onclick = () => {
            dom.leaderboardLayout.classList.add('view-only');
            dom.reportGrid.innerHTML = ''; dom.reportWeakness.innerHTML = '';
            const gf = document.getElementById('rankGameFilter');
            if (gf) { gf.value = 'game2'; gf.dispatchEvent(new Event('change')); }
            if (dom.rankGradeFilter && omState.user) dom.rankGradeFilter.value = String(omState.user.grade || 0);
            if (dom.rankClassFilter && omState.user) dom.rankClassFilter.value = String(omState.user.class || '0');
            loadRanks();
            switchScreen('screen-leaderboard');
        };
        document.getElementById('omBack').onclick = () => {
            resultDiv.remove();
            switchScreen('screen-g2-setup');
        };
    }

    function _omCleanup() {
        if (omState.timer) { cancelAnimationFrame(omState.timer); omState.timer = null; }
        omState.score = 0; omState.correct = 0; omState.wrong = 0;
        omState.total = 0; omState.currentAnswer = null; omState.locked = false;
    }

    // ══════════════════════════════════════════
    // 🎵 時值辨別 — Duration Recognition Game
    // ══════════════════════════════════════════
    const DUR_QUESTIONS = [
        { id: 'whole',       label: '全音符',       img: 'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p02.png', beats: 4,    isRest: false },
        { id: 'dot-half',    label: '附點二分音符', img: 'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p03.png', beats: 3,    isRest: false },
        { id: 'half',        label: '二分音符',     img: 'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p04.png', beats: 2,    isRest: false },
        { id: 'dot-quarter', label: '附點四分音符', img: 'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p05.png', beats: 1.5,  isRest: false },
        { id: 'quarter',     label: '四分音符',     img: 'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p06.png', beats: 1,    isRest: false },
        { id: 'dot-eighth',  label: '附點八分音符', img: 'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p07.png', beats: 0.75, isRest: false },
        { id: 'eighth',      label: '八分音符',     img: 'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p08.png', beats: 0.5,  isRest: false },
        { id: '16th',        label: '十六分音符',   img: 'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p09.png', beats: 0.25, isRest: false },
        { id: 'whole-r',     label: '全休止符',     img: 'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p18.png', beats: 4,    isRest: true },
        { id: 'half-r',      label: '二分休止符',   img: 'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p19.png', beats: 2,    isRest: true },
        { id: 'quarter-r',   label: '四分休止符',   img: 'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p20.png', beats: 1,    isRest: true },
        { id: 'eighth-r',    label: '八分休止符',   img: 'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p21.png', beats: 0.5,  isRest: true },
        { id: 'dot-quarter-r', label: '附點四分休止符', img: 'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p22.png', beats: 1.5, isRest: true },
    ];

    const durState = {
        user: null, score: 0, correct: 0, wrong: 0, total: 0,
        timer: null, startTime: 0, duration: 60000,
        currentQuestion: null, locked: false
    };

    function _durCleanup() {
        if (durState.timer) { cancelAnimationFrame(durState.timer); durState.timer = null; }
        durState.score = 0; durState.correct = 0; durState.wrong = 0;
        durState.total = 0; durState.currentQuestion = null; durState.locked = false;
    }

    function _durLaunch(user) {
        _durCleanup();
        durState.user = user;
        const container = document.getElementById('screen-g2-duration');

        container.innerHTML = `
            <div class="om-header">
                <button class="om-exit" id="durExitBtn">✕</button>
                <div class="om-header-center">
                    <div class="om-title">🎵 時值辨別</div>
                    <span class="om-time-left" id="durTimeLeft">60s</span>
                </div>
                <div class="om-score-wrap">
                    <div class="om-score-val" id="durScore">0</div>
                    <div class="om-score-label">得分</div>
                </div>
            </div>
            <div class="om-timer-wrap"><div class="om-timer-fill" id="durTimerFill"></div></div>
            <div class="om-qnum" id="durQNum" style="display:none;"></div>
            <div class="dur-img-wrap" id="durImgWrap" style="display:none;">
                <img id="durQuestionImg" src="" alt="音符/休止符">
            </div>
            <div class="om-feedback" id="durFeedbackWrap" style="display:none;"><div class="om-feedback-text" id="durFeedback"></div></div>
            <div class="om-prompt" id="durPrompt" style="display:none;">這是什麼音符/休止符？</div>
            <div class="dur-options-wrap" id="durOptions" style="display:none;"></div>
            <div class="dur-pregame" id="durPregame">
                <div class="dur-ref-mini">
                    <div class="dur-ref-mini-section">
                        <div class="dur-ref-heading">🎶 音符</div>
                        <div class="dur-ref-mini-list">
                            <div class="dur-ref-mini-row"><img src="https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p02.png" alt="全音符"><span>全音符</span><b>4拍</b></div>
                            <div class="dur-ref-mini-row"><img src="https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p03.png" alt="附點二分音符"><span>附點二分</span><b>3拍</b></div>
                            <div class="dur-ref-mini-row"><img src="https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p04.png" alt="二分音符"><span>二分音符</span><b>2拍</b></div>
                            <div class="dur-ref-mini-row"><img src="https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p05.png" alt="附點四分音符"><span>附點四分</span><b>1.5拍</b></div>
                            <div class="dur-ref-mini-row"><img src="https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p06.png" alt="四分音符"><span>四分音符</span><b>1拍</b></div>
                            <div class="dur-ref-mini-row"><img src="https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p07.png" alt="附點八分音符"><span>附點八分</span><b>¾拍</b></div>
                            <div class="dur-ref-mini-row"><img src="https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p08.png" alt="八分音符"><span>八分音符</span><b>½拍</b></div>
                            <div class="dur-ref-mini-row"><img src="https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p09.png" alt="十六分音符"><span>十六分</span><b>¼拍</b></div>
                        </div>
                    </div>
                    <div class="dur-ref-mini-section">
                        <div class="dur-ref-heading">🤫 休止符</div>
                        <div class="dur-ref-mini-list">
                            <div class="dur-ref-mini-row"><img src="https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p18.png" alt="全休止符"><span>全休止符</span><b>4拍</b></div>
                            <div class="dur-ref-mini-row"><img src="https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p19.png" alt="二分休止符"><span>二分休止</span><b>2拍</b></div>
                            <div class="dur-ref-mini-row"><img src="https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p20.png" alt="四分休止符"><span>四分休止</span><b>1拍</b></div>
                            <div class="dur-ref-mini-row"><img src="https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p21.png" alt="八分休止符"><span>八分休止</span><b>½拍</b></div>
                            <div class="dur-ref-mini-row"><img src="https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rhythm-p22.png" alt="附點四分休止符"><span>附點四分休止</span><b>1.5拍</b></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="om-status" id="durStatus">準備好就按「開始」！</div>
            <button class="om-start-btn" id="durStartBtn">⏱️ 開始！</button>
        `;

        switchScreen('screen-g2-duration');

        document.getElementById('durExitBtn').onclick = () => {
            _durCleanup();
            switchScreen('screen-g2-setup');
        };

        document.getElementById('durStartBtn').onclick = () => {
            document.getElementById('durStartBtn').style.display = 'none';
            document.getElementById('durStatus').textContent = '';
            _durCountdown(() => {
                document.getElementById('durPregame').style.display = 'none';
                document.getElementById('durQNum').style.display = '';
                document.getElementById('durImgWrap').style.display = '';
                document.getElementById('durFeedbackWrap').style.display = '';
                document.getElementById('durPrompt').style.display = '';
                document.getElementById('durOptions').style.display = '';
                _durStartTimer();
                _durNextQuestion();
            });
        };
    }

    function _durCountdown(cb) {
        const container = document.getElementById('screen-g2-duration');
        let count = 3;
        const overlay = document.createElement('div');
        overlay.className = 'om-countdown';
        overlay.textContent = count;
        container.appendChild(overlay);

        const iv = setInterval(() => {
            count--;
            if (count <= 0) {
                clearInterval(iv);
                overlay.remove();
                cb();
            } else {
                overlay.textContent = count;
                overlay.style.animation = 'none';
                overlay.offsetHeight;
                overlay.style.animation = 'omPulse 0.6s ease';
            }
        }, 700);
    }

    function _durNextQuestion() {
        if (durState.locked) return;

        // Pick random question
        const q = DUR_QUESTIONS[Math.floor(Math.random() * DUR_QUESTIONS.length)];
        durState.currentQuestion = q;
        durState.total++;

        // Update question number
        const qnEl = document.getElementById('durQNum');
        if (qnEl) qnEl.textContent = `第 ${durState.total} 題`;

        // Display image
        const img = document.getElementById('durQuestionImg');
        if (img) img.src = q.img;

        // Generate 8 options: notes (left) + rests (right), 4 each
        // Always include the correct answer in its category
        const notePool = DUR_QUESTIONS.filter(d => !d.isRest);
        const restPool = DUR_QUESTIONS.filter(d => d.isRest);

        let noteOpts, restOpts;
        if (q.isRest) {
            // Correct is a rest — ensure it's in restOpts
            const restDistractors = restPool.filter(d => d.id !== q.id);
            _shuffleArr(restDistractors);
            restOpts = [q, ...restDistractors.slice(0, 3)];
            _shuffleArr(notePool);
            noteOpts = notePool.slice(0, 4);
        } else {
            // Correct is a note — ensure it's in noteOpts
            const noteDistractors = notePool.filter(d => d.id !== q.id);
            _shuffleArr(noteDistractors);
            noteOpts = [q, ...noteDistractors.slice(0, 3)];
            _shuffleArr(restPool);
            restOpts = restPool.slice(0, 4);
        }
        _shuffleArr(noteOpts);
        _shuffleArr(restOpts);

        const optContainer = document.getElementById('durOptions');
        optContainer.innerHTML = `
            <div class="dur-col">
                <div class="dur-col-label">🎶 音符</div>
                ${noteOpts.map(o => `<button class="dur-opt-btn" data-id="${o.id}">${o.label}</button>`).join('')}
            </div>
            <div class="dur-col">
                <div class="dur-col-label">🤫 休止符</div>
                ${restOpts.map(o => `<button class="dur-opt-btn" data-id="${o.id}">${o.label}</button>`).join('')}
            </div>
        `;

        // Bind clicks
        optContainer.querySelectorAll('.dur-opt-btn').forEach(btn => {
            btn.onclick = () => _durHandleAnswer(btn.dataset.id);
        });

        // Clear feedback
        const fb = document.getElementById('durFeedback');
        if (fb) { fb.className = 'om-feedback-text'; fb.textContent = ''; }
    }

    function _shuffleArr(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function _durHandleAnswer(optId) {
        if (durState.locked || !durState.currentQuestion) return;
        durState.locked = true;

        const correctId = durState.currentQuestion.id;
        const isCorrect = optId === correctId;
        const fb = document.getElementById('durFeedback');

        // Highlight buttons
        document.querySelectorAll('.dur-opt-btn').forEach(b => {
            b.disabled = true;
            if (b.dataset.id === correctId) {
                b.classList.add('correct');
            } else if (b.dataset.id === optId && !isCorrect) {
                b.classList.add('wrong');
            }
        });

        if (isCorrect) {
            durState.correct++;
            durState.score += 100;
            if (fb) { fb.textContent = '✓ 答對了！'; fb.className = 'om-feedback-text show correct'; }
            const scoreEl = document.getElementById('durScore');
            if (scoreEl) scoreEl.textContent = durState.score;
            // Float +100
            const floater = document.createElement('div');
            floater.className = 'om-score-float';
            floater.textContent = '+100';
            document.querySelector('#screen-g2-duration .om-header').appendChild(floater);
            setTimeout(() => floater.remove(), 750);
        } else {
            durState.wrong++;
            if (fb) { fb.textContent = '✗ 答錯了'; fb.className = 'om-feedback-text show wrong'; }
        }

        // Next question after brief delay
        setTimeout(() => {
            durState.locked = false;
            if (durState.timer) _durNextQuestion();
        }, 600);
    }

    function _durStartTimer() {
        durState.startTime = performance.now();
        const fill = document.getElementById('durTimerFill');
        const timeText = document.getElementById('durTimeLeft');

        function tick() {
            const elapsed = performance.now() - durState.startTime;
            const remaining = Math.max(0, durState.duration - elapsed);
            const pct = (remaining / durState.duration) * 100;
            if (fill) {
                fill.style.width = pct + '%';
                fill.classList.toggle('warn', pct < 40 && pct >= 15);
                fill.classList.toggle('danger', pct < 15);
            }
            if (timeText) timeText.textContent = Math.ceil(remaining / 1000) + 's';

            if (remaining <= 0) {
                _durEndGame();
                return;
            }
            durState.timer = requestAnimationFrame(tick);
        }
        durState.timer = requestAnimationFrame(tick);
    }

    function _durEndGame() {
        if (durState.timer) { cancelAnimationFrame(durState.timer); durState.timer = null; }
        durState.locked = true;

        // Disable option buttons
        document.querySelectorAll('.dur-opt-btn').forEach(b => b.disabled = true);

        const container = document.getElementById('screen-g2-duration');
        const resultDiv = document.createElement('div');
        resultDiv.className = 'om-result';
        const emoji = durState.score >= 800 ? '🏆' : durState.score >= 500 ? '⭐' : '💪';
        const accuracy = durState.total > 0 ? Math.round((durState.correct / durState.total) * 100) : 0;

        // Submit to leaderboard
        if (durState.user && durState.user.name) {
            saveLocalRank('game2', durState.user, durState.score, accuracy, durState.correct, '時值辨別');
            submitScoreToGAS('game2', durState.user, durState.score, accuracy, durState.correct, '時值辨別');
        }

        resultDiv.innerHTML = `
            <div class="om-result-emoji">${emoji}</div>
            <div class="om-result-title">挑戰結束！</div>
            <div class="om-result-score">${durState.score}</div>
            <div class="om-result-label">最終得分</div>
            <div class="om-result-stats">
                <div class="om-result-stat"><div class="val">${durState.total}</div><div class="lbl">作答</div></div>
                <div class="om-result-stat"><div class="val" style="color:var(--primary-green-dark)">${durState.correct}</div><div class="lbl">答對</div></div>
                <div class="om-result-stat"><div class="val" style="color:var(--primary-red)">${durState.wrong}</div><div class="lbl">答錯</div></div>
            </div>
            <div class="om-result-btns">
                <button class="om-btn-retry" id="durRetry">🔄 再玩一次</button>
                <button class="om-btn-ranks" id="durViewRanks">🏆 查看排行榜</button>
                <button class="om-btn-back" id="durBack">← 返回</button>
            </div>
        `;
        container.appendChild(resultDiv);
        document.getElementById('durRetry').onclick = () => _durLaunch(durState.user);
        document.getElementById('durViewRanks').onclick = () => {
            dom.leaderboardLayout.classList.add('view-only');
            dom.reportGrid.innerHTML = ''; dom.reportWeakness.innerHTML = '';
            const gf = document.getElementById('rankGameFilter');
            if (gf) { gf.value = 'game2'; gf.dispatchEvent(new Event('change')); }
            if (dom.rankGradeFilter && durState.user) dom.rankGradeFilter.value = String(durState.user.grade || 0);
            if (dom.rankClassFilter && durState.user) dom.rankClassFilter.value = String(durState.user.class || '0');
            loadRanks();
            switchScreen('screen-leaderboard');
        };
        document.getElementById('durBack').onclick = () => {
            resultDiv.remove();
            switchScreen('screen-g2-setup');
        };
    }

    function _omLaunch(user) {
        _omCleanup();
        omState.user = user;
        const container = document.getElementById('screen-rc-1min');

        // Pre-render note icons
        const noteIcons = {};
        OM_NOTE_OPTIONS.forEach(opt => { noteIcons[opt.id] = _omRenderNoteIcon(opt.vfDur, opt.dotted); });

        container.innerHTML = `
            <div class="om-header">
                <button class="om-exit" id="omExitBtn">✕</button>
                <div class="om-header-center">
                    <div class="om-title">⏱️ 1分鐘挑戰</div>
                    <span class="om-time-left" id="omTimeLeft">60s</span>
                </div>
                <div class="om-score-wrap">
                    <div class="om-score-val" id="omScore">0</div>
                    <div class="om-score-label">得分</div>
                </div>
            </div>
            <div class="om-timer-wrap"><div class="om-timer-fill" id="omTimerFill"></div></div>
            <div class="om-timesig-row"><span class="om-timesig-badge" id="omTimeSig">4/4</span></div>
            <div class="om-qnum" id="omQNum"></div>
            <div class="om-staff-wrap" id="omStaffWrap"></div>
            <div class="om-feedback"><div class="om-feedback-text" id="omFeedback"></div></div>
            <div class="om-prompt">空位是什麼音符？</div>
            <div class="om-options" id="omOptions">
                ${OM_NOTE_OPTIONS.map(opt => `
                    <button class="om-opt-btn" data-id="${opt.id}">
                        <div class="om-opt-icon">${noteIcons[opt.id]}</div>
                        <div class="om-opt-label">${opt.label}</div>
                    </button>
                `).join('')}
            </div>
            <div class="om-status" id="omStatus">準備好就按「開始」！</div>
            <button class="om-start-btn" id="omStartBtn">⏱️ 開始！</button>
        `;

        switchScreen('screen-rc-1min');

        document.getElementById('omExitBtn').onclick = () => {
            _omCleanup();
            switchScreen('screen-g2-setup');
        };

        // Bind option clicks
        document.querySelectorAll('.om-opt-btn').forEach(btn => {
            btn.onclick = () => _omHandleAnswer(btn.dataset.id);
            btn.disabled = true;
        });

        document.getElementById('omStartBtn').onclick = () => {
            document.getElementById('omStartBtn').style.display = 'none';
            document.getElementById('omStatus').textContent = '';
            // Countdown 3-2-1
            _omCountdown(() => {
                // Enable options and start
                document.querySelectorAll('.om-opt-btn').forEach(b => b.disabled = false);
                _omStartTimer();
                _omNextQuestion();
            });
        };
    }

    function _omCountdown(cb) {
        const container = document.getElementById('screen-rc-1min');
        let count = 3;
        const overlay = document.createElement('div');
        overlay.className = 'om-countdown';
        overlay.textContent = count;
        container.appendChild(overlay);

        const iv = setInterval(() => {
            count--;
            if (count <= 0) {
                clearInterval(iv);
                overlay.remove();
                cb();
            } else {
                overlay.textContent = count;
                overlay.style.animation = 'none';
                overlay.offsetHeight; // reflow
                overlay.style.animation = 'omPulse 0.6s ease';
            }
        }, 700);
    }

    function _rcRenderLevels() {
        const grid = document.getElementById('rcLevelGrid');
        if (!grid) return;

        grid.innerHTML = '';
        const cards = RC_CARDS;
        cards.forEach(card => {
            const num = String(card.num).padStart(2, '0');
            const el = document.createElement('div');
            el.className = 'rc-level-card';
            el.innerHTML = `<div class="rc-level-thumb"><img src="https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/rc-${num}.png" alt="節奏卡 ${card.num}" loading="lazy">${_rcGetGradeBadge(card.num)}<button class="rc-level-preview-btn" title="試聽節奏">▶</button></div>
                <div class="rc-level-copy">
                    <div class="rc-level-num">No.${card.num}</div>
                    <div class="rc-level-diff">${'⭐'.repeat(card.level)}</div>
                </div>`;
            el.querySelector('.rc-level-preview-btn').onclick = (e) => {
                e.stopPropagation();
                _rcPlayLevelPreview(card, e.currentTarget);
            };
            el.onclick = () => _openRCDetail(card, rcGameState._user);
            grid.appendChild(el);
        });
    }

    function _openRCDetail(card, user) {
        audio.bgStop();
        _rcStopPreview();
        _rcRemoveGameKeyHandler();

        // Default BPM based on difficulty level
        const defaultBpm = [75, 70, 65, 60][card.level - 1] || 60;

        rcGameState = {
            ...rcGameState,
            _user: user,
            _card: card,
            _bpm: defaultBpm,
            _previewTimers: [],
        };

        const num = String(card.num).padStart(2, '0');
        document.getElementById('rcDetailImg').src = `img/cards/rc-${num}.png`;
        document.getElementById('rcDetailNum').textContent = `節奏卡 No.${card.num}`;
        document.getElementById('rcDetailDiff').textContent = '⭐'.repeat(card.level);
        document.getElementById('rcDetailLabel').textContent = card.label;
        _rcRenderValueChips(card);

        const kodalyRow = document.getElementById('rcKodalyRow');
        kodalyRow.innerHTML = '';
        card.label.split(' ').forEach(tok => {
            const span = document.createElement('span');
            span.className = 'rg-kodaly-tok';
            if (tok === '休') span.classList.add('tok-rest');
            else if (tok.startsWith('ta-a')) span.classList.add('tok-ta2');
            else if (tok.startsWith('ti')) span.classList.add('tok-ti');
            else span.classList.add('tok-ta');
            span.textContent = tok;
            kodalyRow.appendChild(span);
        });

        document.querySelectorAll('.rc-speed-btn').forEach(btn => {
            const bpm = parseInt(btn.dataset.bpm || '60', 10);
            btn.classList.toggle('active', bpm === rcGameState._bpm);
            btn.onclick = () => {
                rcGameState._bpm = bpm;
                document.querySelectorAll('.rc-speed-btn').forEach(other => {
                    other.classList.toggle('active', parseInt(other.dataset.bpm || '60', 10) === bpm);
                });
            };
        });

        document.getElementById('rcDetailPreviewBtn').onclick = () => _rcPlayPreview(card);
        document.getElementById('rcDetailBack').onclick = () => {
            _rcStopPreview();
            audio.bgPlay();
            switchScreen('screen-rc-levels');
        };
        document.getElementById('rcDetailStartBtn').onclick = () => showRCReadPhase(card, rcGameState._bpm, user);
        document.querySelectorAll('#rcPreviewBeats .rc-beat-box').forEach(box => box.classList.remove('active'));
        switchScreen('screen-rc-detail');
    }

    async function _rcPlayPreview(card) {
        _rcStopPreview();
        audio.bgStop();
        if (!audio.ctx) {
            audio.init();
            audio.warmUp();
        }
        if (audio.ctx.state === 'suspended') await audio.ctx.resume();
        await audio.warmUp();

        const bpm = rcGameState._bpm || 60;
        const beatSec = 60 / bpm;
        const beatMs = beatSec * 1000;
        const { taps, totalBeats } = parseRhythmTaps(card.label);
        const btn = document.getElementById('rcDetailPreviewBtn');
        btn.textContent = '⏸ 停止';

        const now = audio.ctx.currentTime;
        // No prep clicks — start rhythm directly
        const beat0T = now + 0.05;
        taps.forEach(tap => audio.scheduleTick(beat0T + tap * beatSec, tap % 1 === 0));

        const totalBoxes = Math.ceil(totalBeats);
        for (let beat = 0; beat < totalBoxes; beat++) {
            const delay = beat * beatMs;
            const timerId = setTimeout(() => {
                const boxIdx = beat % 4;
                document.querySelectorAll('#rcPreviewBeats .rc-beat-box').forEach((el, idx) => {
                    el.classList.toggle('active', idx === boxIdx);
                });
            }, delay);
            rcGameState._previewTimers.push(timerId);
        }

        const endId = setTimeout(() => {
            document.querySelectorAll('#rcPreviewBeats .rc-beat-box').forEach(box => box.classList.remove('active'));
            btn.textContent = '▶ 再聽一次';
        }, (totalBoxes + 1) * beatMs);
        rcGameState._previewTimers.push(endId);
    }

    function _rcStopPreview() {
        if (Array.isArray(rcGameState._previewTimers)) {
            rcGameState._previewTimers.forEach(timerId => clearTimeout(timerId));
        }
        rcGameState._previewTimers = [];
        const btn = document.getElementById('rcDetailPreviewBtn');
        if (btn) btn.textContent = '▶ 聆聽節奏';
        document.querySelectorAll('#rcPreviewBeats .rc-beat-box').forEach(box => box.classList.remove('active'));
        // Reset any level-grid preview button
        if (rcGameState._levelPreviewBtn) {
            rcGameState._levelPreviewBtn.textContent = '▶';
            rcGameState._levelPreviewBtn.classList.remove('playing');
            rcGameState._levelPreviewBtn = null;
        }
    }

    async function _rcPlayLevelPreview(card, btn) {
        _rcStopPreview();
        if (!audio.ctx) { audio.init(); audio.warmUp(); }
        if (audio.ctx.state === 'suspended') await audio.ctx.resume();
        await audio.warmUp();

        const bpm = [75, 70, 65, 60][card.level - 1] || 65;
        const beatSec = 60 / bpm;
        const beatMs = beatSec * 1000;
        const { taps, totalBeats } = parseRhythmTaps(card.label);

        btn.textContent = '⏸';
        btn.classList.add('playing');
        rcGameState._levelPreviewBtn = btn;
        rcGameState._previewTimers = [];

        const now = audio.ctx.currentTime;
        // No prep clicks — start rhythm directly
        const beat0T = now + 0.05;
        taps.forEach(tap => audio.scheduleTick(beat0T + tap * beatSec, tap % 1 === 0));

        const endMs = Math.ceil(totalBeats) * beatMs;
        const endId = setTimeout(() => {
            btn.textContent = '▶';
            btn.classList.remove('playing');
            rcGameState._levelPreviewBtn = null;
        }, endMs);
        rcGameState._previewTimers.push(endId);
    }

    function showRCReadPhase(card, bpm, user) {
        _rcStopPreview();
        switchScreen('screen-rc-game');

        const msgEl = document.getElementById('rcMessageOverlay');
        if (msgEl) msgEl.style.display = 'none';

        const canvas    = document.getElementById('rcGameCanvas');
        const wrap      = canvas.parentElement;
        const overlay   = document.getElementById('rcReadOverlay');
        const vfDiv     = document.getElementById('rcOsmdContainer');

        const bars = card.bars && card.bars.length ? card.bars : [card.label || ''];

        // Back button during read phase
        document.getElementById('rcGameExit').onclick = () => {
            _rcStopPreview();
            if (vfDiv) { vfDiv.style.display = 'none'; vfDiv.innerHTML = ''; }
            canvas.style.display = '';
            wrap.style.overflowY = '';
            wrap.style.maxHeight = '';
            wrap.style.minHeight = '';
            wrap.style.webkitOverflowScrolling = '';
            overlay.style.display = 'none';
            audio.bgPlay();
            switchScreen('screen-rc-levels');
        };

        // Try VexFlow first; fall back to canvas if library not loaded
        const useVF = typeof VexFlow !== 'undefined' && vfDiv;

        if (useVF) {
            canvas.style.display = 'none';
            vfDiv.style.display = '';
            vfDiv.innerHTML = '';

            wrap.style.overflowY = 'auto';
            wrap.style.maxHeight = 'none';
            wrap.style.webkitOverflowScrolling = 'touch';

            // Delay render to ensure container has layout dimensions
            requestAnimationFrame(() => {
                try {
                    _renderVexFlowBars(bars, vfDiv);
                } catch (err) {
                    console.warn('VexFlow render failed, falling back to canvas:', err);
                    vfDiv.style.display = 'none';
                    _fallbackCanvasPreview(bars, canvas, wrap);
                }
            });
        } else {
            _fallbackCanvasPreview(bars, canvas, wrap);
        }

        overlay.style.display = '';
        document.getElementById('rcReadStartBtn').onclick = () => {
            overlay.style.display = 'none';
            if (vfDiv) { vfDiv.style.display = 'none'; vfDiv.innerHTML = ''; }
            canvas.style.display = '';
            wrap.style.overflowY = '';
            wrap.style.maxHeight = '';
            wrap.style.minHeight = '';
            wrap.style.webkitOverflowScrolling = '';
            canvas.style.width  = '';
            canvas.style.height = '';
            startRCGame(card, bpm, user);
        };
    }

    function _fallbackCanvasPreview(bars, canvas, wrap) {
        canvas.style.display = '';
        const screenH = window.innerHeight;
        const canvasAvailH = Math.round(screenH * 0.72);
        const idealROW_H = Math.floor((canvasAvailH - 60) / bars.length);
        const ROW_H = Math.max(124, Math.min(180, idealROW_H));
        const previewH = bars.length * ROW_H + 72;

        wrap.style.overflowY = 'auto';
        wrap.style.maxHeight = 'none';
        wrap.style.minHeight = Math.min(previewH, canvasAvailH) + 'px';
        wrap.style.webkitOverflowScrolling = 'touch';

        const dpr = window.devicePixelRatio || 1;
        const logW = wrap.clientWidth || 360;
        canvas.width  = logW * dpr;
        canvas.height = previewH * dpr;
        canvas.style.width  = logW + 'px';
        canvas.style.height = previewH + 'px';
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        _rcDrawAllBarsPreview(bars, logW, previewH, ctx);
    }

    /* ── VexFlow renderer for Kodály rhythm bars ── */
    function _renderVexFlowBars(bars, container) {
        const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Annotation, Stem, Dot } = VexFlow;

        container.innerHTML = '';

        const W = container.clientWidth || 360;
        const STAVE_W = W - 20;
        const STAVE_H = 110;
        const totalH = bars.length * STAVE_H + 20;

        const renderer = new Renderer(container, Renderer.Backends.SVG);
        renderer.resize(W, totalH);
        const context = renderer.getContext();

        const durMap = {
            0.25: '16',
            0.5:  '8',
            0.75: '8',
            1:    'q',
            1.5:  'q',
            2:    'h',
            3:    'h',
        };
        const dotSet3 = new Set([0.75, 1.5, 3]);

        bars.forEach((barLabel, bi) => {
            const y = bi * STAVE_H + 10;
            const stave = new Stave(10, y, STAVE_W - 10);
            [0, 1, 3, 4].forEach(line => stave.setConfigForLine(line, { visible: false }));
            if (bi === 0) stave.addTimeSignature('4/4');
            stave.setContext(context).draw();

            const notes = [];
            const beamGroups = [];
            let eighthRun = [];
            const flushEighthRun = () => { if (eighthRun.length > 1) beamGroups.push([...eighthRun]); eighthRun = []; };

            barLabel.split(' ').forEach(token => {
                const isRest = token === '休';
                const compound = COMPOUND_TOKENS[token];

                if (isRest) {
                    flushEighthRun();
                    const note = new StaveNote({ keys: ['b/4'], duration: 'qr' });
                    note.addModifier(new Annotation('休止')
                        .setVerticalJustification(3));
                    notes.push(note);
                } else if (compound) {
                    flushEighthRun();
                    const group = [];
                    compound.forEach(sub => {
                        const dur = durMap[sub.d];
                        if (!dur) return;
                        const note = new StaveNote({
                            keys: ['b/4'],
                            duration: dur,
                            stemDirection: Stem.UP
                        });
                        if (dotSet3.has(sub.d)) Dot.buildAndAttach([note], { all: true });
                        note.addModifier(new Annotation(sub.l)
                            .setVerticalJustification(3));
                        notes.push(note);
                        group.push(note);
                    });
                    if (group.length > 1) beamGroups.push(group);
                } else {
                    const tokenDur = getRhythmTokenDuration(token);
                    const dur = durMap[tokenDur];
                    if (!dur) return;
                    const note = new StaveNote({
                        keys: ['b/4'],
                        duration: dur,
                        stemDirection: Stem.UP
                    });
                    if (dotSet3.has(tokenDur)) Dot.buildAndAttach([note], { all: true });
                    note.addModifier(new Annotation(token)
                        .setVerticalJustification(3));
                    notes.push(note);
                    if (dur === '8') { eighthRun.push(note); } else { flushEighthRun(); }
                }
            });
            flushEighthRun();

            const voice = new Voice({ numBeats: 4, beatValue: 4 });
            voice.setMode(2); // SOFT mode — allow incomplete bars
            voice.addTickables(notes);

            new Formatter().joinVoices([voice]).format([voice], STAVE_W - 60);
            const beams = beamGroups.map(g => new Beam(g));
            voice.draw(context, stave);
            beams.forEach(b => b.setContext(context).draw());
        });
    }

    /* ── VexFlow renderer for game-phase (single bar + scanner) ── */
    function _renderVexFlowGameBar(barLabel, container) {
        const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Annotation, Stem, Dot } = VexFlow;
        container.innerHTML = '';

        const W = container.clientWidth || 360;
        const STAVE_H = 140;
        const PAD_LEFT = 10, PAD_RIGHT = 10;
        const STAVE_W = W - PAD_LEFT - PAD_RIGHT;

        const renderer = new Renderer(container, Renderer.Backends.SVG);
        renderer.resize(W, STAVE_H);
        const context = renderer.getContext();

        const stave = new Stave(PAD_LEFT, 10, STAVE_W);
        [0, 1, 3, 4].forEach(line => stave.setConfigForLine(line, { visible: false }));
        stave.addTimeSignature('4/4');
        stave.setContext(context).draw();

        const durMap = { 0.25: '16', 0.5: '8', 0.75: '8', 1: 'q', 1.5: 'q', 2: 'h', 3: 'h' };
        const dotSet = new Set([0.75, 1.5, 3]);
        const vfNotes = [];
        const beamGroups = [];
        // Map: vfNotes index → array of game-note indices (for coloring)
        const vfToGame = [];
        let gameNoteIdx = 0;
        let eighthRun = [];
        const flushEighthRun = () => { if (eighthRun.length > 1) beamGroups.push([...eighthRun]); eighthRun = []; };

        barLabel.split(' ').forEach(token => {
            const isRest = token === '休';
            const compound = COMPOUND_TOKENS[token];

            if (isRest) {
                flushEighthRun();
                const note = new StaveNote({ keys: ['b/4'], duration: 'qr' });
                note.addModifier(new Annotation('休止').setVerticalJustification(3));
                vfNotes.push(note);
                vfToGame.push([]); // no game note for rests
            } else if (compound) {
                flushEighthRun();
                const group = [];
                compound.forEach(sub => {
                    const dur = durMap[sub.d];
                    if (!dur) return;
                    const note = new StaveNote({ keys: ['b/4'], duration: dur, stemDirection: Stem.UP });
                    if (dotSet.has(sub.d)) Dot.buildAndAttach([note], { all: true });
                    note.addModifier(new Annotation(sub.l).setVerticalJustification(3));
                    vfNotes.push(note);
                    group.push(note);
                    vfToGame.push([gameNoteIdx]);
                    gameNoteIdx++;
                });
                if (group.length > 1) beamGroups.push(group);
            } else {
                const tokenDur = getRhythmTokenDuration(token);
                const dur = durMap[tokenDur];
                if (!dur) return;
                const note = new StaveNote({ keys: ['b/4'], duration: dur, stemDirection: Stem.UP });
                if (dotSet.has(tokenDur)) Dot.buildAndAttach([note], { all: true });
                note.addModifier(new Annotation(token).setVerticalJustification(3));
                vfNotes.push(note);
                vfToGame.push([gameNoteIdx]);
                gameNoteIdx++;
                if (dur === '8') { eighthRun.push(note); } else { flushEighthRun(); }
            }
        });
        flushEighthRun();

        const voice = new Voice({ numBeats: 4, beatValue: 4 });
        voice.setMode(2);
        voice.addTickables(vfNotes);
        new Formatter().joinVoices([voice]).format([voice], STAVE_W - 60);
        const beams = beamGroups.map(g => new Beam(g));
        voice.draw(context, stave);
        beams.forEach(b => b.setContext(context).draw());

        // Collect SVG elements and X positions
        const noteStartX = stave.getNoteStartX();
        const noteEndX = stave.getNoteEndX();
        const noteMap = []; // indexed by game-note index → {x, svgEl}
        vfNotes.forEach((vfNote, vi) => {
            const gameIndices = vfToGame[vi];
            if (!gameIndices || !gameIndices.length) return;
            const x = vfNote.getAbsoluteX();
            const el = vfNote.getSVGElement ? vfNote.getSVGElement() : (vfNote.attrs && vfNote.attrs.el);
            gameIndices.forEach(gi => {
                noteMap[gi] = { x, el };
            });
        });

        return { noteStartX, noteEndX, noteMap, staveH: STAVE_H };
    }

    /* ── Color a VexFlow SVG note element ── */
    function _vfColorNote(svgEl, color, opacity) {
        if (!svgEl) return;
        svgEl.querySelectorAll('path, rect, ellipse, line, circle, polygon').forEach(p => {
            p.setAttribute('fill', color);
            p.setAttribute('stroke', color);
        });
        svgEl.querySelectorAll('text').forEach(t => {
            t.setAttribute('fill', color);
        });
        if (opacity !== undefined) svgEl.style.opacity = opacity;
    }

    function _rcDrawAllBarsPreview(bars, W, totalH, ctx) {
        const n       = bars.length;
        const ROW_H   = (totalH - 28) / n;
        const headRx  = 10, headRy = 7;
        const stemH   = 42;
        const beamThick = 4.5, beamGap = 8;
        const barBeats = 4;
        const LABEL_W  = 48;
        const laneLeft  = LABEL_W;
        const laneRight = W - 16;
        const laneWidth = laneRight - laneLeft;

        // ── Background with soft gradient ──
        const bgGrad = ctx.createLinearGradient(0, 0, 0, totalH);
        bgGrad.addColorStop(0, '#F8FAFF');
        bgGrad.addColorStop(0.5, '#F0F4FF');
        bgGrad.addColorStop(1, '#E8EEFF');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, totalH);

        // Subtle decorative dots in background
        ctx.globalAlpha = 0.04;
        for (let dx = 0; dx < W; dx += 24) {
            for (let dy = 0; dy < totalH; dy += 24) {
                ctx.fillStyle = '#6366F1';
                ctx.beginPath();
                ctx.arc(dx, dy, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;

        // ── Title banner ──
        const titleY = 2;
        const titleH = 22;
        // Title pill background
        const titleText = '📖 先看清楚節奏';
        ctx.font = '900 13px Nunito, sans-serif';
        const titleW = ctx.measureText(titleText).width + 28;
        ctx.fillStyle = 'rgba(99,102,241,0.08)';
        _roundRect(ctx, W / 2 - titleW / 2, titleY, titleW, titleH, 11);
        ctx.fill();
        ctx.strokeStyle = 'rgba(99,102,241,0.15)';
        ctx.lineWidth = 1;
        _roundRect(ctx, W / 2 - titleW / 2, titleY, titleW, titleH, 11);
        ctx.stroke();
        // Title text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(99,102,241,0.7)';
        ctx.fillText(titleText, W / 2, titleY + titleH / 2);

        bars.forEach((barLabel, bi) => {
            const rowTop = 28 + bi * ROW_H;
            const staffY = rowTop + ROW_H * 0.48;
            const beatX  = b => laneLeft + ((b + 0.5) / barBeats) * laneWidth;

            // ── Row card background ──
            const cardPad = 6;
            const cardY = rowTop + 1;
            const cardH = ROW_H - 4;
            // White card with rounded corners
            ctx.shadowColor = 'rgba(99,102,241,0.08)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 3;
            ctx.fillStyle = bi % 2 === 0 ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.6)';
            _roundRect(ctx, laneLeft - cardPad - 2, cardY, laneWidth + cardPad * 2 + 4, cardH, 12);
            ctx.fill();
            // Card border
            ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
            ctx.strokeStyle = bi === 0 ? 'rgba(255,140,66,0.18)' : 'rgba(99,102,241,0.10)';
            ctx.lineWidth = 1.2;
            _roundRect(ctx, laneLeft - cardPad - 2, cardY, laneWidth + cardPad * 2 + 4, cardH, 12);
            ctx.stroke();

            // ── Bar number badge (pill) ──
            ctx.textAlign  = 'center';
            ctx.textBaseline = 'middle';
            const badgeCX = laneLeft / 2;
            const badgeCY = staffY - 10;
            const badgeW = 28, badgeH = 38, badgeR = 10;
            // Badge background
            const badgeGrad = ctx.createLinearGradient(badgeCX, badgeCY - badgeH / 2, badgeCX, badgeCY + badgeH / 2);
            if (bi === 0) {
                badgeGrad.addColorStop(0, 'rgba(255,160,80,0.22)');
                badgeGrad.addColorStop(1, 'rgba(255,120,50,0.12)');
            } else {
                badgeGrad.addColorStop(0, 'rgba(99,102,241,0.12)');
                badgeGrad.addColorStop(1, 'rgba(99,102,241,0.06)');
            }
            ctx.fillStyle = badgeGrad;
            _roundRect(ctx, badgeCX - badgeW / 2, badgeCY - badgeH / 2, badgeW, badgeH, badgeR);
            ctx.fill();
            ctx.strokeStyle = bi === 0 ? 'rgba(255,140,66,0.30)' : 'rgba(99,102,241,0.15)';
            ctx.lineWidth = 1;
            _roundRect(ctx, badgeCX - badgeW / 2, badgeCY - badgeH / 2, badgeW, badgeH, badgeR);
            ctx.stroke();
            // Number
            ctx.font = '900 15px Nunito, sans-serif';
            ctx.fillStyle = bi === 0 ? 'rgba(255,120,40,0.9)' : 'rgba(99,102,241,0.65)';
            ctx.fillText(String(bi + 1), badgeCX, badgeCY - 6);
            // "小節" label
            ctx.font = '800 8px Nunito, sans-serif';
            ctx.fillStyle = bi === 0 ? 'rgba(255,140,66,0.55)' : 'rgba(99,102,241,0.35)';
            ctx.fillText('小節', badgeCX, badgeCY + 11);

            // ── Staff line (thicker, subtle gradient illusion) ──
            ctx.strokeStyle = 'rgba(0,0,0,0.12)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(laneLeft - 2, staffY);
            ctx.lineTo(laneRight + 2, staffY);
            ctx.stroke();

            // ── Beat grid + count labels ──
            for (let b = 0; b < barBeats; b++) {
                const x = laneLeft + (b / barBeats) * laneWidth;
                // Beat separator line
                if (b === 0) {
                    ctx.strokeStyle = 'rgba(255,140,66,0.35)';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([]);
                } else {
                    ctx.strokeStyle = 'rgba(99,102,241,0.08)';
                    ctx.lineWidth = 0.8;
                    ctx.setLineDash([4, 5]);
                }
                ctx.beginPath();
                ctx.moveTo(x, staffY - stemH - 8);
                ctx.lineTo(x, staffY + 36);
                ctx.stroke();
                ctx.setLineDash([]);

                // Beat number pill
                const numCX = x + (laneWidth / barBeats) / 2;
                const numY = staffY - stemH - 14;
                const numPW = 20, numPH = 16, numPR = 5;
                ctx.fillStyle = b === 0 ? 'rgba(255,140,66,0.12)' : 'rgba(59,130,246,0.07)';
                _roundRect(ctx, numCX - numPW / 2, numY - numPH / 2, numPW, numPH, numPR);
                ctx.fill();
                ctx.textAlign    = 'center';
                ctx.textBaseline = 'middle';
                ctx.font      = '900 13px Nunito, sans-serif';
                ctx.fillStyle = b === 0 ? 'rgba(255,140,66,0.8)' : 'rgba(59,130,246,0.55)';
                ctx.fillText(b + 1, numCX, numY);
            }
            // End barline
            ctx.strokeStyle = 'rgba(0,0,0,0.12)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(laneRight, staffY - stemH - 8);
            ctx.lineTo(laneRight, staffY + 36);
            ctx.stroke();

            // ── Parse bar ──
            const { units, segments } = parseRhythmUnits(barLabel);

            // ── Rests (refined sleeping character) ──
            segments.filter(s => s.isRest).forEach(s => {
                const cx = beatX(s.start);
                const rR = 15;
                ctx.globalAlpha = 0.8;
                // Shadow
                ctx.shadowColor = 'rgba(100,116,139,0.2)';
                ctx.shadowBlur = 8;
                // Rest body
                ctx.fillStyle = '#B8C4D0';
                ctx.beginPath(); ctx.arc(cx, staffY, rR, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
                // Night cap
                ctx.fillStyle = '#8B95A5';
                ctx.beginPath();
                ctx.moveTo(cx - 6, staffY - rR + 2);
                ctx.lineTo(cx + 9, staffY - rR - 7);
                ctx.lineTo(cx + 5, staffY - rR + 4);
                ctx.closePath(); ctx.fill();
                // Cap ball
                ctx.fillStyle = '#FFD700';
                ctx.beginPath(); ctx.arc(cx + 9, staffY - rR - 7, 2.5, 0, Math.PI * 2); ctx.fill();
                // Sleeping eyes
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(cx - 6, staffY - 2); ctx.lineTo(cx - 1, staffY - 2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx + 1, staffY - 2); ctx.lineTo(cx + 6, staffY - 2); ctx.stroke();
                // Blush
                ctx.fillStyle = 'rgba(255,150,150,0.30)';
                ctx.beginPath(); ctx.arc(cx - 7, staffY + 3, 3.5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(cx + 7, staffY + 3, 3.5, 0, Math.PI * 2); ctx.fill();
                // Zzz
                ctx.fillStyle = 'rgba(107,114,128,0.55)';
                ctx.font = '800 11px Nunito'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
                ctx.fillText('z', cx + rR + 2, staffY - 4);
                ctx.font = '800 9px Nunito';
                ctx.fillText('z', cx + rR + 7, staffY - 10);
                ctx.font = '800 7px Nunito';
                ctx.fillText('z', cx + rR + 11, staffY - 15);
                // Label
                ctx.textAlign = 'center';
                ctx.font = '800 10px Nunito, sans-serif';
                ctx.fillStyle = 'rgba(100,116,139,0.6)';
                ctx.textBaseline = 'top';
                ctx.fillText('休止', cx, staffY + 16);
                ctx.globalAlpha = 1;
            });

            // ── Group notes by segment, split at beat boundaries ──
            const rawBySegment = {};
            units.forEach(u => {
                if (!rawBySegment[u.segmentIndex]) rawBySegment[u.segmentIndex] = [];
                rawBySegment[u.segmentIndex].push(u);
            });
            const segGroups = [];
            Object.values(rawBySegment).forEach(group => {
                group.sort((a, b) => a.beatPos - b.beatPos);
                let curBeat = Math.floor(group[0].beatPos + 0.001);
                let sub = [];
                group.forEach(note => {
                    const nb = Math.floor(note.beatPos + 0.001);
                    if (nb !== curBeat && sub.length > 0) { segGroups.push(sub); sub = []; curBeat = nb; }
                    sub.push(note);
                });
                if (sub.length > 0) segGroups.push(sub);
            });

            const NC = '#1E293B';
            segGroups.forEach(group => {
                const isBeamed = group.length > 1;

                group.forEach(note => {
                    const cx  = beatX(note.beatPos);
                    const dur = note.durationBeats;
                    const filled = dur <= 1;

                    // Notehead with shadow
                    ctx.shadowColor = 'rgba(30,41,59,0.14)';
                    ctx.shadowBlur  = 7;
                    ctx.save();
                    ctx.translate(cx, staffY);
                    ctx.rotate(-0.18);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, headRx, headRy, 0, 0, Math.PI * 2);
                    if (filled) { ctx.fillStyle = NC; ctx.fill(); }
                    else { ctx.strokeStyle = NC; ctx.lineWidth = 2.8; ctx.stroke(); }
                    ctx.restore();
                    ctx.shadowBlur = 0;

                    // Augmentation dot
                    if (dur === 0.75 || dur === 1.5 || dur === 3) {
                        ctx.beginPath();
                        ctx.arc(cx + headRx + 6, staffY - 2, 3, 0, Math.PI * 2);
                        ctx.fillStyle = NC; ctx.fill();
                    }

                    // Stem
                    if (dur < 4) {
                        const stemX = cx + headRx - 1;
                        ctx.strokeStyle = NC; ctx.lineWidth = 2.2;
                        ctx.beginPath();
                        ctx.moveTo(stemX, staffY - headRy + 2);
                        ctx.lineTo(stemX, staffY - stemH);
                        ctx.stroke();
                        // Isolated flag (8th / dotted-8th)
                        if (!isBeamed && (dur === 0.5 || dur === 0.75)) {
                            ctx.lineWidth = 2.2;
                            ctx.beginPath();
                            ctx.moveTo(stemX, staffY - stemH);
                            ctx.bezierCurveTo(stemX + 9, staffY - stemH + 6, stemX + 15, staffY - stemH + 14, stemX + 6, staffY - stemH + 24);
                            ctx.stroke();
                        }
                        // Double flag (16th)
                        if (!isBeamed && dur === 0.25) {
                            ctx.lineWidth = 2.2;
                            for (let f = 0; f < 2; f++) {
                                const fy = staffY - stemH + f * beamGap;
                                ctx.beginPath();
                                ctx.moveTo(stemX, fy);
                                ctx.bezierCurveTo(stemX + 9, fy + 6, stemX + 15, fy + 14, stemX + 6, fy + 24);
                                ctx.stroke();
                            }
                        }
                    }

                    // ── Kodály label (with pill background) ──
                    const labelY = staffY + 14;
                    const labelText = note.label;
                    ctx.font = '900 11.5px Nunito, sans-serif';
                    const lbW = ctx.measureText(labelText).width + 10;
                    const lbH = 16;
                    ctx.fillStyle = 'rgba(180,140,80,0.10)';
                    _roundRect(ctx, cx - lbW / 2, labelY - 2, lbW, lbH, 5);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(120,80,40,0.88)';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(labelText, cx, labelY);

                    // Beat value
                    const vt = dur===0.25?'¼拍':dur===0.5?'½拍':dur===0.75?'¾拍':dur===1?'1拍':dur===1.5?'1½拍':dur===2?'2拍':dur===3?'3拍':`${dur}拍`;
                    ctx.font = '700 9px Nunito, sans-serif';
                    ctx.fillStyle = 'rgba(100,80,60,0.30)';
                    ctx.fillText(vt, cx, staffY + 30);
                });

                // ── Beams ──
                if (isBeamed && group.length > 1) {
                    const x1 = beatX(group[0].beatPos) + headRx - 1;
                    const x2 = beatX(group[group.length - 1].beatPos) + headRx - 1;
                    const bY  = staffY - stemH;
                    ctx.fillStyle = NC;
                    // Primary beam with rounded ends
                    _roundRect(ctx, x1, bY, x2 - x1, beamThick, 2);
                    ctx.fill();
                    // Secondary beam (16ths)
                    let si = 0;
                    while (si < group.length) {
                        if (group[si].durationBeats <= 0.25) {
                            let sj = si;
                            while (sj < group.length && group[sj].durationBeats <= 0.25) sj++;
                            if (sj - si >= 2) {
                                const rx1 = beatX(group[si].beatPos) + headRx - 1;
                                const rx2 = beatX(group[sj-1].beatPos) + headRx - 1;
                                _roundRect(ctx, rx1, bY + beamGap, rx2 - rx1, beamThick, 2);
                                ctx.fill();
                            } else {
                                const sx = beatX(group[si].beatPos) + headRx - 1;
                                if (si > 0) { _roundRect(ctx, sx - 12, bY + beamGap, 12, beamThick, 2); ctx.fill(); }
                                else { _roundRect(ctx, sx, bY + beamGap, 12, beamThick, 2); ctx.fill(); }
                            }
                            si = sj;
                        } else { si++; }
                    }
                }
            });

            // ── Row separator line between bars ──
            if (bi < n - 1) {
                const sepY = rowTop + ROW_H - 1;
                ctx.strokeStyle = 'rgba(99,102,241,0.06)';
                ctx.lineWidth = 1;
                ctx.setLineDash([6, 6]);
                ctx.beginPath();
                ctx.moveTo(laneLeft + 10, sepY);
                ctx.lineTo(laneRight - 10, sepY);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        });
    }

    // Rounded rectangle helper
    function _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
    }

    function startRCGame(card, bpm, user) {
        _rcStopPreview();
        audio.init();
        audio.warmUp();
        audio.bgStop();
        if (!audio.ctx) return;
        if (audio.ctx.state === 'suspended') audio.ctx.resume();

        const beatSec = 60 / bpm;
        const beatMs = beatSec * 1000;

        // Multi-bar mode: card.bars = [label0, label1, label2, label3]
        let segments, totalBeats, barsSegments = null;
        const notes = [];
        if (card.bars && card.bars.length) {
            const barsData = card.bars.map(lbl => parseRhythmUnits(lbl));
            totalBeats   = 4; // each bar is always 4 beats
            segments     = barsData[0].segments;
            barsSegments = barsData.map(b => b.segments);
            let beatOffset = 0;
            barsData.forEach((barData, rep) => {
                barData.units.forEach(unit => {
                    notes.push({
                        beatPos:       unit.beatPos + beatOffset,
                        localBeatPos:  unit.beatPos,
                        durationBeats: unit.durationBeats,
                        label:         unit.label,
                        segmentIndex:  unit.segmentIndex,
                        repIndex:      rep,
                        state:         'waiting',
                        judgment:      null,
                    });
                });
                beatOffset += barData.totalBeats;
            });
        } else {
            const parsed = parseRhythmUnits(card.label);
            segments  = parsed.segments;
            totalBeats = parsed.totalBeats;
            for (let rep = 0; rep < REPS; rep++) {
                parsed.units.forEach(unit => {
                    notes.push({
                        beatPos:       unit.beatPos + rep * totalBeats,
                        localBeatPos:  unit.beatPos,
                        durationBeats: unit.durationBeats,
                        label:         unit.label,
                        segmentIndex:  unit.segmentIndex,
                        repIndex:      rep,
                        state:         'waiting',
                        judgment:      null,
                    });
                });
            }
        }

        const totalGameBeats = totalBeats * REPS;
        const nowAudio = audio.ctx.currentTime;
        const PREP_BEATS = 4;  // 4 prep beats for countdown
        const beat0T = nowAudio + PREP_BEATS * beatSec + 0.05;
        const perfZero = performance.now() + (beat0T - audio.ctx.currentTime) * 1000;

        // Schedule prep ticks (countdown)
        for (let pb = 0; pb < PREP_BEATS; pb++) {
            audio.scheduleTick(nowAudio + 0.05 + pb * beatSec, pb === 0);
        }
        // Schedule game ticks
        for (let beat = 0; beat < Math.ceil(totalGameBeats) + 3; beat++) {
            audio.scheduleTick(beat0T + beat * beatSec, beat % 4 === 0);
        }

        _rcRemoveGameKeyHandler();
        const keyHandler = (e) => {
            if (e.code !== 'Space') return;
            if (!document.getElementById('screen-rc-game').classList.contains('active')) return;
            e.preventDefault();
            if (rcGameState.phase === 'paused') _rcTogglePause();
            else onRCHit();
        };
        document.addEventListener('keydown', keyHandler);

        rcGameState = {
            ...rcGameState,
            _user: user,
            _card: card,
            _bpm: bpm,
            _previewTimers: [],
            _keyHandler: keyHandler,
            beatMs,
            beatSec,
            notes,
            segments,
            barsSegments,
            barBeats: totalBeats,
            totalGameBeats,
            perfZero,
            score: 0,
            combo: 0,
            maxCombo: 0,
            counts: { perfect: 0, great: 0, good: 0, miss: 0 },
            phase: 'countdown',
            animId: null,
            _prepBeats: PREP_BEATS,
            _lastBeatBox: -1,
            _lastRepIndex: -1,
            _activeSegmentIndex: -1,
            _judgeTimer: null,
        };

        document.getElementById('rcGameTitle').textContent = card.num
            ? `節奏卡 No.${card.num}`
            : '節奏挑戰';
        document.getElementById('rcGameBpm').textContent = `${bpm} BPM`;
        document.getElementById('rcGameScore').textContent = '0';
        document.getElementById('rcComboDisplay').textContent = '';
        document.getElementById('rcProgressFill').style.width = '0%';
        document.getElementById('rcPauseOverlay').style.display = 'none';
        document.getElementById('rcMessageOverlay').textContent = '';
        document.getElementById('rcMessageOverlay').style.display = 'none';
        document.getElementById('rcGamePattern').textContent = card.bars ? card.bars[0] : card.label;
        document.getElementById('rcGameRep').textContent = card.bars ? `小節 1 / ${REPS}` : `第 1 / ${REPS} 次`;

        // Show next-bar preview (shows bar[1] at game start so students can read ahead)
        const nextBarStrip = document.getElementById('rcNextBarStrip');
        const nextBarPat   = document.getElementById('rcNextBarPattern');
        if (nextBarStrip && nextBarPat) {
            if (card.bars && card.bars.length > 1) {
                nextBarPat.textContent = card.bars[1];
                nextBarStrip.style.display = '';
            } else {
                nextBarStrip.style.display = 'none';
            }
        }
        document.getElementById('rcMetronomeText').textContent = '跟着節拍器';
        const metroArm = document.getElementById('rcMetroArm');
        if (metroArm) metroArm.className = 'rc-metro-arm';
        _rcRenderGameTokens(card);
        document.querySelectorAll('#rcGameTokenRow .rc-game-token').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('#rcGameBeats .rc-beat-box').forEach(box => box.classList.remove('active'));

        document.getElementById('rcHitPad').onclick = onRCHit;
        document.getElementById('rcGameExit').onclick = () => _rcTogglePause();
        document.getElementById('rcResumeBtn').onclick = () => _rcTogglePause();
        document.getElementById('rcPauseExitBtn').onclick = () => _rcExitGame();

        switchScreen('screen-rc-game');

        // Show countdown overlay (visual only — does NOT control phase transition)
        _rcShowCountdown(PREP_BEATS, beatMs, () => { /* overlay removed */ });

        // Set phase='playing' based on audio clock, WIN_GOOD ms early so the
        // first note's early-tap window is fully open when beat 0 arrives.
        const msUntilBeat0 = perfZero - performance.now();
        const msUntilPlay  = Math.max(0, msUntilBeat0 - WIN_GOOD);
        rcGameState._startTimer = setTimeout(() => {
            if (rcGameState.phase === 'countdown') rcGameState.phase = 'playing';
            // Show GO! exactly when tapping is allowed
            const msgEl = document.getElementById('rcMessageOverlay');
            if (msgEl) {
                msgEl.textContent = '🥁 GO!';
                msgEl.style.display = '';
                setTimeout(() => { if (msgEl) msgEl.style.display = 'none'; }, WIN_GOOD * 2 + 80);
            }
        }, msUntilPlay);

        const canvas = document.getElementById('rcGameCanvas');
        const wrap = canvas.parentElement;
        const vfDiv = document.getElementById('rcOsmdContainer');
        const useVF = typeof VexFlow !== 'undefined' && vfDiv;

        if (useVF) {
            canvas.style.display = 'none';
            vfDiv.style.display = '';
            vfDiv.innerHTML = '';
            wrap.style.overflowY = 'hidden';

            // Create scanner line
            let scanner = wrap.querySelector('.rc-scanner');
            if (!scanner) {
                scanner = document.createElement('div');
                scanner.className = 'rc-scanner';
                wrap.appendChild(scanner);
            }
            scanner.style.display = '';

            // Render first bar
            const firstBarLabel = card.bars && card.bars.length ? card.bars[0] : card.label;
            try {
                const vfData = _renderVexFlowGameBar(firstBarLabel, vfDiv);
                rcGameState._vf = true;
                rcGameState._vfDiv = vfDiv;
                rcGameState._scanner = scanner;
                rcGameState._vfNoteStartX = vfData.noteStartX;
                rcGameState._vfNoteEndX = vfData.noteEndX;
                rcGameState._vfNoteMap = vfData.noteMap;
                rcGameState._vfStaveH = vfData.staveH;
                scanner.style.height = vfData.staveH + 'px';
            } catch (err) {
                console.warn('VexFlow game render failed, falling back to canvas:', err);
                vfDiv.style.display = 'none';
                scanner.style.display = 'none';
                canvas.style.display = '';
                rcGameState._vf = false;
                canvas.width = wrap.clientWidth || 360;
                canvas.height = wrap.clientHeight || 300;
                rcGameState.canvas = canvas;
                rcGameState.ctx = canvas.getContext('2d');
            }
        } else {
            rcGameState._vf = false;
            canvas.width = wrap.clientWidth || 360;
            canvas.height = wrap.clientHeight || 300;
            rcGameState.canvas = canvas;
            rcGameState.ctx = canvas.getContext('2d');
        }

        rcGameState.animId = requestAnimationFrame(_rcGameLoop);
    }

    // Countdown overlay for RC game
    function _rcShowCountdown(beats, beatMs, onDone) {
        const wrap = document.querySelector('.rc-canvas-wrap');
        if (!wrap) { onDone(); return; }
        let overlay = wrap.querySelector('.rc-countdown-overlay');
        if (overlay) overlay.remove();
        overlay = document.createElement('div');
        overlay.className = 'rc-countdown-overlay';
        overlay.innerHTML = `<div class="rc-countdown-label">預備</div><div class="rc-countdown-num" id="rcCdnNum">${beats}</div>`;
        wrap.appendChild(overlay);
        let count = beats;
        const numEl = overlay.querySelector('.rc-countdown-num');
        function tick() {
            if (count <= 0) {
                // Remove overlay immediately on beat 0 so canvas is fully visible
                overlay.remove();
                onDone();
                return;
            }
            numEl.textContent = count;
            numEl.style.animation = 'none';
            void numEl.offsetWidth;
            numEl.style.animation = 'rcCountPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
            count--;
            setTimeout(tick, beatMs);
        }
        tick();
    }

    function _rcGameLoop() {
        if (rcGameState._vf) { _rcGameLoopVF(); return; }
        _rcGameLoopCanvas();
    }

    /* ── VexFlow game loop: scanner + SVG coloring ── */
    function _rcGameLoopVF() {
        const { notes, perfZero, beatMs, totalGameBeats, phase, barBeats, segments, barsSegments,
                _scanner, _vfNoteStartX, _vfNoteEndX, _vfNoteMap, _vfDiv } = rcGameState;
        if (!_scanner) return;

        const now = performance.now();
        const elapsed = now - perfZero;
        const currentRepIndex = Math.max(0, Math.min(REPS - 1, Math.floor(Math.max(elapsed, 0) / (barBeats * beatMs || 1))));
        const currentSegments = barsSegments ? barsSegments[currentRepIndex] : segments;
        const repStartMs = currentRepIndex * barBeats * beatMs;
        const repElapsed = elapsed - repStartMs;
        const repProgress = Math.max(0, Math.min(1, repElapsed / (barBeats * beatMs || 1)));

        // Scanner position: interpolate between noteStartX and noteEndX
        const scannerX = _vfNoteStartX + (_vfNoteEndX - _vfNoteStartX) * repProgress;
        _scanner.style.left = scannerX + 'px';

        // ── Miss detection ──
        notes.forEach(note => {
            if (note.state === 'waiting' && elapsed - INPUT_LATENCY_MS > note.beatPos * beatMs + WIN_GOOD) {
                note.state = 'miss';
                note.judgment = 'miss';
                rcGameState.counts.miss++;
                rcGameState.combo = 0;
                document.getElementById('rcComboDisplay').textContent = '';
                _rcShowJudgment('MISS', '#EF4444');
                // Color SVG note red (only if note belongs to current displayed bar)
                if (note.repIndex === currentRepIndex) {
                    const repNoteIdx = _rcLocalNoteIndex(note, notes, currentRepIndex);
                    if (_vfNoteMap[repNoteIdx]) {
                        _vfColorNote(_vfNoteMap[repNoteIdx].el, '#EF4444', 0.45);
                    }
                }
            }
        });

        // ── Bar/rep change: re-render VexFlow for new bar ──
        if (elapsed > 0) {
            const beatIdx = Math.floor(elapsed / beatMs) % 4;
            if (beatIdx !== rcGameState._lastBeatBox) {
                rcGameState._lastBeatBox = beatIdx;
                document.querySelectorAll('#rcGameBeats .rc-beat-box').forEach((box, idx) => {
                    box.classList.toggle('active', idx === beatIdx);
                });
                const arm = document.getElementById('rcMetroArm');
                const text = document.getElementById('rcMetronomeText');
                if (arm) {
                    arm.classList.remove('tick-left', 'tick-right');
                    void arm.offsetWidth;
                    arm.classList.add(beatIdx % 2 === 0 ? 'tick-left' : 'tick-right');
                }
                if (text) text.textContent = beatIdx === 0 ? '強拍！' : `第 ${beatIdx + 1} 拍`;
            }

            const repIndex = Math.min(REPS, currentRepIndex + 1);

            if (currentRepIndex !== rcGameState._lastRepIndex) {
                rcGameState._lastRepIndex = currentRepIndex;
                rcGameState._activeSegmentIndex = -1;

                // Re-render VexFlow for new bar
                const barLabel = barsSegments
                    ? (rcGameState._card.bars ? rcGameState._card.bars[currentRepIndex] : rcGameState._card.label)
                    : rcGameState._card.label;
                try {
                    const vfData = _renderVexFlowGameBar(barLabel, _vfDiv);
                    rcGameState._vfNoteStartX = vfData.noteStartX;
                    rcGameState._vfNoteEndX = vfData.noteEndX;
                    rcGameState._vfNoteMap = vfData.noteMap;
                } catch (err) { console.warn('VexFlow re-render failed:', err); }

                if (barsSegments) {
                    _rcRenderGameTokensFromSegs(barsSegments[currentRepIndex]);
                    document.querySelectorAll('#rcGameTokenRow .rc-game-token').forEach(el => el.classList.remove('active'));
                    const patEl = document.getElementById('rcGamePattern');
                    if (patEl && rcGameState._card.bars) patEl.textContent = rcGameState._card.bars[currentRepIndex];

                    const nextStrip = document.getElementById('rcNextBarStrip');
                    const nextPat   = document.getElementById('rcNextBarPattern');
                    if (nextStrip && nextPat) {
                        const nextIdx = currentRepIndex + 1;
                        if (nextIdx < rcGameState._card.bars.length) {
                            nextPat.textContent = rcGameState._card.bars[nextIdx];
                            nextStrip.style.display = '';
                        } else {
                            nextStrip.style.display = 'none';
                        }
                    }
                }
                document.getElementById('rcGameRep').textContent = barsSegments
                    ? `小節 ${repIndex} / ${REPS}`
                    : `第 ${repIndex} / ${REPS} 次`;
            }

            const beatInBar = (elapsed / beatMs) % barBeats;
            const activeSegmentIndex = currentSegments.findIndex(segment => beatInBar >= segment.start && beatInBar < segment.start + segment.duration);
            if (activeSegmentIndex !== rcGameState._activeSegmentIndex) {
                rcGameState._activeSegmentIndex = activeSegmentIndex;
                document.querySelectorAll('#rcGameTokenRow .rc-game-token').forEach(el => {
                    el.classList.toggle('active', parseInt(el.dataset.segmentIndex || '-1', 10) === activeSegmentIndex);
                });
            }
        }

        if (elapsed > 0 && totalGameBeats > 0) {
            const pct = Math.min(elapsed / (totalGameBeats * beatMs) * 100, 100);
            document.getElementById('rcProgressFill').style.width = pct + '%';
        }

        const allDone = notes.every(note => note.state !== 'waiting');
        const lastBeatMs = notes[notes.length - 1]?.beatPos * beatMs || 0;
        if (phase === 'playing' && allDone && elapsed > lastBeatMs + 800) {
            endRCGame();
            return;
        }

        rcGameState.animId = requestAnimationFrame(_rcGameLoop);
    }

    /* ── Helper: find local note index within current rep ── */
    function _rcLocalNoteIndex(note, notes, currentRepIndex) {
        let idx = 0;
        for (const n of notes) {
            if (n === note) return idx;
            if (n.repIndex === currentRepIndex) idx++;
            if (n.repIndex > currentRepIndex) break;
        }
        return -1;
    }

    /* ── Canvas fallback game loop (original) ── */
    function _rcGameLoopCanvas() {
        const { canvas, ctx, notes, perfZero, beatMs, totalGameBeats, phase, barBeats, segments, barsSegments } = rcGameState;
        if (!ctx || !canvas) return;

        const now = performance.now();
        const elapsed = now - perfZero;
        const width = canvas.width;
        const height = canvas.height;
        const beatCount = Math.max(4, Math.ceil(barBeats));
        const currentRepIndex = Math.max(0, Math.min(REPS - 1, Math.floor(Math.max(elapsed, 0) / (barBeats * beatMs || 1))));
        const currentSegments = barsSegments ? barsSegments[currentRepIndex] : segments;
        const repStartMs = currentRepIndex * barBeats * beatMs;
        const repElapsed = elapsed - repStartMs;
        const repProgress = Math.max(0, Math.min(1, repElapsed / (barBeats * beatMs || 1)));
        const laneLeft = 44;
        const laneRight = width - 44;
        const laneWidth = Math.max(120, laneRight - laneLeft);
        const laneTop = height * 0.28;
        const laneHeight = 120;
        const laneMid = laneTop + laneHeight / 2;
        const playheadX = laneLeft + laneWidth * repProgress;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        const staffY = laneTop + laneHeight * 0.50;
        const headRx = 9, headRy = 6.5;
        const stemH = 42;
        const beamThick = 5;
        const beamGap = 7;

        const beatX = b => laneLeft + (b / barBeats) * laneWidth;

        function beatLabel(pos) {
            const num = Math.floor(pos) + 1;
            const sub = Math.round((pos % 1) * 4);
            if (sub === 0) return String(num);
            if (sub === 1) return 'e';
            if (sub === 2) return '&';
            if (sub === 3) return 'a';
            return '';
        }

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(laneLeft - 4, staffY);
        ctx.lineTo(laneLeft + laneWidth + 4, staffY);
        ctx.stroke();

        const repNotes = notes.filter(n => n.repIndex === currentRepIndex);
        const labelPositions = new Set();
        repNotes.forEach(n => labelPositions.add(n.localBeatPos));
        segments.filter(s => s.isRest).forEach(s => labelPositions.add(s.start));
        for (let b = 0; b < barBeats; b++) labelPositions.add(b);

        for (let beat = 0; beat <= beatCount; beat++) {
            const x = beatX(beat);
            ctx.strokeStyle = (beat === 0 || beat === beatCount) ? '#000' : 'rgba(0,0,0,0.12)';
            ctx.lineWidth = (beat === 0 || beat === beatCount) ? 1.5 : 0.8;
            ctx.beginPath();
            ctx.moveTo(x, staffY - stemH - 10);
            ctx.lineTo(x, staffY + 10);
            ctx.stroke();
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        const countY = staffY - stemH - 14;
        [...labelPositions].sort((a, b) => a - b).forEach(pos => {
            const lbl = beatLabel(pos);
            if (!lbl) return;
            const x = beatX(pos);
            const isMain = pos === Math.floor(pos);
            ctx.font = isMain ? '900 18px Nunito' : '800 15px Nunito';
            ctx.fillStyle = isMain ? 'rgba(59,130,246,0.9)' : 'rgba(59,130,246,0.5)';
            ctx.fillText(lbl, x, countY);
        });

        // Miss detection
        notes.forEach(note => {
            if (note.state === 'waiting' && elapsed - INPUT_LATENCY_MS > note.beatPos * beatMs + WIN_GOOD) {
                note.state = 'miss';
                note.judgment = 'miss';
                rcGameState.counts.miss++;
                rcGameState.combo = 0;
                document.getElementById('rcComboDisplay').textContent = '';
                _rcShowJudgment('MISS', '#EF4444');
            }
        });

        // Rests
        const curSegs = barsSegments ? barsSegments[currentRepIndex] : segments;
        curSegs.filter(seg => seg.isRest).forEach(seg => {
            const cx = beatX(seg.start);
            ctx.save();
            ctx.translate(cx, staffY);
            ctx.fillStyle = '#1E293B';
            ctx.beginPath();
            const s = 1.4;
            ctx.moveTo(-3*s, -16*s); ctx.lineTo(3*s, -10*s); ctx.lineTo(-2*s, -4*s); ctx.lineTo(4*s, 2*s);
            ctx.quadraticCurveTo(2*s, 7*s, -2*s, 8*s); ctx.quadraticCurveTo(2*s, 6*s, 1*s, 3*s);
            ctx.lineTo(-4*s, -3*s); ctx.lineTo(3*s, -9*s); ctx.lineTo(-3*s, -16*s);
            ctx.fill(); ctx.restore();
            ctx.textAlign = 'center'; ctx.font = '700 12px "Noto Sans TC", sans-serif';
            ctx.fillStyle = 'rgba(80,80,80,0.7)'; ctx.textBaseline = 'top';
            ctx.fillText('休止', cx, staffY + 14);
        });

        // Notes
        const segGroups = {};
        repNotes.forEach(note => { const key = note.segmentIndex; if (!segGroups[key]) segGroups[key] = []; segGroups[key].push(note); });

        function drawHead(cx, cy, filled, color) {
            ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.18);
            ctx.beginPath(); ctx.ellipse(0, 0, headRx, headRy, 0, 0, Math.PI * 2);
            if (filled) { ctx.fillStyle = color; ctx.fill(); }
            else { ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.stroke(); }
            ctx.restore();
        }
        function noteColor(note) {
            if (note.state === 'hit') return '#10B981';
            if (note.state === 'miss') return '#EF4444';
            return '#1E293B';
        }

        Object.values(segGroups).forEach(group => {
            group.sort((a, b) => a.localBeatPos - b.localBeatPos);
            const isBeamed = group.length > 1;
            group.forEach((note) => {
                const cx = beatX(note.localBeatPos);
                const color = noteColor(note);
                const dur = note.durationBeats;
                ctx.globalAlpha = note.state === 'miss' ? 0.45 : 1;
                if (note.state === 'hit' && note.hitTime) {
                    const dt = now - note.hitTime;
                    if (dt < 300) { const ga = 0.35 * (1 - dt / 300); ctx.fillStyle = 'rgba(16,185,129,' + ga + ')'; ctx.beginPath(); ctx.arc(cx, staffY, headRx + 8, 0, Math.PI * 2); ctx.fill(); }
                }
                drawHead(cx, staffY, dur <= 1, color);
                if (dur === 0.75 || dur === 1.5 || dur === 3) { ctx.beginPath(); ctx.arc(cx + headRx + 5, staffY, 2.5, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
                if (dur < 4) {
                    const stemX = cx + headRx - 1;
                    ctx.strokeStyle = color; ctx.lineWidth = 1.8;
                    ctx.beginPath(); ctx.moveTo(stemX, staffY - headRy + 2); ctx.lineTo(stemX, staffY - stemH); ctx.stroke();
                    if (!isBeamed && dur === 0.5) { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(stemX, staffY - stemH); ctx.quadraticCurveTo(stemX + 12, staffY - stemH + 10, stemX + 3, staffY - stemH + 22); ctx.quadraticCurveTo(stemX + 8, staffY - stemH + 14, stemX, staffY - stemH + 8); ctx.fill(); }
                    if (!isBeamed && dur === 0.25) { for (let f = 0; f < 2; f++) { const fy = staffY - stemH + f * (beamGap + 1); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(stemX, fy); ctx.quadraticCurveTo(stemX + 12, fy + 10, stemX + 3, fy + 20); ctx.quadraticCurveTo(stemX + 8, fy + 12, stemX, fy + 7); ctx.fill(); } }
                }
                ctx.fillStyle = note.state === 'hit' ? '#10B981' : '#3C3C3C';
                ctx.font = '600 13px "Noto Sans TC", Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
                ctx.fillText(note.label, cx, staffY + 14);
                ctx.globalAlpha = 1;
            });
            if (isBeamed && group.length > 1) {
                const first = group[0], last = group[group.length - 1];
                const x1 = beatX(first.localBeatPos) + headRx - 1;
                const x2 = beatX(last.localBeatPos) + headRx - 1;
                const beamY = staffY - stemH;
                const bColor = group.some(n => n.state === 'hit') ? '#10B981' : group.some(n => n.state === 'miss') ? '#EF4444' : '#1E293B';
                ctx.globalAlpha = group.some(n => n.state === 'miss') ? 0.45 : 1;
                ctx.fillStyle = bColor;
                ctx.fillRect(x1, beamY, x2 - x1, beamThick);
                let si = 0;
                while (si < group.length) {
                    if (group[si].durationBeats <= 0.25) {
                        let sj = si;
                        while (sj < group.length && group[sj].durationBeats <= 0.25) sj++;
                        if (sj - si >= 2) { ctx.fillRect(beatX(group[si].localBeatPos) + headRx - 1, beamY + beamGap, beatX(group[sj-1].localBeatPos) + headRx - 1 - (beatX(group[si].localBeatPos) + headRx - 1), beamThick); }
                        else { const sx = beatX(group[si].localBeatPos) + headRx - 1; const stub = 12; if (si > 0) ctx.fillRect(sx - stub, beamY + beamGap, stub, beamThick); else ctx.fillRect(sx, beamY + beamGap, stub, beamThick); }
                        si = sj;
                    } else { si++; }
                }
                ctx.globalAlpha = 1;
            }
        });

        // Floating judgment text
        repNotes.filter(n => n.state === 'hit' && n.hitTime).forEach(note => {
            const age = now - note.hitTime; if (age > 600) return;
            const cx = beatX(note.localBeatPos);
            const floatY = staffY - stemH - 28 - (age / 600) * 24;
            ctx.globalAlpha = Math.max(0, 1 - age / 600);
            ctx.fillStyle = note.judgmentColor || '#10B981'; ctx.font = '900 15px Nunito'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
            const jText = (note.judgment || '').toUpperCase();
            ctx.fillText(jText === 'PERFECT' ? '✦ PERFECT' : jText, cx, floatY);
            ctx.globalAlpha = 1;
        });

        // Playhead
        ctx.strokeStyle = 'rgba(59,130,246,0.85)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(playheadX, staffY - stemH - 16); ctx.lineTo(playheadX, staffY + 30); ctx.stroke();
        ctx.strokeStyle = 'rgba(59,130,246,0.15)'; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(playheadX, staffY - stemH - 16); ctx.lineTo(playheadX, staffY + 30); ctx.stroke();
        ctx.fillStyle = 'rgba(59,130,246,0.8)';
        ctx.beginPath(); ctx.moveTo(playheadX, staffY + 32); ctx.lineTo(playheadX - 5, staffY + 39); ctx.lineTo(playheadX + 5, staffY + 39); ctx.closePath(); ctx.fill();

        if (elapsed > 0) {
            const beatIdx = Math.floor(elapsed / beatMs) % 4;
            if (beatIdx !== rcGameState._lastBeatBox) {
                rcGameState._lastBeatBox = beatIdx;
                document.querySelectorAll('#rcGameBeats .rc-beat-box').forEach((box, idx) => { box.classList.toggle('active', idx === beatIdx); });
                const arm = document.getElementById('rcMetroArm');
                const text = document.getElementById('rcMetronomeText');
                if (arm) { arm.classList.remove('tick-left', 'tick-right'); void arm.offsetWidth; arm.classList.add(beatIdx % 2 === 0 ? 'tick-left' : 'tick-right'); }
                if (text) text.textContent = beatIdx === 0 ? '強拍！' : `第 ${beatIdx + 1} 拍`;
            }
            const repIndex = Math.min(REPS, currentRepIndex + 1);
            if (currentRepIndex !== rcGameState._lastRepIndex) {
                rcGameState._lastRepIndex = currentRepIndex;
                rcGameState._activeSegmentIndex = -1;
                if (barsSegments) {
                    _rcRenderGameTokensFromSegs(barsSegments[currentRepIndex]);
                    document.querySelectorAll('#rcGameTokenRow .rc-game-token').forEach(el => el.classList.remove('active'));
                    const patEl = document.getElementById('rcGamePattern');
                    if (patEl && rcGameState._card.bars) patEl.textContent = rcGameState._card.bars[currentRepIndex];
                    const nextStrip = document.getElementById('rcNextBarStrip');
                    const nextPat   = document.getElementById('rcNextBarPattern');
                    if (nextStrip && nextPat) {
                        const nextIdx = currentRepIndex + 1;
                        if (nextIdx < rcGameState._card.bars.length) { nextPat.textContent = rcGameState._card.bars[nextIdx]; nextStrip.style.display = ''; }
                        else { nextStrip.style.display = 'none'; }
                    }
                }
                document.getElementById('rcGameRep').textContent = barsSegments ? `小節 ${repIndex} / ${REPS}` : `第 ${repIndex} / ${REPS} 次`;
            }
            const beatInBar = (elapsed / beatMs) % barBeats;
            const activeSegmentIndex = currentSegments.findIndex(segment => beatInBar >= segment.start && beatInBar < segment.start + segment.duration);
            if (activeSegmentIndex !== rcGameState._activeSegmentIndex) {
                rcGameState._activeSegmentIndex = activeSegmentIndex;
                document.querySelectorAll('#rcGameTokenRow .rc-game-token').forEach(el => { el.classList.toggle('active', parseInt(el.dataset.segmentIndex || '-1', 10) === activeSegmentIndex); });
            }
        }

        if (elapsed > 0 && totalGameBeats > 0) { const pct = Math.min(elapsed / (totalGameBeats * beatMs) * 100, 100); document.getElementById('rcProgressFill').style.width = pct + '%'; }

        const allDone = notes.every(note => note.state !== 'waiting');
        const lastBeatMs = notes[notes.length - 1]?.beatPos * beatMs || 0;
        if (phase === 'playing' && allDone && elapsed > lastBeatMs + 800) { endRCGame(); return; }

        rcGameState.animId = requestAnimationFrame(_rcGameLoop);
    }

    function onRCHit() {
        if (rcGameState.phase !== 'playing') return;

        audio.playTap();
        const now = performance.now();
        const elapsed = now - rcGameState.perfZero;

        const emoji = document.getElementById('rcHitEmoji');
        if (emoji) {
            emoji.style.transform = 'scale(0.7)';
            setTimeout(() => { emoji.style.transform = ''; }, 120);
        }

        let bestNote = null;
        let bestErr = Infinity;
        rcGameState.notes.forEach(note => {
            if (note.state !== 'waiting') return;
            const { abs } = _compensatedError(elapsed, note.beatPos * rcGameState.beatMs);
            if (abs < bestErr) {
                bestErr = abs;
                bestNote = note;
            }
        });

        if (!bestNote || bestErr > WIN_GOOD) {
            _rcShowJudgment('—', '#aaa');
            rcGameState.combo = 0;
            const comboEl = document.getElementById('rcComboDisplay');
            if (comboEl) { comboEl.textContent = ''; comboEl.style.fontSize = '1rem'; }
            // Screen shake on miss
            const canvasWrap = document.querySelector('.rc-canvas-wrap');
            if (canvasWrap) {
                canvasWrap.style.transition = 'transform 0.06s';
                canvasWrap.style.transform = 'translateX(4px)';
                setTimeout(() => { canvasWrap.style.transform = 'translateX(-4px)'; }, 60);
                setTimeout(() => { canvasWrap.style.transform = ''; canvasWrap.style.transition = ''; }, 120);
            }
            return;
        }

        bestNote.state = 'hit';
        bestNote.hitTime = performance.now();
        rcGameState.combo++;
        if (rcGameState.combo > rcGameState.maxCombo) rcGameState.maxCombo = rcGameState.combo;

        let label;
        let color;
        let pts;
        if (bestErr <= WIN_PERFECT) {
            label = 'PERFECT ✦';
            color = '#10B981';
            pts = 300;
            rcGameState.counts.perfect++;
        } else if (bestErr <= WIN_GREAT) {
            label = 'GREAT';
            color = '#3B82F6';
            pts = 200;
            rcGameState.counts.great++;
        } else {
            label = 'GOOD';
            color = '#ffb74d';
            pts = 100;
            rcGameState.counts.good++;
        }

        const mul = rcGameState.combo >= 20 ? 2.0 : rcGameState.combo >= 10 ? 1.5 : rcGameState.combo >= 5 ? 1.2 : 1.0;
        const earned = Math.round(pts * mul);
        rcGameState.score += earned;
        bestNote.judgment = label.split(' ')[0].toLowerCase();
        bestNote.judgmentColor = color;

        // VexFlow mode: color SVG note green
        if (rcGameState._vf && rcGameState._vfNoteMap) {
            const currentRepIndex = Math.max(0, Math.min(REPS - 1, Math.floor(Math.max(elapsed, 0) / (rcGameState.barBeats * rcGameState.beatMs || 1))));
            const repNoteIdx = _rcLocalNoteIndex(bestNote, rcGameState.notes, currentRepIndex);
            if (rcGameState._vfNoteMap[repNoteIdx]) {
                _vfColorNote(rcGameState._vfNoteMap[repNoteIdx].el, color, 1);
            }
        }

        document.getElementById('rcGameScore').textContent = rcGameState.score;
        // Combo display with milestone celebrations
        const combo = rcGameState.combo;
        const comboEl = document.getElementById('rcComboDisplay');
        if (combo >= 20) {
            comboEl.textContent = `🌟 ${combo} COMBO × 2.0`;
            comboEl.style.color = '#F59E0B';
            comboEl.style.fontSize = '1.3rem';
        } else if (combo >= 10) {
            comboEl.textContent = `🔥 ${combo} COMBO × 1.5`;
            comboEl.style.color = '#EF4444';
            comboEl.style.fontSize = '1.2rem';
        } else if (combo >= 5) {
            comboEl.textContent = `⚡ ${combo} COMBO × 1.2`;
            comboEl.style.color = '#3B82F6';
            comboEl.style.fontSize = '1.1rem';
        } else if (combo >= 2) {
            comboEl.textContent = `🎵 ${combo} COMBO`;
            comboEl.style.color = '#FF8C42';
            comboEl.style.fontSize = '1rem';
        } else {
            comboEl.textContent = '';
        }
        _rcShowJudgment(label + (mul > 1 ? ` ×${mul}` : ''), color);

        // Hit ripple on pad
        const pad = document.getElementById('rcHitPad');
        if (pad) {
            const rip = document.createElement('span');
            rip.className = 'rc-hit-ripple';
            rip.style.borderColor = color;
            rip.style.left = '50%';
            rip.style.top = '50%';
            pad.appendChild(rip);
            rip.addEventListener('animationend', () => rip.remove());
        }
        // Score float near combo
        const wrap = document.querySelector('.rc-canvas-wrap');
        if (wrap) {
            const sf = document.createElement('span');
            sf.className = 'rc-score-float';
            sf.textContent = '+' + earned;
            sf.style.color = color;
            sf.style.left = '50%';
            sf.style.bottom = '60px';
            wrap.appendChild(sf);
            sf.addEventListener('animationend', () => sf.remove());
        }
    }

    function _rcShowJudgment(text, color) {
        const el = document.getElementById('rcJudgmentFlash');
        if (!el) return;
        el.textContent = text;
        el.style.color = color;
        el.classList.remove('show');
        void el.offsetWidth;
        el.classList.add('show');
        clearTimeout(rcGameState._judgeTimer);
        rcGameState._judgeTimer = setTimeout(() => el.classList.remove('show'), 380);
    }

    function _rcTogglePause() {
        const overlay = document.getElementById('rcPauseOverlay');
        if (rcGameState.phase === 'playing') {
            rcGameState.phase = 'paused';
            rcGameState._pauseStart = performance.now();
            overlay.style.display = 'flex';
            if (rcGameState.animId) {
                cancelAnimationFrame(rcGameState.animId);
                rcGameState.animId = null;
            }
        } else if (rcGameState.phase === 'paused') {
            const pausedDuration = performance.now() - (rcGameState._pauseStart || performance.now());
            rcGameState.perfZero += pausedDuration;
            rcGameState._pauseStart = null;
            rcGameState.phase = 'playing';
            overlay.style.display = 'none';
            rcGameState.animId = requestAnimationFrame(_rcGameLoop);
        }
    }

    function _rcExitGame() {
        if (rcGameState.animId) {
            cancelAnimationFrame(rcGameState.animId);
            rcGameState.animId = null;
        }
        if (rcGameState._startTimer) {
            clearTimeout(rcGameState._startTimer);
            rcGameState._startTimer = null;
        }
        _rcCleanupVF();
        _rcRemoveGameKeyHandler();
        audio.stopAllTicks();
        switchScreen('screen-rc-levels');
    }

    function _rcCleanupVF() {
        if (rcGameState._vf) {
            const vfDiv = document.getElementById('rcOsmdContainer');
            if (vfDiv) { vfDiv.style.display = 'none'; vfDiv.innerHTML = ''; }
            const scanner = rcGameState._scanner;
            if (scanner) scanner.style.display = 'none';
            const canvas = document.getElementById('rcGameCanvas');
            if (canvas) canvas.style.display = '';
            rcGameState._vf = false;
            rcGameState._vfNoteMap = null;
        }
    }

    function _rcRemoveGameKeyHandler() {
        if (rcGameState._keyHandler) {
            document.removeEventListener('keydown', rcGameState._keyHandler);
            rcGameState._keyHandler = null;
        }
    }

    function endRCGame() {
        rcGameState.phase = 'done';
        if (rcGameState.animId) {
            cancelAnimationFrame(rcGameState.animId);
            rcGameState.animId = null;
        }
        if (rcGameState._startTimer) {
            clearTimeout(rcGameState._startTimer);
            rcGameState._startTimer = null;
        }
        _rcCleanupVF();
        _rcRemoveGameKeyHandler();
        audio.stopAllTicks();

        const { counts, score, maxCombo, notes } = rcGameState;
        const total = notes.length || 1;
        const hitCount = counts.perfect + counts.great + counts.good;
        const accuracy = Math.round(hitCount / total * 100);
        const qualAcc = Math.round((counts.perfect + counts.great) / total * 100);

        let grade = '🌟 S';
        let gradeMsg = '完美演出！太厲害了！🎉';
        let stars = 3;
        if (qualAcc < 100) { gradeMsg = '超級棒！幾乎完美！✨'; }
        if (qualAcc < 90) { grade = '🥇 A'; gradeMsg = '出色的節奏感！繼續挑戰！'; stars = 2; }
        if (qualAcc < 75) { grade = '🥈 B'; gradeMsg = '很好！再多練習會更棒！'; stars = 2; }
        if (qualAcc < 60) { grade = '🥉 C'; gradeMsg = '加油！每次練習都在進步！💪'; stars = 1; }
        if (qualAcc < 40) { stars = 0; }

        // Render star rating
        const starsEl = document.getElementById('rcResultStars');
        starsEl.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const s = document.createElement('span');
            s.className = 'rc-star' + (i < stars ? ' rc-star-on' : '');
            s.textContent = i < stars ? '⭐' : '☆';
            s.style.animationDelay = (i * 0.15) + 's';
            starsEl.appendChild(s);
        }

        // Save best grade per card (only for real cards with a num)
        if (rcGameState._card.num) _rcSaveBestGrade(rcGameState._card.num, qualAcc, score);

        // Record to profile
        if (rcGameState._user) {
            recordGameResult(rcGameState._user, 'game2', score, accuracy, maxCombo, null, counts);
        }

        document.getElementById('rcResultGrade').textContent = grade;
        document.getElementById('rcResultTitle').textContent = gradeMsg;
        document.getElementById('rcResultAccuracy').textContent = `準確度 ${accuracy}%（${hitCount}/${total} 拍）`;
        // Stagger stat items appearance
        const statEls = document.querySelectorAll('#screen-rc-result .rc-stat-item');
        statEls.forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(16px)';
            setTimeout(() => {
                el.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 200 + i * 100);
        });
        // Counting-up animation for score
        const scoreEl = document.getElementById('rcResScore');
        let countVal = 0;
        const countStep = Math.max(1, Math.ceil(score / 30));
        const countTimer = setInterval(() => {
            countVal = Math.min(countVal + countStep, score);
            scoreEl.textContent = countVal;
            if (countVal >= score) clearInterval(countTimer);
        }, 25);
        document.getElementById('rcResPerfect').textContent = counts.perfect;
        document.getElementById('rcResGreat').textContent = counts.great;
        document.getElementById('rcResGood').textContent = counts.good;
        document.getElementById('rcResMiss').textContent = counts.miss;
        document.getElementById('rcResCombo').textContent = maxCombo;
        document.getElementById('rcResultRecap').innerHTML = '';

        const barEl = document.getElementById('rcAccuracyBar');
        barEl.innerHTML = '';
        [
            { pct: counts.perfect / total * 100, color: '#53cf8a' },
            { pct: counts.great / total * 100, color: '#64b5f6' },
            { pct: counts.good / total * 100, color: '#ffb74d' },
            { pct: counts.miss / total * 100, color: '#ef5350' },
        ].forEach((seg, i) => {
            if (seg.pct <= 0) return;
            const div = document.createElement('div');
            div.className = 'rc-acc-seg';
            div.style.cssText = `width:0%;background:${seg.color};transition:width 0.6s cubic-bezier(.4,0,.2,1) ${0.3 + i * 0.1}s;`;
            barEl.appendChild(div);
            requestAnimationFrame(() => requestAnimationFrame(() => { div.style.width = seg.pct + '%'; }));
        });

        document.getElementById('rcResReplay').textContent = '🔄 再挑戰';
        document.getElementById('rcResReplay').onclick = () => startRCGame(rcGameState._card, rcGameState._bpm, rcGameState._user);
        document.getElementById('rcResBack').textContent  = '← 返回設定';
        document.getElementById('rcResBack').onclick     = () => _openRCDetail(rcGameState._card, rcGameState._user);
        const rankBtn = document.getElementById('rcResViewRank');
        if (rankBtn) rankBtn.style.display = 'none';

        switchScreen('screen-rc-result');
    }

    function renderLocalRankList(gameKey, listId, currentUser, difficulty) {
        const listEl = document.getElementById(listId);
        if (!listEl) return;
        const clsEl = document.getElementById(gameKey === 'game2' ? 'g2RankClass' : gameKey === 'game4' ? 'g4RankClass' : 'g3RankClass');
        const gradeEl = document.getElementById(gameKey === 'game2' ? 'g2RankGrade' : gameKey === 'game4' ? 'g4RankGrade' : 'g3RankGrade');
        // Prefer GAS data; fall back to localStorage if not yet loaded
        let data = state.allRanks.filter(r => r.game === gameKey);
        if (!data.length) data = JSON.parse(localStorage.getItem('musicGameRanks_' + gameKey) || '[]');
        if (clsEl && clsEl.value !== '0') data = data.filter(r => r.class === clsEl.value);
        if (gradeEl && parseInt(gradeEl.value) !== 0) data = data.filter(r => parseInt(r.grade) === parseInt(gradeEl.value));
        if (difficulty) data = data.filter(r => (r.mode_name || '').includes(DIFFICULTY_CONFIG[difficulty]?.label || '') || (r.difficulty || '') === difficulty);
        data.sort((a,b) => (b.score||0) - (a.score||0));
        const seen = new Set();
        data = data.filter(r => {
            const k = `${String(r.name||'').trim()}|${r.grade}|${r.class}|${String(r.id||r.seat||'').trim()}`;
            if (seen.has(k)) return false; seen.add(k); return true;
        });
        const hintId = gameKey === 'game4' ? 'g4RankHint' : gameKey === 'game3' ? 'g3RankHint' : null;
        const hintEl = hintId ? document.getElementById(hintId) : null;
        if (!data.length) {
            if (hintEl) hintEl.style.display = 'none';
            listEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-light);font-weight:800;">暫時未有紀錄🚀</div>'; return;
        }
        if (hintEl) {
            const selfIdx = data.findIndex(r => currentUser && String(r.name||'').trim() === String(currentUser.name||'').trim() && r.class === currentUser.class && String(r.grade) === String(currentUser.grade));
            if (currentUser?.name && selfIdx >= 0) {
                hintEl.innerHTML = `🎯 ${escHtml(currentUser.name)} 同學目前排第 <strong>${selfIdx + 1}</strong> 名`;
                hintEl.style.display = '';
            } else { hintEl.style.display = 'none'; }
        }
        listEl.innerHTML = _rankRewardBanner() + data.map((item,i) => {
            const isSelf = currentUser && String(item.name||'').trim() === String(currentUser.name||'').trim() && item.class === currentUser.class && String(item.grade) === String(currentUser.grade);
            const gradeTxt = item.grade ? `小${item.grade}` : '';
            const seatTxt = (item.id || item.seat) ? `${item.id || item.seat}號` : '';
            return `<div class="rank-item ${i===0?'first':i===1?'second':i===2?'third':''} ${isSelf?'self':''}">
                <div class="rank-pos">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1+'.'}</div>
                <div class="rank-name"><span class="rank-student-name">${escHtml(item.name||'')}</span>
                <div class="rank-badges">
                    ${gradeTxt?`<span class="rank-tag rank-grade-tag">${gradeTxt}</span>`:''}
                    <span class="rank-tag rank-class-tag">${escHtml(item.class||'')}班</span>
                    ${seatTxt?`<span class="rank-tag rank-seat-tag">${seatTxt}</span>`:''}
                    ${isSelf?'<span class="rank-tag" style="background:var(--primary-purple)">我</span>':''}
                    <span class="rank-tag" style="background:#CBD5E1;color:#333;">${item.accuracy||0}% 正確</span>
                </div></div>
                <div class="rank-score">${item.score||0}</div></div>`;
        }).join('');
    }

    // ==========================================
    // 📖 Game 3 — 音樂術語辨識遊戲
    // ==========================================
    // ==========================================
    // 📖 Game 3 — Dynamic Question Generator
    // ==========================================
    // Hand-crafted special questions (key signatures, comparisons, symbol recognition)
    const G3_SPECIAL_Q = {
        easy: [
            { q: '「< 」漸強記號跟哪個術語一樣？', sym: '<', ans: 'cresc.', opts: ['cresc.','decresc.','f','p'], optImgMap: { 'cresc.': 'file:///Users/kenneth/.cursor/projects/Users-kenneth-Desktop-notes/assets/image-ed1c4dc1-77c4-498d-9fff-95295247aad9.png' }, isText: true, explain: '「<」形狀 = 聲音由小到大 = 漸強 = crescendo。' },
            { q: '「> 」漸弱記號跟哪個術語一樣？', sym: '>', ans: 'decresc.', opts: ['cresc.','decresc.','f','p'], isText: true, explain: '「>」形狀 = 聲音由大到小 = 漸弱 = decrescendo。' },
            { q: '以下力度術語由弱到強排序，緊接在「p」後面的是哪個？', sym: 'pp  p  _  mf  f  ff', ans: 'mp', opts: ['mf','mp','ff','pp'], isText: true, explain: '標準排序是 pp → p → mp → mf → f → ff，所以緊接在 p 後面的是 mp。' },
            { q: '以下哪個力度最弱？', sym: 'pp  p  mp', ans: 'pp', opts: ['pp','p','mp','mf'], isText: true, explain: 'pp = pianissimo = 很弱，是三者中最弱的。' },
            { q: '以下哪個力度最強？', sym: 'f  mf  ff', ans: 'ff', opts: ['f','mf','ff','mp'], isText: true, explain: 'ff = fortissimo = 很強，是三者中最強的。' },
            { q: 'C大調的調號有多少個升降號？', ans: '沒有（0個）', opts: ['沒有（0個）','1個升號','1個降號','2個升號'], ksImg:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-0n.png', ksCaption:'<strong class="ks-major">C大調 / a小調</strong>', explain: 'C大調是唯一沒有升降號的大調。' },
            // ── 強弱記號 Q1 ──
            { q: '在音樂中，「f」代表什麼意思？', sym: 'f', ans: '強（Forte）', opts: ['強（Forte）','弱（Piano）','中強（Mezzo-forte）','很強（Fortissimo）'], isText: true, explain: 'f = forte = 強，是最常見的力度記號之一。' },
            // ── 強弱記號 Q2 ──
            { q: '如果你要輕聲唱歌，應該看哪一個力度符號？', sym: 'pp  p  mf  f', ans: 'p', opts: ['p','f','mf','ff'], isText: true, explain: 'p = piano = 弱，代表要輕聲演奏或演唱。' },
            // ── 演奏方式 Q1 ──
            { q: '音符上方或下方有一個小圓點（ · ），代表要怎麼彈奏？', sym: '·', ans: '斷奏（Staccato）', opts: ['斷奏（Staccato）','連奏（Legato）','重音（Accent）','保持音（Tenuto）'], isText: true, explain: '小圓點 = staccato = 斷奏 / 跳音，要把音符彈得短促而分離。' },
            // ── 音樂常識 Q1 ──
            { q: '樂譜開頭那個像大「G」字的符號叫什麼？', sym: '𝄞', ans: '高音譜號（Treble Clef）', opts: ['高音譜號（Treble Clef）','低音譜號（Bass Clef）','中音譜號（Alto Clef）','調號'], isText: true, explain: '高音譜號（Treble Clef）是五線譜最常見的譜號，形狀像大寫 G，圈住第二線（G4）。' },
            // ── 音樂常識 Q2 ──
            { q: '在單線譜（Single-line staff）中，通常是用來練習節奏還是音高？', sym: '— —— — ——', ans: '節奏（Rhythm）', opts: ['節奏（Rhythm）','音高（Pitch）','力度（Dynamics）','音色（Timbre）'], isText: true, explain: '單線譜不標示音高，只顯示節奏型，常用於打擊樂或節奏練習。' },
            // ── 音樂常識 Q3 ──
            { q: '一個四分音符（♩）通常等於幾拍？', sym: '♩', ans: '一拍', opts: ['一拍','兩拍','半拍','四拍'], isText: true, explain: '四分音符是基本拍值單位，在 4/4 拍中等於一拍。' },
            // ── 音樂常識 Q4 ──
            { q: '音符後面跟著一個小圓點（附點），這個音符的長度會變長還是變短？', sym: '♩.', ans: '變長（增加原本音長的一半）', opts: ['變長（增加原本音長的一半）','變短（縮短一半）','長度不變','變成兩倍長'], isText: true, explain: '附點令音符延長原本音值的一半。例如附點四分音符 = 1½ 拍。' },
        ],
        normal: [
            { q: '以下哪個速度最慢？', sym: 'Andante · Allegro · Moderato', ans: 'Andante', opts: ['Andante','Allegro','Moderato','Adagio'], isText: true, explain: 'Adagio < Andante < Moderato < Allegro。Andante 是三者中最慢的。' },
            { q: '以下哪個速度最快？', sym: 'Adagio · Moderato · Allegro', ans: 'Allegro', opts: ['Adagio','Moderato','Allegro','Andante'], isText: true, explain: 'Allegro（快板）是三者中最快的。' },
            // ── 強弱記號 Q3 ──
            { q: '「mf」比「f」還要響亮嗎？', sym: 'mf  vs  f', ans: '不是，mf（中強）比 f 弱', opts: ['不是，mf（中強）比 f 弱','是，mf 比 f 強','兩者一樣響亮','mf 是速度術語，無法比較'], isText: true, explain: 'pp → p → mp → mf → f → ff，mf 排在 f 之前，所以比 f 弱。' },
            // ── 強弱記號 Q4 ──
            { q: '聲音由小漸漸變大，這個術語叫做什麼？', sym: '<', ans: '漸強（Crescendo）', opts: ['漸強（Crescendo）','漸弱（Decrescendo）','突強（Sforzando）','回原速（A tempo）'], isText: true, explain: '「<」形狀由窄到寬，代表聲音由弱漸強 = crescendo（漸強）。' },
            // ── 速度術語 Q1 ──
            { q: '「Allegro」在音樂中通常代表什麼樣的速度？', sym: 'Allegro', ans: '快板（快速、活潑地）', opts: ['快板（快速、活潑地）','慢板（很慢）','中板（適中）','急板（極快）'], isText: true, explain: 'Allegro = 快板，是最常見的速度術語之一，代表快速而活潑的速度。' },
            // ── 速度術語 Q3 ──
            { q: '如果曲子最後要「逐漸慢下來」，符號通常會寫成什麼？', sym: 'rit.', ans: 'rit.（Ritardando / 漸慢）', opts: ['rit.（Ritardando / 漸慢）','accel.（Accelerando / 漸快）','a tempo（回原速）','Presto（急板）'], isText: true, explain: 'rit. = ritardando = 漸慢，指示演奏者逐漸放慢速度。' },
            // ── 速度術語 Q4 ──
            { q: '「Moderato」的意思是？', sym: 'Moderato', ans: '中板（適中、中等速度）', opts: ['中板（適中、中等速度）','快板（快速）','慢板（很慢）','急板（極快）'], isText: true, explain: 'Moderato = 中板，速度適中，介乎快慢之間。' },
            // ── 演奏方式 Q3 ──
            { q: '「Fine」出現在樂譜末尾附近，代表什麼意思？', sym: 'Fine', ans: '樂曲結束', opts: ['樂曲結束','從頭再奏','重複演奏','從記號重奏'], isText: true, explain: 'Fine（讀作 fee-nay）= 終止，是樂曲結束的標記。' },
            // ── 演奏方式 Q4 ──
            { q: '兩道雙槓加上兩個圓點（ ‖: :‖ ），代表什麼指令？', sym: '‖: :‖', ans: '重複記號（重複演奏一段）', opts: ['重複記號（重複演奏一段）','樂曲結束','從頭再奏','速度加快'], isText: true, explain: '‖: :‖ = 反覆記號，要把括號內的樂段重複演奏一次。' },
            { q: '「rit.」和「accel.」是甚麼關係？', sym: 'rit. ↔ accel.', ans: '相反（漸慢 vs 漸快）', opts: ['相反（漸慢 vs 漸快）','意思一樣','一個是力度一個是速度','沒有關係'], isText: true, explain: 'rit. = 漸慢，accel. = 漸快，兩者相反。' },
            { q: '「反覆記號」的作用是甚麼？', sym: '|: :|', ans: '重複演奏一段', opts: ['樂曲結束','重複演奏一段','從頭再奏','從記號重奏'], isText: true, explain: '|: :| = 將括號內的樂段重複演奏一次。' },
            { q: '這個調號是哪個大調？', ans: 'G大調', opts: ['C大調','G大調','D大調','F大調'], ksImg:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-1s.png', ksCaption:'<span class="ks-notes">升 Fa</span>', explain: 'G大調有1個升號，升Fa（F♯）。' },
            { q: 'G大調的關係小調是哪個？', ans: 'e小調', opts: ['a小調','e小調','b小調','d小調'], ksImg:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-1s.png', ksCaption:'<strong class="ks-major">G大調</strong>', explain: 'G大調的關係小調是e小調。' },
            { q: '這個調號是哪個大調？', ans: 'F大調', opts: ['C大調','G大調','F大調','B♭大調'], ksImg:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-1f.png', ksCaption:'<span class="ks-notes">降 Si</span>', explain: 'F大調有1個降號，降Si（B♭）。' },
            { q: 'F大調的關係小調是哪個？', ans: 'd小調', opts: ['a小調','d小調','g小調','e小調'], ksImg:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-1f.png', ksCaption:'<strong class="ks-major">F大調</strong>', explain: 'F大調的關係小調是d小調。' },
        ],
        hard: [
            { q: '以下哪個速度最慢？', sym: 'Largo · Adagio · Presto', ans: 'Largo', opts: ['Largo','Adagio','Presto','Allegro'], isText: true, explain: 'Largo（廣板）是所有速度術語中最慢的之一。' },
            // ── 速度術語 Q2 ──
            { q: '慢板的義大利文術語是什麼？', sym: '慢板', ans: 'Adagio', opts: ['Adagio','Allegro','Moderato','Vivace'], isText: true, explain: 'Adagio = 柔板（很慢），是常見的慢速術語。Lento 同樣表示慢，但 Adagio 更常用。' },
            // ── 演奏方式 Q2 ──
            { q: '音符上面有一條橫線（ — ），代表保持音長並加重，這叫什麼？', sym: '—', ans: '保持音（Tenuto）', opts: ['保持音（Tenuto）','斷奏（Staccato）','延長號（Fermata）','重音（Accent）'], isText: true, explain: 'Tenuto（保持音）= 橫線符號，指示演奏者保持該音的完整時值，並稍作強調。' },
            { q: '以下哪個速度最快？', sym: 'Vivace · Allegro · Presto', ans: 'Presto', opts: ['Vivace','Allegro','Presto','Moderato'], isText: true, explain: 'Presto（急板）是三者中最快的。' },
            { q: '「D.C. al Fine」代表怎樣演奏？', sym: 'D.C. al Fine', ans: '從頭再奏至 Fine 結束', opts: ['從頭再奏至 Fine 結束','從記號重奏','直接結束','跳至尾聲'], isText: true, explain: 'D.C. = 從頭再奏，al Fine = 直到標記 Fine 處結束。' },
            { q: '「D.S. al Coda」代表怎樣演奏？', sym: 'D.S. al Coda', ans: '從記號重奏至 Coda 跳尾聲', opts: ['從記號重奏至 Coda 跳尾聲','從頭再奏','直接結束','重複一次'], isText: true, explain: 'D.S. = 從 Segno 記號重奏，al Coda = 到 Coda 記號跳尾聲。' },
            { q: '「molto」加在術語前代表甚麼？', sym: 'molto forte', ans: '非常（加強程度）', opts: ['非常（加強程度）','一點點','不太','稍微'], isText: true, explain: 'molto = 非常/很多，molto forte = 非常強。' },
            { q: '「poco a poco」代表甚麼？', sym: 'poco a poco', ans: '逐漸地', opts: ['突然','逐漸地','很快','一次過'], isText: true, explain: 'poco a poco = 一點一點地 = 逐漸地。' },
            { q: '這個調號是哪個大調？', ans: 'D大調', opts: ['D大調','A大調','E大調','G大調'], ksImg:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-2s.png', ksCaption:'<span class="ks-notes">升 Fa、Do</span>', explain: 'D大調有2個升號。' },
            { q: 'D大調的關係小調是哪個？', ans: 'b小調', opts: ['e小調','b小調','f♯小調','g小調'], ksImg:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-2s.png', ksCaption:'<strong class="ks-major">D大調</strong>', explain: 'D大調的關係小調是b小調。' },
            { q: '這個調號是哪個大調？', ans: 'B♭大調', opts: ['B♭大調','E♭大調','A♭大調','F大調'], ksImg:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-2f.png', ksCaption:'<span class="ks-notes">降 Si、Mi</span>', explain: 'B♭大調有2個降號。' },
            { q: 'B♭大調的關係小調是哪個？', ans: 'g小調', opts: ['d小調','g小調','c小調','f小調'], ksImg:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-2f.png', ksCaption:'<strong class="ks-major">B♭大調</strong>', explain: 'B♭大調的關係小調是g小調。' },
            { q: '這個調號是哪個大調？', ans: 'A大調', opts: ['A大調','E大調','D大調','G大調'], ksImg:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-3s.png', ksCaption:'<span class="ks-notes">升 Fa、Do、Sol</span>', explain: 'A大調有3個升號。' },
            { q: 'A大調的關係小調是哪個？', ans: 'f♯小調', opts: ['b小調','f♯小調','c♯小調','e小調'], ksImg:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-3s.png', ksCaption:'<strong class="ks-major">A大調</strong>', explain: 'A大調的關係小調是f♯小調。' },
            { q: '這個調號是哪個大調？', ans: 'E♭大調', opts: ['B♭大調','E♭大調','A♭大調','G大調'], ksImg:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-3f.png', ksCaption:'<span class="ks-notes">降 Si、Mi、La</span>', explain: 'E♭大調有3個降號。' },
            { q: 'E♭大調的關係小調是哪個？', ans: 'c小調', opts: ['d小調','g小調','c小調','f小調'], ksImg:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-3f.png', ksCaption:'<strong class="ks-major">E♭大調</strong>', explain: 'E♭大調的關係小調是c小調。' },
            { q: '這個調號是哪個大調？', ans: 'E大調', opts: ['D大調','E大調','A大調','B大調'], ksImg:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-4s.png', ksCaption:'<span class="ks-notes">升 Fa Do Sol Re</span>', explain: '4個升號 = E大調。' },
            { q: '這個調號是哪個大調？', ans: 'A♭大調', opts: ['E♭大調','A♭大調','D♭大調','B♭大調'], ksImg:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-4f.png', ksCaption:'<span class="ks-notes">降 Si Mi La Re</span>', explain: 'A♭大調有4個降號。' },
        ]
    };

    // Grade ranges for each difficulty tier
    const G3_GRADE_RANGE = {
        easy:   [1, 2],   // 小一至小二
        normal: [1, 4],   // 小一至小四
        hard:   [3, 6],   // 小三至小六
        expert: [1, 6],   // 全部
        p1:     [1, 1],   // 小一
        p2:     [1, 2],   // 小一至小二
        p3:     [1, 3],   // 小一至小三
        p4:     [1, 4],   // 小一至小四
        p5:     [1, 5],   // 小一至小五
        p6:     [1, 6],   // 小一至小六
    };

    // Distractor pools grouped by category
    const G3_DISTRACTOR_POOLS = {
        dynamics:     ['強','弱','中強','中弱','很強','很弱','漸強','漸弱','突強','強後即弱'],
        tempo:        ['廣板（極慢）','莊板（極慢）','柔板（很慢）','行板（中慢）','小行板（稍慢）','中板','小快板','快板','活潑地（快）','急板（極快）','漸慢','漸快','回原速','更快地'],
        articulation: ['連奏','斷奏','重音','持音（保持音值）','延長號','強奏'],
        form:         ['重複演奏一段','第一/二次結尾','從頭再奏','從記號重奏','樂曲結束'],
        expression:   ['如歌地','甜美地','有表情地','雄壯地','嬉戲地','平靜地'],
    };

    // Generate questions dynamically from FULL_TERMS_TABLE
    function g3GenerateQuestions(difficulty) {
        const [gradeMin, gradeMax] = G3_GRADE_RANGE[difficulty] || [1, 6];
        // Filter terms by grade range (exclude keysig — handled by special Q)
        const terms = FULL_TERMS_TABLE.filter(t =>
            t.grade >= gradeMin && t.grade <= gradeMax && t.cat !== 'keysig'
        );

        const questions = [];

        for (const t of terms) {
            const pool = G3_DISTRACTOR_POOLS[t.cat] || [];
            const distractors = pool.filter(d => d !== t.meaning);

            // --- Type 1: "What does [symbol] mean?" (術語→意思) ---
            if (distractors.length >= 3) {
                const shuffled = distractors.slice().sort(() => Math.random() - 0.5);
                const wrongOpts = shuffled.slice(0, 3);
                const allOpts = [t.meaning, ...wrongOpts].sort(() => Math.random() - 0.5);
                const qObj = {
                    q: `「${t.sym}」代表甚麼？`,
                    sym: t.sym,
                    ans: t.meaning,
                    opts: allOpts,
                };
                if (t.img) qObj.img = t.img;
                questions.push(qObj);
            }

            // --- Type 2: "Which term means [meaning]?" (意思→術語) — reverse ---
            // Only for terms with unique Italian names
            if (t.cat !== 'form' && t.name && distractors.length >= 2) {
                const sameCatTerms = terms.filter(x => x.cat === t.cat && x.name !== t.name);
                if (sameCatTerms.length >= 3) {
                    const wrongNames = sameCatTerms.sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.name);
                    const allOpts = [t.name, ...wrongNames].sort(() => Math.random() - 0.5);
                    questions.push({
                        q: `哪個術語代表「${t.meaning}」？`,
                        sym: t.meaning,
                        ans: t.name,
                        opts: allOpts,
                        isText: true,
                    });
                }
            }
        }

        // Add special hand-crafted questions for this difficulty
        const specials = G3_SPECIAL_Q[difficulty] || [];
        // For normal: use easy + medium specials; for expert: use all
        let allSpecials = specials;
        if (difficulty === 'normal') allSpecials = (G3_SPECIAL_Q.easy || []).concat(specials);
        if (difficulty === 'expert') allSpecials = (G3_SPECIAL_Q.easy || []).concat(G3_SPECIAL_Q.normal || [], G3_SPECIAL_Q.hard || []);

        questions.push(...allSpecials);
        return questions;
    }

    const G3_DIFF_POOL = {
        easy:   () => g3GenerateQuestions('easy'),
        normal: () => g3GenerateQuestions('normal'),
        hard:   () => g3GenerateQuestions('hard'),
        expert: () => g3GenerateQuestions('expert'),
        p1:     () => g3GenerateQuestions('p1'),
        p2:     () => g3GenerateQuestions('p2'),
        p3:     () => g3GenerateQuestions('p3'),
        p4:     () => g3GenerateQuestions('p4'),
        p5:     () => g3GenerateQuestions('p5'),
        p6:     () => g3GenerateQuestions('p6'),
    };

    const TERMS_GRADE_BANK = { 1:'easy', 2:'easy', 3:'normal', 4:'normal', 5:'hard', 6:'hard' };

    // ==========================================
    // 📚 完整音樂術語參考表資料
    // ==========================================
    // Inline SVG snippets for form/記號 cards
    const FORM_SVG = {
        '‖: :‖': `<svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" class="study-keysig-svg"><line x1="20" y1="8" x2="20" y2="44" stroke="#222" stroke-width="1.2"/><line x1="23" y1="8" x2="23" y2="44" stroke="#222" stroke-width="3.5"/><circle cx="28" cy="18" r="2.2" fill="#222"/><circle cx="28" cy="26" r="2.2" fill="#222"/><line x1="67" y1="8" x2="67" y2="44" stroke="#222" stroke-width="3.5"/><line x1="70" y1="8" x2="70" y2="44" stroke="#222" stroke-width="1.2"/><circle cx="62" cy="18" r="2.2" fill="#222"/><circle cx="62" cy="26" r="2.2" fill="#222"/></svg>`,
        '1.  2.': `<svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" class="study-keysig-svg"><line x1="10" y1="8" x2="10" y2="34" stroke="#555" stroke-width="1.4"/><line x1="10" y1="8" x2="42" y2="8" stroke="#555" stroke-width="1.4"/><text x="14" y="22" font-size="12" font-weight="900" fill="#333" font-family="sans-serif">1.</text><line x1="48" y1="8" x2="48" y2="34" stroke="#555" stroke-width="1.4"/><line x1="48" y1="8" x2="80" y2="8" stroke="#555" stroke-width="1.4"/><text x="52" y="22" font-size="12" font-weight="900" fill="#333" font-family="sans-serif">2.</text></svg>`,
        'D.C.': `<svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" class="study-keysig-svg"><text x="10" y="38" font-size="22" font-weight="900" fill="#5B2D8E" font-family="serif" font-style="italic">D.C.</text><path d="M 72 14 L 82 14 L 82 46 L 72 46" stroke="#5B2D8E" stroke-width="2" fill="none"/><line x1="82" y1="14" x2="82" y2="46" stroke="#5B2D8E" stroke-width="4"/></svg>`,
        'D.S.': `<svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" class="study-keysig-svg"><text x="10" y="38" font-size="22" font-weight="900" fill="#C05B00" font-family="serif" font-style="italic">D.S.</text><text x="71" y="40" font-size="24" font-weight="900" fill="#C05B00" font-family="serif">𝄋</text></svg>`,
        'Fine': `<svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" class="study-keysig-svg"><text x="12" y="40" font-size="26" font-weight="900" fill="#B00020" font-family="serif" font-style="italic">Fine</text><line x1="72" y1="10" x2="72" y2="46" stroke="#B00020" stroke-width="1.5"/><line x1="75" y1="10" x2="75" y2="46" stroke="#B00020" stroke-width="4"/></svg>`,
    };

    const FULL_TERMS_TABLE = [
        // 力度 (Dynamics)
        { cat:'dynamics', sym:'pp',        name:'Pianissimo',   meaning:'很弱',           grade:2, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-pp.png' },
        { cat:'dynamics', sym:'p',         name:'Piano',        meaning:'弱',             grade:1, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-p.png' },
        { cat:'dynamics', sym:'mp',        name:'Mezzo-piano',  meaning:'中弱',           grade:1, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-mp.png' },
        { cat:'dynamics', sym:'mf',        name:'Mezzo-forte',  meaning:'中強',           grade:1, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-mf.png' },
        { cat:'dynamics', sym:'f',         name:'Forte',        meaning:'強',             grade:1, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-f.png' },
        { cat:'dynamics', sym:'ff',        name:'Fortissimo',   meaning:'很強',           grade:2, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-ff.png' },
        { cat:'dynamics', sym:'sf',        name:'Sforzando',    meaning:'突強',           grade:4, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-sf.png' },
        { cat:'dynamics', sym:'fp',        name:'Forte-piano',  meaning:'強後即弱',       grade:5, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-fp.png' },
        { cat:'dynamics', sym:'cresc.',    name:'Crescendo',    meaning:'漸強',           grade:2, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-cresc.png' },
        { cat:'dynamics', sym:'decresc.',  name:'Decrescendo',  meaning:'漸弱',           grade:2, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-decresc.png' },
        // 速度 (Tempo)
        { cat:'tempo',    sym:'Largo',     name:'Largo',        meaning:'廣板（極慢）',   grade:5 },
        { cat:'tempo',    sym:'Grave',     name:'Grave',        meaning:'莊板（極慢）',   grade:6 },
        { cat:'tempo',    sym:'Adagio',    name:'Adagio',       meaning:'柔板（很慢）',   grade:3 },
        { cat:'tempo',    sym:'Andante',   name:'Andante',      meaning:'行板（中慢）',   grade:2 },
        { cat:'tempo',    sym:'Andantino', name:'Andantino',    meaning:'小行板（稍慢）', grade:6 },
        { cat:'tempo',    sym:'Moderato',  name:'Moderato',     meaning:'中板',           grade:3 },
        { cat:'tempo',    sym:'Allegretto',name:'Allegretto',   meaning:'小快板',         grade:6 },
        { cat:'tempo',    sym:'Allegro',   name:'Allegro',      meaning:'快板',           grade:2 },
        { cat:'tempo',    sym:'Vivace',    name:'Vivace',       meaning:'活潑地（快）',   grade:5 },
        { cat:'tempo',    sym:'Presto',    name:'Presto',       meaning:'急板（極快）',   grade:5 },
        { cat:'tempo',    sym:'rit.',      name:'Ritardando',   meaning:'漸慢',           grade:4 },
        { cat:'tempo',    sym:'accel.',    name:'Accelerando',  meaning:'漸快',           grade:4 },
        { cat:'tempo',    sym:'a tempo',   name:'A tempo',      meaning:'回原速',         grade:4 },
        { cat:'tempo',    sym:'più mosso', name:'Più mosso',    meaning:'更快地',         grade:6 },
        // 奏法 (Articulation)
        { cat:'articulation', sym:'⌢',   name:'Legato',    meaning:'連奏',             grade:2 },
        { cat:'articulation', sym:'·',   name:'Staccato',  meaning:'斷奏',             grade:2, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-art-staccato.png' },
        { cat:'articulation', sym:'>',   name:'Accent',    meaning:'重音',             grade:3, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-art-accent.png' },
        { cat:'articulation', sym:'—',   name:'Tenuto',    meaning:'持音（保持音值）', grade:5, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-art-tenuto.png' },
        { cat:'articulation', sym:'𝄐',   name:'Fermata',   meaning:'延長號',           grade:5, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-art-fermata.png' },
        { cat:'articulation', sym:'^',   name:'Marcato',   meaning:'強奏',             grade:6 },
        // 調號 (Key Signatures) — use extracted PDF images
        { cat:'keysig', sym:'0♯ 0♭', name:'C大調 / a小調', meaning:'無升降號',         grade:1, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-0n.png' },
        { cat:'keysig', sym:'1♯',    name:'G大調 / e小調', meaning:'升 Fa（F♯）',      grade:3, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-1s.png' },
        { cat:'keysig', sym:'2♯',    name:'D大調 / b小調', meaning:'升 Fa、Do',        grade:4, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-2s.png' },
        { cat:'keysig', sym:'3♯',    name:'A大調 / f♯小調',meaning:'升 Fa、Do、Sol',   grade:5, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-3s.png' },
        { cat:'keysig', sym:'4♯',    name:'E大調 / c♯小調',meaning:'升 Fa Do Sol Re', grade:6, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-4s.png' },
        { cat:'keysig', sym:'1♭',    name:'F大調 / d小調', meaning:'降 Si（B♭）',      grade:3, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-1f.png' },
        { cat:'keysig', sym:'2♭',    name:'B♭大調 / g小調',meaning:'降 Si、Mi',        grade:4, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-2f.png' },
        { cat:'keysig', sym:'3♭',    name:'E♭大調 / c小調',meaning:'降 Si、Mi、La',    grade:5, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-3f.png' },
        { cat:'keysig', sym:'4♭',    name:'A♭大調 / f小調',meaning:'降 Si Mi La Re',   grade:6, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/keysig-4f.png' },
        // 曲式記號 (Form/Repeat)
        { cat:'form', sym:'‖: :‖',  name:'反覆記號',  meaning:'重複演奏一段', grade:2, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-bar-repeat-start.png' },
        { cat:'form', sym:'1.  2.', name:'第一/二括', meaning:'第一/二次結尾',grade:3 },
        { cat:'form', sym:'D.C.',   name:'Da Capo',   meaning:'從頭再奏',     grade:4 },
        { cat:'form', sym:'D.S.',   name:'Dal Segno', meaning:'從記號重奏',   grade:4, img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/cards/sym-sym-segno.png' },
        { cat:'form', sym:'Fine',   name:'Fine',      meaning:'樂曲結束',     grade:4 },
        // 情緒/表情 (Expression/Character)
        { cat:'expression', sym:'cantabile',  name:'Cantabile',  meaning:'如歌地',   grade:5 },
        { cat:'expression', sym:'dolce',      name:'Dolce',      meaning:'甜美地',   grade:5 },
        { cat:'expression', sym:'espressivo', name:'Espressivo', meaning:'有表情地', grade:6 },
        { cat:'expression', sym:'maestoso',   name:'Maestoso',   meaning:'雄壯地',   grade:6 },
        { cat:'expression', sym:'giocoso',    name:'Giocoso',    meaning:'嬉戲地',   grade:6 },
        { cat:'expression', sym:'tranquillo', name:'Tranquillo', meaning:'平靜地',   grade:6 },
    ];

    const CAT_LABELS = { dynamics:'力度', tempo:'速度', articulation:'奏法', keysig:'調號', form:'記號', expression:'情緒' };

    let g3StudyActiveCat = 'all';
    let g3StudyActiveGrade = 0;

    function renderStudyGrid() {
        const grid = document.getElementById('g3TermsGrid');
        if (!grid) return;
        const filtered = FULL_TERMS_TABLE.filter(t =>
            (g3StudyActiveCat === 'all' || t.cat === g3StudyActiveCat) &&
            (g3StudyActiveGrade === 0 || t.grade === g3StudyActiveGrade)
        );
        if (filtered.length === 0) {
            grid.innerHTML = '<div class="study-terms-empty">此篩選條件下沒有術語 🎵</div>';
            return;
        }
        grid.innerHTML = filtered.map(t => {
            let visual = '';
            if (t.img) {
                visual = `<img src="${escHtml(t.img)}" class="study-term-img" alt="${escHtml(t.sym)}" loading="lazy">`;
            } else if (t.cat === 'form' && FORM_SVG[t.sym]) {
                visual = FORM_SVG[t.sym];
            } else {
                visual = `<div class="study-term-sym">${escHtml(t.sym)}</div>`;
            }
            const showSym = (t.img || t.cat === 'keysig' || t.cat === 'form') ? '' : '';
            const nameHtml = t.cat === 'keysig'
                ? `<div class="study-term-name study-ks-name"><strong>${escHtml(t.name)}</strong></div>`
                : `<div class="study-term-name">${escHtml(t.name)}</div>`;
            const meaningHtml = t.cat === 'keysig'
                ? `<div class="study-term-meaning study-ks-notes">${escHtml(t.meaning)}</div>`
                : `<div class="study-term-meaning">${escHtml(t.meaning)}</div>`;
            const speakKey = G3_PRONUNCIATION[t.name] || G3_PRONUNCIATION[t.sym] || '';
            const audioHtml = speakKey
                ? `<button class="study-audio-btn" data-speak="${escHtml(speakKey)}" title="播放發音">🔊</button>`
                : '';
            return `<div class="study-term-card cat-${escHtml(t.cat)}">
                ${audioHtml}
                ${visual}
                ${nameHtml}
                ${meaningHtml}
            </div>`;
        }).join('');
    }

    function openStudyScreen() {
        g3StudyActiveCat = 'all';
        g3StudyActiveGrade = 0;
        // Reset tab/grade button states
        document.querySelectorAll('.study-tab').forEach(b => b.classList.toggle('active', b.dataset.cat === 'all'));
        document.querySelectorAll('.study-grade-btn').forEach(b => b.classList.toggle('active', b.dataset.grade === '0'));
        renderStudyGrid();
        switchScreen('screen-g3-study');
    }

    // 🔊 Event delegation for study card audio buttons
    document.getElementById('g3TermsGrid').addEventListener('click', function(e) {
        const btn = e.target.closest('.study-audio-btn');
        if (!btn) return;
        const text = btn.dataset.speak;
        if (!text || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'it-IT';
        utter.rate = 0.85;
        btn.classList.add('playing');
        utter.onend = () => btn.classList.remove('playing');
        utter.onerror = () => btn.classList.remove('playing');
        window.speechSynthesis.speak(utter);
    });

    // Tab & grade filter listeners (set up once)
    document.querySelectorAll('.study-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            g3StudyActiveCat = btn.dataset.cat;
            document.querySelectorAll('.study-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderStudyGrid();
        });
    });
    document.querySelectorAll('.study-grade-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            g3StudyActiveGrade = Number(btn.dataset.grade);
            document.querySelectorAll('.study-grade-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderStudyGrid();
        });
    });
    document.getElementById('g3StudyBack').addEventListener('click', () => switchScreen('screen-g3-setup'));
    document.getElementById('g3StudyStartBtn').addEventListener('click', () => switchScreen('screen-g3-setup'));

    // Rank filter listeners — set up once (use current game state for user)
    document.getElementById('g3RankClass').addEventListener('change', () => renderLocalRankList('game3','g3RankList', g3State.user, g3State.difficulty));
    document.getElementById('g3RankGrade').addEventListener('change', () => renderLocalRankList('game3','g3RankList', g3State.user, g3State.difficulty));
    document.getElementById('g4RankClass').addEventListener('change', () => renderLocalRankList('game4','g4RankList', g4State?.user));
    document.getElementById('g4RankGrade').addEventListener('change', () => renderLocalRankList('game4','g4RankList', g4State?.user));

    let g3State = {};
    let g3TimerHandle = null;

    function makeKeySigSvg(count, type) {
        // Staff lines: 5 lines, y = 12 20 28 36 44 (gap=8), bottom=E4 top=F5
        // Sharp order F C G D A E B → positions on treble staff
        const sharpY = [12, 24,  8, 20, 32, 16, 28]; // F5 C5 G5 D5 A4 E5 B4
        // Flat order  B E A D G C F → positions on treble staff
        const flatY  = [28, 16, 32, 20, 36, 24, 40]; // B4 E5 A4 D5 G4 C5 F4
        const positions = type === 'sharp' ? sharpY : flatY;
        const sym = type === 'sharp' ? '\u266F' : '\u266D'; // ♯ or ♭
        const xStart = 26, xGap = 16;
        const W = Math.max(xStart + (count - 1) * xGap + 36, 80);
        const H = 60;
        const lineY = [12, 20, 28, 36, 44];
        const staff = lineY.map(y =>
            `<line x1="4" y1="${y}" x2="${W - 4}" y2="${y}" stroke="#555" stroke-width="1.3"/>`
        ).join('');
        const dy = type === 'sharp' ? 7 : 9; // baseline offset to centre on staff position
        const accs = Array.from({length: count}, (_, i) => {
            const x = xStart + i * xGap;
            const y = positions[i];
            return `<text x="${x}" y="${y + dy}" font-size="19" font-weight="900" fill="#1E293B" font-family="serif" text-anchor="middle">${sym}</text>`;
        }).join('');
        return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="keysig-quiz-svg">${staff}${accs}</svg>`;
    }

    // 🔊 Italian pronunciation map (symbol → full Italian word)
    const G3_PRONUNCIATION = {
        'f':'forte','p':'piano','mf':'mezzo forte','mp':'mezzo piano',
        'ff':'fortissimo','pp':'pianissimo','cresc.':'crescendo','decresc.':'decrescendo',
        'Forte':'forte','Piano':'piano','sfz':'sforzando','sf':'sforzando',
        'fp':'forte piano',
        'rit.':'ritardando','accel.':'accelerando',
        'D.C.':'Da Capo','D.S.':'Dal Segno','Fine':'fine',
        'a tempo':'a tempo','legato':'legato','cantabile':'cantabile',
        'staccato':'staccato','molto forte':'molto forte','poco a poco':'poco a poco',
        'Andante':'andante','Allegro':'allegro','Adagio':'adagio',
        'Moderato':'moderato','Presto':'presto','Largo':'largo',
        'Andantino':'andantino','Allegretto':'allegretto','Vivace':'vivace',
        'Grave':'grave','più mosso':'più mosso',
        'dolce':'dolce','espressivo':'espressivo','maestoso':'maestoso',
        'giocoso':'giocoso','tranquillo':'tranquillo',
        // Capitalized name lookups for study cards
        'Pianissimo':'pianissimo','Mezzo-piano':'mezzo piano','Mezzo-forte':'mezzo forte',
        'Fortissimo':'fortissimo','Sforzando':'sforzando','Forte-piano':'forte piano',
        'Crescendo':'crescendo','Decrescendo':'decrescendo',
        'Ritardando':'ritardando','Accelerando':'accelerando',
        'A tempo':'a tempo','Più mosso':'più mosso',
        'Legato':'legato','Staccato':'staccato','Accent':'accento',
        'Tenuto':'tenuto','Fermata':'fermata','Marcato':'marcato',
        'Da Capo':'da capo','Dal Segno':'dal segno',
        'Cantabile':'cantabile','Dolce':'dolce','Espressivo':'espressivo',
        'Maestoso':'maestoso','Giocoso':'giocoso','Tranquillo':'tranquillo',
        '第一/二括':'primo e secondo','反覆記號':'ripetizione',
    };

    let g3CurrentSym = null;

    function g3PlayAudio() {
        if (!g3CurrentSym) return;
        const text = G3_PRONUNCIATION[g3CurrentSym] || g3CurrentSym;
        // Only speak if it looks like a real word (not just symbols)
        if (!text || /^[<>·—𝜺𝐐|:\s‖]+$/.test(text)) return;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = 'it-IT';
            utter.rate = 0.85;
            utter.pitch = 1;
            const btn = document.getElementById('g3AudioBtn');
            if (btn) btn.classList.add('playing');
            utter.onend = () => { if (btn) btn.classList.remove('playing'); };
            utter.onerror = () => { if (btn) btn.classList.remove('playing'); };
            window.speechSynthesis.speak(utter);
        }
    }

    document.getElementById('g3AudioBtn').addEventListener('click', g3PlayAudio);

    function startGame3(user, mode, difficulty) {
        mode = mode || 'challenge';
        difficulty = difficulty || 'easy';
        const isChallenge = mode === 'challenge';
        g3State = { user, mode, difficulty, score: 0, combo: 0, maxCombo: 0, qIdx: 0, wrong: 0, correct: 0, questions: [], totalTime: isChallenge ? 60 : Infinity, globalTimeLeft: isChallenge ? 60 : Infinity, mistakes: [] };
        if (g3TimerHandle) clearInterval(g3TimerHandle);
        audio.init(); audio.warmUp();

        const pool = (G3_DIFF_POOL[difficulty] || G3_DIFF_POOL.easy)();
        // For challenge mode, we need a large shuffled pool; recycle if needed
        for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
        g3State.questions = pool;
        g3State._pool = pool; // keep reference for recycling

        const modeLabel = isChallenge ? '⏱️ 限時挑戰 (60秒)' : '📝 練習模式';
        const diffEmoji = (DIFFICULTY_CONFIG[difficulty] || {}).emoji || '';
        document.getElementById('g3User').textContent = `👋 ${user.name} 同學 — 音樂術語 ${modeLabel} ${diffEmoji}`;
        document.getElementById('g3EndBtn').onclick = () => endGame3();
        document.getElementById('g3BackBtn').onclick = () => { if (g3TimerHandle) clearInterval(g3TimerHandle); switchScreen('screen-hub'); };
        switchScreen('screen-game3');

        // Start global countdown for challenge mode
        if (isChallenge) {
            const timerEl = document.getElementById('g3Timer');
            const g3timerFill = document.getElementById('g3TimerFill');
            if (g3timerFill) { g3timerFill.style.width = '100%'; g3timerFill.classList.remove('urgent'); }
            const updateGlobalTimer = () => {
                if (timerEl) timerEl.textContent = g3State.globalTimeLeft + 's';
                const pct = (g3State.globalTimeLeft / g3State.totalTime) * 100;
                if (g3timerFill) { g3timerFill.style.width = pct + '%'; if (g3State.globalTimeLeft <= 10) g3timerFill.classList.add('urgent'); else g3timerFill.classList.remove('urgent'); }
                if (timerEl) { if (g3State.globalTimeLeft <= 10) timerEl.style.color = 'var(--primary-red)'; else timerEl.style.color = ''; }
            };
            updateGlobalTimer();
            g3TimerHandle = setInterval(() => {
                g3State.globalTimeLeft--;
                updateGlobalTimer();
                if (g3State.globalTimeLeft <= 0) {
                    clearInterval(g3TimerHandle); g3TimerHandle = null;
                    document.querySelectorAll('.quiz-opt-btn').forEach(b => b.disabled = true);
                    setTimeout(() => endGame3(), 400);
                }
            }, 1000);
        }
        renderG3Question();
    }

    function _getG3Question() {
        // Get next question, recycle pool if exhausted
        if (g3State.qIdx >= g3State.questions.length) {
            // Reshuffle and reset index
            const pool = g3State._pool.slice();
            for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
            g3State.questions = pool;
            g3State.qIdx = 0;
        }
        return g3State.questions[g3State.qIdx];
    }

    function renderG3Question() {
        const isChallenge = g3State.mode === 'challenge';
        // For challenge, check if time is up
        if (isChallenge && g3State.globalTimeLeft <= 0) { endGame3(); return; }
        // For practice, stop after 10 questions
        if (!isChallenge && g3State.qIdx >= 10) { endGame3(); return; }

        const q = _getG3Question();
        const totalAnswered = g3State.correct + g3State.wrong;
        if (isChallenge) {
            document.getElementById('g3Progress').textContent = `${totalAnswered}題`;
            document.getElementById('g3QNum').textContent = `已答 ${totalAnswered} 題`;
        } else {
            document.getElementById('g3Progress').textContent = `${g3State.qIdx+1}/10`;
            document.getElementById('g3QNum').textContent = `第 ${g3State.qIdx+1} 題 / 共 10 題`;
        }
        document.getElementById('g3Score').textContent = g3State.score;
        document.getElementById('g3Combo').textContent = g3State.combo;

        // Progress bar for practice mode only
        const g3pfill = document.getElementById('g3ProgressFill');
        if (g3pfill) g3pfill.style.width = (isChallenge ? 0 : (g3State.qIdx / 10) * 100) + '%';

        // Timer for practice mode (no per-question timer, show infinity)
        if (!isChallenge) {
            const timerEl = document.getElementById('g3Timer');
            const g3timerFill = document.getElementById('g3TimerFill');
            if (timerEl) timerEl.textContent = '∞';
            if (g3timerFill) g3timerFill.style.width = '100%';
        }

        document.getElementById('g3Question').textContent = q.q;
        // 🔊 Audio button: show only when there's a speakable term
        const audioBtn = document.getElementById('g3AudioBtn');
        const sym = q.sym || '';
        const hasSpeakable = sym && !/^[<>·—𝜺𝐐|:\s‖]+$/.test(sym) && (G3_PRONUNCIATION[sym] || /[a-zA-Z]/.test(sym));
        g3CurrentSym = hasSpeakable ? sym : null;
        if (audioBtn) audioBtn.classList.toggle('hidden', !hasSpeakable);

        document.getElementById('g3Visual').innerHTML = q.ksImg
            ? `<div class="ks-quiz-visual"><img src="${escHtml(q.ksImg)}" class="ks-card-img" alt="調號卡" loading="eager">${q.ksCaption ? `<div class="ks-quiz-caption">${q.ksCaption}</div>` : ''}</div>`
            : q.keySig
            ? makeKeySigSvg(q.keySig.count, q.keySig.type)
            : q.img
            ? `<img src="${escHtml(q.img)}" class="quiz-card-img" alt="${escHtml(q.sym || '')}" loading="eager">`
            : `<div class="term-display term-italic">${escHtml(q.sym || '')}</div>`;
        // Fallback: if card image fails to load, show the symbol as text
        const visualEl = document.getElementById('g3Visual');
        const imgEl = visualEl && visualEl.querySelector('img.quiz-card-img');
        if (imgEl) { const sym_ = q.sym || ''; imgEl.onerror = () => { imgEl.outerHTML = `<div class="term-display term-italic">${escHtml(sym_)}</div>`; }; }
        document.getElementById('g3Message').textContent = '📖 快速選出正確答案！';
        document.getElementById('g3Message').className = 'message-box';

        const optEl = document.getElementById('g3Options');
        optEl.innerHTML = '';
        const G3_LETTERS = ['A', 'B', 'C', 'D'];
        q.opts.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-opt-btn';
            btn.dataset.answer = opt;
            const optImg = q.optImgMap && q.optImgMap[opt];
            const optContent = optImg
                ? `<img src="${escHtml(optImg)}" class="quiz-opt-img" alt="${escHtml(opt)}" loading="eager">`
                : escHtml(opt);
            btn.innerHTML = `<span class="opt-letter">${G3_LETTERS[i]}</span><span class="opt-text">${optContent}</span>`;
            btn.addEventListener('click', () => handleG3Answer(opt, q.ans, btn, q));
            optEl.appendChild(btn);
        });
    }

    function handleG3Answer(chosen, correct, btn, q) {
        const isCorrect = chosen === correct;
        document.querySelectorAll('.quiz-opt-btn').forEach(b => b.disabled = true);
        const msgEl = document.getElementById('g3Message');
        if (isCorrect) {
            btn.classList.add('correct');
            g3State.combo++;
            g3State.correct++;
            if (g3State.combo > g3State.maxCombo) g3State.maxCombo = g3State.combo;
            let pts = 10;
            if (g3State.combo >= 5) pts += 10;
            g3State.score += pts;
            audio.playEffect && audio.playEffect('countdown');
            msgEl.textContent = `✅ 答對！+${pts} 分`;
            msgEl.className = 'message-box correct';
        } else {
            btn.classList.add('wrong');
            document.querySelectorAll('.quiz-opt-btn').forEach(b => { if (b.dataset.answer === correct) b.classList.add('correct'); });
            g3State.combo = 0; g3State.wrong++;
            g3State.mistakes.push({ q: q.q, sym: q.sym, chosen, correct, explain: q.explain || '' });
            audio.playEffect && audio.playEffect('wrong');
            const explainText = q.explain ? `　💡 ${q.explain}` : '';
            msgEl.textContent = `❌ 答錯！正確答案是「${correct}」${explainText}`;
            msgEl.className = 'message-box wrong';
        }
        document.getElementById('g3Score').textContent = g3State.score;
        document.getElementById('g3Combo').textContent = g3State.combo;
        g3State.qIdx++;
        const _isChallenge = g3State.mode === 'challenge';
        setTimeout(() => renderG3Question(), _isChallenge ? 980 : 1300);
    }

    function endGame3() {
        if (g3TimerHandle) { clearInterval(g3TimerHandle); g3TimerHandle = null; }
        const { user, score, wrong, maxCombo, mode, difficulty, correct: correctCount } = g3State;
        const totalAnswered = (correctCount || 0) + wrong;
        const correct = correctCount || 0;
        let finalScore = score;
        if (mode !== 'practice' && wrong === 0 && totalAnswered > 0) finalScore += 20; // all correct bonus
        g3State.score = finalScore;
        const accuracy = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;
        const diffLabel = (DIFFICULTY_CONFIG[difficulty] || {}).label || 'Easy';
        if (mode !== 'practice') {
            saveLocalRank('game3', user, finalScore, accuracy, maxCombo, difficulty);
            submitScoreToGAS('game3', user, finalScore, accuracy, maxCombo, '音樂術語·' + diffLabel);
            recordGameResult(user, 'game3', finalScore, accuracy, maxCombo, difficulty);
        }

        const practiceNote = mode === 'practice' ? '<div style="text-align:center;color:var(--text-light);font-size:0.85rem;margin-top:6px;">📝 練習模式成績不計入排行榜</div>' : '';
        document.getElementById('g3ReportGrid').innerHTML = `
            <div class="report-item"><div class="report-label">答題數</div><div class="report-value">${totalAnswered}</div></div>
            <div class="report-item"><div class="report-label">得分</div><div class="report-value">${finalScore}</div></div>
            <div class="report-item"><div class="report-label">正確率</div><div class="report-value">${accuracy}%</div></div>
            <div class="report-item"><div class="report-label">答錯</div><div class="report-value" style="color:var(--primary-red)">${wrong}</div></div>
            <div class="report-item"><div class="report-label">最高連對</div><div class="report-value">${maxCombo}</div></div>` + practiceNote;
        document.getElementById('g3Weakness').innerHTML = wrong === 0
            ? '<div>🌟 全部答對！你是音樂術語小專家！🎉</div>'
            : `<div>繼續練習加油！正確 ${correct}/${totalAnswered} 題。</div>`;

        // Render mistake review
        const g3MistakeEl = document.getElementById('g3MistakeReview');
        if (g3MistakeEl) {
            if (g3State.mistakes.length > 0) {
                g3MistakeEl.innerHTML = '<div class="mistake-review-title">📝 錯題回顧</div>' +
                    g3State.mistakes.map(m => `<div class="mistake-item">
                        <div class="mistake-q">${escHtml(m.q)}</div>
                        <div class="mistake-detail"><span class="mistake-wrong">你的答案：${escHtml(String(m.chosen))}</span> → <span class="mistake-correct">正確：${escHtml(String(m.correct))}</span></div>
                        ${m.explain ? `<div class="mistake-explain">💡 ${escHtml(m.explain)}</div>` : ''}
                    </div>`).join('');
            } else {
                g3MistakeEl.innerHTML = '';
            }
        }

        renderLocalRankList('game3', 'g3RankList', user, difficulty);
        if (mode !== 'practice') setTimeout(() => loadRanks().then(() => renderLocalRankList('game3', 'g3RankList', user, difficulty)).catch(()=>{}), 2500);
        document.getElementById('g3PlayAgain').onclick = () => switchScreen('screen-g3-setup');
        document.getElementById('g3BackToHub').onclick = () => switchScreen('screen-g3-setup');
        const g3Layout = document.getElementById('g3LeaderboardLayout');
        if (g3Layout) g3Layout.classList.remove('view-only');
        const g3RBack = document.getElementById('g3ResultBack');
        if (g3RBack) g3RBack.style.display = 'none';
        switchScreen('screen-game3-result');
    }

    // ==========================================
    // 遊戲四：樂器辨別 (Instrument Identification)
    // ==========================================

    const INSTRUMENT_BANK = [
        // ── 弦樂 Strings ──
        { id:'violin',      nameZh:'小提琴',     nameEn:'Violin',       family:'strings',    familyZh:'弦樂', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/violin.jpg', desc:'弦樂家族中音域最高的樂器',
          history:'小提琴誕生於16世紀的意大利北部，由製琴師安德烈亞·阿馬蒂奠定基礎形制。克里蒙納城成為製琴聖地，斯特拉迪瓦里和瓜奈里·德·耶穌所製作的名琴至今仍是無價之寶，部分估值超過一億港元。小提琴有四根弦，調音為G-D-A-E，是管弦樂團中數量最多的樂器，佔據第一及第二小提琴聲部。著名作曲家帕格尼尼以超技炫技改變了小提琴演奏的可能性，而巴赫的《無伴奏奏鳴曲與組曲》至今仍是最高難度的獨奏曲目之一。',
          video:'https://www.youtube.com/embed/Di0oB_KtqoY',
          synthParams:{ wave:'sawtooth', freq:660, dur:1.0, attack:0.05, vol:0.25, filterType:'lowpass', filterFreq:2200, filterQ:1, vibRate:5.5, vibDepth:4 }},
        { id:'viola',        nameZh:'中提琴',     nameEn:'Viola',        family:'strings',    familyZh:'弦樂', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/viola.jpg', desc:'比小提琴稍大，音色較溫暖',
          history:'中提琴與小提琴幾乎同時在16世紀的意大利出現，體型比小提琴大約15%至20%，調音為C-G-D-A。它音色較溫暖深沉，在管弦樂團中負責中音聲部，使用中音譜號（C譜號，亦稱中提琴譜號）記譜——這是現代管弦樂中少數仍使用C譜號的場合。中提琴長期被視為「次要樂器」，直到20世紀才逐漸受到重視，英國作曲家沃爾頓和巴爾托克均為其創作了重要的協奏曲。',
          video:'https://www.youtube.com/embed/oHR_wn1Fe9M',
          synthParams:{ wave:'sawtooth', freq:440, dur:1.0, attack:0.06, vol:0.25, filterType:'lowpass', filterFreq:1800, filterQ:1, vibRate:5, vibDepth:3.5 },
          parts:[
            { nameZh:'琴頭',  nameEn:'Scroll',      x:55, y:2,  lx:78,  ly:4,  len:23.3 },
            { nameZh:'調音栓', nameEn:'Tuning Peg',  x:63, y:14, lx:100, ly:15, len:37.0 },
            { nameZh:'琴頸',  nameEn:'Neck',         x:48, y:27, lx:32,  ly:28, len:16.1 },
            { nameZh:'弦線',  nameEn:'Strings',      x:45, y:47, lx:12,  ly:46, len:33.0 },
            { nameZh:'琴橋',  nameEn:'Bridge',       x:45, y:71, lx:83,  ly:69, len:38.1 },
            { nameZh:'琴身',  nameEn:'Body',         x:60, y:52, lx:81,  ly:51, len:21.0 },
            { nameZh:'腮托',  nameEn:'Chin Rest',    x:31, y:92, lx:7,   ly:94, len:24.1 },
          ]},
        { id:'cello',        nameZh:'大提琴',     nameEn:'Cello',        family:'strings',    familyZh:'弦樂', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/cello.jpg', desc:'坐着演奏的大型弦樂器',
          history:'大提琴全名Violoncello，16世紀在意大利誕生。演奏時坐着，以末端的尾針支撐於地上。它的音域寬廣達四個八度，既能演奏渾厚的低音旋律，也能唱出如人聲般高亢的獨奏線條。巴赫的六首《無伴奏大提琴組曲》是音樂史上最偉大的獨奏作品之一，曾被遺忘多年，由卡薩爾斯重新發現並推廣。大提琴在交響樂中與低音大提琴共同支撐和聲基礎。',
          video:'https://www.youtube.com/embed/IDn88XRtCqE',
          synthParams:{ wave:'sawtooth', freq:220, dur:1.2, attack:0.07, vol:0.28, filterType:'lowpass', filterFreq:1500, filterQ:0.8, vibRate:4.5, vibDepth:3 }},
        { id:'double-bass',  nameZh:'低音大提琴', nameEn:'Double Bass',  family:'strings',    familyZh:'弦樂', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/double-bass.jpg', desc:'弦樂家族中最大最低沉的',
          history:'低音大提琴是弦樂家族中最大的樂器，高約180厘米，演奏者通常站着或坐在高凳上演奏。它有四根（或五根）弦，比大提琴低一個八度。低音大提琴不僅是古典管弦樂團的低音支柱，在爵士樂中以撥弦方式（pizzicato）演奏，成為節奏組的靈魂。傳奇爵士音樂家查爾斯·明格斯將其發展為能演奏旋律和即興的主角樂器。',
          video:'https://www.youtube.com/embed/Gs72OWYKISk',
          synthParams:{ wave:'sawtooth', freq:110, dur:1.2, attack:0.08, vol:0.3, filterType:'lowpass', filterFreq:1000, filterQ:0.7, vibRate:4, vibDepth:2 },
          parts:[
            { nameZh:'琴頭',  x:50, y:4,  lx:30, ly:6,  len:20.1 },
            { nameZh:'調音栓', x:50, y:9,  lx:62, ly:9,  len:12.0 },
            { nameZh:'琴頸',  x:50, y:18, lx:38, ly:18, len:12.0 },
            { nameZh:'弦線',  x:50, y:42, lx:38, ly:42, len:12.0 },
            { nameZh:'琴橋',  x:50, y:60, lx:62, ly:60, len:12.0 },
            { nameZh:'琴身',  x:56, y:50, lx:68, ly:50, len:12.0 },
            { nameZh:'腳針',  x:51, y:99, lx:72, ly:95, len:21.4 },
          ]},
        { id:'harp',         nameZh:'豎琴',       nameEn:'Harp',         family:'strings',    familyZh:'弦樂', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/harp.png', desc:'用手指撥弦演奏的大型樂器',
          history:'豎琴是人類最古老的樂器之一，可追溯至公元前3000年的古埃及和美索不達米亞。現代演奏用的踏板豎琴由法國製琴師塞巴斯蒂安·艾拉爾在1810年改良定型，擁有47根弦和7個踏板。每個踏板有三個位置，可將對應音名升降半音，從而在所有調性中演奏。豎琴音色空靈夢幻，常用於製造閃爍的琶音效果，是管弦樂團中的特殊色彩樂器。',
          video:'https://www.youtube.com/embed/QypI0Vt8qhU',
          synthParams:{ wave:'sine', freq:523, dur:1.5, attack:0.005, vol:0.3, sustain:0.3 },
          parts:[
            { nameZh:'頸',   x:40, y:14, lx:58,  ly:13, len:18.0 },
            { nameZh:'前柱', x:25, y:50, lx:2,   ly:50, len:23.0 },
            { nameZh:'弦線', x:45, y:42, lx:64,  ly:42, len:19.0 },
            { nameZh:'共鳴箱', x:60, y:67, lx:97, ly:69, len:37.1 },
            { nameZh:'琴聲板', x:58, y:55, lx:100,ly:57, len:42.0 },
            { nameZh:'腳踏', x:64, y:86, lx:89,  ly:94, len:26.2 },
          ]},
        { id:'guitar',       nameZh:'結他',       nameEn:'Guitar',       family:'strings',    familyZh:'弦樂', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/guitar.jpg', desc:'用手指或撥片彈奏的弦樂器',
          history:'結他（吉他）的歷史可追溯至4000年前的古代近東，現代六弦古典結他由西班牙工匠安東尼奧·德·托雷斯在19世紀中葉定型。20世紀電結他的發明徹底改變了流行音樂，搖滾、藍調、爵士均以電結他為核心。結他是世界上最流行的樂器，全球估計有數億名演奏者。著名結他手包括古典的塞戈維亞、爵士的喬·帕斯，以及搖滾的吉米·亨德里克斯。',
          video:'https://www.youtube.com/embed/W--hpA9WPTA',
          synthParams:{ wave:'triangle', freq:330, dur:1.0, attack:0.005, vol:0.3, filterType:'lowpass', filterFreq:2500, filterQ:0.5 }},
        { id:'bass-guitar',  nameZh:'低音結他',   nameEn:'Bass Guitar',  family:'strings',    familyZh:'弦樂', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/bass-guitar.jpg', desc:'電低音弦樂器，節奏的支柱',
          history:'電低音結他（電貝斯）由列奧·芬德在1951年發明，設計目的是取代傳統爵士樂隊中笨重的低音大提琴，同時讓聲音更能通過擴音系統放大。它通常有4根弦（也有5或6弦型號），比結他低一個八度。傳奇貝斯手詹姆斯·詹姆森奠定了流行和節奏藍調音樂的貝斯風格，而約翰·保羅·瓊斯和約翰·班漢則把搖滾貝斯推向新高度。',
          video:'https://www.youtube.com/embed/2hDM0yO27Gs',
          synthParams:{ wave:'triangle', freq:165, dur:1.0, attack:0.005, vol:0.35, filterType:'lowpass', filterFreq:1200, filterQ:0.5 },
          parts:[
            { nameZh:'琴頭',  nameEn:'Headstock', x:67, y:4,  lx:86, ly:2,  len:19.1 },
            { nameZh:'琴頸',  nameEn:'Neck',       x:63, y:18, lx:82, ly:16, len:19.1 },
            { nameZh:'品柱',  nameEn:'Frets',      x:59, y:32, lx:78, ly:30, len:19.1 },
            { nameZh:'弦線',  nameEn:'Strings',    x:55, y:45, lx:36, ly:44, len:19.0 },
            { nameZh:'拾音器', nameEn:'Pickup',    x:51, y:62, lx:70, ly:60, len:19.1 },
            { nameZh:'琴身',  nameEn:'Body',       x:51, y:72, lx:70, ly:70, len:19.1 },
            { nameZh:'旋鈕',  nameEn:'Knobs',      x:51, y:80, lx:33, ly:80, len:18.0 },
          ]},
        { id:'ukulele',      nameZh:'烏克麗麗',   nameEn:'Ukulele',      family:'strings',    familyZh:'弦樂', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/ukulele.jpg', desc:'來自夏威夷的小型四弦琴',
          history:'烏克麗麗（Ukulele）在19世紀由葡萄牙馬德拉島移民帶到夏威夷，並融合當地文化發展而成。其名字在夏威夷語中意為「跳動的跳蚤」，形容演奏者快速撥弦的手指動作。它有4根腸衣弦或尼龍弦，常見調音為G-C-E-A，體型小巧，分為高音、中音、次中音及低音四種型號。20世紀初夏威夷音樂的流行讓烏克麗麗享譽全球，近年再度成為兒童及初學者的熱門入門樂器。',
          video:'https://www.youtube.com/embed/5MgBikgcWnY',
          synthParams:{ wave:'triangle', freq:440, dur:0.6, attack:0.003, vol:0.25, filterType:'lowpass', filterFreq:3000, filterQ:0.5 },
          parts:[
            { nameZh:'琴頭', nameEn:'Headstock',  x:50, y:7,  lx:77, ly:7,  len:27.0 },
            { nameZh:'調音栓', nameEn:'Tuning Peg', x:46, y:11, lx:20, ly:13, len:26.1 },
            { nameZh:'琴頸', nameEn:'Neck',         x:50, y:24, lx:31, ly:25, len:19.0 },
            { nameZh:'品柱', nameEn:'Frets',        x:53, y:33, lx:65, ly:33, len:12.0 },
            { nameZh:'弦線', nameEn:'Strings',      x:50, y:46, lx:22, ly:47, len:28.0 },
            { nameZh:'音孔', nameEn:'Sound Hole',   x:51, y:68, lx:82, ly:68, len:31.0 },
            { nameZh:'琴橋', nameEn:'Bridge',       x:51, y:86, lx:83, ly:85, len:32.0 },
          ]},
        { id:'banjo',        nameZh:'班卓琴',     nameEn:'Banjo',        family:'strings',    familyZh:'弦樂', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/banjo.jpg', desc:'圓形共鳴體的撥弦樂器',
          history:'班卓琴源自西非的弦鼓，由被販賣到美洲的非洲人帶來並演變而成。圓形琴身以動物皮膜（現多為合成皮）覆蓋作共鳴板，產生獨特的清脆穿透音色。在美國南部，班卓琴成為鄉村音樂、藍草音樂和舊時爵士的核心樂器。典型演奏技法包括三指撥奏（三指技法）和雙指撥奏。名手厄爾·史克魯格斯的三指技法革命性地改變了班卓的演奏方式。',
          video:'https://www.youtube.com/embed/dxPVyieptwA',
          synthParams:{ wave:'triangle', freq:392, dur:0.5, attack:0.002, vol:0.28, filterType:'lowpass', filterFreq:3500, filterQ:0.8 }},
        { id:'mandolin',     nameZh:'曼陀林',     nameEn:'Mandolin',     family:'strings',    familyZh:'弦樂', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/mandolin.jpg', desc:'淚滴形的小型弦樂器',
          history:'曼陀林起源於17世紀的意大利那不勒斯，由中世紀的魯特琴演變而來。它有8根鋼弦，按G-D-A-E四組雙弦排列，與小提琴音域相同，用撥片快速撥奏（顫音奏法）來模擬持續音效。曼陀林在意大利民謠、藍草音樂及古典音樂中均有重要地位。韋瓦第和貝多芬均為其創作過樂曲，而比爾·孟羅則是現代藍草曼陀林的奠基人。',
          video:'https://www.youtube.com/embed/0We5g77yBMM',
          synthParams:{ wave:'triangle', freq:523, dur:0.4, attack:0.002, vol:0.25, filterType:'lowpass', filterFreq:3000, filterQ:0.6 },
          parts:[
            { nameZh:'琴頭', nameEn:'Headstock',  x:51, y:2,  lx:77, ly:6,  len:26.3 },
            { nameZh:'調音栓', nameEn:'Tuning Peg', x:42, y:7,  lx:24, ly:6,  len:18.0 },
            { nameZh:'琴頸', nameEn:'Neck',        x:49, y:25, lx:27, ly:28, len:22.2 },
            { nameZh:'品柱', nameEn:'Frets',       x:51, y:30, lx:63, ly:30, len:12.0 },
            { nameZh:'音孔', nameEn:'Sound Hole',  x:37, y:74, lx:18, ly:69, len:19.6 },
            { nameZh:'弦線', nameEn:'Strings',     x:51, y:42, lx:33, ly:42, len:18.0 },
            { nameZh:'琴橋', nameEn:'Bridge',      x:51, y:78, lx:82, ly:79, len:31.0 },
          ]},

        // ── 木管 Woodwind ──
        { id:'flute',        nameZh:'長笛',       nameEn:'Flute',        family:'woodwind',   familyZh:'木管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/flute.jpg', desc:'橫吹的金屬管樂器，音色清亮',
          history:'長笛是人類最古老的樂器之一，最早的骨笛可追溯至四萬年前的歐洲舊石器時代。現代橫吹長笛由德國人特奧巴爾德·波姆在1847年完成改良，改用銀製或鍍銀金屬管並設計了精密的環形按鍵系統，大幅提升了音準和音量。長笛是木管組中最高音的常規成員，演奏者向吹孔邊緣吹氣使空氣柱振動發聲，毋需使用簧片。莫札特、貝多芬、德布西和普羅高菲夫均為其創作了著名的協奏曲或奏鳴曲。',
          video:'https://www.youtube.com/embed/111yvjBvDyU',
          synthParams:{ wave:'sine', freq:880, dur:0.9, attack:0.05, vol:0.25, vibRate:5, vibDepth:4 },
          parts:[
            { nameZh:'頭管', nameEn:'Head Joint',      x:92, y:6,  lx:58, ly:5,  len:34.0 },
            { nameZh:'吹孔', nameEn:'Embouchure Hole',  x:89, y:10, lx:49, ly:21, len:41.5 },
            { nameZh:'上管', nameEn:'Upper Joint',      x:72, y:27, lx:95, ly:37, len:25.1 },
            { nameZh:'按鍵', nameEn:'Keys',             x:48, y:51, lx:28, ly:49, len:20.1 },
            { nameZh:'下管', nameEn:'Lower Joint',      x:36, y:69, lx:64, ly:68, len:28.0 },
            { nameZh:'喇叭口', nameEn:'Bell',           x:8,  y:96, lx:43, ly:94, len:35.1 },
          ]},
        { id:'clarinet',     nameZh:'單簧管',     nameEn:'Clarinet',     family:'woodwind',   familyZh:'木管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/clarinet.jpg', desc:'用單簧片振動發聲',
          history:'單簧管約在1700年由德國樂器師約翰·克里斯托弗·丹納在沙呂莫管的基礎上改良發明，使用一片蘆葦或合成簧片振動發聲。它音域寬廣達四個八度，低音區深沉如夜、高音區明亮輝煌，是管弦樂、爵士樂和室內樂中都極為重要的樂器。莫扎特深愛單簧管，其《A大調單簧管協奏曲》被譽為最美麗的木管協奏曲之一。爵士界的班尼·古德曼被稱為「搖擺樂之王」，更將單簧管推上流行文化的巔峰。',
          video:'https://www.youtube.com/embed/xKIKiYgRnHc',
          synthParams:{ wave:'square', freq:466, dur:0.9, attack:0.03, vol:0.18, filterType:'lowpass', filterFreq:1800, filterQ:2, vibRate:4.5, vibDepth:2 },
          parts:[
            { nameZh:'吹嘴',  nameEn:'Mouthpiece',   x:50, y:13, lx:62, ly:13, len:12.0 },
            { nameZh:'簧片',  nameEn:'Reed',          x:47, y:15, lx:35, ly:15, len:12.0 },
            { nameZh:'上管',  nameEn:'Upper Joint',   x:50, y:25, lx:62, ly:25, len:12.0 },
            { nameZh:'按鍵',  nameEn:'Keys',          x:46, y:43, lx:22, ly:43, len:24.0 },
            { nameZh:'下管',  nameEn:'Lower Joint',   x:50, y:60, lx:62, ly:60, len:12.0 },
            { nameZh:'喇叭口', nameEn:'Bell',         x:51, y:87, lx:71, ly:85, len:20.1 },
          ]},
        { id:'oboe',         nameZh:'雙簧管',     nameEn:'Oboe',         family:'woodwind',   familyZh:'木管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/oboe.jpg', desc:'音色尖銳明亮，用雙簧片發聲',
          history:'雙簧管在17世紀由法國宮廷樂師從肖姆管改良發展而來，使用兩片薄蘆葦簧片夾合振動發聲，音色尖銳穿透且略帶哀愁。由於雙簧管的A音音準極為穩定，管弦樂團在演出前通常以雙簧管吹出的A音（440Hz）作為全團調音基準。雙簧管演奏者需自行削製蘆葦簧片，是樂手技藝的重要部分。巴赫、莫扎特、理察·施特勞斯均為其創作了重要作品，普羅高菲夫的《彼得與狼》中以雙簧管代表鴨子。',
          video:'https://www.youtube.com/embed/NU-8cklBdYo',
          synthParams:{ wave:'sawtooth', freq:523, dur:0.8, attack:0.02, vol:0.15, filterType:'bandpass', filterFreq:1200, filterQ:3, vibRate:5, vibDepth:3 }},
        { id:'bassoon',      nameZh:'巴松管',     nameEn:'Bassoon',      family:'woodwind',   familyZh:'木管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/bassoon.jpg', desc:'木管家族中音域最低',
          history:'巴松管在16世紀的意大利從柯塔爾管演變而成，管身展開長約2.6米，折疊成U型以便演奏，重量約3公斤。它使用雙簧片發聲，是木管家族中音域最低的常規成員，低音區音色溫暖渾厚，高音區則帶有鼻腔共鳴感。普羅高菲夫《彼得與狼》以巴松管代表爺爺的角色，莫扎特的《巴松管協奏曲》是該樂器最著名的獨奏曲目。更大型的倍低音巴松管音域比巴松管低一個八度。',
          video:'https://www.youtube.com/embed/oSQ0fQnGg84',
          synthParams:{ wave:'sawtooth', freq:196, dur:1.0, attack:0.04, vol:0.2, filterType:'lowpass', filterFreq:900, filterQ:2, vibRate:4, vibDepth:2 }},
        { id:'recorder',     nameZh:'牧童笛',     nameEn:'Recorder',     family:'woodwind',   familyZh:'木管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/recorder.jpg', desc:'音樂課最常見的樂器',
          history:'直笛（牧童笛）的歷史可追溯至中世紀歐洲，在文藝復興和巴洛克時期曾是宮廷最重要的管樂器，巴赫和韋瓦第均為其創作了大量作品。它以頂端的吹口直接吹入發聲，構造簡單，按孔便可改變音高，無需額外技巧即可入門。18世紀橫吹長笛興起後，直笛一度沉寂，直至20世紀古樂復興運動才重獲重視。現今直笛被廣泛用作兒童音樂教育的入門樂器，常見型號包括高音、中音和次中音。',
          video:'https://www.youtube.com/embed/dMb1vABS2aM',
          synthParams:{ wave:'sine', freq:784, dur:0.7, attack:0.02, vol:0.22, vibRate:3, vibDepth:2 }},
        { id:'piccolo',      nameZh:'短笛',       nameEn:'Piccolo',      family:'woodwind',   familyZh:'木管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/piccolo.jpg', desc:'比長笛更小，音域最高',
          history:'短笛是長笛家族中最小的成員，長度約為標準長笛的一半，但音域比長笛高整整一個八度，是管弦樂團中音域最高的常規樂器。它在記譜時比實際音高低一個八度，以避免大量加線。短笛聲音尖銳穿透力極強，貝多芬在《第五交響曲》終樂章首次將其引入交響樂，此後成為管弦樂團的標準配置。在軍樂隊中，短笛是帶領隊伍行進的核心聲部。',
          video:'https://www.youtube.com/embed/111yvjBvDyU',
          synthParams:{ wave:'sine', freq:1568, dur:0.6, attack:0.03, vol:0.18, vibRate:6, vibDepth:5 },
          parts:[
                { nameZh:'吹孔', nameEn:'Embouchure Hole', x:86, y:29, lx:84, ly:77, len:22.4 },
                { nameZh:'管身', nameEn:'Body',            x:58, y:49, lx:70, ly:76, len:17.1 },
                { nameZh:'按鍵', nameEn:'Keys',            x:50, y:52, lx:44, ly:80, len:35.7 },
          ]},
        { id:'english-horn', nameZh:'英國管',     nameEn:'English Horn',  family:'woodwind',   familyZh:'木管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/english%20horn.jpg', desc:'比雙簧管音域低，帶梨形喇叭口',
          history:'英國管其實既不是「英國的」也不是「號角」，其法文名稱cor anglais可能源自「彎角」（cor anglé）的諧音。它是雙簧管的次中音版本，管身比雙簧管長，末端有獨特的梨形喇叭口，音域比雙簧管低五度。英國管音色溫暖憂鬱，常被用來表達思鄉、哀愁和遼闊的大自然。德沃夏克《新世界交響曲》第二樂章中英國管奏出的緩板主題，是音樂史上最令人動容的旋律之一。白遼士和西貝流士亦為其寫下精彩的獨奏段落。',
          video:'https://www.youtube.com/embed/ycgzqC92DbQ',
          synthParams:{ wave:'sawtooth', freq:349, dur:1.0, attack:0.03, vol:0.18, filterType:'bandpass', filterFreq:1000, filterQ:2.5, vibRate:4.5, vibDepth:2.5 }},
        { id:'alto-sax',     nameZh:'中音薩克斯風', nameEn:'Alto Saxophone', family:'woodwind', familyZh:'木管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/alto-sax.jpg', desc:'最常見的薩克斯風，音色溫暖',
          history:'薩克斯風由比利時樂器師阿道夫·薩克斯於1846年在法國巴黎發明並申請專利，目的是創造一種音量大於木管、音色柔和於銅管的樂器，以連接兩個家族。中音薩克斯風是最常見的型號，雖然管身由黃銅製造，但因使用單簧片發聲而依照聲學原理被歸類為木管樂器。薩克斯風在爵士樂的發展中舉足輕重，查理·帕克（中音）和約翰·科爾特蘭（次中音）重新定義了爵士樂的語言。',
          video:'https://www.youtube.com/embed/UYU4R-GfFr0',
          synthParams:{ wave:'sawtooth', freq:440, dur:1.0, attack:0.02, vol:0.22, filterType:'lowpass', filterFreq:2200, filterQ:2, vibRate:5, vibDepth:3 },
          parts:[
            { nameZh:'吹嘴',  nameEn:'Mouthpiece', x:93, y:5,  lx:93, ly:20, len:15.0 },
            { nameZh:'頸管',  nameEn:'Neck',       x:56, y:10, lx:40, ly:12, len:16.1 },
            { nameZh:'管身',  nameEn:'Body',       x:47, y:49, lx:59, ly:49, len:12.0 },
            { nameZh:'按鍵',  nameEn:'Keys',       x:39, y:39, lx:28, ly:25, len:17.8 },
            { nameZh:'喇叭口', nameEn:'Bell',      x:16, y:40, lx:11, ly:31, len:10.3 },
          ]},
        { id:'tenor-sax',    nameZh:'次中音薩克斯風', nameEn:'Tenor Saxophone', family:'woodwind', familyZh:'木管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/tenor saxophone.jpg', desc:'爵士樂中最受歡迎的薩克斯風',
          history:'次中音薩克斯風比中音薩克斯風大，管身呈彎曲的U型，音域比中音薩克斯風低五度。它是爵士樂中最具代表性的聲音之一，傳奇演奏家約翰·科爾特蘭以其探索性的演奏重新定義了爵士樂的邊界，索尼·羅林斯則以強勁豪放的即興著稱。次中音薩克斯風在爵士大樂團、流行樂和搖滾樂中均有廣泛使用，其低沉有力的音色極具魅力。',
          video:'https://www.youtube.com/embed/cGjYy_9UCqI',
          synthParams:{ wave:'sawtooth', freq:330, dur:1.0, attack:0.02, vol:0.24, filterType:'lowpass', filterFreq:1800, filterQ:2, vibRate:4.5, vibDepth:3 },
          parts:[
            { nameZh:'吹嘴',  nameEn:'Mouthpiece', x:22, y:13, lx:6,  ly:21, len:17.9 },
            { nameZh:'頸管',  nameEn:'Neck',       x:50, y:14, lx:35, ly:29, len:21.2 },
            { nameZh:'管身',  nameEn:'Body',       x:55, y:40, lx:69, ly:34, len:15.2 },
            { nameZh:'按鍵',  nameEn:'Keys',       x:53, y:52, lx:26, ly:54, len:27.1 },
            { nameZh:'喇叭口', nameEn:'Bell',      x:72, y:53, lx:91, ly:49, len:19.4 },
          ]},
        { id:'soprano-sax',  nameZh:'高音薩克斯風', nameEn:'Soprano Saxophone', family:'woodwind', familyZh:'木管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/Soprano Saxophone.jpg', desc:'直管型薩克斯風，音域最高',
          history:'高音薩克斯風是薩克斯風家族中最小的常見成員，通常為直管形狀，外觀與單簧管相似但末端微微上翹。它的音色明亮穿透，高音區甚至帶有嘹亮的哨音質感。在古典音樂中，高音薩克斯風常見於薩克斯風四重奏；在爵士界，史提夫·雷西和韋恩·蕭特以其創作了大量前衛風格作品。流行樂手肯尼·G更以高音薩克斯風獨特的綿長氣息聞名全球。',
          video:'https://www.youtube.com/embed/u4cMY7qeaiM',
          synthParams:{ wave:'sawtooth', freq:587, dur:0.9, attack:0.02, vol:0.2, filterType:'lowpass', filterFreq:2800, filterQ:2, vibRate:5.5, vibDepth:3.5 },
          parts:[
            { nameZh:'吹嘴',  nameEn:'Mouthpiece', x:52, y:7,  lx:71, ly:7,  len:19.0 },
            { nameZh:'管身',  nameEn:'Body',       x:55, y:41, lx:75, ly:42, len:20.0 },
            { nameZh:'按鍵',  nameEn:'Keys',       x:43, y:57, lx:25, ly:58, len:18.0 },
            { nameZh:'喇叭口', nameEn:'Bell',      x:51, y:96, lx:68, ly:93, len:17.3 },
          ]},
        { id:'baritone-sax', nameZh:'上低音薩克斯風', nameEn:'Baritone Saxophone', family:'woodwind', familyZh:'木管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/baritone-sax.jpg', desc:'最大的常見薩克斯風，音域最低',
          history:'上低音薩克斯風是薩克斯風家族中體型最大的常見型號，管身折疊成巨大的J型，重約5公斤，演奏者通常需要肩帶支撐。它的音域比中音薩克斯風低兩個五度，提供深沉有力的低音，在爵士大樂團和管樂團中擔任低音聲部。傳奇爵士演奏家哈利·卡尼在艾靈頓公爵樂隊中以上低音薩克斯風打造了標誌性的音色，後來哈姆·彼得森更進一步拓展了其獨奏可能性。',
          video:'https://www.youtube.com/embed/k91FjkE3v3Q',
          parts:[
            {nameZh:'吹嘴',nameEn:'Mouthpiece',x:30,y:13,lx:12,ly:18},
            {nameZh:'頸管',nameEn:'Neck',x:43,y:16,lx:30,ly:25},
            {nameZh:'管身',nameEn:'Body',x:65,y:47,lx:77,ly:47},
            {nameZh:'按鍵',nameEn:'Keys',x:53,y:54,lx:36,ly:57},
            {nameZh:'喇叭口',nameEn:'Bell',x:65,y:27,lx:87,ly:17}
          ],
          synthParams:{ wave:'sawtooth', freq:196, dur:1.2, attack:0.03, vol:0.26, filterType:'lowpass', filterFreq:1200, filterQ:1.8, vibRate:4, vibDepth:2 }},
        { id:'harmonica',    nameZh:'口琴',       nameEn:'Harmonica',    family:'woodwind',   familyZh:'木管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/harmonica.jpg', desc:'用嘴吹奏的小型簧片樂器',
          history:'口琴在1820年代由德國和奧地利的工匠分別改良發展而成，體積小巧，可放入口袋中，是最便於攜帶的旋律樂器之一。演奏者通過向不同孔位吹氣和吸氣使內部的金屬自由簧片振動發聲，吹氣和吸氣可產生不同音高。口琴在藍調音樂中被稱為「harp」，鮑勃·狄倫和尼爾·楊將其帶入民謠和搖滾，而史帝維·旺達和西佐·波薩則以半音階口琴征服了流行樂壇。',
          video:'https://www.youtube.com/embed/eEKlRUvk9zc',
          synthParams:{ wave:'square', freq:523, dur:0.8, attack:0.02, vol:0.18, filterType:'lowpass', filterFreq:2000, filterQ:1.5, vibRate:6, vibDepth:3 }},
        { id:'bagpipes',     nameZh:'風笛',       nameEn:'Bagpipes',     family:'woodwind',   familyZh:'木管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/bagpipes.jpg', desc:'蘇格蘭傳統的風袋管樂器',
          history:'風笛的歷史可追溯至古羅馬甚至更早的中東地區，後隨民族遷徙傳播至蘇格蘭、愛爾蘭、西班牙和東歐，各地均有獨特型號。演奏者向風袋吹氣，風袋持續擠壓空氣通過旋律管和持續音低音管發聲，可產生連綿不斷的聲音。蘇格蘭高地風笛是其中最著名的代表，音量極大，傳統上在戰場上激勵士氣。如今風笛在蘇格蘭婚禮、葬禮和節慶場合仍是不可缺少的樂器。',
          video:'https://www.youtube.com/embed/olA-LAG0aRc',
                    parts:[
                        {nameZh:'吹管',nameEn:'Blowpipe',x:26,y:37,lx:10,ly:33},
                        {nameZh:'風袋',nameEn:'Bag',x:54,y:64,lx:75,ly:79},
                        {nameZh:'旋律管',nameEn:'Chanter',x:13,y:87,lx:25,ly:87},
                        {nameZh:'低音管',nameEn:'Drone Pipes',x:53,y:10,lx:78,ly:9}
                    ],
          synthParams:{ wave:'sawtooth', freq:466, dur:2.0, attack:0.1, vol:0.2, filterType:'bandpass', filterFreq:1000, filterQ:2, vibRate:3, vibDepth:2 }},
        { id:'pan-flute',    nameZh:'排笛',       nameEn:'Pan Flute',    family:'woodwind',   familyZh:'木管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/pan-flute.jpg', desc:'由長短不同的管子排成一排',
          history:'排笛（排蕭）以希臘神話中的牧神潘命名，傳說他用蘆葦管排列製成此笛。它由多根長短不同的管子並排組合，演奏者通過向各管頂端吹氣使氣柱振動發聲，音高由管子長度決定。排笛在南美洲安第斯山區的民間音樂傳統中尤其重要，是當地原住民文化的象徵。此外，古代埃及、羅馬和中國均有排笛的使用記錄。現代安第斯排笛音色空靈悠遠，在世界音樂中廣受歡迎。',
          video:'https://www.youtube.com/embed/RW9dzwtWzp8',
                    parts:[
                        {nameZh:'管子',nameEn:'Pipes',x:43,y:74,lx:59,ly:86},
                        {nameZh:'框架',nameEn:'Frame',x:35,y:32,lx:22,ly:34}
                    ],
                    synthParams:{ wave:'sine', freq:698, dur:0.8, attack:0.04, vol:0.22, vibRate:4, vibDepth:3 }},

        // ── 銅管 Brass ──
        { id:'trumpet',      nameZh:'小號',       nameEn:'Trumpet',      family:'brass',      familyZh:'銅管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/trumpet.jpg', desc:'音色明亮響亮的銅管樂器',
          history:'小號的歷史可追溯至3000年前的古埃及，最初用於軍事信號和宗教儀式。現代活塞小號於1820年代在法國發明，三個活塞系統讓演奏者能吹奏所有半音，取代了以往需換管演奏的天然號角。小號是銅管家族中音域最高的樂器，聲音明亮輝煌。爵士大師邁爾斯·戴維斯以柔和細膩的弱音小號開創了冷爵士風格，而海頓的《降E大調小號協奏曲》是古典獨奏曲目中最著名的一首。',
          video:'https://www.youtube.com/embed/0JSNU1H5mQA',
                    parts:[
                        {nameZh:'號嘴',nameEn:'Mouthpiece',x:8,y:45,lx:8,ly:26},
                        {nameZh:'管身',nameEn:'Body',x:32,y:43,lx:24,ly:17},
                        {nameZh:'活塞',nameEn:'Valves',x:48,y:35,lx:52,ly:16},
                        {nameZh:'調音管',nameEn:'Tuning Slide',x:35,y:63,lx:40,ly:86},
                        {nameZh:'喇叭口',nameEn:'Bell',x:88,y:45,lx:91,ly:80}
                    ],
          synthParams:{ wave:'sawtooth', freq:523, dur:0.8, attack:0.01, vol:0.22, filterType:'lowpass', filterFreq:3000, filterQ:3 }},
        { id:'trombone',     nameZh:'長號',       nameEn:'Trombone',     family:'brass',      familyZh:'銅管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/trombone.jpg', desc:'用滑管改變音高',
          history:'長號於1450年代在引入多層滑管機構後形式確立，是銅管家族中唯一不使用活塞而是用滑管改變音高的樂器。滑管有七個把位，配合口型可帶入更多音高，也能演奏流暢的滑音效果。巴赫大量使用長號，其宗教合唱曲中長號聲部至今仍是專業演奏者的挑戰。長號音色厚重莊嚴，在交響樂的高潮段落中尤具震撼力，演奏者需多年苦練才能將滑管控制得精準。',
          video:'https://www.youtube.com/embed/b84jzHw653c',
                    parts:[
                        {nameZh:'號嘴',nameEn:'Mouthpiece',x:16,y:75,lx:27,ly:90},
                        {nameZh:'滑管',nameEn:'Slide',x:48,y:69,lx:59,ly:86},
                        {nameZh:'管身',nameEn:'Body',x:29,y:37,lx:29,ly:16},
                        {nameZh:'喇叭口',nameEn:'Bell',x:59,y:40,lx:71,ly:40}
                    ],
          synthParams:{ wave:'sawtooth', freq:233, dur:1.0, attack:0.02, vol:0.25, filterType:'lowpass', filterFreq:2000, filterQ:2 }},
        { id:'french-horn',  nameZh:'圓號',       nameEn:'French Horn',  family:'brass',      familyZh:'銅管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/french-horn.jpg', desc:'圓形的銅管樂器，音色柔和',
          history:'圓號由狩獵號角演變而來，管身展開全長約3.7米。現代圓號有四個調音管，可降低不同度數的半音以擴展音域。它被認為是最難演奏的銅管樂器，演奏者需精確控制口型和氣息才能達到正確音準。圓號音色柔和溫暖，常用於表現大自然、英雄主義和浩瀚情感，貝多芬、布拉姆斯、理查·施特勞斯和馬勒均為圓號寫下了傳世名作。',
          video:'https://www.youtube.com/embed/JY7wZMX9vfo',
                    parts:[
                        {nameZh:'號嘴',nameEn:'Mouthpiece',x:8,y:42,lx:17,ly:62},
                        {nameZh:'管身',nameEn:'Body',x:56,y:19,lx:68,ly:19},
                        {nameZh:'轉閥',nameEn:'Rotary Valves',x:37,y:63,lx:37,ly:76},
                        {nameZh:'喇叭口',nameEn:'Bell',x:74,y:85,lx:59,ly:94}
                    ],
          synthParams:{ wave:'sawtooth', freq:349, dur:1.0, attack:0.04, vol:0.2, filterType:'lowpass', filterFreq:1500, filterQ:1.5, vibRate:4, vibDepth:2 }},
        { id:'tuba',         nameZh:'大號',       nameEn:'Tuba',         family:'brass',      familyZh:'銅管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/tuba.jpg', desc:'銅管家族最大最低沉',
          history:'大號於1835年由德國人威廉·維普雷希特和約翰·戈特弗里德·莫里茨共同發明，是銅管家族中最大最低沉的樂器。它重約12公斤，管身展開長達5.5米，通常有四或五個調音管。大號為管弦樂團提供低音基礎，在進行樂隊和管樂隊中也是震撼人心的低音支柱。拉爾夫·沃恩·威廉姆斯曾為大號創作了一首著名的協奏曲，約翰·費利斯也以大號獨奏聞名於世。',
          video:'https://www.youtube.com/embed/17HjK-TiM0g',
          parts:[
            {nameZh:'號嘴',nameEn:'Mouthpiece',x:72,y:40,lx:91,ly:29},
            {nameZh:'管身',nameEn:'Body',x:62,y:56,lx:74,ly:56},
            {nameZh:'活塞',nameEn:'Valves',x:80,y:43,lx:100,ly:52},
            {nameZh:'喇叭口',nameEn:'Bell',x:55,y:5,lx:67,ly:5}
          ],
          synthParams:{ wave:'sawtooth', freq:131, dur:1.0, attack:0.03, vol:0.3, filterType:'lowpass', filterFreq:800, filterQ:1.5 }},
        { id:'cornet',       nameZh:'短號',       nameEn:'Cornet',       family:'brass',      familyZh:'銅管', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/cornet.jpg', desc:'比小號稍小，音色較柔和',
          history:'短號於1820年代由郵號發展而來，外形與小號相似但管身更短更圓錐形，音色比小號柔和甜美。在英式銅管樂隊中，短號是最重要的旋律獨奏樂器，地位猶如小提琴在弦樂團中的位置。著名演奏家赫伯特·克拉克將短號技藝帶至高峰，而爵士樂界的比克斯·拜德貝克以短號演奏的柔和風格影響了整個20世紀初的爵士樂壇。',
          video:'https://www.youtube.com/embed/QW_m5t16010',
                    parts:[
                        {nameZh:'號嘴',nameEn:'Mouthpiece',x:21,y:11,lx:9,ly:11},
                        {nameZh:'管身',nameEn:'Body',x:32,y:60,lx:22,ly:67},
                        {nameZh:'活塞',nameEn:'Valves',x:29,y:20,lx:36,ly:9},
                        {nameZh:'喇叭口',nameEn:'Bell',x:82,y:77,lx:87,ly:88}
                    ],
          synthParams:{ wave:'sawtooth', freq:523, dur:0.8, attack:0.01, vol:0.2, filterType:'lowpass', filterFreq:2500, filterQ:2.5 }},

        // ── 敲擊 Percussion ──
        { id:'timpani',      nameZh:'定音鼓',     nameEn:'Timpani',      family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/timpani.jpg', desc:'可調音高的大型鼓',
          history:'定音鼓源自中世紀的阿拉伯戰鼓（Naqqara），十字軍將其帶入歐洲。現代踏板定音鼓於18世紀在德國發展成型，演奏者可通過踏板精確調節音高，從而與管弦樂團和聲，通常一組有2至5個大小不同的鼓。定音鼓是管弦樂團中最重要的敲擊樂器，能產生深山鳴響的低音。貝多芬、布拉姆斯和馬勒均善用定音鼓製造戲劇性的音樂效果。',
          video:'https://www.youtube.com/embed/XPEfzkraPLc',
          synthParams:{ wave:'sine', freq:150, freqEnd:80, dur:0.8, attack:0.005, vol:0.35 }},
        { id:'snare',        nameZh:'小軍鼓',     nameEn:'Snare Drum',   family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/snare.webp', desc:'底部有響弦的小鼓',
          history:'小軍鼓的前身可追溯至14世紀中東的道材爾鼓，十字軍帶入歐洲並演變為現代軍鼓。底部繃有金屬響弦，敲擊時產生獨特的「嘶嘶」聲。小軍鼓在軍樂中用於節奏訊號和調子，在管弦樂團中負責強助聲部和樂勢高潮。爵士鼓組中小軍鼓的橫槳打法（cross-stick）和鑲嵌技巧將其的表現力大大擴展。許多放克小軍鼓獨奏樂器的演奏家度量模之高超吉他者。',
          video:'https://www.youtube.com/embed/NifOAvu7KQk',
                    parts:[
                        {nameZh:'鼓面',nameEn:'Drum Head',x:51,y:36,lx:76,ly:11},
                        {nameZh:'鼓身',nameEn:'Shell',x:36,y:74,lx:48,ly:74},
                        {nameZh:'響弦',nameEn:'Snare Wires',x:11,y:57,lx:7,ly:76},
                        {nameZh:'調音環',nameEn:'Tuning Lug',x:94,y:53,lx:91,ly:78}
                    ],
          synthParams:{ noise:true, dur:0.2, filterType:'highpass', filterFreq:2000, filterQ:0.5, vol:0.35 }},
        { id:'bass-drum',    nameZh:'大鼓',       nameEn:'Bass Drum',    family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/bass%20drum.jpg', desc:'管弦樂中最大的鼓',
          history:'大鼓是管弦樂團中最大的敲擊樂器，直徑可達100厘米。它的前身可追溯至中世紀歐洲的大型軍鼓和非洲各地的傳統鼓類。它產生深沉有力的低音，常用於強調音樂的高潮和節拍重音，一槌就能震撼全場。大鼓在軍樂隊中習用於拍打強勁行進步伐，在管弦樂團中則能色彩壯麗的音樂高潮。巴赫、貝多芬、馬勒和查爾斯尼尼均列大鼓為演奏的主筆甲之。',
          video:'https://www.youtube.com/embed/ci48L1RZokU',
                    parts:[
                        {nameZh:'鼓面',nameEn:'Drum Head',x:55,y:30,lx:84,ly:25},
                        {nameZh:'鼓身',nameEn:'Shell',x:35,y:34,lx:13,ly:19},
                        {nameZh:'鼓棒',nameEn:'Mallet',x:32,y:51,lx:18,ly:51}
                    ],
          synthParams:{ wave:'sine', freq:80, freqEnd:40, dur:0.6, attack:0.005, vol:0.4 }},
        { id:'xylophone',    nameZh:'木琴',       nameEn:'Xylophone',    family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/xylophone.jpg', desc:'用小槌敲擊木條的樂器',
          history:'木琴起源於非洲和東南亞，由按音高排列的木條組成。演奏者用小槌敲擊木條，音色清脆明亮，每條木條下方有金屬共鳴筒增強音量。木琴在非洲大陸是含義深遠的儀式樂器，後經奉教士將其帶入拉丁美洲。木琴在管弦樂和敲擊樂合奏中都很常見，紀特·聖薩和山普雙均為其寫下經典曲目。現代木琴演奏家如徐索夫尼將其引入更廣闊的舞台。',
          video:'https://www.youtube.com/embed/IsfEj_7SKtQ',
                    parts:[
                        {nameZh:'音板',nameEn:'Bars',x:50,y:38,lx:62,ly:17},
                        {nameZh:'共鳴管',nameEn:'Resonators',x:50,y:65,lx:62,ly:65},
                        {nameZh:'框架',nameEn:'Frame',x:15,y:52,lx:7,ly:70},
                        {nameZh:'鼓棒',nameEn:'Mallets',x:17,y:23,lx:29,ly:11}
                    ],
          synthParams:{ wave:'sine', freq:880, dur:0.4, attack:0.002, vol:0.28, sustain:0.15 }},
        { id:'triangle',     nameZh:'三角鐵',     nameEn:'Triangle',     family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/三角鐵.jpg', desc:'三角形的金屬棒，聲音清脆',
          history:'三角鐵是一根彎成三角形的鋼棒，用鐵棒敲擊發聲。雖然構造簡單，三角鐵卻包含一定程度的難度：它產生不限定的音高，需要演奏者精密控制力度和位置。三角鐵在管弦樂團中扮演重要角色，聲音清亮穿透，能為音樂增添光彩。李斯特《交響曲》和布拉姆斯《匯區拉雙豐演奏曲》中均有著名的三角鐵獨奏段落，而奧爾循《三角鐵協奏曲》更是專為其寫下的傳世謔謔。',
          video:'https://www.youtube.com/embed/0uLf5FfvY9c',
                    parts:[
                        {nameZh:'金屬棒',nameEn:'Metal Bar',x:37,y:50,lx:14,ly:49},
                        {nameZh:'敲棒',nameEn:'Beater',x:70,y:60,lx:87,ly:60},
                        {nameZh:'懸掛繩',nameEn:'Suspension',x:45,y:8,lx:26,ly:9}
                    ],
          synthParams:{ wave:'sine', freq:2200, dur:1.2, attack:0.001, vol:0.15, sustain:0.2 }},
        { id:'cymbals',      nameZh:'鈸',         nameEn:'Cymbals',      family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/cymbal.jpg', desc:'兩片圓形金屬板互擊',
          history:'鈸的歷史可追溯至古代中國、埃及和土耳其。由青銅合金製成的圓形金屬板，互相碰擊或用鼓棒敲擊發聲，能產生從輕柔到震耳的多種音效。鈸在亞洲尼瓦納馬和土耳其火腦調儀式音樂中有深厚協作。爵士鼓組中的踏板鈸（hi-hat）和吾鈸是解放和自由的象徵。在管弦樂團中，鈸的黃銅質地和製作工藝決定了其音色特性。',
          video:'https://www.youtube.com/embed/X1rFyPGd95U',
                    parts:[
                        {nameZh:'銅片',nameEn:'Cymbal Plate',x:50,y:31,lx:48,ly:18},
                        {nameZh:'鐘頂',nameEn:'Bell',x:58,y:46,lx:85,ly:23},
                        {nameZh:'把手',nameEn:'Handle',x:81,y:53,lx:84,ly:68}
                    ],
          synthParams:{ noise:true, dur:0.8, filterType:'highpass', filterFreq:5000, filterQ:0.3, vol:0.25 }},
        { id:'tambourine',   nameZh:'鈴鼓',       nameEn:'Tambourine',   family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/tambourine.jpg', desc:'有小鈸片的手鼓',
          history:'鈴鼓結合了鼓面和小金屬鈸片，搖晃或敲擊時發出節奏感十足的聲音。它起源於中東和南歐，日語中叫做「太鼓」，流入歐洲方言築中。鈴鼓廣泛用於世界各地的民流樂，從中世紀歐洲侏儒樂到印度客廳、從寺廟歌唱到現代流行樂，都有鈴鼓的跟隨。它是最容易上手的打擊樂器之一，也是舞台表演中常見的改屠道具。',
          video:'https://www.youtube.com/embed/KvIbXL84duI',
                    parts:[
                        {nameZh:'鼓面',nameEn:'Drum Head',x:50,y:35,lx:62,ly:35},
                        {nameZh:'框架',nameEn:'Frame',x:52,y:70,lx:49,ly:91},
                        {nameZh:'鈴片',nameEn:'Jingles',x:70,y:72,lx:81,ly:84}
                    ],
          synthParams:{ noise:true, dur:0.35, filterType:'bandpass', filterFreq:6000, filterQ:1, vol:0.22 }},
        { id:'glockenspiel', nameZh:'鐵片琴',     nameEn:'Glockenspiel', family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/glockenspiel.jpg', desc:'金屬音條，聲音像鐘聲',
          history:'鐘琴由金屬音條組成，音色清脆悅耳如同小鐘。它起源於16世紀的歐洲，著名演奏家首頭通常使用小槌敲擊。鐘琴在管弦樂中增添亮麗色彩，莫札特的《魔笛》中巴巴跟納之鑄著名的鐘琴樂段就使用了鐘琴的美妙音色。鐘琴在行進樂隊、管樂隊和山岳樂隊中常見，也常用於兒童音樂中。現代鐘琴用金屬音條前一舞台演奏的動作展現，具有視覺與聽覺雙重吸引力。',
          video:'https://www.youtube.com/embed/mxvkjsvgTUo',
                    parts:[
                        {nameZh:'金屬音板',nameEn:'Metal Bars',x:50,y:30,lx:42,ly:11},
                        {nameZh:'框架',nameEn:'Frame',x:87,y:30,lx:81,ly:12},
                        {nameZh:'鼓棒',nameEn:'Mallets',x:68,y:69,lx:80,ly:81}
                    ],
          synthParams:{ wave:'sine', freq:1760, dur:0.8, attack:0.001, vol:0.2, sustain:0.15 }},
        { id:'marimba',      nameZh:'馬林巴琴',   nameEn:'Marimba',      family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/marimba.jpg', desc:'大型木質音條敲擊樂器',
          history:'馬林巴琴起源於非洲中部和中美洲，香山中大勒馬拉難和安第斯地區均有強大的傳統。它是危地馬拉和墨西哥的國樂器，演奏者常帶梓木共鳴管。馬林巴琴音色渾厚溫暖，音域寬廣達四個八度以上，是打擊樂家族中難度最高、表現力最豐富的樂器之一。安代斯·山普更和威娜布尼·吉貝均為其寫下了著名曲目。',
          video:'https://www.youtube.com/embed/sRJYuI8ya84',
                    parts:[
                        {nameZh:'木音板',nameEn:'Wooden Bars',x:44,y:14,lx:24,ly:35},
                        {nameZh:'共鳴管',nameEn:'Resonators',x:62,y:45,lx:61,ly:78},
                        {nameZh:'框架',nameEn:'Frame',x:18,y:14,lx:6,ly:14},
                        {nameZh:'鼓棒',nameEn:'Mallets',x:28,y:84,lx:28,ly:85}
                    ],
          synthParams:{ wave:'sine', freq:440, dur:0.6, attack:0.003, vol:0.3, sustain:0.2 }},
        { id:'vibraphone',   nameZh:'顫音琴',     nameEn:'Vibraphone',   family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/vibraphone.webp', desc:'金屬音條帶電動顫音效果',
          history:'顫音琴在1920年代由美國演奏家貴馬斯·安德森發明，金屬音條下方的共鳴管內裝有電動旋轉盤，產生獨特的顫音效果和柔和的延音。它是爵士樂中重要的旋律打擊樂器，常見了香山爾·考寬、米爾斯·戴維斯和送戰神布則·麥克泛河。現代創作音樂和世界音樂也廣泛採用顫音琴，其嬌貴的音色被許多作曲家視為獨一無二的色彩。',
          video:'https://www.youtube.com/embed/BkBu7Om6Bd4',
                    parts:[
                        {nameZh:'金屬音板',nameEn:'Metal Bars',x:50,y:20,lx:50,ly:7},
                        {nameZh:'共鳴管',nameEn:'Resonators',x:65,y:46,lx:71,ly:75},
                        {nameZh:'踏板',nameEn:'Pedal',x:41,y:77,lx:33,ly:85},
                        {nameZh:'馬達',nameEn:'Motor',x:11,y:32,lx:3,ly:15}
                    ],
          synthParams:{ wave:'sine', freq:880, dur:1.0, attack:0.002, vol:0.22, vibRate:5, vibDepth:4, sustain:0.2 }},
        { id:'drums',        nameZh:'爵士鼓',     nameEn:'Drums',        family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/drums.jpg', desc:'包含多種鼓和鈸的套鼓',
          history:'爵士鼓組於20世紀初隨著爵士樂在美國紐奧良發展而誕生，將大鼓、小鼓、通鼓、踏板鈸和吾鈸組合在一起由一人演奏。標準配置包括大鼓、小鼓、通鼓、腳踏鈸和吊鈸，但可根據風格自由搭配。爵士鼓手對整隊演奏起著不可替代的鼓動作用，圈骨人物如色台布尼·富加、第欠·比海和寞爾尼·潘母斯均重新定義了爵士鼓組的可能性。',
          video:'https://www.youtube.com/embed/HKXqWVWjs-g',
          synthParams:{ noise:true, dur:0.3, filterType:'highpass', filterFreq:3000, filterQ:0.5, vol:0.3 }},
        { id:'cajon',        nameZh:'木箱鼓',     nameEn:'Cajón',        family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/木箱鼓.jpg', desc:'西班牙語「箱子」，坐着拍擊的木箱',
          history:'木箱鼓起源於18至19世紀的秘魯，非洲奴隸以貨箱為鼓，在殖民禁鼓時期保留了音樂傳統。後經西班牙佛朗明哥音樂吸收，成為佛朗明哥樂隊的核心打擊樂器。演奏者坐在木箱上，以雙手拍擊正面打板，拍擊上方邊緣產生高頻清脆音，拍擊中央產生低沉鼓聲，底部鬆弦可增加響弦效果。木箱鼓現已廣泛用於世界音樂、爵士、流行樂中，結構簡單、便於攜帶，深受街頭樂手歡迎。',
          video:'https://www.youtube.com/embed/xnXG8YAJfJg',
                    parts:[
                        {nameZh:'打擊面',nameEn:'Tapa',x:70,y:24,lx:82,ly:24},
                        {nameZh:'箱身',nameEn:'Body',x:24,y:28,lx:12,ly:28},
                        {nameZh:'音孔',nameEn:'Sound Hole',x:16,y:64,lx:12,ly:83}
                    ],
          synthParams:{ noise:true, dur:0.35, filterType:'bandpass', filterFreq:180, filterQ:0.8, vol:0.38 }},
        { id:'maracas',      nameZh:'沙槌',       nameEn:'Maracas',      family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/沙槌.jpg', desc:'裝有種子或珠粒的搖動樂器',
          history:'沙槌（Maracas）原為南美洲及加勒比地區原住民的傳統樂器，以葫蘆盛裝種子或乾豆搖動發聲，後改用木材、塑膠或金屬製造。成對使用，左手與右手各持一支，可搖奏不同節奏型，是拉丁音樂、薩爾薩、曼波等風格的基礎節奏樂器。聲音輕盈而充滿律動感，製作簡便，常用於兒童音樂教育。全球各地均有類似樂器，如非洲的阿薩克韋，充分體現了人類對節奏的共同追求。',
          video:'https://www.youtube.com/embed/N6xBthcGwnw',
                    parts:[
                        {nameZh:'球體',nameEn:'Gourd',x:18,y:50,lx:13,ly:78},
                        {nameZh:'手柄',nameEn:'Handle',x:50,y:75,lx:62,ly:75},
                        {nameZh:'珠粒',nameEn:'Beads',x:31,y:19,lx:19,ly:19}
                    ],
          synthParams:{ noise:true, dur:0.25, filterType:'highpass', filterFreq:4000, filterQ:0.6, vol:0.22 }},
        { id:'egg-shakers',  nameZh:'沙蛋',       nameEn:'Egg Shakers',  family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/沙蛋.jpg', desc:'蛋形的小型沙鈴，適合兒童',
          history:'沙蛋是沙槌家族中最小巧的成員，因形似雞蛋而得名。內部裝有微細砂粒或金屬珠，搖動時發出沙沙聲。體積小巧，手感圓潤，非常適合兒童課堂使用，也常用於音樂治療。在流行樂、民謠和兒童音樂教育中，沙蛋提供了輕柔的持續節奏背景，多位樂手可同時使用，共同構建豐富的律動層次。',
          video:'https://www.youtube.com/embed/GGfrTQ8IPfc',
          synthParams:{ noise:true, dur:0.2, filterType:'highpass', filterFreq:5000, filterQ:0.5, vol:0.18 }},
        { id:'tubular-bells', nameZh:'管鐘',      nameEn:'Tubular Bells', family:'percussion', familyZh:'敲擊', img:'file:///Users/kenneth/.cursor/projects/Users-kenneth-Desktop-notes/assets/__-acd6d1fd-26d0-4b09-bd2d-51e0b6939f74.png', desc:'一排垂掛的金屬管，音色如大鐘',
          history:'管鐘（Tubular Bells）由一排按音高排列、垂掛於架上的金屬管組成，用小槌敲擊頂端發聲，音色渾厚如教堂大鐘。管鐘由英國人約翰·哈靈頓於1886年發明，目的是在管弦樂團中模擬教堂鐘聲，同時比真正的大鐘更易搬運。馬勒、普契尼和拉威爾均在作品中使用管鐘。1973年，麥克·歐菲爾德的唱片《Tubular Bells》更以此命名，成為史上最暢銷的器樂唱片之一，管鐘因此廣為人知。',
          video:'https://www.youtube.com/embed/VKyRgtEMy2c',
          synthParams:{ wave:'sine', freq:523, dur:2.5, attack:0.005, vol:0.22, sustain:0.25 }},
        { id:'cabasa',       nameZh:'鐵沙鈴',     nameEn:'Cabasa',       family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/鐵沙鈴.jpg', desc:'外層包裹金屬珠鏈，轉動搖動發聲',
          history:'鐵沙鈴（Cabasa）由非洲傳統的阿薩克韋（Agbe）演變而成，圓柱形木質或金屬鼓身外部包裹多排金屬珠鏈。演奏時一手握柄，另一手輕壓珠鏈轉動圓柱，或搖動使珠鏈摩擦鼓身發出獨特的沙沙聲。由LP（Latin Percussion）公司在1960年代將其改良標準化後廣為流行，成為拉丁音樂、爵士和流行樂的常見節奏色彩樂器，能為音樂增添輕盈而富有質感的律動層次。',
          video:'https://www.youtube.com/embed/4sH-6Hf83kU',
          synthParams:{ noise:true, dur:0.3, filterType:'bandpass', filterFreq:3500, filterQ:1.2, vol:0.2 }},
        { id:'djembe',       nameZh:'非洲鼓',     nameEn:'Djembe',       family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/非洲鼓Drum Djembe.jpg', desc:'西非傳統杯形鼓，音色豐富',
          history:'金貝鼓（Djembe）源自西非馬利帝國，距今已逾七百年歷史，在曼丁卡民族中有神聖地位，用於慶典、成年禮和通靈儀式。鼓身由整塊木材雕刻而成，呈高腳杯形，頂部蒙以羊皮或山羊皮，用繩索拉緊調音。演奏者用雙手以三種基本擊法——低音（Bass）、中音（Tone）和高音（Slap）——敲奏豐富的節奏層次。金貝鼓隨非洲移民文化走向全球，現已成為世界音樂、音樂治療和兒童教育的熱門樂器。',
          video:'https://www.youtube.com/embed/kXAfPnwvchE',
          synthParams:{ noise:true, dur:0.5, filterType:'bandpass', filterFreq:250, filterQ:1.5, vol:0.35 }},
        { id:'castanets',    nameZh:'響板',       nameEn:'Castanets',    family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/響板.jpg', desc:'兩片木製貝殼形的碰擊樂器',
          history:'響板（Castanets）是一對用橄欖木、栗木或合成材料製成的貝殼形碰擊樂器，演奏時以手指控制兩片相擊發出清脆的卡搭聲。響板起源於地中海地區，可追溯至古埃及和古希臘，在西班牙佛朗明哥舞蹈和傳統民間音樂中尤為重要，佛朗明哥舞者常邊跳邊以手指敲擊響板，兼具節奏和視覺效果。在管弦樂中，響板常由打擊樂手持棒敲擊，比才的《卡門》和拉威爾的《西班牙狂想曲》中均有響板的出色運用。',
          video:'https://www.youtube.com/embed/f2ncikRsjTo',
          synthParams:{ wave:'sine', freq:1800, dur:0.12, attack:0.001, vol:0.25, sustain:0.05 }},
        { id:'congas',       nameZh:'康加鼓',     nameEn:'Congas',       family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/conga.jpg', desc:'古巴傳統高筒手鼓，常成對演奏',
          history:'康加鼓（Congas）源自非洲，隨奴隸貿易傳入古巴，融合了非洲傳統和古巴民間音樂，在非裔古巴宗教儀式中扮演重要角色。鼓身為高筒形，通常以三個大小不同的鼓成組演奏（最小的稱Quinto，中型稱Conga，最大稱Tumbadora），演奏者站立或坐着，以雙手拍擊鼓皮，可產生開放音、悶音和邊緣音等多種音效。康加鼓是薩爾薩、曼波、倫巴和拉丁爵士的靈魂，名手艾迪·帕米里和卡洛斯·帕托·費爾南德斯均以康加演奏著稱。',
          video:'https://www.youtube.com/embed/4pRlRU-LLDE',
          synthParams:{ noise:true, dur:0.45, filterType:'bandpass', filterFreq:220, filterQ:1.2, vol:0.32 }},
        { id:'cowbell',      nameZh:'牛鈴',       nameEn:'Cowbell',      family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/cowbell.jpg', desc:'金屬製的鈴，用木棒敲擊發聲',
          history:'牛鈴最初用於放牧，掛在牛脖子上以追蹤牲畜位置，音色清脆響亮，穿透力強。在音樂中，牛鈴廣泛用於拉丁音樂（如薩爾薩、曼波）和搖滾樂。演奏者用木棒敲擊金屬鈴身，可透過改變敲擊位置和力度產生不同音色——敲擊頂部邊緣音色較高，敲擊鈴口音色較低沉。美國電視節目《週六夜現場》的著名喜劇小品「需要更多牛鈴」更令牛鈴在流行文化中家喻戶曉。',
          video:'https://www.youtube.com/embed/cVsQLlk-T0s',
          synthParams:{ wave:'square', freq:800, dur:0.4, attack:0.002, vol:0.22, filterType:'bandpass', filterFreq:900, filterQ:4 }},
        { id:'guiro',        nameZh:'刮胡',       nameEn:'Güiro',        family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/guiro.jpg', desc:'有鋸齒紋路的葫蘆，用棒刮擦發聲',
          history:'刮胡（Güiro）源自加勒比海地區的泰諾原住民，最初以葫蘆製成，外表刻有橫向鋸齒槽，用木棒或金屬棒來回刮擦發出沙沙的刮擦聲。現代刮胡以木材、金屬或塑膠製成，常見魚形設計（Fish Guiro）尤其受兒童歡迎。刮胡是古巴頌樂、波多黎各音樂和梅連格舞曲的重要節奏樂器，演奏者需控制刮擦速度和力度以創造不同的節奏型態，是拉丁打擊樂中不可或缺的色彩樂器。',
          video:'https://www.youtube.com/embed/Wzm6i7mhSho',
          synthParams:{ noise:true, dur:0.3, filterType:'bandpass', filterFreq:2500, filterQ:1.5, vol:0.2 }},
        { id:'agogo-bell',   nameZh:'阿哥哥鈴',   nameEn:'Agogo Bell',   family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/agogo-bell.jpg', desc:'雙鈴的非洲傳統金屬樂器',
          history:'阿哥哥鈴源自西非約魯巴族的傳統音樂，由兩個大小不同的金屬鈴連接在一個U形握柄上，用金屬棒敲擊兩鈴可奏出高低兩個固定音高。它是非裔巴西宗教音樂坎東布雷（Candomblé）和卡波耶拉中不可缺少的樂器，後被薩爾薩、阿弗羅古巴爵士和流行音樂廣泛採用。阿哥哥鈴的節奏型通常作為整個樂隊的「鐘聲」基準，引領其他樂手的節奏，音色明亮穿透，即使在嘈雜的演奏環境中仍清晰可辨。',
          video:'https://www.youtube.com/embed/0Nj1WDLAghE',
          synthParams:{ wave:'square', freq:900, dur:0.3, attack:0.002, vol:0.22, filterType:'bandpass', filterFreq:1000, filterQ:5 }},
        { id:'bar-chimes',   nameZh:'管鈴',       nameEn:'Wind Chimes',  family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/bar-chimes.jpg', desc:'多根金屬管懸掛成排，輕撥發出金屬聲',
          history:'管鈴（Bar Chimes，又稱Mark Tree）由數十根長短不等的細金屬管懸掛成排製成，演奏者以手指或鼓棒從一端掃過，管子相互碰撞發出輕柔的滑音效果。管鈴在1960至70年代的流行音樂錄音室中廣泛使用，常用於製造夢幻、神秘或過渡性的音效。在管弦樂和打擊樂合奏中，管鈴為音樂增添空靈飄逸的色彩，是音效設計師和打擊樂手工具箱中重要的色彩樂器。',
          video:'https://www.youtube.com/embed/4K2xeVAq45M',
          synthParams:{ wave:'sine', freq:1400, dur:1.5, attack:0.01, vol:0.18, sustain:0.3, vibRate:3, vibDepth:2 }},
        { id:'bongos',       nameZh:'邦哥鼓',     nameEn:'Bongos',       family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/bongos.jpg', desc:'一大一小兩個相連的小型手鼓',
          history:'邦哥鼓（Bongos）源自古巴東部省份，由一大一小兩個皮鼓固定在一起組成，大鼓稱為Hembra（母），小鼓稱為Macho（公）。演奏者通常將鼓夾於兩膝之間，以指尖和手掌拍擊鼓皮，技法豐富細膩。邦哥鼓在古巴頌樂、拉丁爵士和流行音樂中廣泛使用，音色明亮清脆，節奏感強。傳奇演奏家卡洛斯·帕托·費爾南德斯和艾迪·帕米里將邦哥鼓技藝帶至精湛境界，進一步拓展了其在拉丁音樂中的表現空間。',
          video:'https://www.youtube.com/embed/4wPEIWET0fY',
          synthParams:{ noise:true, dur:0.3, filterType:'bandpass', filterFreq:400, filterQ:1.5, vol:0.28 }},
        { id:'kalimba',      nameZh:'姆指琴',     nameEn:'Kalimba',      family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/kalimba.jpg', desc:'非洲拇指鋼琴，用拇指撥片發聲',
          history:'卡林巴琴（Kalimba）又稱拇指鋼琴，是非洲傳統姆比拉琴（Mbira）的現代版本。演奏者雙手握住木製音箱，用拇指撥動固定於音板上的金屬舌片，不同長度的舌片產生不同音高，音色空靈悅耳。卡林巴在非洲各文化中均有變體，辛巴威的姆比拉是其中最著名的，在修納族的宗教儀式中有神聖地位。1960年代，民族音樂學家休·崔西將其商業化改良並命名為Kalimba，從此傳播全球，成為世界音樂和冥想音樂的熱門樂器。',
          video:'https://www.youtube.com/embed/DAHqLGzbmyM',
          synthParams:{ wave:'sine', freq:659, dur:1.2, attack:0.003, vol:0.25, sustain:0.2, vibRate:5, vibDepth:2 }},
        { id:'sleigh-bells', nameZh:'雪橇鈴',     nameEn:'Sleigh Bells', family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/sleigh-bells.jpg', desc:'多個小鈴串在一起，搖動發聲',
          history:'雪橇鈴最初綁於馬拉雪橇的挽具上，在積雪道路上提醒行人注意雪橇接近，後被作曲家引入管弦樂以模擬冬日雪橇行進的意象。它由多個小型金屬鈴串連或釘在皮帶上製成，搖動時發出清脆的叮噹聲。在古典音樂中，莫札特和柴可夫斯基均曾使用雪橇鈴製造節日氣氛，而《Jingle Bells》一曲更令全球聽眾對這清脆鈴聲留下深刻印象，使雪橇鈴成為聖誕音樂中不可缺少的音色。',
          video:'https://www.youtube.com/embed/3xAg65Az6D0',
          synthParams:{ noise:true, dur:0.4, filterType:'bandpass', filterFreq:7000, filterQ:0.8, vol:0.2 }},
        { id:'vibra-slap',   nameZh:'顫音板',     nameEn:'Vibraslap',    family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/vibra-slap.jpg', desc:'敲擊後產生顫動嗡嗡聲',
          history:'顫音板（Vibraslap）是驢顎骨（Quijada）的現代替代品，由LP公司於1960年代發明。其結構為一根鋼條連接一個木球和一個有金屬鉚釘的木質共鳴箱：用手掌擊打木球，衝擊振動使共鳴箱內的金屬鉚釘顫動，發出獨特的嗡嗡顫響聲。顫音板常用於拉丁音樂、流行樂和打擊樂合奏中作為特殊音效，聲音極具辨識度，一聲顫響便能為音樂增添生動的律動色彩。',
          video:'https://www.youtube.com/embed/GGK1NIY-Q18',
          synthParams:{ noise:true, dur:0.6, filterType:'bandpass', filterFreq:1500, filterQ:3, vol:0.25 }},
        { id:'woodblock',    nameZh:'響棒',       nameEn:'Claves',       family:'percussion', familyZh:'敲擊', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/woodblock.jpg', desc:'一對硬木短棒，互相敲擊發出清脆聲',
          history:'響棒（Claves）起源於古巴與加勒比海地區，是一對由硬木製成的短棒，彼此敲擊可產生清脆、穿透力極高的節奏聲。它是薩爾薩、倫巴、松（Son）等拉丁音樂中的核心節奏樂器，「clave 節奏型」更是整個樂隊的時間骨架。演奏時通常一手持共鳴棒形成空腔，另一手以敲擊棒擊打，透過握法與力度變化產生不同音色，簡單卻極具辨識度。',
          video:'https://www.youtube.com/embed/G6eo9ssUJVs',
          synthParams:{ wave:'sine', freq:1200, dur:0.15, attack:0.001, vol:0.28, sustain:0.05, filterType:'bandpass', filterFreq:1300, filterQ:5 }},

        // ── 鍵盤 Keyboard ──
        { id:'piano',        nameZh:'鋼琴',       nameEn:'Piano',        family:'keyboard',   familyZh:'鍵盤', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/piano.webp', desc:'最常見的鍵盤樂器',
          history:'鋼琴於1700年由意大利人巴爾托洛梅奧·克里斯托福里發明，全名Pianoforte，意為「輕聲和強聲」，能根據鍵盤觸料力度控制音量，這是撥弦大鍵琴所缺乏的特性。現代鋼琴有88個鍵，音域長達七個多八度，是所有樂器中音域最寬廣的。著名作曲家蕭邦、貝多芬、李斯特和拉赫曼尼諾夫均是鋼琴大師，鋼琴協奏曲是古典音樂中最富盛的曲種之一。',
          video:'https://www.youtube.com/embed/vGq3-Fi_zQY',
          synthParams:{ wave:'triangle', freq:523, dur:1.2, attack:0.005, vol:0.3, sustain:0.3 }},
        { id:'organ',        nameZh:'管風琴',     nameEn:'Organ',        family:'keyboard',   familyZh:'鍵盤', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/organ.webp', desc:'用風管發聲的大型鍵盤樂器',
          history:'管風琴被稱為「樂器之王」，最早的水壓管風琴出現在公元前3世紀的古希臘。中世紀時管風琴在教堂中成為不可或缺的儀式樂器。大型管風琴有數千根音管、多層鍵盤和腳踏板，能發出震撼整棟建築的鼓一般低音。巴赫、韓德爾和節之堡北霍克斯女均為管風琴寫下傳世名作。現代小型電子管風琴仍在世界各地的教堂和演奏區服務。',
          video:'https://www.youtube.com/embed/JeB3JnKp8To',
          synthParams:{ wave:'sine', freq:262, dur:2.0, attack:0.05, vol:0.25, vibRate:3, vibDepth:2 }},
        { id:'harpsichord',  nameZh:'大鍵琴',     nameEn:'Harpsichord',  family:'keyboard',   familyZh:'鍵盤', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/harpsichord.jpg', desc:'撥弦發聲的古典鍵盤樂器',
          history:'大鍵琴是巴洛克時期（1600–1750）最重要的鍵盤樂器，通過撥片撥動弦線發聲，與鋼琴用槌敲弦的方式不同。其最大特點是音量不能漸變，但可利用雙鍵盤或多鍵盤設計改變音色層次。巴赫的許多作品都是為大鍵琴而寫。隨20世紀古樂復興運動，大鍵琴重新成為被顧盼演奏巴洛克音樂的主要樂器。著名演奏家包括古德南·山普爾和髻文·裴寧。',
          video:'https://www.youtube.com/embed/itLh_yWsOX0',
          synthParams:{ wave:'triangle', freq:523, dur:0.6, attack:0.002, vol:0.22, filterType:'lowpass', filterFreq:3000, filterQ:1 }},
        { id:'accordion',    nameZh:'手風琴',     nameEn:'Accordion',    family:'keyboard',   familyZh:'鍵盤', img:'https://raw.githubusercontent.com/kennethchan6392-hash/notes/main/img/instruments/accordion.webp', desc:'用風箱和按鍵演奏的樂器',
          history:'手風琴於1822年由奧地利人奇爾·迪畫利發明，通過拉伸和壓縮風箱使空氣流過金屬自由簧片發聲。它在法國香頌、阿根廷探戈和民間音樂中廣泛使用。巴揚的手風琴風格被許多中歐流行樂演奏者模仿，窘安·皮亞佐拉（丹哲）和紀謀·百麻斯將其帶入區域性特色音樂的巔峰。手風琴賦之主角地位使其成為某些國家的文化象徵。',
          video:'https://www.youtube.com/embed/aKxOpsUiFzU',
          synthParams:{ wave:'square', freq:440, dur:1.0, attack:0.03, vol:0.18, filterType:'lowpass', filterFreq:1500, filterQ:1.5, vibRate:5, vibDepth:3 }},
    ];

    // ── Instrument structure annotation data (x,y % on image, side = label direction) ──
    const INSTRUMENT_STRUCTURE = {
        'violin':        [{part:'琴頭',en:'Scroll',x:74,y:14,lx:89,ly:8,side:'right',desc:'小提琴頂端的螺旋形裝飾，由工匠手工雕刻而成，是識別樂器的標誌性特徵。'},{part:'調音栓',en:'Tuning Peg',x:77,y:22,lx:95,ly:22,side:'right',desc:'用於調整弦線張力以改變音高的木製旋鈕，四根分別對應 G、D、A、E 弦。'},{part:'琴頸',en:'Neck',x:69,y:25,lx:88,ly:35,side:'right',desc:'演奏者左手握持的部分，由木材製成，連接琴頭與琴身。'},{part:'指板',en:'Fingerboard',x:66,y:30,lx:30,ly:30,side:'left',desc:'左手手指按壓弦線以改變音高的黑色木板，通常由烏木製成，覆蓋於琴頸之上。'},{part:'弦線',en:'Strings',x:57,y:48,lx:25,ly:48,side:'left',desc:'四條弦線由低至高為 G、D、A、E 弦，現代多為鋼芯或合成纖維製成。'},{part:'琴橋',en:'Bridge',x:50,y:65,lx:20,ly:68,side:'left',desc:'支撐弦線並將振動傳送至琴身共鳴箱的精密薄木片，對音色有重要影響。'},{part:'F孔',en:'F-hole',x:48,y:59,lx:18,ly:56,side:'left',desc:'琴身兩側的 F 形音孔，讓琴身內的空氣振動得以傳出，豐富音色。'},{part:'琴身',en:'Body',x:63,y:52,lx:82,ly:52,side:'right',desc:'小提琴的共鳴箱，由面板、背板和側板組成，是放大聲音的關鍵部件。'},{part:'腮托',en:'Chin Rest',x:38,y:82,lx:12,ly:82,side:'left',desc:'演奏時供演奏者夾在下巴與肩膀之間的支撐部件，有助穩定樂器。'},{part:'拉弦板',en:'Tailpiece',x:49,y:76,lx:75,ly:76,side:'right',desc:'固定弦線末端的部件，通常由黑木或金屬製成，位於琴身底部。'}],
        'viola':         [{part:'琴頭',en:'Scroll',x:55,y:2,side:'right',desc:'中提琴頂端的螺旋形裝飾，造型與小提琴相似，但琴頭整體比小提琴更寬厚。'},{part:'調音栓',en:'Tuning Peg',x:63,y:14,side:'right',desc:'用於調整弦線張力的木製旋鈕，四根分別對應 C、G、D、A 弦，音域比小提琴低五度。'},{part:'琴頸',en:'Neck',x:48,y:27,side:'left',desc:'演奏者左手握持的部分，比小提琴略長，連接琴頭與較寬大的琴身。'},{part:'弦線',en:'Strings',x:45,y:47,side:'left',desc:'四條弦由低至高為 C、G、D、A 弦，最低的 C 弦賦予中提琴獨特的渾厚音色。'},{part:'琴橋',en:'Bridge',x:45,y:71,side:'right',desc:'精密薄木片，支撐弦線並將振動傳至共鳴箱，中提琴琴橋比小提琴更寬。'},{part:'琴身',en:'Body',x:60,y:52,side:'right',desc:'中提琴的共鳴箱，體積介於小提琴與大提琴之間，賦予其溫暖而略帶鼻音的音色。'},{part:'腮托',en:'Chin Rest',x:31,y:92,side:'left',desc:'夾在演奏者下巴與肩膀之間的支撐部件，因中提琴較重，腮托設計尤為重要。'}],

        'cello':         [{part:'琴頭',en:'Scroll',x:50,y:2,lx:70,ly:1,side:'right',desc:'大提琴頂端的螺旋裝飾，體積比小提琴和中提琴更大，雕工同樣精細。'},{part:'調音栓',en:'Tuning Peg',x:54,y:8,lx:72,ly:12,side:'right',desc:'用於調整弦線音高的木製旋鈕，四根對應 C、G、D、A 弦，旋轉時需要較大的力道。'},{part:'琴頸',en:'Neck',x:50,y:17,lx:30,ly:17,side:'left',desc:'演奏時左手拇指繞抱琴頸以輔助換把，大提琴夾於雙腿之間演奏，琴頸角度因此較直。'},{part:'弦線',en:'Strings',x:50,y:42,lx:28,ly:42,side:'left',desc:'四條弦由低至高為 C、G、D、A 弦，用弓弦拉奏，音域低沉寬廣，接近人聲男低音。'},{part:'琴橋',en:'Bridge',x:50,y:69,lx:70,ly:72,side:'right',desc:'大型精密薄木片，支撐四條弦並將振動傳至琴身，對音量與音色均有顯著影響。'},{part:'琴身',en:'Body',x:58,y:49,lx:78,ly:49,side:'right',desc:'大型共鳴箱，由雲杉面板與楓木背板側板組成，共鳴空間大，音色低沉豐富。'},{part:'F孔',en:'F-hole',x:44,y:67,lx:22,ly:64,side:'left',desc:'琴身兩側的 F 形音孔，讓腔體內空氣振動傳出，增加音量並豐富泛音。'},{part:'腳針',en:'Endpin',x:50,y:99,lx:72,ly:96,side:'right',desc:'從琴身底部伸出的金屬棒，演奏時頂住地面以支撐樂器，可調節長度適合不同身高的演奏者。'}],

        'double-bass':   [{part:'琴頭',en:'Scroll',x:50,y:4,side:'left',desc:'低音大提琴頂端的裝飾部分，部分琴款採用渦卷形，部分採用獸頭雕刻，整體比其他弓弦樂器更大。'},{part:'調音栓',en:'Tuning Peg',x:50,y:9,side:'right',desc:'低音大提琴常配備機械齒輪調音器，因弦線張力極大，純木製旋鈕難以精確調音。'},{part:'琴頸',en:'Neck',x:50,y:18,side:'left',desc:'粗壯的琴頸供演奏者左手握持，站立或坐於高凳演奏，需要更大的手指延展。'},{part:'弦線',en:'Strings',x:50,y:42,side:'left',desc:'四條弦（E、A、D、G）是管弦樂團中音域最低的弓弦樂器，提供整個樂隊的低音基礎。'},{part:'琴橋',en:'Bridge',x:50,y:60,side:'right',desc:'厚實的木製琴橋，承受四條粗弦的巨大張力，同時高效地傳遞振動至琴身。'},{part:'琴身',en:'Body',x:56,y:50,side:'right',desc:'管弦樂團中最大的弓弦樂器琴身，肩部通常呈斜肩設計，方便演奏者的弓臂操作。'},{part:'腳針',en:'Endpin',x:51,y:99,side:'right',desc:'從琴底伸出的粗大金屬支撐棒，站立演奏時頂住地面，可調節高度適合不同的演奏者。'}],

        'harp':          [{part:'頸',en:'Neck',x:40,y:14,side:'right',desc:'豎琴頂部弧形的部件，內藏調音機構，連接前柱與共鳴箱，是整個框架的關鍵結構。'},{part:'前柱',en:'Fore-pillar',x:25,y:50,side:'left',desc:'豎琴最粗壯的直立支柱，承受所有弦線的巨大張力，通常由硬木製成，是整個樂器的骨架。'},{part:'弦線',en:'Strings',x:45,y:42,side:'right',desc:'音樂會豎琴共有 47 條弦，由金屬線和羊腸線製成，跨越六個半八度的音域，演奏時用雙手手指撥弦。'},{part:'共鳴箱',en:'Resonator',x:60,y:67,side:'right',desc:'三角形的中空腔體，將弦線振動放大並投射出去，通常由雲杉面板與楓木背板製成。'},{part:'琴聲板',en:'Sound Board',x:58,y:55,side:'right',desc:'弦線固定於其上的面板，振動時將能量傳入共鳴箱，是音色形成的核心部件。'},{part:'腳踏',en:'Pedal',x:64,y:86,side:'right',desc:'音樂會豎琴有七個踏板，分別控制七個音名，每個踏板有三段位置，可升降半音，實現不同調性的演奏。'}],

        'guitar':        [{part:'琴頭',en:'Headstock',x:51,y:11,lx:70,ly:7,side:'right',desc:'吉他頂端固定調音器的部件，造型因品牌而異，是辨識吉他款式的特徵之一。'},{part:'調音器',en:'Tuner',x:46,y:14,lx:24,ly:14,side:'left',desc:'機械式調音旋鈕，轉動可調整弦線張力以改變音高，現代吉他多採用封閉式機械調音器。'},{part:'琴頸',en:'Neck',x:51,y:26,lx:30,ly:26,side:'left',desc:'演奏者左手握持及按弦的部分，通常由楓木或桃花心木製成，內有鋼筋調整弧度。'},{part:'品柱',en:'Frets',x:54,y:36,lx:72,ly:36,side:'right',desc:'嵌入指板的金屬條，將音階分割為半音，手指按在品柱之間可發出準確音高。'},{part:'音孔',en:'Sound Hole',x:51,y:58,lx:75,ly:55,side:'right',desc:'琴身中央的圓形開口，讓琴腔內的空氣振動傳出，擴大音量並豐富音色。'},{part:'弦線',en:'Strings',x:51,y:45,lx:28,ly:45,side:'left',desc:'六條弦由低至高為 E、A、D、G、B、E 弦，可用手指撥奏或撥片彈奏。'},{part:'琴橋',en:'Bridge',x:51,y:72,lx:78,ly:76,side:'right',desc:'固定弦線末端並將振動傳至琴身的部件，對音色和音準均有影響。'},{part:'琴身',en:'Body',x:51,y:65,lx:80,ly:65,side:'right',desc:'吉他的共鳴箱，由面板、背板和側板組成，形狀影響音色特性。'}],
        'bass-guitar':   [{part:'琴頭',en:'Headstock',x:67,y:4,side:'right',desc:'低音吉他頂端固定調音器的部件，通常比一般吉他更寬以容納粗重的低音弦。'},{part:'琴頸',en:'Neck',x:63,y:18,side:'right',desc:'較長且寬闊的指板，通常為四弦或五弦，需要手指有較大的延展能力。'},{part:'品柱',en:'Frets',x:59,y:32,side:'right',desc:'金屬分音條，也有無品設計，無品貝斯音色更圓滑，接近雙低音提琴。'},{part:'弦線',en:'Strings',x:55,y:45,side:'left',desc:'通常四條弦（E、A、D、G），音域比吉他低八度，為樂隊提供低音節奏基礎。'},{part:'拾音器',en:'Pickup',x:51,y:62,side:'right',desc:'將弦線振動轉換為電信號的磁性裝置，不同類型拾音器產生不同音色。'},{part:'琴身',en:'Body',x:51,y:72,side:'right',desc:'多為實心木材，不需共鳴腔，通過拾音器和擴音器輸出聲音。'},{part:'旋鈕',en:'Knobs',x:51,y:80,side:'left',desc:'控制音量和音色（高低頻）的旋鈕，調整輸出到擴音器的聲音特性。'}],
        'ukulele':       [{part:'琴頭',en:'Headstock',x:50,y:7,side:'right',desc:'烏克麗麗頂端固定調音器的小型琴頭，造型多樣，常見鳳梨形或標準形。'},{part:'調音栓',en:'Tuning Peg',x:46,y:11,side:'left',desc:'調整四條弦音高的旋鈕，標準調音為 G、C、E、A，音域明亮輕快。'},{part:'琴頸',en:'Neck',x:50,y:24,side:'left',desc:'短小的琴頸，適合小手演奏，是烏克麗麗易於上手的原因之一。'},{part:'品柱',en:'Frets',x:53,y:33,side:'right',desc:'指板上的金屬分音條，數量通常少於吉他，演奏範圍相對較小。'},{part:'弦線',en:'Strings',x:50,y:46,side:'left',desc:'四條尼龍弦，音色清亮輕快，與夏威夷音樂和民謠風格相得益彰。'},{part:'音孔',en:'Sound Hole',x:51,y:68,side:'right',desc:'琴身中央的音孔，讓共鳴箱內的聲音傳出，增加音量與音色層次。'},{part:'琴橋',en:'Bridge',x:51,y:86,side:'right',desc:'固定弦線末端並傳遞振動至琴面的部件，通常由烏木或玫瑰木製成。'}],
        'banjo':         [{part:'調音栓',en:'Tuning Peg',x:47,y:9,side:'left',desc:'調整弦線音高的旋鈕，五弦班卓有五根調音栓，第五根位於琴頸中段。'},{part:'琴頸',en:'Neck',x:51,y:22,side:'left',desc:'細長的指板供手指按弦，五弦班卓常見於藍草音樂，四弦則用於傳統爵士。'},{part:'品柱',en:'Frets',x:54,y:30,side:'right',desc:'嵌入指板的金屬條，使演奏者能按出準確音高。'},{part:'鼓面',en:'Drum Head',x:52,y:62,side:'right',desc:'班卓琴圓形共鳴體上的鼓皮面板，演奏時用手指或撥片撥弦，振動通過鼓面放大。'},{part:'弦線',en:'Strings',x:51,y:42,side:'left',desc:'通常五條弦，撥奏時產生清脆明亮的音色，是美國民間音樂的特色樂器。'},{part:'共鳴器',en:'Resonator',x:52,y:74,side:'right',desc:'背面的圓形碗狀共鳴器，將聲音向前投射，增加音量，常見於演奏用班卓琴。'}],
        'mandolin':      [{part:'琴頭',en:'Headstock',x:51,y:2,side:'right',lx:77,ly:6,desc:'曼陀鈴頂端固定八個調音旋鈕的部件，因為共有四組雙弦，旋鈕比一般吉他多。'},{part:'調音栓',en:'Tuning Peg',x:42,y:7,side:'left',lx:24,ly:6,desc:'調整八條弦（四組雙弦）音高的旋鈕，成對調成同音以增強音量與共鳴。'},{part:'琴頸',en:'Neck',x:49,y:25,side:'left',lx:27,ly:28,desc:'短小的指板，音域與小提琴相同（G、D、A、E），可演奏小提琴曲目。'},{part:'品柱',en:'Frets',x:51,y:30,side:'right',lx:63,ly:30,desc:'指板上的金屬分音條，使曼陀鈴比小提琴更易於初學者按出準確音高。'},{part:'音孔',en:'Sound Hole',x:37,y:74,side:'left',lx:18,ly:69,desc:'傳統曼陀鈴有圓形音孔，F型曼陀鈴則有兩個F形音孔，影響音色特性。'},{part:'弦線',en:'Strings',x:51,y:42,side:'left',lx:33,ly:42,desc:'四組共八條鋼弦，每組兩條調成同音，演奏時同時撥響，音色洪亮穿透。'},{part:'琴橋',en:'Bridge',x:51,y:78,side:'right',lx:82,ly:79,desc:'支撐弦線的可移動木橋，調整音準時可前後移動，通常由烏木製成。'}],
        'flute':         [{part:'頭管',en:'Head Joint',x:92,y:6,side:'left',lx:58,ly:5,desc:'長笛可拆卸的頂端管節，上面有吹孔，演奏者橫吹使氣流切過吹孔邊緣，使管內空氣柱振動發聲，無需使用任何簧片。'},{part:'吹孔',en:'Embouchure Hole',x:89,y:10,side:'left',lx:49,ly:21,desc:'頭管上方的橢圓形小孔，演奏者將嘴唇放在吹孔邊緣，以特定角度吹氣使空氣柱振動，是長笛唯一的發聲部位。'},{part:'上管',en:'Upper Joint',x:72,y:27,lx:95,ly:37,side:'right',desc:'上半段管身，設有高音區按鍵，是演奏者左手操控的主要區域。'},{part:'按鍵',en:'Keys',x:48,y:51,lx:28,ly:49,side:'left',desc:'精密的銀製機械按鍵，按下時封閉音孔改變振動管長，從而改變音高。'},{part:'下管',en:'Lower Joint',x:36,y:69,lx:64,ly:68,side:'right',desc:'下半段管身，設有低音區按鍵，與上管共同組成完整音域。'},{part:'喇叭口',en:'Bell',x:8,y:96,lx:43,ly:94,side:'right',desc:'管身末端略微外擴的開口，聲音從此向外投射，形狀影響音色的圓潤度。'}],
        'clarinet':      [{part:'吹嘴',en:'Mouthpiece',x:50,y:13,side:'right',desc:'單簧管頂端，演奏者含住並吹氣使簧片振動，吹嘴的開口大小影響音色。'},{part:'簧片',en:'Reed',x:47,y:15,side:'left',desc:'一片薄竹片，固定於吹嘴扁平面，吹氣時高速振動產生聲音，是單簧管的發聲核心。'},{part:'上管',en:'Upper Joint',x:50,y:25,side:'right',desc:'左手操控的上半段管身，設有多個音孔和按鍵，覆蓋中高音域。'},{part:'按鍵',en:'Keys',x:46,y:43,side:'left',desc:'覆蓋上下管的複雜金屬按鍵系統，由貝姆（Böhm）系統設計，確保按鍵靈活精確。'},{part:'下管',en:'Lower Joint',x:50,y:60,side:'right',desc:'右手操控的下半段管身，與上管相接，設有低音區按鍵。'},{part:'喇叭口',en:'Bell',x:51,y:87,side:'right',desc:'管身末端略微外擴的喇叭形開口，讓聲音向外投射，賦予單簧管圓潤溫暖的音色。'}],
        'oboe':          [{part:'雙簧片',en:'Double Reed',x:84,y:10,lx:63,ly:6,side:'left',desc:'由兩片蘆葦竹綁合而成，吹氣時兩片相互振動發聲，音色尖銳穿透，演奏者需自行手工製作。'},{part:'上管',en:'Upper Joint',x:70,y:26,lx:90,ly:31,side:'right',desc:'上半段管身，左手按鍵控制高音區，管身圓錐形設計賦予雙簧管獨特的音色。'},{part:'按鍵',en:'Keys',x:46,y:54,lx:33,ly:46,side:'left',desc:'精密的機械按鍵系統，封閉音孔改變音高，雙簧管按鍵比單簧管更為複雜精細。'},{part:'下管',en:'Lower Joint',x:36,y:64,lx:53,ly:70,side:'right',desc:'下半段管身，右手按鍵控制低音區，與上管無縫接合組成完整音域。'},{part:'喇叭口',en:'Bell',x:11,y:92,lx:36,ly:93,side:'right',desc:'管身末端微微外擴的開口，聲音自此傳出，雙簧管的喇叭口比單簧管更短小。'}],
        'bassoon':       [{part:'雙簧片',en:'Double Reed',x:74,y:44,lx:89,ly:54,side:'right',desc:'兩片薄蘆葦竹綁成的雙簧片，插入S形彎管頂端，吹氣振動發聲，製作精細且費時。'},{part:'翼管',en:'Wing Joint',x:53,y:46,lx:22,ly:44,side:'left',desc:'緊接S形彎管的上段管身，由楓木製成，設有指孔和按鍵，左手拇指負責按壓背面音孔。'},{part:'長管',en:'Long Joint',x:40,y:62,lx:55,ly:67,side:'right',desc:'主要的長段管身，貫穿巴松管大部分音域，設有複雜的按鍵機構。'},{part:'底管',en:'Boot',x:6,y:96,lx:31,ly:93,side:'right',desc:'底部U形彎折的管段，將兩段管道並排折回，使整個樂器長度可被演奏者把持。'},{part:'喇叭口',en:'Bell',x:96,y:5,lx:70,ly:6,side:'left',desc:'頂端向上張開的喇叭形開口，聲音從此傳出，朝向演奏者後方投射。'}],
        'recorder':      [{part:'吹口',en:'Mouthpiece',x:50,y:3,lx:76,ly:19,side:'right',desc:'頂端的吹嘴，內有氣道引導氣流衝擊邊緣產生聲音，無需特殊吹奏技巧，適合初學者。'},{part:'管身',en:'Body',x:53,y:61,lx:75,ly:61,side:'right',desc:'木製或塑膠的主管體，中空的管道是聲音的共鳴腔，材質影響音色的溫暖程度。'},{part:'指孔',en:'Finger Holes',x:49,y:50,lx:23,ly:48,side:'left',desc:'管身上的七個圓形指孔，以手指開閉控制音高，是牧童笛最易辨識的特徵。'},{part:'尾端',en:'Foot',x:50,y:92,lx:62,ly:92,side:'right',desc:'管身最底部的末端，開口讓空氣流通，部分牧童笛在此設有額外按鍵擴展音域。'}],
            'piccolo':       [{part:'吹孔',en:'Embouchure Hole',x:86,y:29,lx:84,ly:77,side:'left',desc:'短笛橫吹的橢圓形吹孔，氣流切過吹孔邊緣使空氣柱振動，演奏方式與長笛相同，無需簧片，音域高出長笛一個八度。'},{part:'管身',en:'Body',x:58,y:49,lx:70,ly:76,side:'right',desc:'短小的管身，通常由木材或金屬製成，是管弦樂團中音域最高的管樂器。'},{part:'按鍵',en:'Keys',x:50,y:52,lx:44,ly:80,side:'right',desc:'銀製按鍵，封閉音孔改變音高，因管身短小，按鍵數量比長笛略少。'}],
        'english-horn':  [{part:'雙簧片',en:'Double Reed',x:92,y:10,side:'right',lx:60,ly:10,desc:'兩片蘆葦竹製成的雙簧片，振動方式與雙簧管相同，但英國管音色更溫暖深沉，帶鄉愁感。'},{part:'管身',en:'Body',x:55,y:45,side:'right',lx:71,ly:47,desc:'較雙簧管更長的管身，使音域比雙簧管低五度，渾厚的音色常用於描繪田園或哀愁的旋律。'},{part:'按鍵',en:'Keys',x:44,y:53,side:'left',lx:26,ly:46,desc:'精密的金屬按鍵系統，結構與雙簧管相近，封閉音孔改變音高。'},{part:'梨形喇叭口',en:'Pear Bell',x:14,y:92,side:'left',lx:43,ly:93,desc:'末端獨特的梨形球狀喇叭口，是英國管最顯著的外觀特徵，賦予其溫暖圓潤的共鳴音色。'}],
        'alto-sax':      [{part:'吹嘴',en:'Mouthpiece',x:93,y:5,side:'right',desc:'演奏者含住的吹嘴，配合單簧片振動發聲，材質（橡膠或金屬）影響音色的明暗。'},{part:'頸管',en:'Neck',x:56,y:10,side:'left',desc:'連接吹嘴與管身的S形彎曲金屬管，讓演奏者能以舒適角度持奏。'},{part:'管身',en:'Body',x:47,y:49,side:'right',desc:'彎曲的主管身，由黃銅製成，上面布滿音孔和按鍵，決定音域和音色特性。'},{part:'按鍵',en:'Keys',x:39,y:39,side:'left',desc:'複雜的機械按鍵系統，封閉音孔改變振動管長，中音薩克斯共有約23個按鍵。'},{part:'喇叭口',en:'Bell',x:16,y:40,side:'left',desc:'管身底部向上彎曲的喇叭形開口，聲音從此向前投射，增加音量和共鳴效果。'}],
        'tenor-sax':     [{part:'吹嘴',en:'Mouthpiece',x:22,y:13,side:'left',desc:'次中音薩克斯的吹嘴比中音更大，配合寬簧片產生更豐富低沉的音色，是爵士樂的經典音色。'},{part:'頸管',en:'Neck',x:50,y:14,side:'left',desc:'比中音薩克斯更長的S形頸管，連接吹嘴與管身，適應更大的管身體積。'},{part:'管身',en:'Body',x:55,y:40,side:'right',desc:'較中音薩克斯更大的管身，音域低一個全音，音色渾厚飽滿，常見於爵士和搖滾音樂。'},{part:'按鍵',en:'Keys',x:53,y:52,side:'left',desc:'封閉音孔改變音高的機械按鍵系統，按鍵間距比中音更寬，需更大的手掌操控。'},{part:'喇叭口',en:'Bell',x:72,y:53,side:'right',desc:'管身末端的大型喇叭形開口，投射出次中音薩克斯特有的溫暖渾厚音色。'}],
        'soprano-sax':   [{part:'吹嘴',en:'Mouthpiece',x:52,y:7,side:'right',desc:'小型吹嘴配合細小簧片，高音薩克斯音域最高，音色明亮穿透，常見於爵士和古典音樂。'},{part:'管身',en:'Body',x:55,y:41,side:'right',desc:'直管形設計，外觀近似單簧管，是四種薩克斯中最小、音域最高的。'},{part:'按鍵',en:'Keys',x:43,y:57,side:'left',desc:'精密按鍵系統，封閉音孔改變音高，因管身較直，持奏角度接近豎直。'},{part:'喇叭口',en:'Bell',x:51,y:96,side:'right',desc:'管身末端略微外擴的開口，聲音清亮穿透，適合演奏流暢的旋律線條。'}],
        'baritone-sax':  [{part:'吹嘴',en:'Mouthpiece',x:30,y:13,lx:12,ly:18,side:'left',desc:'四種薩克斯中最大的吹嘴，配合寬大簧片振動，產生深沉厚重的低音音色。'},{part:'頸管',en:'Neck',x:43,y:16,lx:30,ly:25,side:'left',desc:'較長彎曲的頸管，連接吹嘴與龐大的管身，頸部彎曲幅度比其他薩克斯更大。'},{part:'管身',en:'Body',x:65,y:47,lx:77,ly:47,side:'right',desc:'四種薩克斯中最大最重的管身，音域最低，管身頂部有額外的低音延伸管。'},{part:'按鍵',en:'Keys',x:53,y:54,lx:36,ly:57,side:'left',desc:'大型按鍵系統，間距寬廣需較大手掌操控，包含專屬的低音延伸按鍵。'},{part:'喇叭口',en:'Bell',x:65,y:27,lx:87,ly:17,side:'right',desc:'巨大的喇叭形開口，投射出低沉渾厚的低音，是薩克斯四重奏的重要低音基礎。'}],
        'harmonica':     [{part:'蓋板',en:'Cover Plate',x:50,y:20,side:'right',desc:'覆蓋在簧片板上方的金屬蓋，保護簧片並將聲音反射向前投射，通常由不鏽鋼製成。'},{part:'吹孔',en:'Blow Holes',x:50,y:50,side:'right',desc:'沿琴身排列的小孔，吹氣和吸氣分別產生不同音高，10孔口琴可演奏約三個八度的音域。'},{part:'簧片',en:'Reeds',x:50,y:75,side:'right',desc:'固定在金屬板上的薄片，氣流通過吹孔使其振動發聲，每個孔有吹簧和吸簧各一片。'},{part:'琴身',en:'Body',x:20,y:50,side:'left',desc:'中央的木製或塑膠框架，將蓋板和簧片板固定在一起，形狀讓演奏者能舒適地握持演奏。'}],
        'bagpipes':      [{part:'吹管',en:'Blowpipe',x:26,y:37,lx:10,ly:33,side:'left',desc:'演奏者用嘴吹氣充填風袋的管道，內有止回閥防止空氣回流，保持風袋持續充氣。'},{part:'風袋',en:'Bag',x:54,y:64,lx:75,ly:79,side:'right',desc:'皮革製的氣囊，儲存空氣並持續供氣給各管，使旋律不因演奏者呼吸而中斷。'},{part:'旋律管',en:'Chanter',x:13,y:87,lx:25,ly:87,side:'right',desc:'雙簧片管，演奏者手指控制音孔演奏旋律，是風笛的主要樂器聲部。'},{part:'低音管',en:'Drone Pipes',x:53,y:10,lx:78,ly:9,side:'right',desc:'持續發出固定低音的管道，通常有2至3支，為旋律提供不間斷的和聲背景。'}],
        'pan-flute':     [{part:'管子',en:'Pipes',x:43,y:74,lx:59,ly:86,side:'right',desc:'長短不一的竹管或木管排列而成，長管發低音，短管發高音，演奏者對管口吹氣以發聲。'},{part:'框架',en:'Frame',x:35,y:32,lx:22,ly:34,side:'left',desc:'將所有管子固定排列的支撐框架，保持管子正確間距和角度，便於演奏者持奏。'}],
        'trumpet':       [{part:'號嘴',en:'Mouthpiece',x:8,y:45,lx:8,ly:26,side:'left',desc:'杯形號嘴緊貼嘴唇，演奏者嘴唇振動產生音波，號嘴大小影響音色的明亮度與演奏舒適性。'},{part:'管身',en:'Body',x:32,y:43,lx:24,ly:17,side:'left',desc:'數段U形彎管連接而成的管身，總長約134公分，音域由低音升B到高音G，音色明亮響亮。'},{part:'活塞',en:'Valves',x:48,y:35,lx:52,ly:16,side:'right',desc:'三個圓柱形活塞按下時改變氣流路徑，延長有效管長以降低音高，組合出不同音符。'},{part:'調音管',en:'Tuning Slide',x:35,y:63,lx:40,ly:86,side:'left',desc:'U形滑管可拉出或推入調整整體音高，確保樂器在正確的音準範圍內演奏。'},{part:'喇叭口',en:'Bell',x:88,y:45,lx:91,ly:80,side:'right',desc:'管身末端擴張的喇叭形開口，將聲音向前投射並決定音量與音色的寬廣度。'}],
        'trombone':      [{part:'號嘴',en:'Mouthpiece',x:16,y:75,lx:27,ly:90,side:'left',desc:'大型杯形號嘴，演奏者嘴唇鬆弛振動產生較低的音波，長號號嘴比小號更大更淺。'},{part:'滑管',en:'Slide',x:48,y:69,lx:59,ly:86,side:'left',desc:'長號獨特的U形伸縮滑管，向外拉出延長管道降低音高，共有七個把位，取代活塞機構。'},{part:'管身',en:'Body',x:29,y:37,lx:29,ly:16,side:'right',desc:'固定管身部分，包含號嘴接頭與連接滑管的管道，決定長號的基本音域和音色特質。'},{part:'喇叭口',en:'Bell',x:59,y:40,lx:71,ly:40,side:'right',desc:'向右延伸的大型喇叭形開口，投射出長號特有的渾厚低沉音色，直徑通常約20-25公分。'}],
        'french-horn':   [{part:'號嘴',en:'Mouthpiece',x:8,y:42,lx:17,ly:62,side:'left',desc:'漏斗形號嘴，比其他銅管更深更窄，演奏者需要精確控制嘴唇張力，技術難度較高。'},{part:'管身',en:'Body',x:56,y:19,lx:68,ly:19,side:'right',desc:'盤繞成圓形的長管（展開約3.7公尺），圓形設計使樂器易於攜帶，音色圓潤柔和。'},{part:'轉閥',en:'Rotary Valves',x:37,y:63,lx:37,ly:76,side:'left',desc:'圓號使用旋轉閥而非活塞，左手操作四個轉閥改變管長，現代雙調圓號可在F調和降B調之間切換。'},{part:'喇叭口',en:'Bell',x:74,y:85,lx:59,ly:94,side:'right',desc:'朝向後方的大型喇叭口，演奏時右手伸入喇叭口微調音準和音色，是圓號獨特的演奏技巧。'}],
        'tuba':          [{part:'號嘴',en:'Mouthpiece',x:72,y:40,lx:91,ly:29,side:'right',desc:'大型杯形號嘴，演奏者嘴唇鬆弛振動產生極低的音波，是銅管樂器中最大的號嘴。'},{part:'管身',en:'Body',x:62,y:56,lx:74,ly:56,side:'right',desc:'龐大盤繞的管身（展開約5.5公尺），是銅管樂器中最大最重的，提供管弦樂團最低音域的基礎。'},{part:'活塞',en:'Valves',x:80,y:43,lx:100,ly:52,side:'right',desc:'三至五個活塞或轉閥，按下時改變氣流路徑延長管長降低音高，通常由右手操作。'},{part:'喇叭口',en:'Bell',x:55,y:5,lx:67,ly:5,side:'right',desc:'朝上或朝前的巨大喇叭口，投射出深沉渾厚的低音，賦予管弦樂團堅實的低音基礎。'}],
        'cornet':        [{part:'號嘴',en:'Mouthpiece',x:21,y:11,lx:9,ly:11,side:'left',desc:'比小號號嘴略深的杯形號嘴，賦予短號較柔和圓潤的音色，技術上比小號稍易上手。'},{part:'管身',en:'Body',x:32,y:60,lx:22,ly:67,side:'left',desc:'比小號更緊湊的圓錐形管身，錐形設計（而非圓柱形）使音色更加柔和溫暖，常見於銅管樂隊。'},{part:'活塞',en:'Valves',x:29,y:20,lx:36,ly:9,side:'right',desc:'三個活塞按鍵，功能與小號相同，改變管長調整音高，短號的活塞間距較小，適合手小的演奏者。'},{part:'喇叭口',en:'Bell',x:82,y:77,lx:87,ly:88,side:'right',desc:'比小號更寬的喇叭口，投射出短號特有的柔和飽滿音色，在薩爾瓦多軍樂隊和爵士樂中常見。'}],
        'timpani':       [{part:'鼓面',en:'Drum Head',x:50,y:20,side:'right',desc:'覆蓋在銅鍋頂部的塑料或動物皮鼓面，敲擊時振動產生聲音，張力決定音高，可通過踏板即時調整。'},{part:'銅鍋',en:'Kettle',x:50,y:55,side:'right',desc:'半球形的銅製或玻璃纖維鍋體，作為共鳴腔放大聲音，不同大小的定音鼓負責不同音域。'},{part:'調音器',en:'Tuning Gauge',x:20,y:40,side:'left',desc:'顯示當前音高的指示器，讓演奏者在演奏中準確調音，是定音鼓精確音準的重要輔助工具。'},{part:'腳踏板',en:'Foot Pedal',x:50,y:92,side:'right',desc:'用腳踩踏可即時改變鼓面張力以調整音高，是定音鼓區別於其他鼓的最大特色。'}],
        'snare':         [{part:'鼓面',en:'Drum Head',x:51,y:36,lx:76,ly:11,side:'right',desc:'頂部的擊打面，演奏者用鼓棒敲擊，振動向下傳遞至響弦，產生小軍鼓特有的清脆噪音。'},{part:'鼓身',en:'Shell',x:36,y:74,lx:48,ly:74,side:'right',desc:'金屬或木製的圓柱形鼓身，連接頂部鼓面與底部響弦，深度影響共鳴和音色特性。'},{part:'響弦',en:'Snare Wires',x:11,y:57,lx:7,ly:76,side:'right',desc:'底部鼓面下方的金屬弦，鼓面振動時響弦拍擊底面產生「沙沙」的噪音，可用開關切換拆除。'},{part:'調音環',en:'Tuning Lug',x:94,y:53,lx:91,ly:78,side:'left',desc:'環繞鼓身的金屬螺栓，旋緊或放鬆可調整鼓面張力，改變音高和音色的明亮度。'}],
        'bass-drum':     [{part:'鼓面',en:'Drum Head',x:55,y:30,lx:84,ly:25,side:'right',desc:'大型的鼓皮面板，管弦樂團中大鼓直立放置，用特製大槌敲擊側面鼓皮產生低沉宏亮的聲音。'},{part:'鼓身',en:'Shell',x:35,y:34,lx:13,ly:19,side:'right',desc:'超大的圓柱形木製鼓身，龐大的共鳴腔產生深沉渾厚的低頻聲音，是樂團中音量最大的打擊樂器。'},{part:'鼓棒',en:'Mallet',x:32,y:51,lx:18,ly:51,side:'left',desc:'頭部包有毛氈的大型圓頭槌，柔軟的材質使敲擊時產生渾厚而非尖銳的低音。'}],
        'xylophone':     [{part:'音板',en:'Bars',x:50,y:38,lx:62,ly:17,side:'right',desc:'硬木製成的長方形音板，按音階排列，長板發低音，短板發高音，敲擊後聲音短促乾脆。'},{part:'共鳴管',en:'Resonators',x:50,y:65,lx:62,ly:65,side:'right',desc:'每塊音板下方懸掛的金屬管，長度與音板匹配，放大並延長特定頻率的振動聲音。'},{part:'框架',en:'Frame',x:15,y:52,lx:7,ly:70,side:'left',desc:'支撐所有音板和共鳴管的金屬框架，通常安裝於可折疊的腳架上便於搬運。'},{part:'鼓棒',en:'Mallets',x:17,y:23,lx:29,ly:11,side:'right',desc:'頭部由橡膠或硬塑料製成的敲擊槌，材質較硬使音色清脆明亮，演奏時雙手各持一或兩支。'}],
        'triangle':      [{part:'金屬棒',en:'Metal Bar',x:37,y:50,lx:14,ly:49,side:'right',desc:'由鋼鐵彎折成三角形的金屬棒，一角留有開口使聲音能自由共鳴，敲擊時產生清澈延續的高音。'},{part:'敲棒',en:'Beater',x:70,y:60,lx:87,ly:60,side:'right',desc:'細長的金屬棒，敲擊三角鐵產生清脆的叮噹聲，在三角鐵內壁來回敲擊可演奏顫音。'},{part:'懸掛繩',en:'Suspension',x:45,y:8,lx:26,ly:9,side:'right',desc:'懸掛三角鐵的細繩或魚線，讓金屬棒能自由振動而不受阻礙，接觸點越少音色越純淨。'}],
        'cymbals':       [{part:'銅片',en:'Cymbal Plate',x:50,y:31,lx:48,ly:18,side:'right',desc:'大圓形的銅合金薄板，兩片相互碰撞或刷擦產生響亮的金屬音，厚薄和大小影響音色特質。'},{part:'鐘頂',en:'Bell',x:58,y:46,lx:85,ly:23,side:'left',desc:'鈸面中央凸起的圓丘，是鈸最厚實的部分，敲擊時聲音最清亮，常用鼓棒頭部敲擊。'},{part:'把手',en:'Handle',x:81,y:53,lx:84,ly:68,side:'right',desc:'縫在皮革把手上供演奏者抓握，演奏時雙手持鈸對擊，或單手持鈸碰撞另一靜止的鈸。'}],
        'tambourine':    [{part:'鼓面',en:'Drum Head',x:50,y:35,lx:62,ly:35,side:'right',desc:'圓形框架上的薄鼓皮，用手指敲擊或用拇指摩擦邊緣可產生不同效果，也可不裝鼓皮。'},{part:'框架',en:'Frame',x:52,y:70,lx:49,ly:91,side:'left',desc:'淺圓形木製框架，周邊開有缺口安裝銅製鈴片，可用手持握搖動或敲擊演奏。'},{part:'鈴片',en:'Jingles',x:70,y:72,lx:81,ly:84,side:'right',desc:'成對嵌入框架缺口的小型金屬圓片，搖動或敲擊時互相碰撞發出叮叮響聲，是鈴鼓的標誌性特色。'}],
        'glockenspiel':  [{part:'金屬音板',en:'Metal Bars',x:50,y:30,lx:42,ly:11,side:'right',desc:'鋼製的長方形音板按音階排列，敲擊後產生清亮悅耳的鐘聲，音域比木琴高，聲音延續較長。'},{part:'框架',en:'Frame',x:87,y:30,lx:81,ly:12,side:'left',desc:'支撐金屬音板的框架，通常較小型便於攜帶，行進樂隊版本可手持演奏。'},{part:'鼓棒',en:'Mallets',x:68,y:69,lx:80,ly:81,side:'right',desc:'頭部由橡膠或塑料製成的小槌，敲擊金屬音板產生清澈的鐘聲，材質越硬音色越明亮。'}],
        'marimba':       [{part:'木音板',en:'Wooden Bars',x:44,y:14,lx:24,ly:35,side:'right',desc:'玫瑰木或合成材料製成的音板，比木琴更寬更厚，底部削成弧形以調整音調，音色溫暖圓潤。'},{part:'共鳴管',en:'Resonators',x:62,y:45,lx:61,ly:78,side:'right',desc:'每塊音板下方的金屬共鳴管，比木琴的更長，使聲音延續更久並增添豐富的泛音色彩。'},{part:'框架',en:'Frame',x:18,y:14,lx:6,ly:14,side:'left',desc:'支撐音板和共鳴管的大型金屬框架，通常裝有輪子便於移動，標準馬林巴可達四至五個八度。'},{part:'鼓棒',en:'Mallets',x:28,y:84,lx:28,ly:85,side:'right',desc:'頭部包有毛線或橡膠的軟質槌，柔軟材質使敲擊時產生溫暖圓潤的音色，演奏者可同時持兩至四支。'}],
        'vibraphone':    [{part:'金屬音板',en:'Metal Bars',x:50,y:20,lx:50,ly:7,side:'right',desc:'鋁合金製的音板，音色介於木琴和鐘琴之間，聲音延續長且帶有獨特的顫音效果。'},{part:'共鳴管',en:'Resonators',x:65,y:46,lx:71,ly:75,side:'right',desc:'每塊音板下方的金屬管，管口裝有可旋轉的扇葉，由馬達驅動產生週期性開閉形成顫音效果。'},{part:'踏板',en:'Pedal',x:41,y:77,lx:33,ly:85,side:'right',desc:'控制消音器的踏板，踩下時消音器離開音板讓聲音自由延續，釋放時消音使聲音停止。'},{part:'馬達',en:'Motor',x:11,y:32,lx:3,ly:15,side:'left',desc:'驅動共鳴管頂部扇葉旋轉的小型電動馬達，轉速決定顫音的快慢，是顫音琴最獨特的部件。'}],
        'drums':         [{part:'大鼓',en:'Bass Drum',x:50,y:75,side:'right',desc:'鼓組最大的鼓，平設後用腳踏槌敲擊鼓面，按車節奏，提供整順音樂的低音風檢基礎。'},{part:'小鼓',en:'Snare',x:35,y:55,side:'left',desc:'帶有響弦的小型鼓，產生清脆尖銳的火花聲，是鼓組中節奏的核心，通常置於演奏者左手邊。'},{part:'嗵鼓',en:'Toms',x:50,y:30,side:'right',desc:'沒有響弦的中型鼓，音色飽滿圓潤，通常有多個不同大小，如中鼓和地鼓，用於填充和修飾旋律。'},{part:'踩鈸',en:'Hi-hat',x:15,y:40,side:'left',desc:'兩片金屬鈸由腳踏板控制開閉，開車音色張放，閉鈸聲音短促，是保持节奏动感的核心打擊樂器。'},{part:'碎音鈸',en:'Crash',x:25,y:15,side:'left',desc:'張力較大、音色尖銳的鈸，進行加強音像和渴染效果，敲擊後聲音突然蠀辣再漸漸消退。'},{part:'騎鈸',en:'Ride',x:80,y:25,side:'right',desc:'較厚層的大鈸，產生清晰明亮的泛音，常用於爵士樂和中速曲風的持續音色節奏。'}],
        'cajon':         [{part:'打擊面',en:'Tapa',x:70,y:24,lx:82,ly:24,side:'right'},{part:'箱身',en:'Body',x:24,y:28,lx:12,ly:28,side:'left'},{part:'音孔',en:'Sound Hole',x:16,y:64,lx:12,ly:83,side:'right'}],
        'maracas':       [{part:'球體',en:'Gourd',x:18,y:50,lx:13,ly:78,side:'right',desc:'圓球形的中空殼體，傳統用葡葦乾果，現代常用塑膠或木製，內裝珠粒或種子。'},{part:'手柄',en:'Handle',x:50,y:75,lx:62,ly:75,side:'right',desc:'木製或塑膠手柄，搖動時帶動球體內的珠粒撞擊殼壁產生聲音，數量影響音量。'},{part:'珠粒',en:'Beads',x:31,y:19,lx:19,ly:19,side:'left',desc:'球體內的小珠粒或種子，搖動時撞擊内壁產生沙沙的響聲，珠粒大小和數量影響音色。'}],
        'egg-shakers':   [{part:'蛋形殼',en:'Egg Shell',x:50,y:40,side:'right',desc:'蛋形的塑膠殼體，小巧輕便易握，內裝小珠粒搖動即可產生柔和的沙沙聲。'},{part:'珠粒',en:'Beads',x:30,y:40,side:'left',desc:'殼內的細小珠粒，搖動時撞擊內壁產生聲音，音量比沙槌更柔和細致，適合兒童音樂配器。'}],
        'tubular-bells': [{part:'金屬管',en:'Metal Tubes',x:50,y:35,side:'right',desc:'不同長度的黃銅管按音高排列，敲擊產生清亮深遠的教堂鐘聲效果，常用於管弦樂在鵅鸽場景的音樂中。'},{part:'框架',en:'Frame',x:15,y:50,side:'left',desc:'金屬支撐架，將金屬管懸掛在空中使其自由振動，頂部有掛勾固定，港口有消音裝置。'},{part:'踏板',en:'Damper Pedal',x:50,y:92,side:'right',desc:'釋放踏板時消音器接觸金屬管止音，踩下踏板則讓聲音自由延續，控制聲音的長短。'},{part:'鼓棒',en:'Mallet',x:80,y:15,side:'right',desc:'專用的硬賯圓頭槌，敲擊金屬管頂端產生清亮的鐘聲，散摺不同管上的不同部位可產生不同音色。'}],
        'cabasa':        [{part:'金屬珠鏈',en:'Bead Chain',x:50,y:30,side:'right',desc:'繞在圓筒外的金屬珠鏈，旋轉或搖動時與圓筒表面摩擦產生獨特的沙沙金屬聲。'},{part:'圓筒',en:'Cylinder',x:50,y:45,side:'left',desc:'中央的圓柱形結構，表面有綋路與珠鏈摩擦產生聲音，材質影響聲音的豐富度。'},{part:'手柄',en:'Handle',x:50,y:80,side:'right',desc:'木製手柄，一手握住手柄，另一手控制圓筒旋轉珠鏈產生聲音，強弱由摩擦力道控制。'}],
        'djembe':        [{part:'鼓面',en:'Goat Skin',x:50,y:15,side:'right',desc:'山羊皮製成的鼓面，用雙手拍打不同位置產生三種基本音色：中心低音、中間中音和邊緣高音。'},{part:'鼓身',en:'Shell',x:50,y:50,side:'right',desc:'杯形的整塊木雕鼓身，底部收窄形成開口，木材和形狀影響音色，發源於西非曼子族。'},{part:'繩索',en:'Rope Tuning',x:25,y:55,side:'left',desc:'繞在鼓身外側的繩索，將鼓面拉緊固定在鼓身上，拉緊可提高音高，新麻絹調音系統。'}],
        'castanets':     [{part:'貝殼片',en:'Shell Pair',x:50,y:35,side:'right',desc:'一對貝殼形的硬木片，互相撞擊產生清脆急促的「啦啦」聲，是西班牙舞蹈的經典伴奏。'},{part:'連接繩',en:'String',x:50,y:10,side:'right',desc:'將兩片貝殼片連接的繩子，套在拇指上，用手指控制兩片的開合和撞擊，產生快速的節奏聲。'}],
        'congas':        [{part:'鼓面',en:'Drum Head',x:50,y:12,side:'right',desc:'水牛皮或合成皮製成，用手掌和手指拍打產生多種音色，包括低音、開放音和清脆的拍打音。'},{part:'鼓身',en:'Shell',x:50,y:50,side:'right',desc:'圖桶形的木製或玻璃纖維鼓身，底部有開口，形狀和大小影響音色和音域。'},{part:'調音環',en:'Tuning Lugs',x:25,y:30,side:'left',desc:'環繞鼓身頂部的金屬螺栓，旋轉可調整鼓面張力以改變音高，通常成對使用以平衡張力。'}],
        'cowbell':       [{part:'鐘身',en:'Bell Body',x:50,y:45,side:'right',desc:'梯形的金屬鐘體，敲擊不同位置產生不同音色——開口處聲音明亮，封閉處聲音沉鬶，拉丁音樂和搖滾樂常見。'},{part:'敲棒',en:'Beater',x:20,y:30,side:'left',desc:'木棒或鼓棒敲擊鐘體產生響亮的金屬聲，在拉丁音樂和搖滾音樂中常見。'}],
        'guiro':         [{part:'刮紋面',en:'Ridged Surface',x:50,y:35,side:'right'},{part:'共鳴腔',en:'Chamber',x:50,y:65,side:'right'},{part:'刮棒',en:'Scraper',x:20,y:30,side:'left'}],
        'piano':         [{part:'琴鍵',en:'Keys',x:50,y:55,side:'right'},{part:'琴弦',en:'Strings',x:50,y:25,side:'right'},{part:'琴槌',en:'Hammers',x:50,y:35,side:'left'},{part:'踏板',en:'Pedals',x:50,y:92,side:'right'},{part:'共鳴板',en:'Soundboard',x:25,y:30,side:'left'}],
        'organ':         [{part:'琴鍵',en:'Keys',x:50,y:60,side:'right'},{part:'風管',en:'Pipes',x:50,y:15,side:'right'},{part:'音栓',en:'Stops',x:20,y:45,side:'left'},{part:'踏板鍵',en:'Pedal Board',x:50,y:92,side:'right'}],
        'harpsichord':   [{part:'琴鍵',en:'Keys',x:50,y:65,side:'right'},{part:'琴弦',en:'Strings',x:50,y:35,side:'right'},{part:'撥子',en:'Plectra',x:30,y:45,side:'left'},{part:'共鳴板',en:'Soundboard',x:65,y:50,side:'right'}],
        'accordion':     [{part:'琴鍵',en:'Keys',x:20,y:40,side:'left'},{part:'風箱',en:'Bellows',x:50,y:50,side:'right'},{part:'簧片',en:'Reeds',x:50,y:30,side:'right'},{part:'按鈕',en:'Buttons',x:80,y:40,side:'right'},{part:'背帶',en:'Straps',x:15,y:15,side:'left'}],
    };

    const INSTRUMENT_MAP = new Map(INSTRUMENT_BANK.map(i => [i.id, i]));  // O(1) lookup
    // Pre-index: instruments that have card/photo images (not SVG/emoji-only)
    const G4_IMG_POOL = INSTRUMENT_BANK.filter(i => i.img && /\.(png|jpg|jpeg|avif|webp)$/i.test(i.img));

    // Sound source descriptions per family (Q4: 靠甚麼發聲？)
    const SOUND_SOURCE_MAP = {
        strings:   '弓拉或撥動弦線',
        woodwind:  '吹氣通過管口或簧片',
        brass:     '嘴唇振動吹入管口',
        percussion:'敲擊使物體振動',
        keyboard:  '按鍵觸動機械或電路',
    };
    // Percussion instruments that have fixed pitch (Q3: 有固定音高嗎？)
    const PERCUSSION_HAS_PITCH = new Set(['timpani','xylophone','glockenspiel','marimba','vibraphone']);

    // Question type weights: [type, weight]
    const G4_Q_TYPES = [
        ['image-name',       0.30],  // 這是甚麼樂器？ (image → name)
        ['name-image',       0.25],  // 哪張是…？ (name → pick image)
        ['name-family',      0.27],  // 屬於哪個樂器家族？ (name → family)
        ['percussion-pitch', 0.08],  // 有固定音高嗎？ (percussion only)
        ['sound-source',     0.10],  // 靠甚麼方式發聲？ (image → sound method)
    ];

    let g4State = null;

    /** Weighted random pick from G4_Q_TYPES, returns type string */
    function pickG4Type() {
        const total = G4_Q_TYPES.reduce((s, t) => s + t[1], 0);
        let r = Math.random() * total;
        for (const [type, w] of G4_Q_TYPES) { r -= w; if (r <= 0) return type; }
        return G4_Q_TYPES[G4_Q_TYPES.length - 1][0];
    }

    /** Pick n distractor instrument objects for name-image type, prefer same-family */
    function pickImgDistractors(correct, pool, n) {
        const sameFamily = shuffle(pool.filter(p => p.id !== correct.id && p.family === correct.family));
        const diffFamily = shuffle(pool.filter(p => p.id !== correct.id && p.family !== correct.family));
        const result = [];
        for (const p of sameFamily) { if (result.length >= Math.min(2, n)) break; result.push(p); }
        for (const p of diffFamily) { if (result.length >= n) break; result.push(p); }
        return result.slice(0, n);
    }

    /** Generate balanced distractors — prefer same-family, then cross-family, guaranteed unique */
    function pickDistractors(correct, pool, field, n) {
        const answer = correct[field];
        const sameFamily = shuffle(pool.filter(p => p.family === correct.family && p[field] !== answer));
        const diffFamily = shuffle(pool.filter(p => p.family !== correct.family && p[field] !== answer));
        const seen = new Set([answer]);
        const wrongs = [];
        // Pick 1-2 from same family for plausible distractors
        for (const p of sameFamily) {
            if (wrongs.length >= Math.min(2, n)) break;
            if (!seen.has(p[field])) { seen.add(p[field]); wrongs.push(p[field]); }
        }
        // Fill rest from different families
        for (const p of diffFamily) {
            if (wrongs.length >= n) break;
            if (!seen.has(p[field])) { seen.add(p[field]); wrongs.push(p[field]); }
        }
        return wrongs.slice(0, n);
    }

    function generateG4Questions(count) {
        const pool = INSTRUMENT_BANK;
        const percPool = pool.filter(i => i.family === 'percussion');
        const imgPool = G4_IMG_POOL;
        const videoPool = pool.filter(i => i.video);
        const questions = [];
        const recentIds = [];
        const recentWindow = Math.min(8, Math.floor(pool.length * 0.5));
        const allSoundSources = Object.values(SOUND_SOURCE_MAP);

        for (let i = 0; i < count; i++) {
            const type = pickG4Type();
            let correct, safety = 0;

            // Select instrument based on type constraints
            if (type === 'percussion-pitch') {
                do { correct = percPool[Math.floor(Math.random() * percPool.length)]; safety++; }
                while (recentIds.includes(correct.id) && safety < 20);
            } else if (type === 'image-name' || type === 'sound-source') {
                do { correct = imgPool[Math.floor(Math.random() * imgPool.length)]; safety++; }
                while (recentIds.includes(correct.id) && safety < 30);
            } else if (type === 'listen-name') {
                const listenPool = videoPool.length ? videoPool : pool;
                do { correct = listenPool[Math.floor(Math.random() * listenPool.length)]; safety++; }
                while (recentIds.includes(correct.id) && safety < 30);
            } else {
                do { correct = pool[Math.floor(Math.random() * pool.length)]; safety++; }
                while (recentIds.includes(correct.id) && safety < 30);
            }

            recentIds.push(correct.id);
            if (recentIds.length > recentWindow) recentIds.shift();

            let opts, answerKey, imgOptions = null;
            if (type === 'listen-name') {
                answerKey = correct.nameZh;
                const wrongs = pickDistractors(correct, pool, 'nameZh', 3);
                opts = shuffle([answerKey, ...wrongs]);
            } else if (type === 'image-name') {
                answerKey = correct.nameZh;
                const wrongs = pickDistractors(correct, pool, 'nameZh', 3);
                opts = shuffle([answerKey, ...wrongs]);
            } else if (type === 'name-image') {
                answerKey = correct.id;
                const wrongInstrs = pickImgDistractors(correct, imgPool, 3);
                imgOptions = shuffle([correct, ...wrongInstrs]);
                opts = imgOptions.map(i => i.id);
            } else if (type === 'name-family') {
                answerKey = correct.familyZh;
                const allFamilies = ['弦樂', '木管', '銅管', '敲擊', '鍵盤'];
                const wrongFamilies = shuffle(allFamilies.filter(f => f !== answerKey));
                opts = shuffle([answerKey, ...wrongFamilies.slice(0, 3)]);
            } else if (type === 'percussion-pitch') {
                const hasPitch = PERCUSSION_HAS_PITCH.has(correct.id);
                answerKey = hasPitch ? '有固定音高' : '沒有固定音高';
                opts = ['有固定音高', '沒有固定音高'];
            } else { // sound-source
                answerKey = SOUND_SOURCE_MAP[correct.family];
                const wrongs = shuffle(allSoundSources.filter(s => s !== answerKey));
                opts = shuffle([answerKey, ...wrongs.slice(0, 3)]);
            }

            questions.push({ instrument: correct, type, answer: answerKey, options: opts, imgOptions });
        }
        return questions;
    }

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function startGame4(user, mode) {
        const count = mode === 'practice' ? 10 : 999;
        const questions = generateG4Questions(Math.min(count, 40));

        g4State = {
            user, mode,
            questions, currentIdx: 0,
            score: 0, combo: 0, maxCombo: 0,
            counts: { correct: 0, wrong: 0 },
            mistakes: [],
            familyStats: {
                strings: { correct: 0, total: 0 },
                woodwind: { correct: 0, total: 0 },
                brass: { correct: 0, total: 0 },
                percussion: { correct: 0, total: 0 },
                keyboard: { correct: 0, total: 0 },
            },
            startTime: Date.now(),
            timeLeft: mode === 'challenge' ? 60 : null,
            timerId: null,
            answered: false,
        };

        // HUD
        const gradeLabels = ['','小一','小二','小三','小四','小五','小六'];
        document.getElementById('g4User').textContent = `👋 ${gradeLabels[user.grade] || ''}${user.class}班 · ${user.name}`;
        document.getElementById('g4Score').textContent = '0';
        document.getElementById('g4Combo').textContent = '0';
        document.getElementById('g4Timer').textContent = mode === 'challenge' ? '60' : '--';
        document.getElementById('g4Message').textContent = '🎻 準備好就點選答案！';

        // Timer for challenge
        if (mode === 'challenge') {
            g4State.timerId = setInterval(() => {
                g4State.timeLeft--;
                document.getElementById('g4Timer').textContent = g4State.timeLeft;
                const pct = (g4State.timeLeft / 60) * 100;
                document.getElementById('g4TimerFill').style.width = pct + '%';
                if (g4State.timeLeft <= 10) {
                    document.getElementById('g4TimerFill').style.background = '#FF4A6B';
                }
                if (g4State.timeLeft <= 0) {
                    clearInterval(g4State.timerId);
                    g4State.timerId = null;
                    endGame4();
                }
            }, 1000);
        }

        document.getElementById('g4EndBtn').onclick = () => endGame4();
        document.getElementById('g4BackBtn').onclick = () => {
            if (g4State.timerId) clearInterval(g4State.timerId);
            if (g4State._nextTimer) clearTimeout(g4State._nextTimer);
            switchScreen('screen-hub');
        };

        switchScreen('screen-game4');
        renderG4Question();
    }

    function g4AdvanceNext() {
        if (!g4State || g4State._advancing) return;
        g4State._advancing = true;
        if (g4State._nextTimer) { clearTimeout(g4State._nextTimer); g4State._nextTimer = null; }
        g4State.currentIdx++;
        if (g4State.mode === 'challenge' && g4State.currentIdx >= g4State.questions.length) {
            const more = generateG4Questions(20);
            g4State.questions = g4State.questions.concat(more);
        }
        renderG4Question();
    }

    function renderG4Question() {
        if (!g4State || g4State.currentIdx >= g4State.questions.length) {
            endGame4();
            return;
        }
        g4State.answered = false;
        g4State._advancing = false;
        const q = g4State.questions[g4State.currentIdx];
        const total = g4State.mode === 'practice' ? g4State.questions.length : '∞';
        const num = g4State.currentIdx + 1;

        document.getElementById('g4QNum').textContent = `第 ${num} 題${g4State.mode === 'practice' ? ' / 共 ' + total + ' 題' : ''}`;
        const pct = g4State.mode === 'practice' ? (num / g4State.questions.length) * 100 : 0;
        document.getElementById('g4ProgressFill').style.width = pct + '%';
        document.getElementById('g4Progress').textContent = g4State.mode === 'practice' ? `${num}/${total}` : `已答 ${num - 1}`;

        const audioBtn = document.getElementById('g4AudioBtn');
        const visualEl = document.getElementById('g4Visual');
        const questionEl = document.getElementById('g4Question');

        // Reset audio btn
        audioBtn.style.display = 'none';
        audioBtn.onclick = null;

        // --- Audio helper ---
        const setupAudio = () => {
            audioBtn.style.display = '';
            audioBtn.onclick = () => {
                audio.playInstrumentSound(q.instrument.id);
                audioBtn.classList.add('playing');
                setTimeout(() => audioBtn.classList.remove('playing'), 600);
            };
            setTimeout(() => audio.playInstrumentSound(q.instrument.id), 300);
        };

        if (q.type === 'listen-name') {
            questionEl.textContent = '🎵 聽一聽，這是什麼樂器？';
            const videoSrc = q.instrument.video;
            visualEl.innerHTML = `
                <div class="g4-listen-placeholder" id="g4ListenPlaceholder">
                    <div class="g4-listen-icon">🎵</div>
                    <div class="g4-listen-hint">點擊播放演奏示範</div>
                </div>
                <div id="g4ListenFrame" style="display:none;text-align:center;"></div>
            `;
            const loadFrame = () => {
                const placeholder = document.getElementById('g4ListenPlaceholder');
                const frame = document.getElementById('g4ListenFrame');
                if (!frame) return;
                if (videoSrc) {
                    frame.innerHTML = `<iframe src="${videoSrc}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen style="width:100%;max-width:320px;height:180px;border-radius:12px;border:none;"></iframe>`;
                    frame.style.display = '';
                    if (placeholder) placeholder.style.display = 'none';
                }
            };
            const placeholderEl = document.getElementById('g4ListenPlaceholder');
            if (placeholderEl) placeholderEl.onclick = loadFrame;
            audioBtn.style.display = '';
            audioBtn.onclick = () => {
                const frame = document.getElementById('g4ListenFrame');
                if (frame && frame.querySelector('iframe')) {
                    const iframe = frame.querySelector('iframe');
                    const s = iframe.src; iframe.src = ''; iframe.src = s;
                } else {
                    loadFrame();
                }
                audioBtn.classList.add('playing');
                setTimeout(() => audioBtn.classList.remove('playing'), 3000);
            };
            setTimeout(loadFrame, 400);
        } else if (q.type === 'image-name') {
            questionEl.textContent = '🖼️ 這是甚麼樂器？';
            visualEl.innerHTML = `<img class="g4-visual-img" src="${q.instrument.img}" alt="樂器圖片" loading="lazy">`;
        } else if (q.type === 'name-image') {
            questionEl.textContent = `🎯「${q.instrument.nameZh}」是哪一種樂器？點選正確圖片！`;
            visualEl.innerHTML = `<div class="g4-visual-hint" style="font-size:1rem;font-weight:700;margin-top:6px;">${q.instrument.nameEn}</div>`;
        } else if (q.type === 'name-family') {
            questionEl.textContent = `「${q.instrument.nameZh}」屬於哪個樂器家族？`;
            visualEl.innerHTML = (q.instrument.img ? `<img class="g4-visual-img" src="${q.instrument.img}" alt="${q.instrument.nameZh}" loading="lazy">` : '') +
                `<div class="g4-visual-hint" style="font-size:1.1rem;font-weight:700;margin-top:8px;">${q.instrument.nameEn}</div>` +
                `<div class="g4-visual-hint" style="margin-top:4px;">${q.instrument.desc}</div>`;
        } else if (q.type === 'percussion-pitch') {
            questionEl.textContent = `「${q.instrument.nameZh}」有固定音高嗎？`;
            visualEl.innerHTML = `<img class="g4-visual-img" src="${q.instrument.img}" alt="樂器圖片" loading="lazy">`;
        } else if (q.type === 'sound-source') {
            questionEl.textContent = `「${q.instrument.nameZh}」靠甚麼方式發聲？`;
            visualEl.innerHTML = `<img class="g4-visual-img" src="${q.instrument.img}" alt="樂器圖片" loading="lazy">`;
        }

        // Render options
        const optEl = document.getElementById('g4Options');
        optEl.innerHTML = '';

        if (q.type === 'name-image' && q.imgOptions) {
            optEl.classList.add('g4-img-opts');
            q.imgOptions.forEach(instr => {
                const btn = document.createElement('button');
                btn.className = 'quiz-opt-btn g4-img-opt-btn';
                btn.dataset.optVal = instr.id;
                btn.innerHTML = `<img src="${instr.img}" alt="樂器圖片" loading="lazy">`;
                btn.onclick = (e) => { e.stopPropagation(); handleG4Answer(instr.id, q.answer, btn, q); };
                optEl.appendChild(btn);
            });
        } else {
            optEl.classList.remove('g4-img-opts');
            q.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'quiz-opt-btn';
                btn.textContent = opt;
                btn.onclick = (e) => { e.stopPropagation(); handleG4Answer(opt, q.answer, btn, q); };
                optEl.appendChild(btn);
            });
        }
    }

    function handleG4Answer(chosen, correct, btn, q) {
        if (!g4State || g4State.answered) return;
        g4State.answered = true;

        const isCorrect = chosen === correct;
        const family = q.instrument.family;
        g4State.familyStats[family].total++;

        // Highlight buttons
        document.querySelectorAll('#g4Options .quiz-opt-btn').forEach(b => {
            b.disabled = true;
            const bVal = b.dataset.optVal !== undefined ? b.dataset.optVal : b.textContent;
            if (bVal === correct) b.classList.add('correct');
            if (b === btn && !isCorrect) b.classList.add('wrong');
        });

        if (isCorrect) {
            g4State.counts.correct++;
            g4State.combo++;
            if (g4State.combo > g4State.maxCombo) g4State.maxCombo = g4State.combo;
            g4State.familyStats[family].correct++;
            const comboBonus = Math.floor(g4State.combo / 5) * 2;
            const pts = 10 + comboBonus;
            g4State.score += pts;
            document.getElementById('g4Message').textContent = `✅ 答對了！+${pts}分`;
            audio.playEffect('countdown');
        } else {
            g4State.counts.wrong++;
            g4State.combo = 0;
            const qLabel = q.type === 'listen-name' ? `聽一聽，這是${q.instrument.nameZh}嗎？`
                : q.type === 'name-family' ? `${q.instrument.nameZh}屬於哪個樂器家族？`
                : q.type === 'percussion-pitch' ? `${q.instrument.nameZh}有固定音高嗎？`
                : q.type === 'sound-source' ? `${q.instrument.nameZh}靠甚麼方式發聲？`
                : q.type === 'name-image' ? `哪一張是「${q.instrument.nameZh}」？`
                : `這是甚麼樂器？（${q.instrument.desc}）`;
            const chosenLabel = q.type === 'name-image'
                ? (INSTRUMENT_BANK.find(i => i.id === chosen)?.nameZh || chosen) : chosen;
            const correctLabel = q.type === 'name-image' ? q.instrument.nameZh : correct;
            // For listen-name: stop video and reveal instrument image
            if (q.type === 'listen-name') {
                const frame = document.getElementById('g4ListenFrame');
                if (frame) { const iframe = frame.querySelector('iframe'); if (iframe) iframe.src = ''; }
                const visualEl2 = document.getElementById('g4Visual');
                if (visualEl2 && q.instrument.img) {
                    visualEl2.innerHTML = `<img class="g4-visual-img" src="${q.instrument.img}" alt="${q.instrument.nameZh}" loading="lazy">`;
                } else if (visualEl2) {
                    visualEl2.innerHTML = `<div class="g4-visual-hint" style="font-size:1.1rem;font-weight:700;">${q.instrument.nameZh}<br><span style="font-size:0.85rem;font-weight:400;color:var(--text-light)">${q.instrument.nameEn}</span></div>`;
                }
            }
            const explainMap = {
                'listen-name':      `正確答案是${q.instrument.nameZh}（${q.instrument.nameEn}）`,
                'name-family':      `${q.instrument.nameZh}（${q.instrument.nameEn}）屬於${q.instrument.familyZh}家族`,
                'percussion-pitch': `${q.instrument.nameZh}${PERCUSSION_HAS_PITCH.has(q.instrument.id) ? '有' : '沒有'}固定音高`,
                'sound-source':     `${q.instrument.nameZh}的發聲方式：${SOUND_SOURCE_MAP[q.instrument.family]}`,
                'image-name':       `正確答案是${q.instrument.nameZh}（${q.instrument.nameEn}）`,
                'name-image':       `正確答案是${q.instrument.nameZh}（${q.instrument.nameEn}）`,
            };
            g4State.mistakes.push({
                q: qLabel,
                chosen: chosenLabel, correct: correctLabel,
                explain: explainMap[q.type] || ''
            });
            const correctDisplay = q.type === 'name-image' ? q.instrument.nameZh : correct;
            document.getElementById('g4Message').textContent = `❌ 正確答案：${correctDisplay}`;
            audio.playEffect('wrong');
        }

        document.getElementById('g4Score').textContent = g4State.score;
        document.getElementById('g4Combo').textContent = g4State.combo;

        g4State._advancing = false;
        g4State._nextTimer = setTimeout(() => g4AdvanceNext(), isCorrect ? 1000 : 2000);
    }

    function endGame4() {
        if (!g4State) return;
        if (g4State.timerId) { clearInterval(g4State.timerId); g4State.timerId = null; }
        if (g4State._nextTimer) { clearTimeout(g4State._nextTimer); g4State._nextTimer = null; }

        const { user, mode, score, maxCombo, counts, familyStats, mistakes } = g4State;
        const totalAnswered = counts.correct + counts.wrong;
        const accuracy = totalAnswered > 0 ? Math.round((counts.correct / totalAnswered) * 100) : 0;
        const practiceNote = mode === 'practice' ? '<div class="report-item"><div class="report-label">模式</div><div class="report-value">📝 練習</div></div>' : '';

        document.getElementById('g4ReportGrid').innerHTML =
            `<div class="report-item"><div class="report-label">答對題數</div><div class="report-value">${counts.correct} / ${totalAnswered}</div></div>` +
            `<div class="report-item"><div class="report-label">準確率</div><div class="report-value">${accuracy}%</div></div>` +
            `<div class="report-item"><div class="report-label">總分</div><div class="report-value">${score}</div></div>` +
            `<div class="report-item"><div class="report-label">最高連對</div><div class="report-value">${maxCombo}</div></div>` + practiceNote;

        // Family breakdown
        const fbEl = document.getElementById('g4FamilyBreakdown');
        const families = [
            { key: 'strings', zh: '弦樂', color: '#E8739E' },
            { key: 'woodwind', zh: '木管', color: '#5DB85D' },
            { key: 'brass', zh: '銅管', color: '#F5A623' },
            { key: 'percussion', zh: '敲擊', color: '#4A90D9' },
            { key: 'keyboard', zh: '鍵盤', color: '#9B59B6' },
        ];
        let fbHtml = '<div style="font-weight:800;margin-bottom:8px;">🎼 各家族表現</div>';
        families.forEach(f => {
            const s = familyStats[f.key];
            if (s.total === 0) return;
            const pct = Math.round((s.correct / s.total) * 100);
            fbHtml += `<div class="g4-family-bar">
                <div class="g4-family-bar-label">${f.zh}</div>
                <div class="g4-family-bar-track"><div class="g4-family-bar-fill" style="width:${pct}%;background:${f.color};"></div></div>
                <div class="g4-family-bar-val">${pct}%</div>
            </div>`;
        });
        fbEl.innerHTML = fbHtml;

        // Weakness
        document.getElementById('g4Weakness').innerHTML = counts.wrong === 0
            ? '<div>🌟 全部答對！你是樂器辨別小專家！🎉</div>'
            : `<div>繼續練習加油！正確 ${counts.correct}/${totalAnswered} 題。</div>`;

        // Mistake review
        const mistakeEl = document.getElementById('g4MistakeReview');
        if (mistakeEl) {
            if (mistakes.length > 0) {
                mistakeEl.innerHTML = '<div class="mistake-review-title">📝 錯題回顧</div>' +
                    mistakes.map(m => `<div class="mistake-item">
                        <div class="mistake-q">${escHtml(m.q)}</div>
                        <div class="mistake-detail"><span class="mistake-wrong">你的答案：${escHtml(String(m.chosen))}</span> → <span class="mistake-correct">正確：${escHtml(String(m.correct))}</span></div>
                        ${m.explain ? `<div class="mistake-explain">💡 ${escHtml(m.explain)}</div>` : ''}
                    </div>`).join('');
            } else {
                mistakeEl.innerHTML = '';
            }
        }

        // Save scores
        saveLocalRank('game4', user, score, accuracy, maxCombo);
        if (mode !== 'practice') {
            submitScoreToGAS('game4', user, score, accuracy, maxCombo, '樂器辨別·挑戰');
            recordGameResult(user, 'game4', score, accuracy, maxCombo, null, counts);
        }

        renderLocalRankList('game4', 'g4RankList', user);
        if (mode !== 'practice') setTimeout(() => loadRanks().then(() => renderLocalRankList('game4', 'g4RankList', user)).catch(()=>{}), 2500);
        document.getElementById('g4PlayAgain').onclick = () => switchScreen('screen-g4-setup');
        document.getElementById('g4BackToHub').onclick = () => switchScreen('screen-g4-setup');
        const g4Layout = document.getElementById('g4LeaderboardLayout');
        if (g4Layout) g4Layout.classList.remove('view-only');
        const g4RBack = document.getElementById('g4ResultBack');
        if (g4RBack) g4RBack.style.display = 'none';
        switchScreen('screen-game4-result');
    }

    // ── Game 4 Study Screen ──
    function renderG4Study(familyFilter, searchQuery) {
        const grid = document.getElementById('g4StudyGrid');
        if (!grid) return;
        let items = INSTRUMENT_BANK;
        if (familyFilter && familyFilter !== 'all') items = items.filter(i => i.family === familyFilter);
        if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            items = items.filter(i =>
                i.nameZh.toLowerCase().includes(q) ||
                i.nameEn.toLowerCase().includes(q) ||
                (i.desc && i.desc.toLowerCase().includes(q))
            );
        }

        grid.innerHTML = items.length === 0
            ? `<div class="g4-study-empty">😔 找不到符合的樂器，請嘗試其他關鍵字。</div>`
            : items.map(inst => {
            const isCard = inst.img && inst.img.includes('/cards/');
            const imgHtml = inst.img ? `<img src="${inst.img}" alt="${inst.nameEn}" class="g4-study-img" loading="lazy">` : `<div class="g4-study-emoji">🎵</div>`;
            return `
            <div class="g4-study-card${isCard ? ' has-card-img' : ''}" data-id="${inst.id}">
                ${imgHtml}
                <span class="g4-family-badge g4-family-${inst.family}">${inst.familyZh}</span>
                <div class="g4-study-name">${inst.nameZh}</div>
                <div class="g4-study-en">${inst.nameEn}</div>
                <div class="g4-study-desc">${inst.desc}</div>
                <button class="g4-study-listen" data-id="${inst.id}" data-name="${inst.nameZh}">🔊 讀音</button>
            </div>
        `}).join('');

        // Single delegated handler for entire grid
        grid.onclick = (e) => {
            const listenBtn = e.target.closest('.g4-study-listen');
            if (listenBtn) {
                e.stopPropagation();
                const instrName = listenBtn.dataset.name || INSTRUMENT_MAP?.get(listenBtn.dataset.id)?.nameZh || listenBtn.dataset.id;
                const utt = new SpeechSynthesisUtterance(instrName);
                utt.lang = 'zh-HK';
                speechSynthesis.cancel();
                speechSynthesis.speak(utt);
                listenBtn.textContent = '🔊 讀音中…';
                setTimeout(() => { listenBtn.textContent = '🔊 讀音'; }, 1200);
                return;
            }
            const card = e.target.closest('.g4-study-card');
            if (card) showInstrumentDetail(card.dataset.id);
        };
    }

    // ── Game 4 Instrument Detail Modal ──
    function showInstrumentDetail(instrId) {
        const inst = INSTRUMENT_MAP ? INSTRUMENT_MAP.get(instrId) : INSTRUMENT_BANK.find(i => i.id === instrId);
        if (!inst) return;

        closeInstrumentDetail();

        // ── Derived facts from existing data ──
        const playMap = { strings:'弓拉 / 撥弦', woodwind:'管口吹奏', brass:'振唇吹奏', percussion:'敲擊', keyboard:'鍵盤按壓' };
        const familyIconMap = { strings:'🎻', woodwind:'🎵', brass:'🎺', percussion:'🥁', keyboard:'🎹' };
        const TONE_MAP = {
            // Strings
            'violin':'明亮圓潤', 'viola':'溫暖深沉', 'cello':'豐厚溫暖', 'double-bass':'低沉渾厚',
            'harp':'清亮空靈', 'guitar':'溫暖木質', 'bass-guitar':'低沉有力',
            'ukulele':'清甜輕盈', 'banjo':'清脆明亮', 'mandolin':'清脆明亮',
            // Woodwind
            'flute':'清澈空靈', 'clarinet':'圓潤甜美', 'oboe':'尖銳穿透', 'bassoon':'低沉溫暖',
            'recorder':'清甜柔和', 'piccolo':'尖銳嘹亮', 'english-horn':'憂鬱溫柔',
            'alto-sax':'溫暖圓潤', 'tenor-sax':'低沉有力', 'soprano-sax':'明亮尖銳',
            'baritone-sax':'深沉渾厚', 'harmonica':'帶鼻音柔和', 'bagpipes':'嘹亮刺激',
            'pan-flute':'空靈悠遠',
            // Brass
            'trumpet':'明亮輝煌', 'trombone':'厚重莊嚴', 'french-horn':'柔和圓潤',
            'tuba':'低沉渾厚', 'cornet':'柔和甜美',
            // Percussion
            'timpani':'低沉有力', 'snare':'乾脆清晰', 'bass-drum':'低沉震撼',
            'xylophone':'清脆明亮', 'triangle':'清亮穿透', 'cymbals':'金屬嘹亮',
            'tambourine':'輕盈活潑', 'glockenspiel':'清脆如鐘', 'marimba':'溫暖木質',
            'vibraphone':'空靈顫動', 'drums':'有力多變', 'cajon':'乾脆溫暖',
            'maracas':'輕盈沙沙', 'egg-shakers':'輕柔沙沙', 'tubular-bells':'渾厚如鐘',
            'cabasa':'金屬沙沙', 'djembe':'豐富多變', 'castanets':'清脆短促',
            'congas':'溫暖渾厚', 'cowbell':'響亮持久', 'guiro':'沙沙刮擦',
            // Keyboard
            'piano':'豐富多變', 'organ':'厚重持久', 'harpsichord':'清脆明亮', 'accordion':'溫暖豐厚',
        };
        const sp = inst.synthParams || {};
        const freqHz = sp.freq || 0;
        const rangeLabel = freqHz >= 800 ? '高音域' : freqHz >= 400 ? '中高音域' : freqHz >= 200 ? '中音域' : freqHz >= 100 ? '中低音域' : '低音域';
        const toneLabel = TONE_MAP[inst.id] || '多元音色';
        const playLabel = playMap[inst.family] || '—';
        const familyIcon = familyIconMap[inst.family] || '🎵';

        const factsHtml = `
            <div class="g4-fact-card"><div class="g4-fact-icon">🎼</div><div class="g4-fact-label">族群</div><div class="g4-fact-val">${inst.familyZh}</div></div>
            <div class="g4-fact-card"><div class="g4-fact-icon">🤲</div><div class="g4-fact-label">演奏方式</div><div class="g4-fact-val">${playLabel}</div></div>
            <div class="g4-fact-card"><div class="g4-fact-icon">🎨</div><div class="g4-fact-label">音色特質</div><div class="g4-fact-val">${toneLabel}</div></div>
            <div class="g4-fact-card"><div class="g4-fact-icon">📊</div><div class="g4-fact-label">音域範圍</div><div class="g4-fact-val">${rangeLabel}</div></div>`;

        const videoId = inst.video ? (inst.video.match(/embed\/([^?]+)/) || [])[1] : '';
        const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';

        const isCard = inst.img && inst.img.includes('/cards/');
        const imgHtml = inst.img
            ? `<img src="${inst.img}" alt="${inst.nameEn}" class="g4-modal-img${isCard ? ' card-img' : ''}">`
            : `<div class="g4-modal-img-placeholder">🎵</div>`;

        const structData = INSTRUMENT_STRUCTURE[inst.id] || [];
        const wrappedImg = `<div class="g4-modal-img-wrap">${imgHtml}</div>`;
        const structToggle = structData.length
            ? `<button class="g4-modal-struct-toggle"><span class="struct-toggle-icon">🔬</span><span class="struct-toggle-text">顯示構造</span><span class="struct-toggle-arrow">›</span></button>`
            : '';

        const modal = document.createElement('div');
        modal.className = 'g4-instrument-modal';
        modal.id = 'g4InstrumentModal';
        modal.innerHTML = `
            <div class="g4-instrument-modal-box">
                <button class="g4-modal-close" id="g4ModalClose">✕</button>

                <div class="g4-modal-left">
                    ${wrappedImg}
                    ${structToggle}
                    <span class="g4-family-badge g4-family-${inst.family}">${inst.familyZh}</span>
                    <div class="g4-modal-name">${inst.nameZh}</div>
                    <div class="g4-modal-en">${inst.nameEn}</div>
                    <button class="g4-modal-listen" id="g4ModalListen">🔊 讀音</button>
                </div>

                <div class="g4-modal-right">
                    <nav class="g4-modal-tabs" role="tablist">
                        <button class="g4-tab-btn active" data-tab="intro" role="tab">📖 介紹</button>
                        <button class="g4-tab-btn" data-tab="history" role="tab">📜 歷史</button>
                        ${inst.video ? '<button class="g4-tab-btn" data-tab="video" role="tab">🎬 演奏</button>' : ''}
                    </nav>

                    <div class="g4-tab-panels">
                        <div class="g4-tab-panel active" data-panel="intro">
                            <div class="g4-intro-banner g4-intro-banner-${inst.family}">
                                <span class="g4-intro-banner-icon">${familyIcon}</span>
                                <span class="g4-intro-banner-txt">${inst.familyZh}樂器</span>
                                <span class="g4-intro-banner-dot">·</span>
                                <span class="g4-intro-banner-txt">${inst.nameEn}</span>
                            </div>
                            <p class="g4-panel-lead">${inst.desc}</p>
                            <div class="g4-facts-grid">${factsHtml}</div>
                        </div>

                        <div class="g4-tab-panel" data-panel="history">
                            <div class="g4-history-body">
                                <div class="g4-history-quote">${inst.history || inst.desc}</div>
                            </div>
                        </div>

                        ${inst.video ? `
                        <div class="g4-tab-panel" data-panel="video">
                            <div class="g4-modal-video-wrap g4-video-lazy" data-src="${inst.video}">
                                <div class="g4-video-poster" style="background-image:url(${thumbUrl})">
                                    <div class="g4-video-play">▶</div>
                                </div>
                            </div>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Single delegated click handler for modal
        modal.onclick = (e) => {
            if (e.target === modal) { closeInstrumentDetail(); return; }
            if (e.target.closest('.g4-modal-close')) { closeInstrumentDetail(); return; }
            // Structure viewer (fullscreen lightbox)
            if (e.target.closest('.g4-modal-struct-toggle')) {
                openStructureViewer(inst, structData);
                return;
            }
            if (e.target.closest('.g4-modal-listen')) {
                const lb = e.target.closest('.g4-modal-listen');
                const utt = new SpeechSynthesisUtterance(inst.nameZh);
                utt.lang = 'zh-HK';
                speechSynthesis.cancel();
                speechSynthesis.speak(utt);
                lb.textContent = '🔊 讀音中…';
                setTimeout(() => { lb.textContent = '🔊 讀音'; }, 1200);
                return;
            }
            // Tab switching
            const tabBtn = e.target.closest('.g4-tab-btn');
            if (tabBtn) {
                const box = tabBtn.closest('.g4-instrument-modal-box');
                box.querySelectorAll('.g4-tab-btn').forEach(b => b.classList.remove('active'));
                box.querySelectorAll('.g4-tab-panel').forEach(p => p.classList.remove('active'));
                tabBtn.classList.add('active');
                const panel = box.querySelector(`[data-panel="${tabBtn.dataset.tab}"]`);
                if (panel) panel.classList.add('active');
                return;
            }
            // Lazy YouTube: click poster to load iframe
            const poster = e.target.closest('.g4-video-poster');
            if (poster) {
                const wrap = poster.closest('.g4-video-lazy');
                if (wrap) {
                    wrap.innerHTML = `<iframe src="${wrap.dataset.src}?autoplay=1" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                    wrap.classList.remove('g4-video-lazy');
                }
                return;
            }
        };
        modal._escHandler = (e) => { if (e.key === 'Escape') closeInstrumentDetail(); };
        document.addEventListener('keydown', modal._escHandler);
    }

    function openStructureViewer(inst, structData) {
        const existing = document.getElementById('g4StructLb');
        if (existing) existing.remove();

        // Default label offset from dot (in % units) based on side
        const LABEL_OFFSET = 12;
        function defaultLx(s) { return s.side === 'left' ? s.x - LABEL_OFFSET : s.x + LABEL_OFFSET; }
        function defaultLy(s) { return s.y; }

        // Working copy: dot at x,y; label at lx,ly (all in %)
        const positions = structData.map(s => ({
            x: s.x, y: s.y,
            lx: s.lx != null ? s.lx : defaultLx(s),
            ly: s.ly != null ? s.ly : defaultLy(s),
            side: s.side || 'right'
        }));
        // Snapshot for cancel
        const origPositions = positions.map(p => ({ ...p }));

        const partsListHtml = structData.map((s, i) =>
            `<button class="g4-struct-part-item" data-idx="${i}">` +
                `<span class="g4-struct-part-num">${i + 1}</span>` +
                `<span class="g4-struct-part-names">` +
                    `<span class="g4-struct-part-zh">${s.part}</span>` +
                    `<span class="g4-struct-part-en">${s.en}</span>` +
                `</span>` +
            `</button>`
        ).join('');

        const lb = document.createElement('div');
        lb.className = 'g4-struct-lb';
        lb.id = 'g4StructLb';
        lb.innerHTML = `
            <div class="g4-struct-wrap">
                <div class="g4-struct-panel-left">
                    <button class="g4-struct-lb-close" aria-label="關閉">✕</button>
                    <div class="g4-struct-lb-body">
                        <img src="${inst.img}" alt="${inst.nameEn}" class="g4-struct-lb-img" id="g4StructImg">
                        <div class="g4-anno-overlay" id="g4StructOverlay"></div>
                    </div>
                </div>
                <div class="g4-struct-panel-right">
                    <div class="g4-struct-panel-header">
                        <div class="g4-struct-panel-title">
                            <span class="g4-struct-panel-zh">${inst.nameZh}</span>
                            <span class="g4-struct-panel-en">${inst.nameEn}</span>
                        </div>
                        <span class="g4-struct-lb-badge">構造圖</span>
                    </div>
                    <div class="g4-struct-parts-list" id="g4StructPartsList">${partsListHtml}</div>
                    <div class="g4-struct-desc-box" id="g4StructDescBox">
                        <div class="g4-struct-desc-empty">👆 點擊紅點或部件名稱查看說明</div>
                    </div>
                    <div class="g4-struct-drag-bar" id="g4StructDragBar">
                        <button class="g4-struct-drag-btn" id="g4DragModeBtn">✥ 拖曳模式</button>
                        <button class="g4-struct-cancel-btn" id="g4CancelBtn" style="display:none">↩ 取消</button>
                        <button class="g4-struct-lock-btn" id="g4LockBtn" style="display:none">📋 複製座標</button>
                    </div>
                </div>
            </div>
            <div class="g4-struct-lb-hint" id="g4StructHint">點擊紅點或部件名稱可查看詳情 · 按 ESC 關閉</div>
        `;
        document.body.appendChild(lb);
        document.body.style.overflow = 'hidden';

        const img = lb.querySelector('#g4StructImg');
        const overlay = lb.querySelector('#g4StructOverlay');
        const descBox = lb.querySelector('#g4StructDescBox');
        const partsList = lb.querySelector('#g4StructPartsList');
        const dragModeBtn = lb.querySelector('#g4DragModeBtn');
        const cancelBtn = lb.querySelector('#g4CancelBtn');
        const lockBtn = lb.querySelector('#g4LockBtn');
        const hint = lb.querySelector('#g4StructHint');
        let activeIdx = -1;
        let dragMode = false;

        function focusPart(idx) {
            if (dragMode) return;
            if (activeIdx === idx) { clearFocus(); return; }
            activeIdx = idx;
            overlay.classList.add('has-focus');
            // Highlight dot
            overlay.querySelectorAll('.g4-anno-dot-wrap').forEach((el, i) => el.classList.toggle('focused', i === idx));
            // Highlight label
            overlay.querySelectorAll('.g4-anno-label-abs').forEach((el, i) => el.classList.toggle('focused', i === idx));
            // Highlight SVG line
            overlay.querySelectorAll('.g4-anno-svg-line').forEach((el, i) => el.classList.toggle('focused', i === idx));
            // Highlight parts list
            partsList.querySelectorAll('.g4-struct-part-item').forEach((el, i) => el.classList.toggle('active', i === idx));
            // Scroll active part into view
            const activeItem = partsList.querySelector('.g4-struct-part-item.active');
            if (activeItem) activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            const s = structData[idx];
            if (s) {
                descBox.innerHTML =
                    `<div class="g4-struct-desc-part">` +
                        `<span class="g4-struct-desc-zh">${s.part}</span>` +
                        `<span class="g4-struct-desc-en">${s.en}</span>` +
                    `</div>` +
                    `<p class="g4-struct-desc-text">${s.desc || '—'}</p>`;
            }
        }

        function clearFocus() {
            activeIdx = -1;
            overlay.classList.remove('has-focus');
            overlay.classList.remove('has-focus');
            overlay.querySelectorAll('.g4-anno-dot-wrap').forEach(el => el.classList.remove('focused'));
            overlay.querySelectorAll('.g4-anno-label-abs').forEach(el => el.classList.remove('focused'));
            overlay.querySelectorAll('.g4-anno-svg-line').forEach(el => el.classList.remove('focused'));
            partsList.querySelectorAll('.g4-struct-part-item').forEach(el => el.classList.remove('active'));
            descBox.innerHTML = `<div class="g4-struct-desc-empty">👆 點擊紅點或部件名稱查看說明</div>`;
        }

        function buildOverlay() {
            // Dots
            const dotsHtml = positions.map((p, i) =>
                `<div class="g4-anno-dot-wrap" data-idx="${i}" style="left:${p.x}%;top:${p.y}%;">` +
                    `<div class="g4-anno-dot"></div>` +
                `</div>`
            ).join('');
            // Labels (absolutely positioned in overlay)
            const labelsHtml = positions.map((p, i) =>
                `<div class="g4-anno-label-abs" data-idx="${i}" style="left:${p.lx}%;top:${p.ly}%;">` +
                    `<div class="g4-anno-tag"><span class="g4-anno-zh">${structData[i].part}</span><span class="g4-anno-en">${structData[i].en}</span></div>` +
                `</div>`
            ).join('');
            // SVG lines connecting dots to labels
            const svgLines = positions.map((p, i) =>
                `<line class="g4-anno-svg-line" data-idx="${i}" x1="${p.x}%" y1="${p.y}%" x2="${p.lx}%" y2="${p.ly}%"/>`
            ).join('');

            overlay.innerHTML =
                `<svg class="g4-anno-svg">${svgLines}</svg>` +
                dotsHtml + labelsHtml;
            overlay.classList.add('active');
            attachDragListeners();
        }

        function updatePositionDOM(idx) {
            const p = positions[idx];
            const dotEl = overlay.querySelector(`.g4-anno-dot-wrap[data-idx="${idx}"]`);
            const lblEl = overlay.querySelector(`.g4-anno-label-abs[data-idx="${idx}"]`);
            const lineEl = overlay.querySelector(`.g4-anno-svg-line[data-idx="${idx}"]`);
            if (dotEl) { dotEl.style.left = p.x + '%'; dotEl.style.top = p.y + '%'; }
            if (lblEl) { lblEl.style.left = p.lx + '%'; lblEl.style.top = p.ly + '%'; }
            if (lineEl) {
                lineEl.setAttribute('x1', p.x + '%');
                lineEl.setAttribute('y1', p.y + '%');
                lineEl.setAttribute('x2', p.lx + '%');
                lineEl.setAttribute('y2', p.ly + '%');
            }
        }

        function attachDragListeners() {
            overlay.querySelectorAll('.g4-anno-dot-wrap').forEach(el => {
                el.addEventListener('pointerdown', onDotPointerDown, { passive: false });
            });
            overlay.querySelectorAll('.g4-anno-label-abs').forEach(el => {
                el.addEventListener('pointerdown', onLabelPointerDown, { passive: false });
            });
        }

        function onDotPointerDown(e) {
            if (!dragMode) return;
            e.preventDefault();
            e.stopPropagation();
            const el = e.currentTarget;
            const idx = parseInt(el.dataset.idx);
            const rect = overlay.getBoundingClientRect();
            // Remember label offset from dot so it follows
            const offsetLx = positions[idx].lx - positions[idx].x;
            const offsetLy = positions[idx].ly - positions[idx].y;

            function onMove(ev) {
                const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
                const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
                positions[idx].x = Math.round(Math.max(0, Math.min(100, (cx - rect.left) / rect.width * 100)) * 10) / 10;
                positions[idx].y = Math.round(Math.max(0, Math.min(100, (cy - rect.top) / rect.height * 100)) * 10) / 10;
                positions[idx].lx = Math.round((positions[idx].x + offsetLx) * 10) / 10;
                positions[idx].ly = Math.round((positions[idx].y + offsetLy) * 10) / 10;
                updatePositionDOM(idx);
            }
            function onUp() {
                window.removeEventListener('pointermove', onMove);
                window.removeEventListener('pointerup', onUp);
            }
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
        }

        function onLabelPointerDown(e) {
            if (!dragMode) return;
            e.preventDefault();
            e.stopPropagation();
            const el = e.currentTarget;
            const idx = parseInt(el.dataset.idx);
            const rect = overlay.getBoundingClientRect();

            function onMove(ev) {
                const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
                const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
                positions[idx].lx = Math.round(Math.max(0, Math.min(100, (cx - rect.left) / rect.width * 100)) * 10) / 10;
                positions[idx].ly = Math.round(Math.max(0, Math.min(100, (cy - rect.top) / rect.height * 100)) * 10) / 10;
                updatePositionDOM(idx);
            }
            function onUp() {
                window.removeEventListener('pointermove', onMove);
                window.removeEventListener('pointerup', onUp);
            }
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
        }

        function enableDragMode() {
            dragMode = true;
            clearFocus();
            overlay.classList.add('drag-mode');
            dragModeBtn.textContent = '✓ 拖曳中…';
            dragModeBtn.classList.add('active');
            cancelBtn.style.display = '';
            lockBtn.style.display = '';
            hint.textContent = '拖曳紅點移動標記 · 拖曳文字方塊調整位置 · 完成後按「複製座標」';
            descBox.innerHTML = `<div class="g4-struct-desc-empty">🖱 拖曳紅點或文字方塊調整位置</div>`;
        }

        function cancelDrag() {
            // Restore all positions
            origPositions.forEach((o, i) => Object.assign(positions[i], o));
            positions.forEach((_, i) => updatePositionDOM(i));
            // Exit drag mode
            dragMode = false;
            overlay.classList.remove('drag-mode');
            dragModeBtn.textContent = '✥ 拖曳模式';
            dragModeBtn.classList.remove('active');
            cancelBtn.style.display = 'none';
            lockBtn.style.display = 'none';
            hint.textContent = '點擊紅點或部件名稱可查看詳情 · 按 ESC 關閉';
            descBox.innerHTML = `<div class="g4-struct-desc-empty">👆 點擊紅點或部件名稱查看說明</div>`;
        }

        function copyCoords() {
            const lines = positions.map((p, i) =>
                `{x:${Math.round(p.x)},y:${Math.round(p.y)},lx:${Math.round(p.lx)},ly:${Math.round(p.ly)}}  // ${structData[i].part}`
            ).join('\n');
            navigator.clipboard.writeText(lines).then(() => {
                lockBtn.textContent = '✅ 已複製！';
                setTimeout(() => { lockBtn.textContent = '📋 複製座標'; }, 2000);
            });
        }

        if (img.complete && img.naturalWidth) buildOverlay();
        else img.addEventListener('load', buildOverlay);

        function closeLb() {
            lb.style.animation = 'g4ModalBgIn 0.18s ease reverse both';
            setTimeout(() => { lb.remove(); document.body.style.overflow = ''; }, 180);
            document.removeEventListener('keydown', escH);
        }

        dragModeBtn.addEventListener('click', (e) => { e.stopPropagation(); enableDragMode(); });
        cancelBtn.addEventListener('click', (e) => { e.stopPropagation(); cancelDrag(); });
        lockBtn.addEventListener('click', (e) => { e.stopPropagation(); copyCoords(); });

        lb.onclick = (e) => {
            if (e.target === lb || e.target.closest('.g4-struct-lb-close')) { closeLb(); return; }
            if (dragMode) return;
            const dotWrap = e.target.closest('.g4-anno-dot-wrap');
            if (dotWrap) { focusPart(parseInt(dotWrap.dataset.idx)); return; }
            const labelEl = e.target.closest('.g4-anno-label-abs');
            if (labelEl) { focusPart(parseInt(labelEl.dataset.idx)); return; }
            const partItem = e.target.closest('.g4-struct-part-item');
            if (partItem) { focusPart(parseInt(partItem.dataset.idx)); return; }
        };

        const escH = (e) => { if (e.key === 'Escape') closeLb(); };
        document.addEventListener('keydown', escH);
    }

    function closeInstrumentDetail() {
        const modal = document.getElementById('g4InstrumentModal');
        if (!modal) return;
        // Stop YouTube video
        const iframe = modal.querySelector('iframe');
        if (iframe) iframe.src = '';
        // Remove escape listener
        if (modal._escHandler) document.removeEventListener('keydown', modal._escHandler);
        // Close animation
        const box = modal.querySelector('.g4-instrument-modal-box');
        if (box) box.style.animation = 'g4ModalBoxIn 0.18s ease reverse both';
        modal.style.animation = 'g4ModalBgIn 0.18s ease reverse both';
        setTimeout(() => { modal.remove(); document.body.style.overflow = ''; }, 180);
    }

})();
