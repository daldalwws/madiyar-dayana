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

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // не теряем ответы при одновременной отправке
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Шапка таблицы при первом запуске
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Дата ответа', 'Имя', 'Фамилия', 'Присутствие', 'Код',
                       'Венчание', 'Дети', 'Кол-во детей', 'Пожелания', 'Язык']);
      sheet.setFrozenRows(1);
    }

    var p = (e && e.parameter) ? e.parameter : {};
    sheet.appendRow([
      new Date(),
      p.firstName || '',
      p.lastName || '',
      p.attendanceText || '',   // человекочитаемо: «Приду один / одна» и т.п.
      p.attendance || '',       // код: alone | couple | no
      p.venchanie || '',        // Да / Нет (только расширенная анкета)
      p.kids || '',             // Да / Нет
      p.kidsCount || '',        // число детей
      p.wishes || '',
      p.lang || ''
    ]);

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
    .createTextOutput('OK — анкета свадьбы Мадияр & Даяна готова принимать ответы.')
    .setMimeType(ContentService.MimeType.TEXT);
}
