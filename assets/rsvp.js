/* ============================================================
   Свадьба Мадияр & Даяна — общая логика для всех вариантов
   ------------------------------------------------------------
   1) ВСТАВЬТЕ сюда ссылку на ваш Google Apps Script (Web app URL)
      после деплоя (см. README.md, раздел «Анкета в Google Таблицы»).
   ============================================================ */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzbgom_nTSSHmwXZMEH2Ic4tui6DjBYIYcuYatqlTbvMfsrHXTJCqihPT7DPYwltDoE/exec";

/* Дата и время свадьбы: 26 сентября 2026, 18:00 по Алматы (UTC+5) */
const WEDDING_TS = Date.UTC(2026, 8, 26, 12, 0, 0); // 12:00 UTC = 17:00 Алматы (начало в 17:00)

/* ------------------------------------------------------------
   Переводы RU / KZ. Элемент с data-i18n="ключ" получает текст.
   Для placeholder используйте data-i18n-ph="ключ".
   ------------------------------------------------------------ */
const I18N = {
  ru: {
    "hero.invite": "Приглашение на свадьбу",
    "hero.scroll": "Листайте вниз",
    "countdown.title": "До нашего праздника осталось",
    "countdown.days": "дней",
    "countdown.hours": "часов",
    "countdown.minutes": "минут",
    "countdown.seconds": "секунд",
    "invite.heading": "Дорогие гости!",
    "invite.text": "Мы с радостью приглашаем вас разделить с нами один из самых счастливых дней нашей жизни — день нашей свадьбы. Будем благодарны, если вы найдёте время и подтвердите своё присутствие в анкете ниже.",
    "when.title": "Когда",
    "when.date": "26 сентября 2026 · суббота",
    "when.time": "Начало в 17:00",
    "where.title": "Где",
    "where.venue": "Premier Hall",
    "where.address": "г. Алматы, ул. Умурзакова 76 (уг. Шевченко, рядом с пр. Гагарина)",
    "where.map": "Открыть на карте",
    "gallery.title": "Наши моменты",
    "rsvp.title": "Подтвердите присутствие",
    "rsvp.subtitle": "Пожалуйста, заполните анкету — нам важно знать, что вы будете рядом.",
    "rsvp.firstName": "Имя",
    "rsvp.lastName": "Фамилия",
    "rsvp.attendanceLabel": "Сможете ли вы прийти?",
    "rsvp.alone": "Приду один / одна",
    "rsvp.couple": "Приду с супругом / супругой",
    "rsvp.no": "К сожалению, не смогу прийти",
    "rsvp.wishes": "Пожелания молодожёнам",
    "rsvp.wishesPh": "Ваши тёплые слова (необязательно)",
    "rsvp.submit": "Отправить ответ",
    "rsvp.sending": "Отправляем…",
    "rsvp.success": "Спасибо! Ваш ответ получен 💛",
    "rsvp.error": "Не удалось отправить. Проверьте интернет и попробуйте ещё раз.",
    "rsvp.required": "Пожалуйста, укажите имя, фамилию и выберите вариант.",
    "footer.text": "Будем рады видеть вас!",
    "music.play": "Включить музыку",
    "music.pause": "Выключить музыку",
    "nav.home": "Главная",
    "nav.details": "Детали",
    "nav.rsvp": "Анкета",
    "wc.weMarry": "Мы женимся",
    "wc.tapOpen": "Нажмите, чтобы открыть",
    "wc.invited": "Вы приглашены на свадьбу",
    "wc.dearGuests": "Дорогие гости!",
    "wc.greetText": "Вы приглашены на особенное событие — празднование нашего бракосочетания. День, когда две судьбы соединятся в одну историю, наполненную любовью, теплом и счастьем.",
    "wc.timing": "Тайминг",
    "wc.t1time": "17:00",
    "wc.t1label": "Сбор гостей · Фуршет",
    "wc.t3time": "18:00",
    "wc.t3label": "Начало тоя",
    "wc.sayYes": "Мы говорим друг другу «да»",
    "wc.locText": "Среди уюта и торжества — в Premier Hall, Алматы.",
    "wc.openMap": "Открыть карту",
    "wc.dresscode": "Дресс код",
    "wc.dresscodeNote": "Будем благодарны, если вы поддержите цветовую гамму торжества.",
    "wc.anketa": "Анкета",
    "wc.fillForm": "Заполните, пожалуйста, анкету",
    "wc.nameFamily": "Имя Фамилия",
    "wc.willCome": "Сможете ли Вы прийти?",
    "wc.comeAlone": "Да, я приду один (одна)",
    "wc.comeCouple": "Да, я приду с супругой (-ом)",
    "wc.comeNo": "Нет, я не смогу прийти",
    "wc.venchanie": "Сможете ли Вы присутствовать на венчании?",
    "wc.venYes": "Да, смогу",
    "wc.venNo": "Нет, не смогу",
    "wc.kids": "Будут ли с Вами дети?",
    "wc.kidsYes": "Да",
    "wc.kidsNo": "Нет",
    "wc.kidsCount": "Сколько детей будет с вами?",
    "wc.submit": "Отправить",
    "wc.regards": "С уважением, Madiyar & Dayana"
  },
  kz: {
    "hero.invite": "Үйлену тойына шақыру",
    "hero.scroll": "Төмен қарай жылжытыңыз",
    "countdown.title": "Мерекемізге дейін қалды",
    "countdown.days": "күн",
    "countdown.hours": "сағат",
    "countdown.minutes": "минут",
    "countdown.seconds": "секунд",
    "invite.heading": "Қымбатты қонақтар!",
    "invite.text": "Өміріміздегі ең бақытты күндердің бірін — үйлену тойымызды — сіздермен бөлісуге шын жүректен шақырамыз. Төмендегі сауалнаманы толтырып, қатысатыныңызды растасаңыз, ризашылығымызды білдіреміз.",
    "when.title": "Қашан",
    "when.date": "26 қыркүйек 2026 · сенбі",
    "when.time": "Басталуы 17:00",
    "where.title": "Қайда",
    "where.venue": "Premier Hall",
    "where.address": "Алматы қ., Умурзаков көшесі 76 (Шевченко қиылысы, Гагарин даңғылы маңы)",
    "where.map": "Картадан ашу",
    "gallery.title": "Біздің сәттер",
    "rsvp.title": "Қатысуыңызды растаңыз",
    "rsvp.subtitle": "Өтінеміз, сауалнаманы толтырыңыз — жаныңызда болғаныңыз біз үшін маңызды.",
    "rsvp.firstName": "Атыңыз",
    "rsvp.lastName": "Тегіңіз",
    "rsvp.attendanceLabel": "Келе аласыз ба?",
    "rsvp.alone": "Жалғыз келемін",
    "rsvp.couple": "Жұбайыммен келемін",
    "rsvp.no": "Өкінішке орай, келе алмаймын",
    "rsvp.wishes": "Жас жұбайларға тілектер",
    "rsvp.wishesPh": "Жылы лебізіңіз (міндетті емес)",
    "rsvp.submit": "Жауапты жіберу",
    "rsvp.sending": "Жіберілуде…",
    "rsvp.success": "Рахмет! Жауабыңыз қабылданды 💛",
    "rsvp.error": "Жіберілмеді. Интернетті тексеріп, қайталап көріңіз.",
    "rsvp.required": "Өтінеміз, атыңызды, тегіңізді көрсетіп, нұсқаны таңдаңыз.",
    "footer.text": "Сізді күтеміз!",
    "music.play": "Музыканы қосу",
    "music.pause": "Музыканы өшіру",
    "nav.home": "Басты",
    "nav.details": "Толығырақ",
    "nav.rsvp": "Сауалнама",
    "wc.weMarry": "Біз үйленеміз",
    "wc.tapOpen": "Ашу үшін басыңыз",
    "wc.invited": "Сіз тойға шақырылдыңыз",
    "wc.dearGuests": "Қымбатты қонақтар!",
    "wc.greetText": "Сіз ерекше оқиғаға — біздің неке тойымызға шақырылдыңыз. Екі тағдыр махаббатқа, жылулық пен бақытқа толы бір тарихқа айналатын күн.",
    "wc.timing": "Бағдарлама",
    "wc.t1time": "17:00",
    "wc.t1label": "Қонақтарды қарсы алу · Фуршет",
    "wc.t3time": "18:00",
    "wc.t3label": "Тойдың басталуы",
    "wc.sayYes": "Бір-бірімізге «иә» дейміз",
    "wc.locText": "Жайлылық пен салтанат аясында — Premier Hall, Алматы.",
    "wc.openMap": "Картаны ашу",
    "wc.dresscode": "Дресс-код",
    "wc.dresscodeNote": "Тойдың түс палитрасын қолдасаңыз, ризамыз.",
    "wc.anketa": "Сауалнама",
    "wc.fillForm": "Сауалнаманы толтырыңыз",
    "wc.nameFamily": "Аты-жөні",
    "wc.willCome": "Келе аласыз ба?",
    "wc.comeAlone": "Иә, жалғыз келемін",
    "wc.comeCouple": "Иә, жұбайыммен келемін",
    "wc.comeNo": "Жоқ, келе алмаймын",
    "wc.venchanie": "Неке қиюда бола аласыз ба?",
    "wc.venYes": "Иә, боламын",
    "wc.venNo": "Жоқ, бола алмаймын",
    "wc.kids": "Сізбен бірге балалар бола ма?",
    "wc.kidsYes": "Иә",
    "wc.kidsNo": "Жоқ",
    "wc.kidsCount": "Қанша бала болады?",
    "wc.submit": "Жіберу",
    "wc.regards": "Құрметпен, Madiyar & Dayana"
  }
};

