// ============================================================
// 音符小精靈 — Google Apps Script 排行榜後端
// 支援：遊戲一（音名辨別）、遊戲二（節奏挑戰）、遊戲三（音樂術語）
// ============================================================

// 對應 game 欄位 → 工作表名稱
const GAME_SHEETS = {
  game1: '音名辨別',
  game2: '節奏挑戰',
  game3: '音樂術語'
};

// 欄位順序（與現有工作表一致）
// name | grade | class | id | mode | mode_name | score | max_combo | total_questions | accuracy | timestamp
const COLUMNS = ['name','grade','class','id','mode','mode_name','score','max_combo','total_questions','accuracy','timestamp'];

// ── 工具：取得或建立指定工作表 ──────────────────────────────
function getSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length)
      .setFontWeight('bold')
      .setBackground('#8B66FF')
      .setFontColor('#FFFFFF');
    sheet.setColumnWidths(1, COLUMNS.length, 130);
  }
  return sheet;
}

// ── 接收分數（POST） ─────────────────────────────────────────
function doPost(e) {
  try {
    const raw = e.postData && e.postData.contents ? e.postData.contents : '{}';
    const rec = JSON.parse(raw);

    if (!rec.name || !rec.game) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'missing required fields' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheetName = GAME_SHEETS[rec.game] || GAME_SHEETS['game1'];
    const sheet = getSheet(sheetName);

    // 寫入順序必須與 COLUMNS 一致
    sheet.appendRow([
      String(rec.name             || '').trim(),
      String(rec.grade            || ''),
      String(rec.class            || '').trim(),
      String(rec.id               || '').trim(),
      String(rec.mode             || ''),
      String(rec.mode_name        || ''),
      parseInt(rec.score)         || 0,
      parseInt(rec.max_combo)     || 0,
      parseInt(rec.total_questions) || 0,
      parseInt(rec.accuracy)      || 0,
      rec.timestamp               || new Date().toLocaleString('zh-TW')
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── 讀取排行榜（GET） ────────────────────────────────────────
// 合併三個工作表，每筆紀錄加上 game 欄位供前端篩選
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let allRows = [];

    Object.entries(GAME_SHEETS).forEach(([gameKey, sheetName]) => {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return;
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) return;

      const headers = data[0];
      data.slice(1).forEach(row => {
        const obj = { game: gameKey };
        headers.forEach((h, i) => { obj[h] = row[i]; });
        allRows.push(obj);
      });
    });

    return ContentService
      .createTextOutput(JSON.stringify(allRows))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── OPTIONS（CORS preflight） ────────────────────────────────
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ── 本地測試用（在 GAS 編輯器執行） ─────────────────────────
function testPost() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        game: 'game1',
        name: '測試學生',
        grade: '4',
        class: 'A',
        id: '1',
        mode: 'classic60',
        mode_name: '高音譜號挑戰',
        score: 120,
        max_combo: 15,
        accuracy: 90,
        total_questions: 20,
        timestamp: new Date().toLocaleString('zh-TW')
      })
    }
  };
  const result = doPost(fakeEvent);
  Logger.log(result.getContent());
}

function testGet() {
  const result = doGet({});
  Logger.log(result.getContent().slice(0, 500));
}
