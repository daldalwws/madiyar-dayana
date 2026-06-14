/**
 * Анкета свадьбы Мадияр & Даяна → Google Таблицы (без базы данных, бесплатно).
 *
 * КАК ПОДКЛЮЧИТЬ (подробно в README.md):
 *  1. Создайте Google Таблицу: https://sheets.new
 *  2. Меню: Расширения → Apps Script (Extensions → Apps Script).
 *  3. Удалите весь код в редакторе и вставьте ЭТОТ файл целиком.
 *  4. Нажмите «Сохранить» (значок дискеты).
 *  5. Deploy → New deployment → шестерёнка → тип «Web app».
 *       - Description: любое;
 *       - Execute as: Me (вы);
 *       - Who has access: Anyone (Все).
 *     Нажмите Deploy, разрешите доступ к аккаунту.
 *  6. Скопируйте «Web app URL» (заканчивается на /exec).
 *  7. Вставьте этот URL в файл assets/rsvp.js → const SCRIPT_URL = "...";
 *
 * После любого ИЗМЕНЕНИЯ кода делайте Deploy → Manage deployments → Edit → Version: New version.
 */

// Название листа, куда писать ответы (создаётся автоматически).
var SHEET_NAME = 'Ответы';

// --- Telegram-уведомления (заполни в СВОЁМ Apps Script, в репозиторий НЕ коммить) ---
var TG_TOKEN   = '';   // токен от @BotFather, напр. '123456:ABC...'
var TG_CHAT_ID = '';   // твой chat_id (узнать через @userinfobot)