let currentLang = localStorage.getItem("md_lang") || "ru";

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem("md_lang", lang);
  document.documentElement.lang = lang;
  const dict = I18N[lang];

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] != null) el.textContent = dict[key];
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    const key = el.getAttribute("data-i18n-ph");
    if (dict[key] != null) el.setAttribute("placeholder", dict[key]);
  });

  // подсветка активной кнопки переключателя
  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.getAttribute("data-lang-btn") === lang);
    btn.setAttribute("aria-pressed", btn.getAttribute("data-lang-btn") === lang);
  });
}

function initLangSwitcher() {
  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.getAttribute("data-lang-btn")));
  });
  applyLang(currentLang);
}

/* ------------------- Обратный отсчёт ------------------- */
function initCountdown() {
  const root = document.querySelector("[data-countdown]");
  if (!root) return;
  const elDays = root.querySelector("[data-cd='days']");
  const elHours = root.querySelector("[data-cd='hours']");
  const elMin = root.querySelector("[data-cd='minutes']");
  const elSec = root.querySelector("[data-cd='seconds']");

  function tick() {
    let diff = Math.max(0, WEDDING_TS - Date.now());
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    const pad = (n) => String(n).padStart(2, "0");
    if (elDays) elDays.textContent = d;
    if (elHours) elHours.textContent = pad(h);
    if (elMin) elMin.textContent = pad(m);
    if (elSec) elSec.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);
}

