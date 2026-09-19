(function () {
  "use strict";

  var DATA = window.QUIZ;
  var ALL = DATA.questions.map(function (q, i) { q.id = i; return q; });

  var I18N = {
    ka: {
      skip: "გადასვლა შინაარსზე",
      brand: "კანონების ქვიზი", brandSub: "ამზომველებისთვის",
      eyebrow: "სავარჯიშო ტესტი",
      title: "კანონების ქვიზი ამზომველებისთვის",
      lead: "შეამოწმე ცოდნა საქართველოს იმ ორ კანონში, რომლებიც ამზომველის ყოველდღიურ საქმეს განსაზღვრავს.",
      statQuestions: "კითხვა", statLaws: "კანონი", statLangs: "ენა",
      setupTitle: "ტესტის პარამეტრები",
      pickLaw: "კანონი", pickCount: "კითხვების რაოდენობა", options: "პარამეტრები",
      bothLaws: "ორივე კანონი", bothLawsSub: "ყველა კითხვა ერთად",
      all: "ყველა",
      shuffleQ: "კითხვების არეული თანმიმდევრობა",
      shuffleA: "პასუხების არეული თანმიმდევრობა",
      start: "დაწყება",
      kbdHint: "კლავიატურა: 1–4 პასუხის ასარჩევად, Enter — შემდეგი.",
      lawsTitle: "რას მოიცავს",
      questionsN: "{n} კითხვა",
      quit: "← გასვლა",
      quitConfirm: "ტესტს დაასრულებ? პროგრესი დაიკარგება.",
      counter: "კითხვა {i} / {n}",
      next: "შემდეგი →", finish: "შედეგის ნახვა →",
      right: "სწორია!",
      wrongIs: "არასწორია. სწორი პასუხია: ",
      correct: "სწორი", wrong: "არასწორი",
      resDone: "ტესტი დასრულებულია",
      resGreat: "შესანიშნავია!", resGood: "კარგი შედეგია", resMore: "ღირს გამეორება",
      retryWrong: "მხოლოდ შეცდომების გამეორება",
      again: "თავიდან დაწყება",
      review: "მიმოხილვა", reviewWrong: "შეცდომები", reviewAll: "ყველა",
      yourAnswer: "თქვენი პასუხი: ", rightAnswer: "სწორი პასუხი: ",
      noWrong: "გილოცავთ! ყველა კითხვას სწორად უპასუხეთ.",
      ideaBy: "იდეის ავტორი",
      devBy: "იდეის განმავითარებელი და შემოქმედი",
      nameGogita: "გოგიტა შაინიძე",
      nameGiorgi: "გიორგი კაპანაძე",
      disclaimer: "ტესტი სასწავლო მიზნით შეიქმნა და იურიდიულ კონსულტაციას არ წარმოადგენს. კანონების მოქმედი რედაქცია იხილეთ <a href=\"https://matsne.gov.ge/\" target=\"_blank\" rel=\"noopener\">matsne.gov.ge</a>-ზე.",
      themeToLight: "ნათელ თემაზე გადართვა", themeToDark: "მუქ თემაზე გადართვა",
      docTitle: "კანონების ქვიზი ამზომველებისთვის"
    },
    en: {
      skip: "Skip to content",
      brand: "Law Quiz", brandSub: "for Surveyors",
      eyebrow: "Practice test",
      title: "Law Quiz for Surveyors",
      lead: "Test your knowledge of the two Georgian laws that shape a surveyor’s everyday work.",
      statQuestions: "questions", statLaws: "laws", statLangs: "languages",
      setupTitle: "Quiz settings",
      pickLaw: "Law", pickCount: "Number of questions", options: "Options",
      bothLaws: "Both laws", bothLawsSub: "All questions together",
      all: "All",
      shuffleQ: "Shuffle question order",
      shuffleA: "Shuffle answer order",
      start: "Start",
      kbdHint: "Keyboard: 1–4 to pick an answer, Enter for next.",
      lawsTitle: "What it covers",
      questionsN: "{n} questions",
      quit: "← Quit",
      quitConfirm: "End the quiz? Your progress will be lost.",
      counter: "Question {i} / {n}",
      next: "Next →", finish: "See results →",
      right: "Correct!",
      wrongIs: "Incorrect. The correct answer is: ",
      correct: "correct", wrong: "wrong",
      resDone: "Quiz complete",
      resGreat: "Excellent!", resGood: "Good result", resMore: "Worth another round",
      retryWrong: "Retry mistakes only",
      again: "Start over",
      review: "Review", reviewWrong: "Mistakes", reviewAll: "All",
      yourAnswer: "Your answer: ", rightAnswer: "Correct answer: ",
      noWrong: "Congratulations! You answered every question correctly.",
      ideaBy: "Idea by",
      devBy: "Developed and built by",
      nameGogita: "Gogita Shainidze",
      nameGiorgi: "Giorgi Kapanadze",
      disclaimer: "This quiz is a study aid, not legal advice. The English wording is an unofficial translation. For the current text of the laws, see <a href=\"https://matsne.gov.ge/\" target=\"_blank\" rel=\"noopener\">matsne.gov.ge</a>.",
      themeToLight: "Switch to light theme", themeToDark: "Switch to dark theme",
      docTitle: "Law Quiz for Surveyors"
    }
  };
  var KEYS = { ka: ["ა", "ბ", "გ", "დ"], en: ["A", "B", "C", "D"] };
  var COUNTS = [10, 20, 40, 0]; // 0 = all

  /* ---------- storage (best effort) ---------- */
  function load(k, d) { try { var v = localStorage.getItem("slq-" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem("slq-" + k, JSON.stringify(v)); } catch (e) {} }

  var root = document.documentElement;
  var lang = root.getAttribute("data-lang") === "en" ? "en" : "ka";
  var settings = Object.assign({ law: "all", count: 0, shuffleQ: true, shuffleA: true }, load("settings", {}));

  var run = null;          // { items: [{q, order, pick}], i }
  var reviewMode = "wrong";

  function t(k, vars) {
    var s = I18N[lang][k] || k;
    if (vars) for (var v in vars) s = s.replace("{" + v + "}", vars[v]);
    return s;
  }
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  function where(q) { return q.ch[lang] + (q.art[lang] ? " · " + q.art[lang] : ""); }

  /* ---------- theme ---------- */
  function currentTheme() {
    var t0 = root.getAttribute("data-theme");
    if (t0) return t0;
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function syncThemeBtn() {
    $("themeBtn").setAttribute("aria-label", currentTheme() === "dark" ? t("themeToLight") : t("themeToDark"));
  }
  $("themeBtn").addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("slq-theme", next); } catch (e) {}
    syncThemeBtn();
  });

  /* ---------- language ---------- */
  function applyLang() {
    root.lang = lang;
    root.setAttribute("data-lang", lang);
    document.title = t("docTitle");
    document.querySelectorAll("[data-i18n]").forEach(function (n) { n.textContent = t(n.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-html]").forEach(function (n) { n.innerHTML = t(n.getAttribute("data-i18n-html")); });
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === lang));
    });
    syncThemeBtn();
    renderSetup();
    if (!$("screen-quiz").hidden) renderQuestion();
    if (!$("screen-result").hidden) renderResult();
  }
  document.querySelectorAll("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () {
      lang = b.getAttribute("data-set-lang");
      try { localStorage.setItem("slq-lang", lang); } catch (e) {}
      applyLang();
    });
  });

  /* ---------- screens ---------- */
  function show(name) {
    ["start", "quiz", "result"].forEach(function (s) { $("screen-" + s).hidden = s !== name; });
    window.scrollTo(0, 0);
  }

  /* ---------- setup ---------- */
  function pool() { return settings.law === "all" ? ALL : ALL.filter(function (q) { return q.law === settings.law; }); }

  function renderSetup() {
    $("statTotal").textContent = ALL.length;

    var lc = $("lawChoices");
    lc.innerHTML = "";
    var opts = [{ id: "all", title: t("bothLaws"), sub: t("bothLawsSub"), n: ALL.length }];
    Object.keys(DATA.laws).forEach(function (id) {
      var L = DATA.laws[id];
      opts.push({ id: id, title: L.short[lang], sub: L[lang], n: ALL.filter(function (q) { return q.law === id; }).length });
    });
    opts.forEach(function (o) {
      var lab = el("label", "choice");
      var inp = el("input");
      inp.type = "radio"; inp.name = "law"; inp.value = o.id; inp.checked = settings.law === o.id;
      inp.addEventListener("change", function () { settings.law = o.id; save("settings", settings); renderCounts(); });
      var txt = el("span");
      txt.appendChild(el("b", null, o.title + " · " + t("questionsN", { n: o.n })));
      txt.appendChild(el("small", null, o.sub));
      lab.appendChild(inp); lab.appendChild(txt);
      lc.appendChild(lab);
    });
    renderCounts();

    $("optShuffleQ").checked = settings.shuffleQ;
    $("optShuffleA").checked = settings.shuffleA;

    var cards = $("lawCards");
    cards.innerHTML = "";
    Object.keys(DATA.laws).forEach(function (id) {
      var L = DATA.laws[id];
      var qs = ALL.filter(function (q) { return q.law === id; });
      var chapters = [];
      qs.forEach(function (q) {
        var last = chapters[chapters.length - 1];
        if (last && last.ka === q.ch.ka) last.n++;
        else chapters.push({ ka: q.ch.ka, label: q.ch[lang], n: 1 });
      });
      var c = el("div", "card law-card");
      c.appendChild(el("h3", null, L.short[lang]));
      c.appendChild(el("p", null, L[lang]));
      var ul = el("ul");
      chapters.forEach(function (ch) {
        var li = el("li");
        li.appendChild(el("span", null, ch.label));
        li.appendChild(el("b", null, String(ch.n)));
        ul.appendChild(li);
      });
      c.appendChild(ul);
      cards.appendChild(c);
    });
  }

  function renderCounts() {
    var max = pool().length;
    if (settings.count && settings.count >= max) settings.count = 0;
    var box = $("countChips");
    box.innerHTML = "";
    COUNTS.forEach(function (n) {
      if (n && n >= max) return;
      var lab = el("label", "chip");
      var inp = el("input");
      inp.type = "radio"; inp.name = "count"; inp.value = n; inp.checked = settings.count === n;
      inp.addEventListener("change", function () { settings.count = n; save("settings", settings); });
      lab.appendChild(inp);
      lab.appendChild(el("span", null, n ? String(n) : t("all") + " (" + max + ")"));
      box.appendChild(lab);
    });
  }

  $("optShuffleQ").addEventListener("change", function (e) { settings.shuffleQ = e.target.checked; save("settings", settings); });
  $("optShuffleA").addEventListener("change", function (e) { settings.shuffleA = e.target.checked; save("settings", settings); });

  function startRun(questions) {
    var qs = settings.shuffleQ ? shuffle(questions) : questions.slice();
    run = {
      i: 0,
      items: qs.map(function (q) {
        return { q: q, order: settings.shuffleA ? shuffle([0, 1, 2, 3]) : [0, 1, 2, 3], pick: null };
      })
    };
    show("quiz");
    renderQuestion();
  }

  $("setup").addEventListener("submit", function (e) {
    e.preventDefault();
    var qs = pool();
    if (settings.count) qs = shuffle(qs).slice(0, settings.count).sort(function (a, b) { return a.id - b.id; });
    startRun(qs);
  });

  /* ---------- quiz ---------- */
  function score() {
    var ok = 0, bad = 0;
    run.items.forEach(function (it) { if (it.pick === null) return; if (it.pick === it.q.a) ok++; else bad++; });
    return { ok: ok, bad: bad };
  }

  function renderQuestion() {
    var it = run.items[run.i], q = it.q, n = run.items.length;
    $("counter").textContent = t("counter", { i: run.i + 1, n: n });
    var s = score();
    $("liveScore").innerHTML = "";
    var okB = el("b", "ok", "✓ " + s.ok), badB = el("b", "bad", "✗ " + s.bad);
    $("liveScore").appendChild(okB); $("liveScore").appendChild(document.createTextNode("  ")); $("liveScore").appendChild(badB);
    var pct = Math.round((run.i + (it.pick !== null ? 1 : 0)) / n * 100);
    $("progressBar").style.width = pct + "%";
    $("progress").setAttribute("aria-valuenow", pct);

    $("qLaw").textContent = DATA.laws[q.law].short[lang];
    $("qWhere").textContent = where(q);
    $("qText").textContent = q.q[lang];

    var box = $("qOptions");
    box.innerHTML = "";
    it.order.forEach(function (orig, pos) {
      var b = el("button", "opt");
      b.type = "button";
      b.setAttribute("role", "listitem");
      b.dataset.orig = orig;
      b.appendChild(el("span", "key", KEYS[lang][pos]));
      b.appendChild(el("span", null, q.o[orig][lang]));
      b.addEventListener("click", function () { answer(orig); });
      box.appendChild(b);
    });

    var nb = $("nextBtn");
    nb.textContent = run.i === n - 1 ? t("finish") : t("next");
    paintAnswer();
  }

  function paintAnswer() {
    var it = run.items[run.i], q = it.q;
    var fb = $("qFeedback");
    fb.className = "feedback";
    fb.textContent = "";
    $("nextBtn").disabled = it.pick === null;
    if (it.pick === null) return;
    document.querySelectorAll("#qOptions .opt").forEach(function (b) {
      var o = +b.dataset.orig;
      b.disabled = true;
      if (o === q.a) b.classList.add("correct");
      else if (o === it.pick) b.classList.add("wrong");
      else b.classList.add("dim");
    });
    if (it.pick === q.a) {
      fb.textContent = t("right");
      fb.classList.add("ok");
    } else {
      var pos = it.order.indexOf(q.a);
      fb.textContent = t("wrongIs") + KEYS[lang][pos] + ") " + q.o[q.a][lang];
      fb.classList.add("bad");
    }
  }

  function answer(orig) {
    var it = run.items[run.i];
    if (it.pick !== null) return;
    it.pick = orig;
    renderQuestion();
    $("nextBtn").focus({ preventScroll: true });
  }

  function next() {
    if (run.items[run.i].pick === null) return;
    if (run.i < run.items.length - 1) { run.i++; renderQuestion(); window.scrollTo({ top: 0 }); }
    else { reviewMode = "wrong"; show("result"); renderResult(); }
  }
  $("nextBtn").addEventListener("click", next);

  $("quitBtn").addEventListener("click", function () {
    var answered = run && run.items.some(function (x) { return x.pick !== null; });
    if (answered && !confirm(t("quitConfirm"))) return;
    run = null;
    show("start");
  });

  document.addEventListener("keydown", function (e) {
    if ($("screen-quiz").hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key;
    if (/^[1-4]$/.test(k)) {
      var it = run.items[run.i];
      answer(it.order[+k - 1]);
      e.preventDefault();
    } else if ((k === "Enter" || k === "ArrowRight") && document.activeElement !== $("quitBtn")) {
      if (run.items[run.i].pick !== null) { next(); e.preventDefault(); }
    }
  });

  /* ---------- result ---------- */
  function renderResult() {
    var n = run.items.length, s = score();
    var pct = n ? Math.round(s.ok / n * 100) : 0;
    $("resTitle").textContent = pct >= 90 ? t("resGreat") : pct >= 70 ? t("resGood") : pct >= 1 ? t("resMore") : t("resDone");
    $("resPct").textContent = pct + "%";
    $("resFrac").textContent = s.ok + " / " + n;
    $("ring").style.setProperty("--p", pct);
    $("resOk").textContent = s.ok;
    $("resBad").textContent = s.bad;
    $("retryWrongBtn").hidden = s.bad === 0;

    var bl = $("byLaw");
    bl.innerHTML = "";
    Object.keys(DATA.laws).forEach(function (id) {
      var items = run.items.filter(function (x) { return x.q.law === id; });
      if (!items.length) return;
      var ok = items.filter(function (x) { return x.pick === x.q.a; }).length;
      var row = el("div", "row");
      row.appendChild(el("span", null, DATA.laws[id].short[lang]));
      row.appendChild(el("span", null, ok + " / " + items.length));
      var bar = el("div", "bar"), fill = el("i");
      fill.style.width = Math.round(ok / items.length * 100) + "%";
      bar.appendChild(fill); row.appendChild(bar);
      bl.appendChild(row);
    });

    document.querySelectorAll("[data-review]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-review") === reviewMode));
    });
    renderReview();
  }

  function renderReview() {
    var list = $("reviewList");
    list.innerHTML = "";
    var shown = 0;
    run.items.forEach(function (it, idx) {
      var ok = it.pick === it.q.a;
      if (reviewMode === "wrong" && ok) return;
      shown++;
      var q = it.q;
      var li = el("li", ok ? "ok" : "bad");
      li.appendChild(el("div", "rq", (idx + 1) + ". " + q.q[lang]));
      li.appendChild(el("div", "rw", DATA.laws[q.law].short[lang] + " · " + where(q)));
      if (!ok) li.appendChild(el("div", "ra you", t("yourAnswer") + (it.pick === null ? "—" : q.o[it.pick][lang])));
      li.appendChild(el("div", "ra right", t("rightAnswer") + q.o[q.a][lang]));
      list.appendChild(li);
    });
    if (!shown) list.appendChild(el("li", "review-empty", t("noWrong")));
  }

  document.querySelectorAll("[data-review]").forEach(function (b) {
    b.addEventListener("click", function () {
      reviewMode = b.getAttribute("data-review");
      document.querySelectorAll("[data-review]").forEach(function (x) {
        x.setAttribute("aria-pressed", String(x === b));
      });
      renderReview();
    });
  });

  $("retryWrongBtn").addEventListener("click", function () {
    startRun(run.items.filter(function (x) { return x.pick !== x.q.a; }).map(function (x) { return x.q; }));
  });
  $("againBtn").addEventListener("click", function () { run = null; show("start"); });

  /* ---------- boot ---------- */
  applyLang();
  show("start");
})();
