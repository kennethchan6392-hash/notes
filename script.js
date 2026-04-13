(function() {
    // ==========================================
    // 核心設定
    // ==========================================
    const CONFIG = {
        // GAS API (needs to be accessible to all)
        API_URL: "https://script.google.com/macros/s/AKfycbzGQY1_Lc1a51vtp0hRR452l2hbkcLgS854SXzsG_62WK3PqtYpdFKY72KUarpxiPMw/exec",
        
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
        classic60:{ name:'高音譜號挑戰', type:'challenge', duration:60, maxWrong:Infinity, scoreMulti:1, forceClef:'treble' },
        bass60:   { name:'低音譜號挑戰', type:'challenge', duration:60, maxWrong:Infinity, scoreMulti:1, forceClef:'bass' },
        mixed60:  { name:'混合譜號挑戰', type:'challenge', duration:60, maxWrong:Infinity, scoreMulti:1.2, forceClef:'mixed' },
        noMiss:   { name:'零失誤挑戰', type:'challenge', duration:60, maxWrong:1, scoreMulti:1.5 }
    };

    const TEXTBOOK_CONFIG = {
        1: { clef:['treble'], accidentalChance:0, noteRange:[0,4], ledgerAbove:false, ledgerBelow:false },
        2: { clef:['treble'], accidentalChance:0, noteRange:[0,7], ledgerAbove:false, ledgerBelow:false },
        3: { clef:['treble'], accidentalChance:0.1, noteRange:[0,9], ledgerAbove:false, ledgerBelow:false },
        4: { clef:['treble'], accidentalChance:0.15, noteRange:[0,11], ledgerAbove:true, ledgerBelow:false },
        5: { clef:['treble'], accidentalChance:0.25, noteRange:[0,12], ledgerAbove:true, ledgerBelow:true },
        6: { clef:['treble'], accidentalChance:0.4, noteRange:[0,12], ledgerAbove:true, ledgerBelow:true }
    };

    const SOLFEGE = {C:'Do',D:'Re',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si'};
    const noteSol = n => { const b = SOLFEGE[n.letter]; if (!b) return ''; return b + (n.accidental==='#'?'♯':n.accidental==='♭'?'♭':''); };

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

    // ==========================================
    // 🎯 難度系統 (Difficulty System)
    // ==========================================
    const DIFFICULTY_CONFIG = {
        easy:   { tokenSet: 'basic',    bpm: 60,  winScale: 1.4, label: 'Easy',   emoji: '⭐' },
        normal: { tokenSet: 'basic',    bpm: 72,  winScale: 1.2, label: 'Normal', emoji: '⭐⭐' },
        hard:   { tokenSet: 'medium',   bpm: 84,  winScale: 1.0, label: 'Hard',   emoji: '⭐⭐⭐' },
        expert: { tokenSet: 'advanced', bpm: 96,  winScale: 0.9, label: 'Expert', emoji: '⭐⭐⭐⭐' },
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
        } catch(e) {}
        return _defaultProfile(user);
    }

    function saveProfile(profile) {
        const key = `${PROFILE_STORAGE_KEY}_${profile.grade}_${profile.class}_${profile.name}`;
        try { localStorage.setItem(key, JSON.stringify(profile)); } catch(e) {}
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
            gameBests: { game1: 0, game2: 0, game3: 0 },
        };
    }

    function _expForLevel(lvl) { return lvl * 100; }

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
        return profile;
    }

    function renderProfileScreen(user) {
        const p = loadProfile(user);
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

    // Preload clef SVG images using real music clef glyphs
    const clefImages = { treble: new Image(), bass: new Image() };
    clefImages.treble.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 300"><text x="60" y="230" text-anchor="middle" font-size="250" fill="#1E1E2F" font-family="Bravura, Noto Music, Apple Symbols, Segoe UI Symbol, serif">𝄞</text></svg>');
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
            practiceDiff: '3'
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
            scheduleTick(audioT, strong = false, countdown = false) {
                // Precise AudioContext-scheduled metronome tick
                if (!this.ctx || !this.enabled) return;
                // Route through a shared metronome bus so we can cut all future ticks
                if (!this._metroBus || this._metroBus.context !== this.ctx) {
                    this._metroBus = this.ctx.createGain();
                    this._metroBus.connect(this.ctx.destination);
                }
                const g = this.getSfxGain();
                const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
                osc.connect(gain); gain.connect(this._metroBus);
                if (countdown) {
                    // Woodblock-like sound for prep beats
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(900, audioT);
                    osc.frequency.exponentialRampToValueAtTime(400, audioT + 0.06);
                    gain.gain.setValueAtTime(0, audioT);
                    gain.gain.linearRampToValueAtTime(0.38 * g, audioT + 0.004);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioT + 0.14);
                    osc.start(audioT); osc.stop(audioT + 0.18);
                } else {
                    osc.type = 'sine';
                    osc.frequency.value = strong ? 1100 : 720;
                    gain.gain.setValueAtTime(0, audioT);
                    gain.gain.linearRampToValueAtTime(0.22 * g, audioT + 0.005);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioT + 0.085);
                    osc.start(audioT); osc.stop(audioT + 0.1);
                }
            },
            stopAllTicks() {
                // Disconnect the metronome bus to silence all scheduled ticks
                if (this._metroBus) {
                    try { this._metroBus.disconnect(); } catch(e) { /* ignore */ }
                    this._metroBus = null;
                }
            }
        };
    }

    // ==========================================
    // 介面切換系統
    // ==========================================
    function switchScreen(screenId) {
        const current = [...dom.screens].find(s => s.classList.contains('active'));
        const next = dom.screenMap.get(screenId);
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
        if (!rect.width || !rect.height) return;
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
        const imgH = ls * 10.5;
        const imgW = imgH * (120 / 300);
        const drawX = x - imgW * 0.42;
        const drawY = y - imgH * 0.590;
        if (clefImages.treble.complete && clefImages.treble.naturalWidth > 0) {
            ctx.drawImage(clefImages.treble, drawX, drawY, imgW, imgH);
            return;
        }
        ctx.save();
        ctx.fillStyle = '#1E1E2F';
        ctx.font = `${Math.round(ls * 6)}px serif`;
        ctx.textBaseline = 'middle';
        ctx.fillText('𝄞', x - ls * 1.4, y + ls * 0.6);
        ctx.restore();
    }



    function drawSharp(ctx, x, y, ls) {
        ctx.save();
        ctx.fillStyle = '#1E1E2F';
        ctx.font = `900 ${Math.round(ls * 1.6)}px Bravura, "Noto Music", "Apple Symbols", "Segoe UI Symbol", serif`;
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
        const ls = w < 400 ? 18 : 22;
        if (!_staffCache || _staffCache.w !== w || _staffCache.h !== h || _staffCache.dpr !== dpr || _staffCache.clefLoaded !== clefLoaded || _staffCache.clef !== currentClef) {
            const oc = document.createElement('canvas');
            oc.width = w * dpr; oc.height = h * dpr;
            const oc_ctx = oc.getContext('2d');
            oc_ctx.scale(dpr, dpr);
            const _baseY = h / 2 - (ls * 2), _startX = w < 400 ? 25 : 50;
            oc_ctx.strokeStyle = '#1E1E2F'; oc_ctx.lineWidth = 2; oc_ctx.lineCap = 'round';
            oc_ctx.beginPath();
            for (let i = 0; i < 5; i++) { oc_ctx.moveTo(_startX, _baseY + i*ls); oc_ctx.lineTo(w - _startX, _baseY + i*ls); }
            oc_ctx.stroke();
            if (currentClef === 'bass') {
                drawBassClef(oc_ctx, _startX + (w < 400 ? 25 : 35), _baseY + ls * 1, ls);
            } else {
                drawTrebleClef(oc_ctx, _startX + (w < 400 ? 25 : 35), _baseY + ls * 3, ls);
            }
            _staffCache = { canvas: oc, w, h, dpr, ls, clefLoaded, clef: currentClef, baseY: _baseY, startX: _startX };
        }
        ctx.drawImage(_staffCache.canvas, 0, 0, w, h);
        if (dom.clefBadge) dom.clefBadge.textContent = currentClef === 'bass' ? '低音譜號' : '高音譜號';

        const baseY = _staffCache.baseY, startX = _staffCache.startX;
        const centerX = w / 2, middleLineY = baseY + 2 * ls;

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
                if (dom.clefBass)   dom.clefBass.checked   = false; // textbook configs are treble-only
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
        if (dom.inputs) dom.inputs.forEach(el => s[el.id] = el.type==='checkbox' ? el.checked : el.value);
        s.lastMode = state.currentMode;
        s.practiceDiff = state.practiceDiff;
        s.savedName = dom.userName.value;
        const customInp = _customNameInput;
        if (dom.userName.value === '__other__' && customInp) s.savedCustomName = customInp.value;
        localStorage.setItem('musicGameSettingsV4', JSON.stringify(s));
    }

    function loadSavedSettings() {
        const stored = localStorage.getItem('musicGameSettingsV4');
        if (!stored) return;
        try {
            const s = JSON.parse(stored);
            if (s) {
                if (dom.inputs) dom.inputs.forEach(el => { if (s[el.id] !== undefined) { if (el.type==='checkbox') el.checked=s[el.id]; else el.value=s[el.id]; } });
                if (s.practiceDiff) state.practiceDiff = s.practiceDiff;
                if (s.lastMode && MODE_CONFIG[s.lastMode]) {
                    state.currentMode = s.lastMode; state.modeConfig = MODE_CONFIG[s.lastMode];
                    dom.modeCards.forEach(c => c.classList.remove('active'));
                    const isClefChallenge = s.lastMode === 'classic60' || s.lastMode === 'bass60' || s.lastMode === 'mixed60';
                    if (isClefChallenge) { dom.modeCardMap.get('classic60')?.classList.add('active'); }
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
        el.textContent = combo >= 10 ? `🔥 ${combo} 題連對！勁啊！` : `⚡ ${combo} 題連對！`;
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

    function generateNote() {
        let clefOptions = [], accidentalChance = 0, noteRange = [0, 10], allowAbove = true, allowBelow = true;
        
        // Challenge modes can force a specific clef
        const forceClef = state.modeConfig && state.modeConfig.forceClef;
        
        if (forceClef) {
            clefOptions = forceClef === 'mixed' ? ['treble','bass'] : [forceClef];
            accidentalChance = 0.3;
            allowAbove = true; allowBelow = true;
            noteRange = [0, 12];
        } else {
            // Practice mode — use difficulty-based config
            const config = _getPracticeConfig();
            clefOptions = config.clef; accidentalChance = config.accidentalChance; noteRange = config.noteRange; allowAbove = config.ledgerAbove; allowBelow = config.ledgerBelow;
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
        const hasAccidentals = forceClef ? true : (_getPracticeConfig().accidentalChance > 0);
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
            if (isFirstAttempt && elapsed > 4000) {
                state.slowNoteStats[state.currentNote.correctName] = (state.slowNoteStats[state.currentNote.correctName] || 0) + 1;
            }
            const pts = state.modeConfig.type === 'challenge' ? Math.round(10 * state.modeConfig.scoreMulti + state.combo) : 0;
            if (pts) state.score += pts;
            const _sol = noteSol(state.currentNote); const _secs = isFirstAttempt ? ` ⚡ ${(elapsed/1000).toFixed(1)}s` : ''; dom.messageBox.textContent = `✅ 答對了！${state.currentNote.correctName}${_sol?' = '+_sol:''}${_secs} ✨ 得分：${state.score}`; 
            dom.messageBox.className = 'message-box correct';
            audio.playNote(state.currentNote.freqKey);
            if (btn) { btn.classList.add('correct'); if (pts) { const r = btn.getBoundingClientRect(); showScoreFloat(pts, r.left + r.width/2 - 15, r.top - 10); } }
            if (state.combo > 0 && state.combo % 5 === 0) { showComboBurst(state.combo); spawnConfetti(Math.min(state.combo, 25)); }
            // Practice mode milestone
            if (state.modeConfig.type === 'practice') {
                const correctCount = state.totalQuestions - state.wrongCount;
                if (correctCount > 0 && correctCount % 20 === 0) {
                    showComboBurst(correctCount); spawnConfetti(30);
                    dom.messageBox.textContent = `🎯 已答對 ${correctCount} 題！你好棒！繼續加油！`;
                }
            }
            setTimeout(() => { if (btn) btn.classList.remove('correct', 'wrong'); if (state.gameActive) nextQuestion(); }, 500);
        } else {
            const clefLabel = state.currentNote.clef === 'bass' ? '低音' : '高音';
            const statKey = `${state.currentNote.correctName} (${clefLabel})`;
            state.wrongNoteStats[statKey] = (state.wrongNoteStats[statKey]||0) + 1; 
            state.combo = 0; 
            audio.playEffect('wrong');
            
            state.answered = true; 
            state.wrongCount++; 
            state.showAnswerHighlight = true; drawStaff();
            const _sol2 = noteSol(state.currentNote); const _secs2 = isFirstAttempt ? `（${(elapsed/1000).toFixed(1)}s）` : ''; dom.messageBox.textContent = `❌ 答錯了～正確答案是 ${state.currentNote.correctName}${_sol2?' ('+_sol2+')':''}${_secs2}，記住了嗎？`; 
            dom.messageBox.className = 'message-box wrong';
            if (btn) btn.classList.add('wrong'); 
            setTimeout(() => { if (btn) btn.classList.remove('wrong'); if (state.gameActive) { if(state.modeConfig.maxWrong !== Infinity) endGame(); else nextQuestion(); } }, 1500);
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
        audio.warmUp();
        const playerName = getPlayerName();
        if (!playerName) {
            dom.nameField.classList.add('error');
            alert('❗ 請先選擇你的名字才可以開始哦！');
            return;
        }
        dom.nameField.classList.remove('error');
        saveSettings();
        state.currentUser = { name: playerName, grade: parseInt(dom.userGrade.value), class: dom.userClass.value, id: dom.userId.value };
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
            dom.messageBox.textContent = `🎵 ${state.modeConfig.name} — 開始囉！加油！`; 
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
            if (secondHalf > firstHalf * 1.3) speedTrend = '<li>⚠️ 後半段反應變慢，可能有少少攰，記得休息</li>';
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

        try {
            await fetch(CONFIG.API_URL, { 
                method: 'POST', 
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
                body: JSON.stringify(record),
                mode: 'no-cors',
                redirect: 'follow',
                signal: controller.signal
            });
            setTimeout(loadRanks, 2000);
        } catch (e) {
            console.error("上傳失敗：", e);
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
            mode: game,
            mode_name: modeName,
            score,
            max_combo: maxCombo,
            accuracy,
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
        } catch(e) {
            console.error('上傳失敗：', e);
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
            state.allRanks = Array.isArray(data) ? data.filter(r => r && r.mode) : []; 
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
        dom.rankList.innerHTML = _rankRewardBanner() + f.map((item, i) => {
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
        }).join('');
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
        dom.soundToggle.addEventListener('click', () => { audio.init(); audio.warmUp(); audio.enabled = !audio.enabled; dom.soundToggle.textContent = audio.enabled ? '🔊' : '🔇'; audio.bgSetMute(!audio.enabled); localStorage.setItem('musicGameSoundEnabled', audio.enabled); });

        // Mode card selection + clef sub-selector
        const clefSelectorRow = document.getElementById('clefSelectorRow');
        const clefSelBtns = document.querySelectorAll('.clef-sel-btn');
        dom.modeCards.forEach(card => card.addEventListener('click', () => {
            audio.init(); audio.playClick('select');
            dom.modeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const mode = card.dataset.mode;
            if (mode === 'practice' || mode === 'noMiss') {
                state.currentMode = mode;
                state.modeConfig = MODE_CONFIG[mode];
                if (clefSelectorRow) clefSelectorRow.style.display = 'none';
            } else {
                // classic60 card = 1-min challenge, show clef sub-selector
                const activeClef = document.querySelector('.clef-sel-btn.active');
                state.currentMode = activeClef ? activeClef.dataset.clef : 'classic60';
                state.modeConfig = MODE_CONFIG[state.currentMode];
                if (clefSelectorRow) clefSelectorRow.style.display = '';
            }
            if (dom.practiceDiffRow) dom.practiceDiffRow.style.display = mode === 'practice' ? '' : 'none';
            saveSettings();
        }));
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
          if (clefSelectorRow) clefSelectorRow.style.display = isChallenge ? '' : 'none';
          if (isChallenge) { clefSelBtns.forEach(b => b.classList.toggle('active', b.dataset.clef === state.currentMode));
              const challengeCard = document.querySelector('.mode-card[data-mode="classic60"]');
              if (challengeCard) { dom.modeCards.forEach(c => c.classList.remove('active')); challengeCard.classList.add('active'); }
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
        
        dom.startBtn.addEventListener('click', startGame); 
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
        
        dom.revealBtn.addEventListener('click', () => { if (!state.gameActive || state.answered) return; state.answered = true; state.combo = 0; state.showAnswerHighlight = true; drawStaff(); updateScoreboard(); audio.playNote(state.currentNote.freqKey); const _sol3 = noteSol(state.currentNote); dom.messageBox.textContent = `🔊 答案是 ${state.currentNote.correctName}${_sol3?' = '+_sol3:''}，聽聽看！記住位置，下題加油！`; dom.messageBox.className = 'message-box warning'; enableGameControls(false); setTimeout(() => { dom.messageBox.className = 'message-box'; nextQuestion(); }, 2500); });
        dom.skipBtn.addEventListener('click', () => { if (!state.gameActive || state.answered) return; state.answered = true; state.combo = 0; updateScoreboard(); dom.messageBox.textContent = '⏩ 跳過這題，下一題加油！'; dom.messageBox.className = 'message-box'; setTimeout(() => nextQuestion(), 400); });
        
        document.getElementById('rankGameFilter')?.addEventListener('change', () => {
            const gfVal = document.getElementById('rankGameFilter').value;
            const mfRow = dom.rankModeFilter?.closest?.('.rank-filter');
            if (mfRow) mfRow.style.display = gfVal === 'game1' ? '' : 'none';
            const dfWrap = document.getElementById('rankDiffFilterWrap');
            if (dfWrap) dfWrap.style.display = (gfVal === 'game2' || gfVal === 'game3') ? '' : 'none';
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
        });
        // Back buttons
        document.getElementById('classmatesBackBtn').addEventListener('click', () => switchScreen('screen-hub'));
        document.getElementById('viewProfileBackBtn').addEventListener('click', () => switchScreen('screen-classmates'));
        // Classmate filter changes
        document.getElementById('cmGrade').addEventListener('change', renderClassmateList);
        document.getElementById('cmClass').addEventListener('change', renderClassmateList);

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

        if (!students.length) {
            list.innerHTML = '<div class="cm-empty">這個班別暫時沒有同學資料 📭</div>';
            return;
        }

        const me = state.currentUser;
        list.innerHTML = students.map((name, i) => {
            const user = { name, grade, class: cls, seat: i + 1 };
            const p = loadProfile(user);
            const avInfo = _avatarLookup(p.avatar);
            const isMe = me && me.name === name && me.grade == grade && me.class === cls;
            return `<div class="cm-card${isMe ? ' cm-me' : ''}" data-name="${escHtml(name)}" data-grade="${grade}" data-class="${cls}" data-seat="${i+1}">
                <div class="cm-avatar" style="background:${avInfo.bg}">${p.avatar}</div>
                <div class="cm-info">
                    <div class="cm-name">${escHtml(name)}${isMe ? ' <span class="cm-me-tag">我</span>' : ''}</div>
                    <div class="cm-detail">Lv.${p.level} · ${p.signature || '未設定簽名'}</div>
                    <div class="cm-stats">🎮 ${p.stats.totalPlayed}次 · 🏆 ${p.stats.totalScore}分 · 🔥 ${p.stats.maxCombo}連擊</div>
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
    function openViewProfile(user) {
        _viewingProfile = user;
        const p = loadProfile(user);
        const avInfo = _avatarLookup(p.avatar);

        const avEl = document.getElementById('vpAvatar');
        avEl.textContent = p.avatar;
        avEl.style.background = avInfo.bg;

        document.getElementById('vpName').textContent = p.name + ' 同學';
        document.getElementById('vpSig').textContent = p.signature || '尚未設定簽名';
        document.getElementById('vpMeta').textContent = `${p.grade ? '小' + p.grade : ''} ${p.class}班 · ${p.seat ? p.seat + '號' : ''}`;
        document.getElementById('vpLevel').textContent = 'Lv.' + p.level;
        const needed = _expForLevel(p.level);
        document.getElementById('vpExpFill').style.width = Math.min(100, Math.round((p.exp / needed) * 100)) + '%';

        document.getElementById('vpTotalPlayed').textContent = p.stats.totalPlayed;
        document.getElementById('vpCleared').textContent = p.stats.cleared;
        document.getElementById('vpTotalScore').textContent = p.stats.totalScore;
        document.getElementById('vpMaxCombo').textContent = p.stats.maxCombo;

        document.getElementById('vpGame1').textContent = p.gameBests.game1 || '---';
        document.getElementById('vpGame2').textContent = p.gameBests.game2 || '---';
        document.getElementById('vpGame3').textContent = p.gameBests.game3 || '---';

        switchScreen('screen-view-profile');
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
        }

        hubGrade.addEventListener('change', () => { populateHub(); });
        hubClass.addEventListener('change', () => { populateHub(); });
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
                } else {
                    enterRCGame(user);
                }
            };
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
            const badgeText = document.getElementById('g3PlayerBadgeText');
            if (badgeText) badgeText.textContent = `${user.grade ? ['','小一','小二','小三','小四','小五','小六'][user.grade] : ''}${user.class}班 · ${user.name} 同學`;
            let g3SelectedMode = 'practice';
            let g3SelectedDiff = 'easy';
            const g3DiffSel = document.getElementById('g3DiffSelector');

            document.querySelectorAll('#g3ModeCards .mode-card').forEach(c => {
                c.classList.toggle('active', c.dataset.mode === 'practice');
                c.onclick = () => {
                    g3SelectedMode = c.dataset.mode;
                    document.querySelectorAll('#g3ModeCards .mode-card').forEach(x => x.classList.remove('active'));
                    c.classList.add('active');
                    if (g3DiffSel) g3DiffSel.style.display = (g3SelectedMode === 'challenge') ? '' : 'none';
                };
            });

            // Difficulty card selection
            document.querySelectorAll('#g3DiffCards .diff-card').forEach(c => {
                c.classList.toggle('active', c.dataset.diff === 'easy');
                c.onclick = () => {
                    g3SelectedDiff = c.dataset.diff;
                    document.querySelectorAll('#g3DiffCards .diff-card').forEach(x => x.classList.remove('active'));
                    c.classList.add('active');
                };
            });
            if (g3DiffSel) g3DiffSel.style.display = 'none';

            document.getElementById('g3StartBtn').onclick = () => startGame3(user, g3SelectedMode, g3SelectedDiff);
            document.getElementById('g3StudyBtn').onclick = () => openStudyScreen();
            document.getElementById('g3BackToHubFromSetup').onclick = () => switchScreen('screen-hub');
            document.getElementById('g3SetupViewRanks').onclick = () => {
                renderLocalRankList('game3', 'g3RankList', user, g3SelectedDiff);
                switchScreen('screen-game3-result');
            };
            switchScreen('screen-g3-setup');
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
            if (!state.currentUser) return;
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
        // Dedup: keep highest score per student per difficulty
        const seen = new Set();
        const deduped = data.filter(r => {
            const diffKey = fD !== '0' ? '' : `|${(r.mode_name||'').split('·')[1]||''}`;
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
        dom.rankList.innerHTML = _rankRewardBanner() + deduped.map((item, i) => {
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
        }).join('');
    }

    function saveLocalRank(gameKey, user, score, accuracy, maxCombo, difficulty) {
        try {
            const all = JSON.parse(localStorage.getItem('musicGameRanks_' + gameKey) || '[]');
            const idx = all.findIndex(r => r.name === user.name && r.class === user.class && r.grade === user.grade && (r.difficulty || '') === (difficulty || ''));
            if (idx >= 0) { if (score > (all[idx].score || 0)) { all[idx].score = score; all[idx].accuracy = accuracy; all[idx].maxCombo = maxCombo; } }
            else all.push({ name: user.name, grade: user.grade, class: user.class, seat: user.seat, score, accuracy, maxCombo, difficulty: difficulty || '' });
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
        'ti-ti-ri':    [{l:'ti',o:0,d:0.5},{l:'ri',o:0.5,d:0.25},{l:'ri',o:0.75,d:0.25}],
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
    // 🎴 RC Canvas Game — 節奏卡打擊
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
    const CHALLENGE_TOKEN_SETS = {
        basic:    [{n:'ta',d:1},{n:'ta',d:1},{n:'ti-ti',d:1},{n:'ta-a',d:2},{n:'休',d:1}],
        medium:   [{n:'ta',d:1},{n:'ti-ti',d:1},{n:'ta-a',d:2},{n:'休',d:1},
                   {n:'ti-ri-ti-ri',d:1},{n:'ti-ri',d:1},{n:'ta-i',d:1.5},{n:'ti',d:0.5}],
        advanced: [{n:'ta',d:1},{n:'ti-ti',d:1},{n:'ta-a',d:2},{n:'休',d:1},
                   {n:'ti-ri-ti-ri',d:1},{n:'ti-ri',d:1},{n:'ta-i',d:1.5},{n:'ti',d:0.5},
                   {n:'ti-ti-ri',d:1},{n:'ti-ri-ti',d:1},{n:'ri-ti-ri',d:1},{n:'ta-a-a',d:3}],
    };

    // Compound tokens that use beams — must start at an integer beat position
    // (otherwise the beam would cross a beat boundary, which is wrong notation)
    const _BEAM_TOKENS = new Set(['ti-ti','ti-ri-ti-ri','ti-ri','ti-ti-ri','ti-ri-ti','ri-ti-ri']);

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
        { id: 1, name: '初級',  icon: '⭐',       bpm: 60,  tokenSet: 'basic',    bars: 16, winScale: 1.4, hpLoss: 10 },
        { id: 2, name: '中級',  icon: '⭐⭐',     bpm: 72,  tokenSet: 'medium',   bars: 16, winScale: 1.2, hpLoss: 13 },
        { id: 3, name: '高級',  icon: '⭐⭐⭐',   bpm: 88,  tokenSet: 'advanced', bars: 16, winScale: 1.0, hpLoss: 15 },
    ];

    const rchalState = {
        user: null,
        level: null,
        phase: 'idle',       // idle | select | preview | countdown | playing | done
        measures: [],
        taps: [],            // expected taps
        score: 0, combo: 0, maxCombo: 0, hp: 100,
        counts: { perfect: 0, great: 0, good: 0, miss: 0 },
        startTime: 0,
        timers: [],
        stars: {},           // levelId → 0-3
        rowRanges: [],       // per-row y/h for highlighting
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
    }

    /* ── Level Select View ── */
    function _rchalShowSelect() {
        _rchalCleanup();
        rchalState.phase = 'select';
        const container = document.getElementById('screen-rc-grade');
        const grade = rchalState.user ? rchalState.user.grade || 1 : 1;
        const gradeName = ['', '小一', '小二', '小三', '小四', '小五', '小六'][grade] || '';

        container.innerHTML = `
            <div class="rchal-header">
                <button class="rchal-exit" id="rchalExitBtn">✕</button>
                <div class="rchal-header-center">
                    <div class="rchal-title">🥁 節奏挑戰</div>
                    <div class="rchal-meta">${gradeName} · ${rchalState.user ? rchalState.user.name : ''}</div>
                </div>
                <div style="width:36px"></div>
            </div>
            <div class="rchal-level-grid" id="rchalLevelGrid"></div>
        `;
        document.getElementById('rchalExitBtn').onclick = _rchalExit;

        const grid = document.getElementById('rchalLevelGrid');
        RCHAL_LEVELS.forEach(lvl => {
            const stars = _rchalGetStars(lvl.id);
            const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
            const card = document.createElement('div');
            card.className = 'rchal-level-card';
            card.innerHTML = `
                <div class="rchal-level-icon">${lvl.icon}</div>
                <div class="rchal-level-name">Lv.${lvl.id} ${lvl.name}</div>
                <div class="rchal-level-info">${lvl.bpm} BPM · ${lvl.bars}小節</div>
                <div class="rchal-level-stars">${starStr}</div>
            `;
            card.onclick = () => _rchalStartLevel(lvl);
            grid.appendChild(card);
        });
    }

    /* ── Start a Level (preview phase) ── */
    function _rchalStartLevel(lvl) {
        _rchalCleanup();
        rchalState.user = state.currentUser;
        rchalState.level = lvl;
        rchalState.phase = 'preview';
        rchalState.score = 0; rchalState.combo = 0; rchalState.maxCombo = 0; rchalState.hp = 100;
        rchalState.counts = { perfect: 0, great: 0, good: 0, miss: 0 };

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
            <div class="rchal-status" id="rchalStatus">看清楚節奏，然後按「開始」！</div>
            <button class="rchal-start-btn" id="rchalStartBtn">🥁 開始！</button>
            <div class="rchal-overlay" id="rchalOverlay" style="display:none;"></div>
        `;

        document.getElementById('rchalExitBtn').onclick = () => _rchalShowSelect();

        // Render all 16 bars as 4 rows × 4 bars
        rchalState.noteMap = [];
        _rchalRenderNotes(measures, lvl.bars);

        // Build taps for ALL bars
        _rchalBuildTaps(measures, lvl);

        // Start button
        document.getElementById('rchalStartBtn').onclick = () => _rchalCountdown();

        // HP bar initial
        _rchalDrawHP();
    }

    /* ── Render notes via VexFlow — 4 rows × 4 bars ── */
    function _rchalRenderNotes(measures, numBars) {
        const notesEl = document.getElementById('rchalNotes');
        notesEl.innerHTML = '';
        const trackEl = document.getElementById('rchalTrack');
        const W = trackEl.clientWidth || 360;
        const BARS_PER_ROW = 4;
        const numRows = Math.ceil(numBars / BARS_PER_ROW);
        const totalH = trackEl.clientHeight || (numRows * 65);
        const ROW_H = totalH / numRows;

        if (typeof VexFlow === 'undefined') return;
        const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Annotation, Stem } = VexFlow;

        const renderer = new Renderer(notesEl, Renderer.Backends.SVG);
        renderer.resize(W, totalH);
        const context = renderer.getContext();

        const durMap = { 0.25: '16', 0.5: '8', 0.75: '8', 1: 'q', 1.5: 'q', 2: 'h', 3: 'h' };
        const dotSet = new Set([0.75, 1.5, 3]);
        const PAD = 4;
        const barW = (W - PAD * 2) / BARS_PER_ROW;

        const allNoteMap = [];
        let tapIdx = 0;

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

            const stave = new Stave(x, y + 2, barW);
            [0, 1, 3, 4].forEach(line => stave.setConfigForLine(line, { visible: false }));
            if (col === 0 && row === 0) stave.addTimeSignature('4/4');
            stave.setContext(context).draw();

            const vfNotes = [];
            const beamGroups = [];
            const noteGameMap = [];
            const barTapStart = tapIdx;

            barLabel.split(' ').forEach(token => {
                const isRest = token === '休';
                const compound = COMPOUND_TOKENS[token];

                if (isRest) {
                    const note = new StaveNote({ keys: ['b/4'], duration: 'qr' });
                    note.addModifier(new Annotation('休止').setVerticalJustification(3));
                    vfNotes.push(note);
                    noteGameMap.push([]);
                } else if (compound) {
                    const group = [];
                    compound.forEach(sub => {
                        const dur = durMap[sub.d];
                        if (!dur) return;
                        const note = new StaveNote({ keys: ['b/4'], duration: dur, stem_direction: Stem.UP });
                        if (dotSet.has(sub.d)) note.addDotToAll();
                        note.addModifier(new Annotation(sub.l).setVerticalJustification(3));
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
                    const note = new StaveNote({ keys: ['b/4'], duration: dur, stem_direction: Stem.UP });
                    if (dotSet.has(tokenDur)) note.addDotToAll();
                    note.addModifier(new Annotation(token).setVerticalJustification(3));
                    vfNotes.push(note);
                    noteGameMap.push([tapIdx]);
                    tapIdx++;
                }
            });

            const nsx = stave.getNoteStartX();
            const voice = new Voice({ num_beats: 4, beat_value: 4 });
            voice.setMode(2);
            voice.addTickables(vfNotes);
            new Formatter().joinVoices([voice]).format([voice], barW - (nsx - x) - 16);
            const beams = beamGroups.map(g => new Beam(g));
            voice.draw(context, stave);
            beams.forEach(b => b.setContext(context).draw());

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
                if (!gameIndices || !gameIndices.length) return;
                const el = vfNote.getSVGElement ? vfNote.getSVGElement() : (vfNote.attrs && vfNote.attrs.el);
                // Find which beam group this note belongs to
                let beamEl = null;
                beamGroups.forEach((group, gi) => {
                    if (group.includes(vfNote)) beamEl = beamElMap.get(gi);
                });
                gameIndices.forEach(gi => {
                    allNoteMap[gi] = { el: el, bar: bi, row: row, beamEl: beamEl };
                });
            });

            // Store rest elements for pass-through coloring
            /* rests not colored */
        });

        rchalState.noteMap = allNoteMap;
        rchalState.trackW = W;
    }

    /* ── Build expected taps ── */
    function _rchalBuildTaps(measures, lvl) {
        rchalState.taps = [];
        const beatMs = 60000 / lvl.bpm;
        let beatCursor = 0;
        let tapIdx = 0;

        measures.forEach((label, mIdx) => {
            const tokens = label.split(' ');
            tokens.forEach(token => {
                const dur = getRhythmTokenDuration(token);
                if (token === '休') { beatCursor += dur; return; }

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

    /* ── Countdown ── */
    function _rchalCountdown() {
        if (rchalState.phase !== 'preview') return;
        rchalState.phase = 'countdown';
        const startBtn = document.getElementById('rchalStartBtn');
        if (startBtn) startBtn.style.display = 'none';
        const statusEl = document.getElementById('rchalStatus');
        if (statusEl) statusEl.textContent = '';

        const overlay = document.getElementById('rchalOverlay');
        overlay.style.display = 'flex';

        let count = 3;
        const tick = () => {
            if (count <= 0) {
                overlay.style.display = 'none';
                _rchalBeginPlay();
                return;
            }
            overlay.innerHTML = `<div class="rchal-cdn-num">${count}</div>`;
            const numEl = overlay.querySelector('.rchal-cdn-num');
            numEl.classList.add('rchal-cdn-pop');
            audio.playEffect && audio.playEffect('countdown');
            rchalState.timers.push(setTimeout(() => { count--; tick(); }, 700));
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

        // Schedule row highlighting
        const BARS_PER_ROW = 4;
        const rows = rchalState.rowRanges || [];
        let currentRow = -1;
        const updateRow = (barIdx) => {
            const newRow = Math.floor(barIdx / BARS_PER_ROW);
            if (newRow !== currentRow && rows[newRow]) {
                currentRow = newRow;
                rowHL.style.top = rows[newRow].y + 'px';
                rowHL.style.height = rows[newRow].h + 'px';
                rowHL.style.opacity = '1';
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
        if (audio.ctx) {
            const baseTime = audio.ctx.currentTime + 0.02;
            for (let b = 0; b < totalBeats; b++) {
                const t = baseTime + (b * beatMs) / 1000;
                const beatInBar = b % 4;
                const osc = audio.ctx.createOscillator();
                const gain = audio.ctx.createGain();
                osc.connect(gain).connect(audio.ctx.destination);
                osc.type = 'triangle';
                osc.frequency.value = beatInBar === 0 ? 1200 : 800;
                gain.gain.setValueAtTime(beatInBar === 0 ? 0.25 : 0.15, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
                osc.start(t); osc.stop(t + 0.06);
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

    /* ── Tap Handler ── */
    function _rchalOnTap() {
        if (rchalState.phase !== 'playing') return;
        const elapsed = performance.now() - rchalState.startTime;
        const lvl = rchalState.level;
        const beatMs = 60000 / lvl.bpm;
        const winMs = beatMs * 0.35 * lvl.winScale;

        // Flash tap zone
        const tapEl = document.getElementById('rchalTap');
        tapEl.classList.add('flash');
        setTimeout(() => tapEl.classList.remove('flash'), 80);

        // Find nearest unhit tap
        let best = null, bestDiff = Infinity;
        rchalState.taps.forEach(tap => {
            if (tap.consumed) return;
            const diff = elapsed - tap.absTimeMs;
            if (diff >= -winMs && diff <= winMs && Math.abs(diff) < bestDiff) {
                best = tap; bestDiff = Math.abs(diff);
            }
        });

        if (!best) return; // No note in range

        best.consumed = true;
        best.hit = true;
        const ratio = bestDiff / winMs;
        let judgment, jClass, points;
        if (ratio < 0.25) { judgment = 'PERFECT'; jClass = 'perfect'; points = 300; }
        else if (ratio < 0.5) { judgment = 'GREAT'; jClass = 'great'; points = 200; }
        else { judgment = 'GOOD'; jClass = 'good'; points = 100; }

        rchalState.combo++;
        if (rchalState.combo > rchalState.maxCombo) rchalState.maxCombo = rchalState.combo;
        const mul = rchalState.combo >= 30 ? 4 : rchalState.combo >= 20 ? 3 : rchalState.combo >= 10 ? 2 : 1;
        const earned = points * mul;
        rchalState.score += earned;
        rchalState.counts[jClass]++;

        // HP recovery
        if (jClass === 'perfect') rchalState.hp = Math.min(100, rchalState.hp + 5);
        else if (jClass === 'great') rchalState.hp = Math.min(100, rchalState.hp + 2);
        _rchalDrawHP();

        document.getElementById('rchalScore').textContent = rchalState.score;
        _rchalShowJudgment(judgment, jClass);
        if (rchalState.combo >= 2) {
            document.getElementById('rchalCombo').textContent = `🔥 ${rchalState.combo} COMBO` + (mul > 1 ? ` ×${mul}` : '');
        }

        // Mark note as hit (VexFlow SVG)
        const nm = rchalState.noteMap && rchalState.noteMap[best.idx];
        if (nm && nm.el) {
            _vfColorNote(nm.el, '#34D399');
            if (nm.beamEl) _vfColorNote(nm.beamEl, '#34D399');
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
        el.textContent = text;
        el.className = 'rchal-judgment show ' + cls;
        setTimeout(() => el.classList.remove('show'), 600);
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
                    </div>
                    <div class="rchal-result-detail">準確度 ${accuracy}%　·　最高連擊 ${rchalState.maxCombo}</div>
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
    function _rcRenderLevels() {
        const grid = document.getElementById('rcLevelGrid');
        if (!grid) return;

        grid.innerHTML = '';
        const cards = RC_CARDS;
        cards.forEach(card => {
            const num = String(card.num).padStart(2, '0');
            const el = document.createElement('div');
            el.className = 'rc-level-card';
            el.innerHTML = `<div class="rc-level-thumb"><img src="img/cards/rc-${num}.png" alt="節奏卡 ${card.num}" loading="lazy">${_rcGetGradeBadge(card.num)}<button class="rc-level-preview-btn" title="試聽節奏">▶</button></div>
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
        const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Annotation, Stem } = VexFlow;

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

            barLabel.split(' ').forEach(token => {
                const isRest = token === '休';
                const compound = COMPOUND_TOKENS[token];

                if (isRest) {
                    const note = new StaveNote({ keys: ['b/4'], duration: 'qr' });
                    note.addModifier(new Annotation('休止')
                        .setVerticalJustification(3));
                    notes.push(note);
                } else if (compound) {
                    const group = [];
                    compound.forEach(sub => {
                        const dur = durMap[sub.d];
                        if (!dur) return;
                        const note = new StaveNote({
                            keys: ['b/4'],
                            duration: dur,
                            stem_direction: Stem.UP
                        });
                        if (dotSet3.has(sub.d)) note.addDotToAll();
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
                        stem_direction: Stem.UP
                    });
                    if (dotSet3.has(tokenDur)) note.addDotToAll();
                    note.addModifier(new Annotation(token)
                        .setVerticalJustification(3));
                    notes.push(note);
                }
            });

            const voice = new Voice({ num_beats: 4, beat_value: 4 });
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
        const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Annotation, Stem } = VexFlow;
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

        barLabel.split(' ').forEach(token => {
            const isRest = token === '休';
            const compound = COMPOUND_TOKENS[token];

            if (isRest) {
                const note = new StaveNote({ keys: ['b/4'], duration: 'qr' });
                note.addModifier(new Annotation('休止').setVerticalJustification(3));
                vfNotes.push(note);
                vfToGame.push([]); // no game note for rests
            } else if (compound) {
                const group = [];
                compound.forEach(sub => {
                    const dur = durMap[sub.d];
                    if (!dur) return;
                    const note = new StaveNote({ keys: ['b/4'], duration: dur, stem_direction: Stem.UP });
                    if (dotSet.has(sub.d)) note.addDotToAll();
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
                const note = new StaveNote({ keys: ['b/4'], duration: dur, stem_direction: Stem.UP });
                if (dotSet.has(tokenDur)) note.addDotToAll();
                note.addModifier(new Annotation(token).setVerticalJustification(3));
                vfNotes.push(note);
                vfToGame.push([gameNoteIdx]);
                gameNoteIdx++;
            }
        });

        const voice = new Voice({ num_beats: 4, beat_value: 4 });
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
        const titleText = '📖 先睇清楚節奏';
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
        document.getElementById('rcMetronomeText').textContent = '跟住節拍器';
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
        const clsEl = document.getElementById(gameKey === 'game2' ? 'g2RankClass' : 'g3RankClass');
        const gradeEl = document.getElementById(gameKey === 'game2' ? 'g2RankGrade' : 'g3RankGrade');
        // Prefer GAS data; fall back to localStorage if not yet loaded
        let data = state.allRanks.filter(r => r.game === gameKey || r.mode === gameKey);
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
        if (!data.length) { listEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-light);font-weight:800;">暫時未有紀錄🚀</div>'; return; }
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
    const TERMS_BANK = {
        easy: [
            { q: '「f」代表甚麼？', sym: 'f', ans: '強', opts: ['強','弱','中強','中弱'], img: 'img/cards/others-p08.png' },
            { q: '「p」代表甚麼？', sym: 'p', ans: '弱', opts: ['強','弱','中強','中弱'], img: 'img/cards/others-p05.png' },
            { q: '「mf」代表甚麼？', sym: 'mf', ans: '中強', opts: ['強','弱','中強','漸強'], img: 'img/cards/others-p07.png' },
            { q: '「mp」代表甚麼？', sym: 'mp', ans: '中弱', opts: ['強','弱','中強','中弱'], img: 'img/cards/others-p06.png' },
            { q: '「ff」代表甚麼？', sym: 'ff', ans: '很強', opts: ['很強','很弱','中強','漸強'], img: 'img/cards/others-p09.png' },
            { q: '「pp」代表甚麼？', sym: 'pp', ans: '很弱', opts: ['很強','很弱','中強','漸弱'], img: 'img/cards/others-p04.png' },
            { q: '「cresc.」代表甚麼？', sym: 'cresc.', ans: '漸強', opts: ['漸強','漸弱','漸快','漸慢'], img: 'img/cards/others-p10.png' },
            { q: '「decresc.」代表甚麼？', sym: 'decresc.', ans: '漸弱', opts: ['漸強','漸弱','漸快','漸慢'], img: 'img/cards/others-p11.png' },
            { q: '「Forte」是甚麼意思？', sym: 'Forte', ans: '強', opts: ['強','弱','快','慢'], img: 'img/cards/others-p08.png' },
            { q: '「Piano」（力度）是甚麼意思？', sym: 'Piano', ans: '弱', opts: ['強','弱','快','慢'], img: 'img/cards/others-p05.png' },
            { q: '「< 」漸強記號跟哪個術語一樣？', sym: '<', ans: 'cresc.', opts: ['cresc.','decresc.','f','p'], isText: true, explain: '「<」形邊 = 聲音由小到大 = 漸強 = crescendo。' },
            { q: '「> 」漸弱記號跟哪個術語一樣？', sym: '>', ans: 'decresc.', opts: ['cresc.','decresc.','f','p'], isText: true, explain: '「>」形邊 = 聲音由大到小 = 漸弱 = decrescendo。' },
            { q: '以下力度術語由弱到強排序，哪個在中間？', sym: 'p _ f', ans: 'mf', opts: ['mf','mp','ff','pp'], isText: true, explain: 'pp → p → mp → mf → f → ff，p 后 f 前是 mf。' },
            { q: 'C大調的調號有多少個升降號？', ans: '沒有（0個）', opts: ['沒有（0個）','1個升號','1個降號','2個升號'], ksImg:'img/cards/keysig-0n.png', ksCaption:'<strong class="ks-major">C大調 / a小調</strong>', explain: 'C大調是唯一沒有升降號的大調，五線譜上乾乾淨淨。' },
        ],
        medium: [
            { q: '「Andante」是甚麼速度？', sym: 'Andante', ans: '行板（中慢速）', opts: ['行板（中慢速）','急板（很快）','柔板（很慢）','小行板（稍慢）'] },
            { q: '「Allegro」是甚麼速度？', sym: 'Allegro', ans: '快板', opts: ['快板','行板','柔板','慢板'] },
            { q: '「Adagio」是甚麼速度？', sym: 'Adagio', ans: '柔板（很慢）', opts: ['行板（中慢速）','快板','柔板（很慢）','急板'] },
            { q: '「Moderato」是甚麼速度？', sym: 'Moderato', ans: '中板', opts: ['快板','中板','柔板','行板'] },
            { q: '「staccato」（·）代表甚麼？', sym: '·', ans: '斷奏', opts: ['連奏','斷奏','強奏','漸弱'] },
            { q: '「legato」代表甚麼？', sym: 'legato', ans: '連奏', opts: ['連奏','斷奏','強奏','漸弱'] },
            { q: '這個調號是哪個大調？', ans: 'G大調', opts: ['C大調','G大調','D大調','F大調'], ksImg:'img/cards/keysig-1s.png', ksCaption:'<span class="ks-notes">升 Fa</span>', explain: 'G大調有1個升號，升Fa（F♯）。' },
            { q: 'G大調的關係小調是哪個？', ans: 'e小調', opts: ['a小調','e小調','b小調','d小調'], ksImg:'img/cards/keysig-1s.png', ksCaption:'<strong class="ks-major">G大調</strong>', explain: 'G大調的關係小調是e小調，兩者共享同一個調號（1♯）。' },
            { q: '這個調號是哪個大調？', ans: 'F大調', opts: ['C大調','G大調','F大調','B♭大調'], ksImg:'img/cards/keysig-1f.png', ksCaption:'<span class="ks-notes">降 Si</span>', explain: 'F大調有1個降號，降Si（B♭）。' },
            { q: 'F大調的關係小調是哪個？', ans: 'd小調', opts: ['a小調','d小調','g小調','e小調'], ksImg:'img/cards/keysig-1f.png', ksCaption:'<strong class="ks-major">F大調</strong>', explain: 'F大調的關係小調是d小調。' },
            { q: '「accent」（>）是甚麼意思？', sym: '>', ans: '重音', opts: ['重音','強音','斷奏','漸強'] },
            { q: '「sfz」代表甚麼？', sym: 'sfz', ans: '突強', opts: ['突強','漸強','強','中強'] },
            { q: '「Andantino」速度比 Andante 如何？', sym: 'Andantino', ans: '稍快一點', opts: ['稍快一點','慢很多','一樣','快很多'], isText: true, explain: 'Andantino = 小行板，比行板稍快少許。' },
            { q: '以下旋律記號中，「連結線」代表甚麼？', sym: '͡', ans: '圓滑地連唱', opts: ['斷奏','圓滑地連唱','重音','漸慢'], isText: true, explain: '連結線 = legato，將音符圓滑地連接。' },
            { q: '「rit.」需要彈奏者怎樣做？', sym: 'rit.', ans: '慢慢變慢', opts: ['慢慢變快','慢慢變慢','突然停','慢慢變強'], isText: true, explain: 'rit. = ritardando = 漸慢。' },
            { q: '「a tempo」代表甚麼？', sym: 'a tempo', ans: '回原速', opts: ['漸快','漸慢','回原速','更快'], isText: true, explain: 'a tempo = 回到原來的速度。' },
            { q: '「反覆記號」的作用是甚麼？', sym: '|: :|', ans: '重複演奏一段', opts: ['樂曲結束','重複演奏一段','從頭再奏','從記號重奏'], isText: true, explain: '|: :| = 將括號內的樂段重複演奏一次。' },
        ],
        hard: [
            { q: '這個調號是哪個大調？', ans: 'D大調', opts: ['D大調','A大調','E大調','G大調'], ksImg:'img/cards/keysig-2s.png', ksCaption:'<span class="ks-notes">升 Fa、Do</span>', explain: 'D大調有2個升號，升Fa、Do（F♯、C♯）。' },
            { q: 'D大調的關係小調是哪個？', ans: 'b小調', opts: ['e小調','b小調','f♯小調','g小調'], ksImg:'img/cards/keysig-2s.png', ksCaption:'<strong class="ks-major">D大調</strong>', explain: 'D大調的關係小調是b小調。' },
            { q: '「D大調 / b小調」調號升了哪些音？', ans: '升 Fa、Do', opts: ['升 Fa','升 Fa、Do','升 Fa、Do、Sol','降 Si、Mi'], ksImg:'img/cards/keysig-2s.png', ksCaption:'<strong class="ks-major">D大調</strong><span class="ks-minor"> / b小調</span>', explain: 'D大調（b小調）有2個升號：F♯（升Fa）和C♯（升Do）。' },
            { q: '這個調號是哪個大調？', ans: 'B♭大調', opts: ['B♭大調','E♭大調','A♭大調','F大調'], ksImg:'img/cards/keysig-2f.png', ksCaption:'<span class="ks-notes">降 Si、Mi</span>', explain: 'B♭大調有2個降號，降Si、Mi（B♭、E♭）。' },
            { q: 'B♭大調的關係小調是哪個？', ans: 'g小調', opts: ['d小調','g小調','c小調','f小調'], ksImg:'img/cards/keysig-2f.png', ksCaption:'<strong class="ks-major">B♭大調</strong>', explain: 'B♭大調的關係小調是g小調。' },
            { q: '「Presto」是甚麼速度？', sym: 'Presto', ans: '急板（極快）', opts: ['行板','快板','急板（極快）','慢板'] },
            { q: '「Largo」是甚麼速度？', sym: 'Largo', ans: '廣板（極慢）', opts: ['廣板（極慢）','行板','中板','快板'] },
            { q: '「Da Capo（D.C.）」代表甚麼？', sym: 'D.C.', ans: '從頭再奏', opts: ['從頭再奏','從記號重奏','跳至結尾','速度加快'] },
            { q: '「Dal Segno（D.S.）」代表甚麼？', sym: 'D.S.', ans: '從記號重奏', opts: ['從頭再奏','從記號重奏','跳至結尾','速度減慢'] },
            { q: '「Fine」代表甚麼？', sym: 'Fine', ans: '樂曲結束', opts: ['樂曲結束','從頭再奏','漸弱','反覆記號'] },
            { q: '這個調號是哪個大調？', ans: 'A大調', opts: ['A大調','E大調','D大調','G大調'], ksImg:'img/cards/keysig-3s.png', ksCaption:'<span class="ks-notes">升 Fa、Do、Sol</span>', explain: 'A大調有3個升號，升Fa、Do、Sol（F♯、C♯、G♯）。' },
            { q: 'A大調的關係小調是哪個？', ans: 'f♯小調', opts: ['b小調','f♯小調','c♯小調','e小調'], ksImg:'img/cards/keysig-3s.png', ksCaption:'<strong class="ks-major">A大調</strong>', explain: 'A大調的關係小調是f♯小調。' },
            { q: '「A大調 / f♯小調」調號升了哪些音？', ans: '升 Fa、Do、Sol', opts: ['升 Fa、Do','升 Fa、Do、Sol','升 Fa Do Sol Re','降 Si、Mi、La'], ksImg:'img/cards/keysig-3s.png', ksCaption:'<strong class="ks-major">A大調</strong><span class="ks-minor"> / f♯小調</span>', explain: 'A大調（f♯小調）有3個升號：F♯、C♯、G♯，即升Fa、Do、Sol。' },
            { q: '這個調號是哪個大調？', ans: 'E♭大調', opts: ['B♭大調','E♭大調','A♭大調','G大調'], ksImg:'img/cards/keysig-3f.png', ksCaption:'<span class="ks-notes">降 Si、Mi、La</span>', explain: 'E♭大調有3個降號，降Si、Mi、La（B♭、E♭、A♭）。' },
            { q: 'E♭大調的關係小調是哪個？', ans: 'c小調', opts: ['d小調','g小調','c小調','f小調'], ksImg:'img/cards/keysig-3f.png', ksCaption:'<strong class="ks-major">E♭大調</strong>', explain: 'E♭大調的關係小調是c小調。' },
            { q: '「Ritardando（rit.）」代表甚麼？', sym: 'rit.', ans: '漸慢', opts: ['漸慢','漸快','漸強','漸弱'] },
            { q: '「Accelerando（accel.）」代表甚麼？', sym: 'accel.', ans: '漸快', opts: ['漸慢','漸快','漸強','漸弱'] },
            { q: '「Coda（𝜺）」代表甚麼？', sym: '𝜺', ans: '跳至尾聲', opts: ['從頭再奏','從記號重奏','跳至尾聲','樂曲結束'], isText: true, explain: 'Coda = 尾聲記號，指示跳到樂曲的結束部分。' },
            { q: '「cantabile」代表甚麼風格？', sym: 'cantabile', ans: '如歌地', opts: ['如歌地','甜美地','雄壯地','平靜地'], isText: true, explain: 'cantabile = 像唱歌一樣優美地演奏。' },
            { q: '「Tenuto（—）」代表甚麼？', sym: '—', ans: '保持完整音值', opts: ['斷奏','重音','保持完整音值','漸強'], isText: true, explain: 'Tenuto = 把音符完整地彈完，不可縮短。' },
            { q: '「Fermata（𝐐）」代表甚麼？', sym: '𝐐', ans: '自由延長', opts: ['斷奏','重音','自由延長','漸慢'], isText: true, explain: 'Fermata = 延長記號，讓演奏者自由延長該音符。' },
            { q: '這個調號是哪個大調？', ans: 'E大調', opts: ['D大調','E大調','A大調','B大調'], ksImg:'img/cards/keysig-4s.png', ksCaption:'<span class="ks-notes">升 Fa Do Sol Re</span>', explain: '升號順序 = FCGDAEB，4個升號 = E大調。' },
            { q: 'E大調的關係小調是哪個？', ans: 'c♯小調', opts: ['f♯小調','b小調','c♯小調','g♯小調'], ksImg:'img/cards/keysig-4s.png', ksCaption:'<strong class="ks-major">E大調</strong>', explain: 'E大調的關係小調是c♯小調。' },
            { q: '這個調號是哪個大調？', ans: 'A♭大調', opts: ['E♭大調','A♭大調','D♭大調','B♭大調'], ksImg:'img/cards/keysig-4f.png', ksCaption:'<span class="ks-notes">降 Si Mi La Re</span>', explain: 'A♭大調有4個降號，降Si、Mi、La、Re（B♭、E♭、A♭、D♭）。' },
            { q: 'A♭大調的關係小調是哪個？', ans: 'f小調', opts: ['c小調','f小調','g小調','b♭小調'], ksImg:'img/cards/keysig-4f.png', ksCaption:'<strong class="ks-major">A♭大調</strong>', explain: 'A♭大調的關係小調是f小調。' },
            { q: '「molto」加在術語前代表甚麼？', sym: 'molto forte', ans: '非常（加強程度）', opts: ['非常（加強程度）','一點點','不太','稍微'], isText: true, explain: 'molto = 非常/很多，molto forte = 非常強。' },
            { q: '「poco a poco」代表甚麼？', sym: 'poco a poco', ans: '逐漸地', opts: ['突然','逐漸地','很快','一次過'], isText: true, explain: 'poco a poco = 一點一點地 = 逐漸地。' },
        ]
    };

    const TERMS_GRADE_BANK = { 1:'easy',2:'easy',3:'medium',4:'medium',5:'hard',6:'hard' };

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
        { cat:'dynamics', sym:'pp',        name:'Pianissimo',   meaning:'很弱',           grade:2, img:'img/cards/sym-pp.png' },
        { cat:'dynamics', sym:'p',         name:'Piano',        meaning:'弱',             grade:1, img:'img/cards/sym-p.png' },
        { cat:'dynamics', sym:'mp',        name:'Mezzo-piano',  meaning:'中弱',           grade:1, img:'img/cards/sym-mp.png' },
        { cat:'dynamics', sym:'mf',        name:'Mezzo-forte',  meaning:'中強',           grade:1, img:'img/cards/sym-mf.png' },
        { cat:'dynamics', sym:'f',         name:'Forte',        meaning:'強',             grade:1, img:'img/cards/sym-f.png' },
        { cat:'dynamics', sym:'ff',        name:'Fortissimo',   meaning:'很強',           grade:2, img:'img/cards/sym-ff.png' },
        { cat:'dynamics', sym:'sf',        name:'Sforzando',    meaning:'突強',           grade:4, img:'img/cards/sym-sf.png' },
        { cat:'dynamics', sym:'fp',        name:'Forte-piano',  meaning:'強後即弱',       grade:5, img:'img/cards/sym-fp.png' },
        { cat:'dynamics', sym:'cresc.',    name:'Crescendo',    meaning:'漸強',           grade:2, img:'img/cards/sym-cresc.png' },
        { cat:'dynamics', sym:'decresc.',  name:'Decrescendo',  meaning:'漸弱',           grade:2, img:'img/cards/sym-decresc.png' },
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
        { cat:'articulation', sym:'~',   name:'Legato',    meaning:'連奏',             grade:2 },
        { cat:'articulation', sym:'·',   name:'Staccato',  meaning:'斷奏',             grade:2, img:'img/cards/sym-art-staccato.png' },
        { cat:'articulation', sym:'>',   name:'Accent',    meaning:'重音',             grade:3, img:'img/cards/sym-art-accent.png' },
        { cat:'articulation', sym:'—',   name:'Tenuto',    meaning:'持音（保持音值）', grade:5, img:'img/cards/sym-art-tenuto.png' },
        { cat:'articulation', sym:'𝄐',   name:'Fermata',   meaning:'延長號',           grade:5, img:'img/cards/sym-art-fermata.png' },
        { cat:'articulation', sym:'^',   name:'Marcato',   meaning:'強奏',             grade:6 },
        // 調號 (Key Signatures) — use extracted PDF images
        { cat:'keysig', sym:'0♯ 0♭', name:'C大調 / a小調', meaning:'無升降號',         grade:1, img:'img/cards/keysig-0n.png' },
        { cat:'keysig', sym:'1♯',    name:'G大調 / e小調', meaning:'升 Fa（F♯）',      grade:3, img:'img/cards/keysig-1s.png' },
        { cat:'keysig', sym:'2♯',    name:'D大調 / b小調', meaning:'升 Fa、Do',        grade:4, img:'img/cards/keysig-2s.png' },
        { cat:'keysig', sym:'3♯',    name:'A大調 / f♯小調',meaning:'升 Fa、Do、Sol',   grade:5, img:'img/cards/keysig-3s.png' },
        { cat:'keysig', sym:'4♯',    name:'E大調 / c♯小調',meaning:'升 Fa Do Sol Re', grade:6, img:'img/cards/keysig-4s.png' },
        { cat:'keysig', sym:'1♭',    name:'F大調 / d小調', meaning:'降 Si（B♭）',      grade:3, img:'img/cards/keysig-1f.png' },
        { cat:'keysig', sym:'2♭',    name:'B♭大調 / g小調',meaning:'降 Si、Mi',        grade:4, img:'img/cards/keysig-2f.png' },
        { cat:'keysig', sym:'3♭',    name:'E♭大調 / c小調',meaning:'降 Si、Mi、La',    grade:5, img:'img/cards/keysig-3f.png' },
        { cat:'keysig', sym:'4♭',    name:'A♭大調 / f小調',meaning:'降 Si Mi La Re',   grade:6, img:'img/cards/keysig-4f.png' },
        // 曲式記號 (Form/Repeat)
        { cat:'form', sym:'‖: :‖',  name:'反覆記號',  meaning:'重複演奏一段', grade:2, img:'img/cards/sym-bar-repeat-start.png' },
        { cat:'form', sym:'1.  2.', name:'第一/二括', meaning:'第一/二次結尾',grade:3 },
        { cat:'form', sym:'D.C.',   name:'Da Capo',   meaning:'從頭再奏',     grade:4 },
        { cat:'form', sym:'D.S.',   name:'Dal Segno', meaning:'從記號重奏',   grade:4, img:'img/cards/sym-sym-segno.png' },
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
            return `<div class="study-term-card cat-${escHtml(t.cat)}">
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

    const G3_DIFF_POOL = {
        easy:   () => TERMS_BANK.easy.slice(),
        normal: () => TERMS_BANK.easy.concat(TERMS_BANK.medium),
        hard:   () => TERMS_BANK.medium.concat(TERMS_BANK.hard),
        expert: () => TERMS_BANK.easy.concat(TERMS_BANK.medium, TERMS_BANK.hard),
    };

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
        document.getElementById('g3Visual').innerHTML = q.ksImg
            ? `<div class="ks-quiz-visual"><img src="${escHtml(q.ksImg)}" class="ks-card-img" alt="調號卡" loading="eager">${q.ksCaption ? `<div class="ks-quiz-caption">${q.ksCaption}</div>` : ''}</div>`
            : q.keySig
            ? makeKeySigSvg(q.keySig.count, q.keySig.type)
            : q.img
            ? `<img src="${escHtml(q.img)}" class="quiz-card-img" alt="${escHtml(q.sym || '')}" loading="eager">`
            : `<div class="term-display term-italic">${escHtml(q.sym || '')}</div>`;
        document.getElementById('g3Message').textContent = '📖 快速選出正確答案！';
        document.getElementById('g3Message').className = 'message-box';

        const optEl = document.getElementById('g3Options');
        optEl.innerHTML = '';
        const G3_LETTERS = ['A', 'B', 'C', 'D'];
        q.opts.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-opt-btn';
            btn.dataset.answer = opt;
            btn.innerHTML = `<span class="opt-letter">${G3_LETTERS[i]}</span><span class="opt-text">${escHtml(opt)}</span>`;
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
            ? '<div>🌟 全部答對！你係音樂術語小專家！🎉</div>'
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
        switchScreen('screen-game3-result');
    }

})();