/* ------------------- Музыка ------------------- */
function initMusic() {
  const btn = document.querySelector("[data-music-btn]");
  if (!btn) return;
  const audio = document.getElementById("bg-music");
  if (!audio) return;
  audio.loop = true;
  audio.volume = 0.6;
  let playing = false;

  function setState(on) {
    playing = on;
    btn.classList.toggle("is-playing", on);
    btn.setAttribute("aria-label", I18N[currentLang][on ? "music.pause" : "music.play"]);
  }
  btn.addEventListener("click", () => {
    if (playing) {
      audio.pause();
      setState(false);
    } else {
      audio.play().then(() => setState(true)).catch(() => setState(false));
    }
  });
  setState(false);
}

/* ------------------- Анкета (RSVP) ------------------- */
function initForm() {
  const form = document.querySelector("[data-rsvp-form]");
  if (!form) return;
  const status = form.querySelector("[data-rsvp-status]");
  const submitBtn = form.querySelector("[type='submit']");
  const submitLabel = submitBtn ? submitBtn.querySelector("[data-i18n]") : null;

  function say(key, type) {
    if (!status) return;
    status.textContent = I18N[currentLang][key] || key;
    status.className = "rsvp-status is-" + type;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const firstName = (fd.get("firstName") || "").toString().trim();
    const lastName = (fd.get("lastName") || "").toString().trim();
    const attendance = (fd.get("attendance") || "").toString();

    if (!firstName || !lastName || !attendance) {
      say("rsvp.required", "error");
      return;
    }
    if (!SCRIPT_URL) {
      // На случай, если ссылка ещё не вставлена — не теряем ответ молча.
      say("rsvp.error", "error");
      console.warn("SCRIPT_URL не задан в assets/rsvp.js");
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    say("rsvp.sending", "info");

    // человекочитаемая метка варианта присутствия (на текущем языке)
    const attendanceText = I18N[currentLang][
      attendance === "alone" ? "rsvp.alone" : attendance === "couple" ? "rsvp.couple" : "rsvp.no"
    ];

    // Доп. поля расширенной анкеты (есть только в variant-watercolor; в остальных — пусто).
    // В таблицу пишем по-русски для единообразия, независимо от языка интерфейса.
    const yn = (v) => v === "yes" ? "Да" : v === "no" ? "Нет" : "";
    const kids = yn((fd.get("kids") || "").toString());
    const kidsCount = (fd.get("kidsCount") || "").toString();

    const body = new URLSearchParams({
      firstName,
      lastName,
      attendance,
      attendanceText,
      wishes: (fd.get("wishes") || "").toString().trim(),
      kids,
      kidsCount,
      lang: currentLang
    });

    try {
      await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body });
      say("rsvp.success", "success");
      form.reset();
    } catch (err) {
      say("rsvp.error", "error");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

/* ------------------- Плавное появление при скролле ------------------- */
function initReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach((el) => io.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  initLangSwitcher();
  initCountdown();
  initMusic();
  initForm();
  initReveal();
});
