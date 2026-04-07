(function() {
    // ==========================================
    // 核心設定
    // ==========================================
    const CONFIG = {
        // GAS API (needs to be accessible to all)
        API_URL: "https://script.google.com/macros/s/AKfycbzc2rdfrulFGfo93uVbrXQvDmaBwTlAdUQNuc2eUNBj6zD-cahF6gUuxdlOWl9Ym233/exec",
        
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
        classic60:{ name:'1分鐘挑戰', type:'challenge', duration:60, maxWrong:Infinity, scoreMulti:1 },
        noMiss:   { name:'零失誤挑戰', type:'challenge', duration:Infinity, maxWrong:1, scoreMulti:1.5 }
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
            lastNoteKey: null
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
            }
        };
    }

    // ==========================================
    // 介面切換系統
    // ==========================================
    function switchScreen(screenId) {
        dom.screens.forEach(s => s.classList.remove('active'));
        dom.screenMap.get(screenId)?.classList.add('active');
        
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
        const s = {}; dom.inputs.forEach(el => s[el.id] = el.type==='checkbox' ? el.checked : el.value);
        s.lastMode = state.currentMode;
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
                dom.inputs.forEach(el => { if (s[el.id] !== undefined) { if (el.type==='checkbox') el.checked=s[el.id]; else el.value=s[el.id]; } });
                if (s.lastMode && MODE_CONFIG[s.lastMode]) { state.currentMode = s.lastMode; state.modeConfig = MODE_CONFIG[s.lastMode]; dom.modeCards.forEach(c => c.classList.remove('active')); dom.modeCardMap.get(s.lastMode)?.classList.add('active'); }
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
        handleTextbookModeChange();
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

    function generateNote() {
        const tbMode = dom.textbookMode ? dom.textbookMode.value : "0";
        const config = TEXTBOOK_CONFIG[tbMode];
        let clefOptions = [], accidentalChance = 0, noteRange = [0, 10], allowAbove = true, allowBelow = true;
        
        if (config) { 
            clefOptions = config.clef; accidentalChance = config.accidentalChance; noteRange = config.noteRange; allowAbove = config.ledgerAbove; allowBelow = config.ledgerBelow; 
        } else {
            if(dom.clefTreble && dom.clefTreble.checked) clefOptions.push('treble');
            if(dom.clefBass   && dom.clefBass.checked)   clefOptions.push('bass');
            if (!clefOptions.length) clefOptions = ['treble'];
            accidentalChance = ((dom.accidentalSharp && dom.accidentalSharp.checked) || (dom.accidentalFlat && dom.accidentalFlat.checked)) ? 0.3 : 0;
            
            allowAbove = dom.ledgerLineAbove ? dom.ledgerLineAbove.checked : true; 
            allowBelow = dom.ledgerLineBelow ? dom.ledgerLineBelow.checked : true;
            const rf = dom.noteRangeFrom ? parseInt(dom.noteRangeFrom.value) : 0;
            const rt = dom.noteRangeTo ? parseInt(dom.noteRangeTo.value) : 12;
            noteRange = [Math.min(rf, rt), Math.max(rf, rt)];
        }

        const clef = clefOptions[Math.floor(Math.random() * clefOptions.length)];
        // Bass clef uses its full range; range pickers are treble-only
        const effRange = clef === 'bass' ? [0, MAPS.bass.length - 1] : noteRange;
        const maxIdx = Math.min(effRange[1], MAPS[clef].length - 1);
        const poolSize = maxIdx - effRange[0] + 1;
        const pickBase = () => MAPS[clef][Math.floor(Math.random() * poolSize) + effRange[0]];
        let base = pickBase();
        // Anti-repeat: try once more if same base note as last question (only when pool > 1)
        if (poolSize > 1 && base.letter + base.octave === state.lastNoteKey) base = pickBase();

        let finalName = base.letter, accidental = null;
        if (Math.random() < accidentalChance) {
            const isSharp = Math.random() < 0.5;
            if (isSharp && (dom.accidentalSharp && dom.accidentalSharp.checked) && base.letter !== 'E' && base.letter !== 'B') { finalName += '#'; accidental = '#'; }
            else if (!isSharp && (dom.accidentalFlat && dom.accidentalFlat.checked) && base.letter !== 'F' && base.letter !== 'C') { finalName += '♭'; accidental = '♭'; }
        }
        const note = { ...base, clef, accidental, correctName: finalName, freqKey: finalName + base.octave };
        state.lastNoteKey = base.letter + base.octave;
        return note;
    }

    function buildNoteButtons() {
        const showSharp = dom.accidentalSharp && dom.accidentalSharp.checked;
        const showFlat  = dom.accidentalFlat  && dom.accidentalFlat.checked;

        if (!_noteRowsBuilt) {
            dom.notesGrid.innerHTML = '';
            noteBtnMap.clear();
            const keys = { 'C':'1', 'D':'2', 'E':'3', 'F':'4', 'G':'5', 'A':'6', 'B':'7', 'C#':'Q', 'D#':'W', 'F#':'E', 'G#':'R', 'A#':'T', 'D♭':'A', 'E♭':'S', 'G♭':'D', 'A♭':'F', 'B♭':'G'};
            const gridFrag = document.createDocumentFragment();
            const buildRow = (notes, cls) => {
                const div = document.createElement('div'); div.className = 'note-row';
                notes.forEach(n => {
                    const btn = document.createElement('button'); btn.className = `note-btn ${cls}`; btn.dataset.note = n; btn.disabled = true;
                    const sol = SOLFEGE[n]; btn.innerHTML = `${n}${sol?`<span class="note-sol">${sol}</span>`:''}<span class="key-hint">${keys[n]}</span>`; btn.addEventListener('click', () => handleAnswer(n));
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
        state.lastNoteKey = null;
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

    async function loadRanks(retries) {
        if (retries === undefined) retries = 2;
        dom.rankList.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-light); font-weight:800;">📡 載入中...</div>';
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
    
    function focusLeaderboardToCurrentStudent() {
        if (!state.currentUser?.name) return;
        if (dom.rankGradeFilter) dom.rankGradeFilter.value = String(state.currentUser.grade || 0);
        if (dom.rankClassFilter) dom.rankClassFilter.value = String(state.currentUser.class || '0');
        if (dom.rankModeFilter && state.modeConfig?.type === 'challenge') dom.rankModeFilter.value = state.currentMode;
    }

    function renderRanks() {
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
                const outOfTop50 = selfIndex >= 50 ? '（未顯示於前50名）' : '';
                dom.studentRankHint.innerHTML = `🎯 ${safeName} 同學（${gradeTxt}${clsTxt}）目前排第 <strong>${rankTxt}</strong> 名 ${outOfTop50}`;
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
        dom.rankList.innerHTML = f.slice(0, 50).map((item, i) => {
            const isSelf = isCurrentUserRecord(item);
            const cls = escHtml(item.class); const name = escHtml(item.name);
            const accuracy = parseInt(item.accuracy) || 0; const score = parseInt(item.score) || 0;
            return `<div class="rank-item ${i===0?'first':i===1?'second':i===2?'third':''} ${isSelf?'self':''}">
                <div class="rank-pos">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1+'.'}</div>
                <div class="rank-name">
                    <span class="rank-student-name">${name}</span>
                    <div class="rank-badges">
                        <span class="rank-tag rank-class-tag">${cls}班</span>
                        ${isSelf?'<span class="rank-tag" style="background:var(--primary-purple)">我</span>':''}
                        <span class="rank-tag" style="background:#CBD5E1; color:#333;">${accuracy}% 正確</span>
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
        dom.modeCards.forEach(card => card.addEventListener('click', () => { audio.init(); audio.playClick('select'); dom.modeCards.forEach(c => c.classList.remove('active')); card.classList.add('active'); state.currentMode = card.dataset.mode; state.modeConfig = MODE_CONFIG[state.currentMode]; saveSettings(); }));

        // Practice difficulty selector
        dom.modeCards.forEach(card => card.addEventListener('click', () => {
            if (dom.practiceDiffRow) dom.practiceDiffRow.style.display = card.dataset.mode === 'practice' ? '' : 'none';
        }));
        const diffBtns = document.querySelectorAll('.diff-btn');
        const DIFF_TO_TB = {'1':'1','2':'2','3':'3','4':'5','5':'6'};
        diffBtns.forEach(btn => btn.addEventListener('click', () => {
            audio.init(); audio.playClick('select');
            diffBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (dom.textbookMode) { dom.textbookMode.value = DIFF_TO_TB[btn.dataset.diff]; handleTextbookModeChange(); saveSettings(); }
        }));
        if (dom.practiceDiffRow) dom.practiceDiffRow.style.display = state.currentMode === 'practice' ? '' : 'none';
        { const tbToDiff = {'1':'1','2':'2','3':'3','4':'3','5':'4','6':'5'}; const d = tbToDiff[dom.textbookMode?.value] || '3'; diffBtns.forEach(b => b.classList.toggle('active', b.dataset.diff === d)); }
        
        dom.settingsToggleBtn.addEventListener('click', () => { audio.init(); audio.playClick(); dom.settingsContent.classList.toggle('show'); dom.settingsArrow.textContent = dom.settingsContent.classList.contains('show') ? '▲ 摺疊' : '▼ 展開'; });
        dom.inputs.forEach(el => el.addEventListener('change', () => { audio.init(); audio.playClick(); if (el.id === 'textbookMode') handleTextbookModeChange(); toggleCheckboxAppearance(); saveSettings(); if (el.id.startsWith('clef') || el.id.startsWith('accidental')) { buildNoteButtons(); enableGameControls(false); } }));
        // Note range interlock: keep from <= to
        if (dom.noteRangeFrom && dom.noteRangeTo) {
            dom.noteRangeFrom.addEventListener('change', () => {
                audio.init(); audio.playClick();
                if (parseInt(dom.noteRangeFrom.value) >= parseInt(dom.noteRangeTo.value)) {
                    dom.noteRangeTo.value = String(Math.min(parseInt(dom.noteRangeFrom.value) + 1, 12));
                }
                saveSettings(); enableGameControls(false);
            });
            dom.noteRangeTo.addEventListener('change', () => {
                audio.init(); audio.playClick();
                if (parseInt(dom.noteRangeTo.value) <= parseInt(dom.noteRangeFrom.value)) {
                    dom.noteRangeFrom.value = String(Math.max(parseInt(dom.noteRangeTo.value) - 1, 0));
                }
                saveSettings(); enableGameControls(false);
            });
        }
        
        dom.startBtn.addEventListener('click', startGame); 
        dom.endBtn.addEventListener('click', endGame); 
        dom.backToSetupBtn.addEventListener('click', () => { audio.playClick();
            dom.leaderboardLayout.classList.remove('view-only', 'practice-end');
            switchScreen('screen-setup'); 
        });
        document.getElementById('rankBackBtn')?.addEventListener('click', () => { audio.init(); audio.playClick();
            dom.leaderboardLayout.classList.remove('view-only', 'practice-end');
            switchScreen('screen-setup');
        });
        dom.viewRanksBtn?.addEventListener('click', () => { audio.init(); audio.playClick();
            dom.leaderboardLayout.classList.add('view-only');
            dom.reportGrid.innerHTML = '';
            dom.reportWeakness.innerHTML = '';
            loadRanks();
            switchScreen('screen-leaderboard');
        });
        
        dom.revealBtn.addEventListener('click', () => { if (!state.gameActive || state.answered) return; state.answered = true; state.combo = 0; state.showAnswerHighlight = true; drawStaff(); updateScoreboard(); audio.playNote(state.currentNote.freqKey); const _sol3 = noteSol(state.currentNote); dom.messageBox.textContent = `🔊 答案是 ${state.currentNote.correctName}${_sol3?' = '+_sol3:''}，聽聽看！記住位置，下題加油！`; dom.messageBox.className = 'message-box warning'; enableGameControls(false); setTimeout(() => { dom.messageBox.className = 'message-box'; nextQuestion(); }, 2500); });
        dom.skipBtn.addEventListener('click', () => { if (!state.gameActive || state.answered) return; state.answered = true; state.combo = 0; updateScoreboard(); dom.messageBox.textContent = '⏩ 跳過這題，下一題加油！'; dom.messageBox.className = 'message-box'; setTimeout(() => nextQuestion(), 400); });
        
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
        initEvents();
        initTutorial();
    });
})();