function notifyTelegram_(p) {
  if (!TG_TOKEN || !TG_CHAT_ID) return;
  var txt = '🎉 Новый ответ на свадьбу\n'
    + '👤 ' + (p.firstName || '') + ' ' + (p.lastName || '') + '\n'
    + '✅ ' + (p.attendanceText || p.attendance || '') + '\n'
    + '👶 Дети: ' + (p.kids || '—') + ' (' + (p.kidsCount || '0') + ')'
    + (p.wishes ? '\n💬 ' + p.wishes : '');
  UrlFetchApp.fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
    method: 'post',
    payload: { chat_id: TG_CHAT_ID, text: txt, disable_web_page_preview: 'true' },
    muteHttpExceptions: true
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // не теряем ответы при одновременной отправке
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Шапка таблицы при первом запуске
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Дата ответа', 'Имя', 'Фамилия', 'Присутствие', 'Код',
                       'Дети', 'Кол-во детей', 'Пожелания', 'Язык']);
      sheet.setFrozenRows(1);
    }

    var p = (e && e.parameter) ? e.parameter : {};
    sheet.appendRow([
      new Date(),
      p.firstName || '',
      p.lastName || '',
      p.attendanceText || '',   // человекочитаемо: «Приду один / одна» и т.п.
      p.attendance || '',       // код: alone | couple | no
      p.kids || '',             // Да / Нет (будут ли дети)
      p.kidsCount || '',        // число детей
      p.wishes || '',
      p.lang || ''
    ]);

    try { notifyTelegram_(p); } catch (e) {} // пуш в Telegram, не ломает приём анкеты

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Открытие URL в браузере (GET) — простая проверка, что веб-приложение работает.
function doGet() {
  return ContentService
    .createTextOutput('OK — анкета свадьбы Madiyar & Dayana готова принимать ответы.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/* ============================================================
   ДАШБОРД ГОСТЕЙ — лист «Дашборд» (разбор и подсчёт)
   Запуск: меню «🎛 Дашборд → Построить / обновить»
           либо Run → buildDashboard в редакторе скрипта.
   Подсчёт: alone=1, couple=2, no=0, плюс «Кол-во детей». Лимит ниже.
   ============================================================ */
var GUEST_LIMIT = 144;

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🎛 Дашборд')
    .addItem('Построить / обновить', 'buildDashboard')
    .addToUi();
}

function buildDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // Разделители формул зависят от локали таблицы (RU/KZ → «;» и «\»).
  var loc = (ss.getSpreadsheetLocale() || 'en_US');
  var S = /^en_/.test(loc) ? ',' : ';';    // разделитель аргументов
  var AC = /^en_/.test(loc) ? ',' : '\\';  // разделитель столбцов inline-массива
  var src = ss.getSheetByName(SHEET_NAME); // 'Ответы'
  if (!src) {
    SpreadsheetApp.getUi().alert('Лист «' + SHEET_NAME + '» не найден. Сначала должны прийти ответы анкеты.');
    return;
  }

  var sh = ss.getSheetByName('Дашборд');
  if (!sh) sh = ss.insertSheet('Дашборд', 0);
  sh.getCharts().forEach(function (c) { sh.removeChart(c); });
  sh.clear();
  sh.clearConditionalFormatRules();
  try { sh.setHiddenGridlines(true); } catch (e) {}

  sh.setColumnWidth(1, 185);
  sh.setColumnWidth(2, 120);
  sh.setColumnWidth(3, 26);
  sh.setColumnWidth(4, 150);
  sh.setColumnWidth(5, 95);

  // Заголовок
  sh.getRange('A1:F1').merge()
    .setValue('🎀 Дашборд гостей — Madiyar & Dayana   ·   лимит ' + GUEST_LIMIT)
    .setFontSize(15).setFontWeight('bold').setFontColor('#ffffff')
    .setBackground('#2f356e').setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.setRowHeight(1, 44);

  // ---- ПОДСЧЁТ ГОСТЕЙ (A3..B9) ----
  sh.getRange('A3').setValue('ПОДСЧЁТ ГОСТЕЙ').setFontWeight('bold').setFontColor('#ab6f78');
  var labels1 = [['Лимит мест'], ['Взрослых'], ['Детей'], ['Придёт гостей'], ['Осталось мест'], ['Заполнено']];
  sh.getRange(4, 1, labels1.length, 1).setValues(labels1).setFontWeight('bold');
  sh.getRange('B4').setValue(GUEST_LIMIT);
  sh.getRange('B5').setFormula('=SUMPRODUCT((\'Ответы\'!E2:E2000="couple")*2)+SUMPRODUCT((\'Ответы\'!E2:E2000="alone")*1)');
  sh.getRange('B6').setFormula('=SUMPRODUCT((\'Ответы\'!E2:E2000<>"no")*(\'Ответы\'!E2:E2000<>"")*IFERROR(VALUE(\'Ответы\'!G2:G2000&"")' + S + '0))');
  sh.getRange('B7').setFormula('=B5+B6');
  sh.getRange('B8').setFormula('=B4-B7');
  sh.getRange('B9').setFormula('=SPARKLINE(IFERROR(B7/B4' + S + '0)' + S + '{"charttype"' + AC + '"bar";"max"' + AC + '1;"color1"' + AC + '"#b06c74";"empty"' + AC + '"zero"})');
  sh.getRange('A7:B7').setBackground('#eef0f8');
  sh.getRange('B7').setFontSize(18).setFontWeight('bold').setFontColor('#2f356e');
  sh.getRange('B8').setFontSize(13).setFontWeight('bold');

  // ---- ОТВЕТЫ (A11..B15) ----
  sh.getRange('A11').setValue('ОТВЕТЫ').setFontWeight('bold').setFontColor('#ab6f78');
  var labels2 = [['Всего ответов'], ['Придут один'], ['Придут с парой'], ['Не смогут'], ['Семей с детьми']];
  sh.getRange(12, 1, labels2.length, 1).setValues(labels2).setFontWeight('bold');
  sh.getRange('B12').setFormula('=COUNTA(\'Ответы\'!B2:B2000)');
  sh.getRange('B13').setFormula('=COUNTIF(\'Ответы\'!E2:E2000' + S + '"alone")');
  sh.getRange('B14').setFormula('=COUNTIF(\'Ответы\'!E2:E2000' + S + '"couple")');
  sh.getRange('B15').setFormula('=COUNTIF(\'Ответы\'!E2:E2000' + S + '"no")');
  sh.getRange('B16').setFormula('=COUNTIF(\'Ответы\'!F2:F2000' + S + '"Да")');

  // ---- разбивка для диаграммы (D4:E6) ----
  sh.getRange('D3').setValue('Разбивка').setFontWeight('bold').setFontColor('#ab6f78');
  sh.getRange('D4:E6').setValues([
    ['Придут один', '=B13'],
    ['С парой', '=B14'],
    ['Не смогут', '=B15']
  ]);

  // Pie chart справа (анкер G3)
  var chart = sh.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(sh.getRange('D4:E6'))
    .setPosition(3, 7, 0, 0)
    .setOption('title', 'Гости по статусу')
    .setOption('width', 380).setOption('height', 240)
    .setOption('pieHole', 0.4)
    .setOption('colors', ['#9fb38c', '#b06c74', '#c9c4d6'])
    .build();
  sh.insertChart(chart);

  // ---- список гостей (кто придёт) ----
  sh.getRange('A18').setValue('СПИСОК ГОСТЕЙ (кто придёт)').setFontWeight('bold').setFontColor('#ab6f78');
  sh.getRange('A19:E19').setValues([['Имя', 'Фамилия', 'Присутствие', 'Детей', 'Дата ответа']])
    .setFontWeight('bold').setBackground('#f3eef5');
  sh.getRange('A20').setFormula('=IFERROR(QUERY(\'Ответы\'!A2:I2000' + S + ' "select B, C, D, G, A where E=\'alone\' or E=\'couple\' order by A desc"' + S + ' 0)' + S + ' "Пока нет подтверждений")');
  sh.getRange('E20:E300').setNumberFormat('dd.mm.yyyy hh:mm');

  // осталось < 0 → красный
  var rule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(0).setBackground('#f4c7c3').setRanges([sh.getRange('B8')]).build();
  sh.setConditionalFormatRules([rule]);

  sh.setFrozenRows(1);
  ss.setActiveSheet(sh);
  try { ss.moveActiveSheet(1); } catch (e) {}
}
