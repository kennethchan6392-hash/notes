const CHALLENGE_TOKEN_SETS = {
    basic:    [{n:'ta',d:1},{n:'ta',d:1},{n:'ti-ti',d:1},{n:'ta-a',d:2},{n:'休',d:1}],
    medium:   [{n:'ta',d:1},{n:'ti-ti',d:1},{n:'ta-a',d:2},{n:'休',d:1},
               {n:'ti-ri-ti-ri',d:1},{n:'ti-ri',d:1},{n:'ta-i',d:1.5},{n:'ti',d:0.5}],
    advanced: [{n:'ta',d:1},{n:'ti-ti',d:1},{n:'ta-a',d:2},{n:'休',d:1},
               {n:'ti-ri-ti-ri',d:1},{n:'ti-ri',d:1},{n:'ta-i',d:1.5},{n:'ti',d:0.5},
               {n:'ti-ti-ri',d:1},{n:'ti-ri-ti',d:1},{n:'ri-ti-ri',d:1},{n:'ta-a-a',d:3}],
};
const _BEAM_TOKENS = new Set(['ti-ti','ti-ri-ti-ri','ti-ri','ti-ti-ri','ti-ri-ti','ri-ti-ri']);
function getRhythmTokenDuration(token) {
    switch (token) {
        case '休': return 1; case 'ta': return 1; case 'ta-a': return 2;
        case 'ta-a-a': return 3; case 'ta-i': return 1.5; case 'ti': return 0.5;
        case 'ti-ti': return 1; case 'ti-ri-ti-ri': return 1; case 'ti-ri': return 1;
        case 'ti-ti-ri': return 1; case 'ti-ri-ti': return 1; case 'ri-ti-ri': return 1;
        default: return 1;
    }
}
function gen(diff) {
    const tokens = CHALLENGE_TOKEN_SETS[diff];
    const target = 4;
    let remaining = target;
    const parts = [];
    let safety = 0;
    while (remaining > 0.001 && safety++ < 200) {
        const pos = Math.round((target - remaining) * 1000) / 1000;
        const onBeat = Math.abs(pos - Math.round(pos)) < 0.01;
        let eligible = tokens.filter(t => t.d <= remaining + 0.001);
        if (!onBeat) eligible = eligible.filter(t => !_BEAM_TOKENS.has(t.n));
        if (!eligible.length) {
            console.log('STUCK at pos=' + pos + ' remaining=' + remaining + ' parts=' + parts.join(' '));
            break;
        }
        const tok = eligible[Math.floor(Math.random() * eligible.length)];
        parts.push(tok.n);
        remaining = Math.round((remaining - tok.d) * 1000) / 1000;
    }
    const result = parts.join(' ');
    const total = parts.reduce((s,t) => s + getRhythmTokenDuration(t), 0);
    return { result, total };
}
let mFail = 0, aFail = 0;
for (let i = 0; i < 10000; i++) {
    const m = gen('medium');
    if (Math.abs(m.total - 4) > 0.01) { mFail++; if (mFail <= 5) console.log('medium fail:', m); }
    const a = gen('advanced');
    if (Math.abs(a.total - 4) > 0.01) { aFail++; if (aFail <= 5) console.log('advanced fail:', a); }
}
console.log('medium fails:', mFail, '/ 10000');
console.log('advanced fails:', aFail, '/ 10000');
