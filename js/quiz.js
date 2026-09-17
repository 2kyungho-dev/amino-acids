/* =========================================================================
   quiz.js — round builder + question runner.

   What it does differently from a plain random-multiple-choice loop:
     * targets are drawn without replacement, one full cycle at a time, so a
       20-question round covers 20 different amino acids
     * "focus mode" weights the draw towards the ones you keep missing
     * distractors are deliberately tempting (same class, or the letter you
       would have guessed) instead of uniformly random
     * every answer opens a reveal card, so a wrong answer teaches something
     * answer with the keyboard: 1-4 / A-D, Enter to continue
     * scores persist per amino acid and feed back into the study view
   ========================================================================= */
window.Quiz = (function () {
  'use strict';

  var TYPES = [
    { id: 'struct2name', label: 'Structure → name',  d: 'See the molecule, name it' },
    { id: 'name2struct', label: 'Name → structure',  d: 'Pick the right drawing' },
    { id: 'rgroup',      label: 'R group → name',    d: 'Match the side-chain formula' },
    { id: 'one2name',    label: '1-letter → name',   d: 'F, W, Q, K…' },
    { id: 'name2one',    label: 'Name → 1-letter',   d: 'The tricky half of the codes' },
    { id: 'name2three',  label: 'Name → 3-letter',   d: 'Asn vs Asp, Gln vs Glu' },
    { id: 'category',    label: 'Class',             d: 'Nonpolar / polar / basic / acidic' },
    { id: 'name2scode',  label: 'Name → code',       d: '이름 → 구조 코드 (112, 1헥…)' },
    { id: 'scode2name',  label: 'Code → name',       d: '구조 코드 → 이름' }
  ];
  var DEFAULT = {
    len: 20, types: TYPES.map(function (t) { return t.id; }),
    cats: ['nonpolar', 'polar', 'basic', 'acidic'], adaptive: true, typed: true
  };

  var cfg = null, st = null;

  function root() { return document.getElementById('view-quiz'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function strip(s) { return String(s).replace(/<[^>]+>/g, ''); }
  function norm(x) { return String(x).toLowerCase().replace(/[\s\-.,'’·]/g, ''); }
  /* structure codes: letter O and digit 0 are interchangeable when typed */
  function normCode(x) { return norm(x).replace(/o/g, '0'); }
  function codeWords(a) { return [a.scode, window.romanCode(a.scode)]; }
  function otherCodes(target) {
    var out = [];
    window.AA.forEach(function (a) { if (a.key !== target.key) out = out.concat(codeWords(a)); });
    return out;
  }

  function editDist(a, b) {
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) d[i] = [i];
    for (j = 0; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1,
                         d[i - 1][j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
    return d[a.length][b.length];
  }
  /* distance to the nearest of `words`; short words are exact-match only, so
     a one-letter code can never be reached by a typo */
  function bestDist(given, words) {
    var best = 99;
    words.forEach(function (w) {
      if (w.length < 5) { if (given === w) best = 0; return; }
      best = Math.min(best, editDist(given, w));
    });
    return best;
  }
  function tolerance(given) { return given.length <= 6 ? 1 : 2; }

  var CAT_WORDS = {
    nonpolar: ['nonpolar', 'nonpolarhydrophobic', 'hydrophobic', '비극성', '소수성'],
    polar:    ['polar', 'polaruncharged', 'uncharged', '극성'],
    basic:    ['basic', 'base', 'positive', 'positivelycharged', '염기성', '염기'],
    acidic:   ['acidic', 'acid', 'negative', 'negativelycharged', '산성']
  };
  /* every spelling that should count as naming this amino acid */
  function nameWords(a) { return [a.name, a.three, a.one].concat(a.alias || []); }

  /* turn a question into a free-text one. `accept` is every spelling that
     counts; `reject` is what the *other* candidates are called, so a typo is
     only forgiven when it is unambiguously aimed at the right answer —
     "glutamine" never slides through as "glutamic acid". */
  function typedAs(q, kind, shown, accept, reject) {
    if (!cfg.typed) return;
    q.typed = true;
    q.typedKind = kind;
    q.answerText = shown;
    q.accept = accept.map(norm);
    q.reject = (reject || []).map(norm);
  }

  function otherNames(target) {
    var out = [];
    window.AA.forEach(function (a) { if (a.key !== target.key) out = out.concat(nameWords(a)); });
    return out;
  }
  function otherClasses(target) {
    var out = [];
    window.CAT_ORDER.forEach(function (c) { if (c !== target.cat) out = out.concat(CAT_WORDS[c]); });
    return out;
  }

  /* ---------- picking targets ---------- */
  function weight(a) {
    var acc = window.Store.accuracy(a.key);
    if (acc === null) return 2.4;                 // never seen -> show it
    return 0.35 + 2.6 * (1 - acc);
  }
  function weightedDraw(pool) {
    var total = pool.reduce(function (s, a) { return s + weight(a); }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < pool.length; i++) { r -= weight(pool[i]); if (r <= 0) return i; }
    return pool.length - 1;
  }
  function chooseTargets(pool, n, adaptive) {
    var out = [];
    while (out.length < n) {
      var cycle = pool.slice();
      while (cycle.length && out.length < n) {
        var i = adaptive ? weightedDraw(cycle) : Math.floor(Math.random() * cycle.length);
        out.push(cycle.splice(i, 1)[0]);
      }
    }
    return out;
  }

  /* ---------- distractors ---------- */
  function otherAA(target, n, preferSameClass) {
    var pool = window.AA.filter(function (a) { return a.key !== target.key; });
    var same = pool.filter(function (a) { return a.cat === target.cat; });
    if (preferSameClass && same.length >= n && Math.random() < 0.6) return shuffle(same).slice(0, n);
    return shuffle(pool).slice(0, n);
  }
  /* letters people actually confuse: the initial you'd guess, plus the
     codes of other amino acids sharing that initial */
  function codeDistractors(target, field) {
    var want = target[field], seen = {}, out = [];
    function push(v) { if (v && v !== want && !seen[v]) { seen[v] = 1; out.push(v); } }
    var initial = target.name.charAt(0).toUpperCase();
    if (field === 'one') push(initial);
    window.AA.forEach(function (a) {
      if (a.key !== target.key && a.name.charAt(0).toUpperCase() === initial) push(a[field]);
    });
    shuffle(window.AA).forEach(function (a) { if (out.length < 3) push(a[field]); });
    return out.slice(0, 3);
  }

  function panel(a, cls) { return '<div class="' + (cls || 'qpanel') + '">' + window.art(a) + '</div>'; }

  /* ---------- one question ---------- */
  function makeQuestion(target, type) {
    var q = { type: type, key: target.key, target: target, typed: false, panel: '', prompt: '', options: [] };
    var opts;

    if (type === 'struct2name') {
      q.prompt = 'Which amino acid is this?';
      q.panel = panel(target);
      typedAs(q, 'name', target.name, nameWords(target), otherNames(target));
      opts = otherAA(target, 3, true).map(function (a) { return { t: a.name, ok: false }; });
      opts.push({ t: target.name, ok: true });
    } else if (type === 'name2struct') {
      q.prompt = 'Which structure is <b>' + target.name + '</b>?';
      opts = otherAA(target, 3, true).map(function (a) { return { t: a.name, ok: false, svg: window.art(a) }; });
      opts.push({ t: target.name, ok: true, svg: window.art(target) });
      q.struct = true;
    } else if (type === 'rgroup') {
      q.prompt = 'Which amino acid carries this side chain?<span class="big">' + esc(target.rShort) + '</span>';
      typedAs(q, 'name', target.name, nameWords(target), otherNames(target));
      opts = otherAA(target, 3, true).map(function (a) { return { t: a.name, ok: false }; });
      opts.push({ t: target.name, ok: true });
    } else if (type === 'one2name') {
      q.prompt = 'Which amino acid is this the code for?<span class="big">' + target.one + '</span>';
      typedAs(q, 'name', target.name, nameWords(target), otherNames(target));
      opts = otherAA(target, 3, false).map(function (a) { return { t: a.name, ok: false }; });
      opts.push({ t: target.name, ok: true });
    } else if (type === 'name2one' || type === 'name2three') {
      var field = type === 'name2one' ? 'one' : 'three';
      q.prompt = (field === 'one' ? 'One-letter' : 'Three-letter') + ' code for <b>' + target.name + '</b>?';
      typedAs(q, 'code', target[field], [target[field]],
               window.AA.filter(function (a) { return a.key !== target.key; }).map(function (a) { return a[field]; }));
      opts = codeDistractors(target, field).map(function (v) { return { t: v, ok: false, mono: true }; });
      opts.push({ t: target[field], ok: true, mono: true });
    } else if (type === 'name2scode') {
      q.prompt = '<b>' + target.name + '</b> 의 구조 코드는?';
      typedAs(q, 'scode', target.scode, codeWords(target), otherCodes(target));
      q.codeAnswer = true;
      opts = shuffle(window.AA.filter(function (a) { return a.key !== target.key; }))
             .slice(0, 3).map(function (a) { return { t: a.scode, ok: false, mono: true }; });
      opts.push({ t: target.scode, ok: true, mono: true });
    } else if (type === 'scode2name') {
      q.prompt = '이 구조 코드는 어떤 아미노산?<span class="big">' + esc(target.scode) + '</span>';
      typedAs(q, 'name', target.name, nameWords(target), otherNames(target));
      opts = otherAA(target, 3, false).map(function (a) { return { t: a.name, ok: false }; });
      opts.push({ t: target.name, ok: true });
    } else /* category */ {
      q.prompt = 'Which class does <b>' + target.name + '</b> belong to?';
      q.panel = panel(target);
      typedAs(q, 'cat', window.CAT[target.cat].short, CAT_WORDS[target.cat], otherClasses(target));
      opts = window.CAT_ORDER.map(function (c) { return { t: window.CAT[c].label, ok: c === target.cat }; });
    }
    q.options = type === 'category' ? opts : shuffle(opts);
    q.answer = (q.options.filter(function (o) { return o.ok; })[0] || {}).t;
    q.explain = (type === 'name2scode' || type === 'scode2name')
                ? '<span style="font-family:var(--mono);color:var(--nonpolar)">' + esc(target.scode) + '</span> — ' + target.scodeNote
              : (type === 'name2one' || type === 'name2three' || type === 'one2name') ? target.codeNote
              : type === 'category' ? (target.catNote || window.CAT[target.cat].desc)
              : target.chem;
    return q;
  }

  /* ---------- round ---------- */
  function buildRound(forced) {
    var pool = window.AA.filter(function (a) { return cfg.cats.indexOf(a.cat) >= 0; });
    if (pool.length < 2) pool = window.AA.slice();
    var targets = forced && forced.length ? forced : chooseTargets(pool, cfg.len, cfg.adaptive);
    var types = cfg.types.length ? cfg.types : DEFAULT.types;
    st = {
      qs: targets.map(function (t) { return makeQuestion(t, types[Math.floor(Math.random() * types.length)]); }),
      i: 0, score: 0, streak: 0, best: 0, answered: false, results: [], missed: [], byType: {}
    };
    st.len = st.qs.length;
    renderQuestion();
  }

  /* ---------- setup screen ---------- */
  function renderSetup() {
    if (!cfg) {
      var saved = window.Store.prefs() || {};
      cfg = {};
      Object.keys(DEFAULT).forEach(function (k) {
        cfg[k] = (saved[k] === undefined) ? JSON.parse(JSON.stringify(DEFAULT[k])) : saved[k];
      });
      cfg.types = cfg.types.filter(function (id) {
        return TYPES.some(function (t) { return t.id === id; });
      });
      if (!cfg.types.length) cfg.types = DEFAULT.types.slice();
      if (!cfg.cats.length) cfg.cats = DEFAULT.cats.slice();
    }
    var tot = window.Store.totals();
    var lens = [10, 20, 40].map(function (n) {
      return '<button class="chip plain" data-len="' + n + '" aria-pressed="' + (cfg.len === n) + '">' + n + '</button>';
    }).join('');
    var cats = window.CAT_ORDER.map(function (c) {
      var i = window.CAT[c];
      return '<button class="chip" data-cat="' + c + '" style="--acc:' + i.color + '" aria-pressed="' +
             (cfg.cats.indexOf(c) >= 0) + '">' + i.short + '</button>';
    }).join('');
    var types = TYPES.map(function (t) {
      return '<label class="switch"><input type="checkbox" data-type="' + t.id + '"' +
             (cfg.types.indexOf(t.id) >= 0 ? ' checked' : '') + '>' +
             '<span class="t">' + t.label + '<span class="d">' + t.d + '</span></span></label>';
    }).join('');

    root().innerHTML =
      '<div class="setup">' +
        '<h2>Build a round</h2>' +
        '<p class="lead">' +
          (tot.seen ? 'So far: <b>' + tot.ok + ' / ' + tot.seen + '</b> correct (' + Math.round(100 * tot.ok / tot.seen) +
            '%). <button class="linkbtn" id="q-reset">reset progress</button>' :
           'Your per-amino-acid scores are saved on this device and feed the focus mode below.') +
        '</p>' +
        '<div class="fieldset"><span class="lg">Questions</span><div class="chips">' + lens + '</div></div>' +
        '<div class="fieldset"><span class="lg">Draw from</span><div class="chips">' + cats + '</div></div>' +
        '<div class="fieldset"><span class="lg">Question types</span><div class="switches">' + types + '</div></div>' +
        '<div class="fieldset"><span class="lg">Mode</span><div class="switches">' +
          '<label class="switch"><input type="checkbox" id="q-adaptive"' + (cfg.adaptive ? ' checked' : '') + '>' +
            '<span class="t">Focus on weak spots<span class="d">Weights the draw towards amino acids you have been missing</span></span></label>' +
          '<label class="switch"><input type="checkbox" id="q-typed"' + (cfg.typed ? ' checked' : '') + '>' +
            '<span class="t">주관식 · typed answers<span class="d">보기를 고르는 대신 직접 입력합니다. 이름은 3글자·1글자 코드도 정답 처리되고, 오타 한 글자는 봐줍니다. (구조 고르기 문제만 객관식 유지)</span></span></label>' +
        '</div></div>' +
        '<button class="btn primary lg" id="q-start">Start round</button>' +
      '</div>';

    var r = root();
    r.querySelectorAll('[data-len]').forEach(function (b) {
      b.addEventListener('click', function () {
        cfg.len = Number(b.dataset.len);
        r.querySelectorAll('[data-len]').forEach(function (x) { x.setAttribute('aria-pressed', String(Number(x.dataset.len) === cfg.len)); });
      });
    });
    r.querySelectorAll('[data-cat]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = b.dataset.cat, on = cfg.cats.indexOf(c) >= 0;
        if (on && cfg.cats.length === 1) return;
        cfg.cats = on ? cfg.cats.filter(function (x) { return x !== c; }) : cfg.cats.concat([c]);
        b.setAttribute('aria-pressed', String(!on));
      });
    });
    r.querySelectorAll('[data-type]').forEach(function (b) {
      b.addEventListener('change', function () {
        var id = b.dataset.type;
        if (!b.checked && cfg.types.length === 1) { b.checked = true; return; }
        cfg.types = b.checked ? cfg.types.concat([id]) : cfg.types.filter(function (x) { return x !== id; });
      });
    });
    document.getElementById('q-adaptive').addEventListener('change', function (e) { cfg.adaptive = e.target.checked; });
    document.getElementById('q-typed').addEventListener('change', function (e) { cfg.typed = e.target.checked; });
    var rs = document.getElementById('q-reset');
    if (rs) rs.addEventListener('click', function () { window.Store.reset(); window.Study.refresh(); renderSetup(); });
    document.getElementById('q-start').addEventListener('click', function () {
      window.Store.setPrefs(cfg);
      buildRound(null);
    });
  }

  /* ---------- question screen ---------- */
  function headHTML() {
    return '<span>QUESTION ' + (st.i + 1) + ' / ' + st.len + '</span>' +
      (st.streak > 1 ? '<span class="streak">▲ ' + st.streak + ' in a row</span>' : '') +
      '<span class="spacer"></span><span>SCORE ' + st.score + '</span>' +
      '<button class="linkbtn quit" id="qquit" title="Abandon this round and go back to the settings (Esc)">End round</button>';
  }

  /* bail out mid-round: answers already given are still saved */
  function quit() {
    st = null;
    window.Study.refresh();
    renderSetup();
  }

  function progressBar() {
    var s = '';
    for (var i = 0; i < st.len; i++) {
      var c = st.results[i] === true ? 'ok' : st.results[i] === false ? 'no' : (i === st.i ? 'now' : '');
      s += '<i class="' + c + '"></i>';
    }
    return '<div class="pbar">' + s + '</div>';
  }

  function renderQuestion() {
    var q = st.qs[st.i];
    st.answered = false;
    var typeLabel = (TYPES.filter(function (t) { return t.id === q.type; })[0] || {}).label || '';

    var body;
    if (q.typed) {
      var kind = q.typedKind;
      var ph = kind === 'code' ? (q.answerText.length === 1 ? '?' : '???')
             : kind === 'scode' ? '예: 112, 1헥, 1111아'
             : kind === 'cat' ? 'nonpolar / polar / basic / acidic'
             : 'name, or its 1- or 3-letter code';
      var cls = kind === 'code' ? '' : kind === 'scode' ? ' scode' : ' wide';
      body = '<form class="typed' + cls + '" id="typedform">' +
             '<input id="typedin" ' + (kind === 'code' ? 'maxlength="3" ' : '') + 'autocomplete="off" ' +
             'autocapitalize="' + (kind === 'code' ? 'characters' : 'none') + '" spellcheck="false" ' +
             'placeholder="' + ph + '">' +
             '<button class="btn primary" type="submit">Check</button></form>';
    } else {
      body = '<div class="opts' + (q.struct ? ' struct' : '') + '">' + q.options.map(function (o, i) {
        var kbd = '<span class="kbd">' + 'ABCD'.charAt(i) + '</span>';
        if (o.svg) return '<button class="opt structopt" data-i="' + i + '">' + kbd + '<span class="sv">' + o.svg + '</span></button>';
        return '<button class="opt" data-i="' + i + '">' + kbd + '<span' + (o.mono ? ' style="font-family:var(--mono);font-size:1.1rem"' : '') + '>' +
               esc(o.t) + '</span></button>';
      }).join('') + '</div>';
    }

    root().innerHTML =
      '<div class="qhead" id="qhead">' + headHTML() + '</div>' +
      '<div id="pbarwrap">' + progressBar() + '</div>' +
      '<div class="qcard">' +
        '<div class="qtype">' + typeLabel + '</div>' +
        '<div class="qprompt">' + q.prompt + '</div>' +
        q.panel + body +
        '<div id="reveal"></div>' +
        '<div class="qfoot"><button class="btn primary" id="nextbtn" hidden>' +
          (st.i + 1 >= st.len ? 'See results' : 'Next question') + ' →</button></div>' +
      '</div>' +
      '<p class="hint">' + (q.typed
        ? 'Type your answer and press <kbd>Enter</kbd> · <kbd>Enter</kbd> again continues'
        : 'Answer with <kbd>1</kbd>–<kbd>4</kbd> or <kbd>A</kbd>–<kbd>D</kbd> · <kbd>Enter</kbd> continues') +
        '</p>';

    if (q.typed) {
      var f = document.getElementById('typedform');
      f.addEventListener('submit', function (e) { e.preventDefault(); submitTyped(); });
      document.getElementById('typedin').focus();
    } else {
      root().querySelectorAll('.opt').forEach(function (b) {
        b.addEventListener('click', function () { answer(Number(b.dataset.i)); });
      });
    }
    document.getElementById('nextbtn').addEventListener('click', next);
  }

  function finishAnswer(q, ok, chosenLabel) {
    st.answered = true;
    st.results[st.i] = ok;
    if (ok) { st.score++; st.streak++; st.best = Math.max(st.best, st.streak); }
    else { st.streak = 0; st.missed.push(q); }
    var bt = st.byType[q.type] || (st.byType[q.type] = { n: 0, ok: 0 });
    bt.n++; if (ok) bt.ok++;
    window.Store.record(q.key, ok);
    document.getElementById('qhead').innerHTML = headHTML();
    document.getElementById('pbarwrap').innerHTML = progressBar();

    var a = q.target, cat = window.CAT[a.cat];
    document.getElementById('reveal').innerHTML =
      '<div class="reveal">' +
        '<div class="rv-panel">' + window.art(a) + '</div>' +
        '<div class="rv-body">' +
          '<div class="verdict ' + (ok ? 'ok' : 'no') + '">' +
            (ok ? (chosenLabel ? esc(chosenLabel) : '✓ Correct') : '✗ ' + esc(chosenLabel || 'Not quite')) + '</div>' +
          '<h4>' + a.name + ' <span class="c">' + a.three + ' · ' + a.one + '</span>' +
            ' <span class="pill acc" style="--acc:' + cat.color + '">' + cat.short + '</span></h4>' +
          '<p><span style="font-family:var(--mono);color:var(--dim2)">R = </span>' + esc(a.rShort) + '</p>' +
          '<p>' + q.explain + '</p>' +
        '</div>' +
      '</div>';
    var nb = document.getElementById('nextbtn');
    nb.hidden = false; nb.focus();
  }

  function answer(i) {
    if (st.answered) return;
    var q = st.qs[st.i], o = q.options[i], ok = !!o.ok;
    root().querySelectorAll('.opt').forEach(function (b, j) {
      b.disabled = true;
      if (q.options[j].ok) b.classList.add('correct');
      else if (j === i) b.classList.add('wrong');
    });
    finishAnswer(q, ok, ok ? '' : 'You said “' + o.t + '” — it is ' + q.answer);
  }

  function submitTyped() {
    if (st.answered) return;
    var q = st.qs[st.i], inp = document.getElementById('typedin');
    var given = inp.value.trim();
    if (!given) { inp.focus(); return; }
    var f = q.codeAnswer ? normCode : norm;
    var g = f(given), ok = false, fuzzy = false;
    var acc = q.codeAnswer ? q.accept.map(normCode) : q.accept;
    var rej = q.codeAnswer ? q.reject.map(normCode) : q.reject;
    var dMine = bestDist(g, acc), dOther = bestDist(g, rej);
    if (dMine === 0) ok = true;
    else if (!q.codeAnswer && dOther > 0 && dMine <= tolerance(g) && dMine < dOther) { ok = true; fuzzy = true; }
    inp.disabled = true;
    inp.classList.add(ok ? 'correct' : 'wrong');
    if (!ok) inp.value = q.answerText;
    finishAnswer(q, ok,
      ok ? (fuzzy ? '✓ Close enough — it is spelt “' + q.answerText + '”' : '')
         : 'You typed “' + given + '” — it is ' + q.answerText);
  }

  function next() {
    st.i++;
    if (st.i >= st.len) { window.Study.refresh(); renderResults(); }
    else renderQuestion();
  }

  /* ---------- results ---------- */
  function renderResults() {
    var pct = Math.round(100 * st.score / st.len);
    var C = 2 * Math.PI * 56;
    var msg = pct === 100 ? ['Perfect round.', 'Every single one. Go pick a harder mix or a longer round.']
            : pct >= 85 ? ['Solid.', 'You have these cold — try turning on typed codes for the next round.']
            : pct >= 60 ? ['Getting there.', 'The reveal cards below are the ones worth another look.']
            : ['Early days.', 'Leave “focus on weak spots” on and these will come round again quickly.'];
    var bd = Object.keys(st.byType).map(function (t) {
      var v = st.byType[t], lbl = (TYPES.filter(function (x) { return x.id === t; })[0] || {}).label || t;
      return '<div class="bd"><div class="t">' + lbl + '</div><div class="v">' + v.ok + ' / ' + v.n + '</div>' +
             '<div class="track"><i style="width:' + Math.round(100 * v.ok / v.n) + '%"></i></div></div>';
    }).join('');
    var uniq = [], seen = {};
    st.missed.forEach(function (q) { if (!seen[q.key]) { seen[q.key] = 1; uniq.push(q.target); } });
    var misses = uniq.length ? '<div class="misses"><h3>Worth another look</h3><div class="misslist">' +
      uniq.map(function (a) {
        return '<div class="miss" style="--acc:' + window.CAT[a.cat].color + '"><div class="mp">' + window.art(a) + '</div>' +
               '<div><div class="nm">' + a.name + '</div><div class="sub">' + a.three + ' · ' + a.one + '</div></div></div>';
      }).join('') + '</div></div>' : '';

    root().innerHTML =
      '<div class="results">' +
        '<div class="res-top">' +
          '<div class="ring"><svg viewBox="0 0 128 128">' +
            '<circle cx="64" cy="64" r="56" fill="none" stroke="var(--surface3)" stroke-width="11"/>' +
            '<circle cx="64" cy="64" r="56" fill="none" stroke="' + (pct >= 60 ? 'var(--good)' : 'var(--nonpolar)') +
              '" stroke-width="11" stroke-linecap="round" stroke-dasharray="' + (C * pct / 100).toFixed(1) + ' ' + C.toFixed(1) + '"/>' +
            '</svg><div class="rv"><b>' + pct + '%</b><span>' + st.score + ' / ' + st.len + '</span></div></div>' +
          '<div class="msg"><h2>' + msg[0] + '</h2><p>' + msg[1] +
            (st.best > 2 ? ' Best streak: <b>' + st.best + '</b>.' : '') + '</p></div>' +
        '</div>' +
        '<div class="breakdown">' + bd + '</div>' +
        misses +
        '<div class="res-actions">' +
          (uniq.length ? '<button class="btn" id="retry">Drill the ' + uniq.length + ' I missed</button>' : '') +
          '<button class="btn primary" id="again">New round</button>' +
          '<button class="btn" id="tosetup">Change settings</button>' +
        '</div>' +
      '</div>';

    var rt = document.getElementById('retry');
    if (rt) rt.addEventListener('click', function () { buildRound(uniq); });
    document.getElementById('again').addEventListener('click', function () { buildRound(null); });
    document.getElementById('tosetup').addEventListener('click', renderSetup);
  }

  /* ---------- keyboard ---------- */
  function onKey(e) {
    if (document.getElementById('view-quiz').hidden || !st) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (e.key === 'Escape') { e.preventDefault(); quit(); return; }
    if (e.key === 'Enter') {
      var nb = document.getElementById('nextbtn');
      if (nb && !nb.hidden) { e.preventDefault(); next(); }
      return;
    }
    if (tag === 'input') return;
    if (st.answered) return;
    var i = -1;
    if (e.key >= '1' && e.key <= '4') i = Number(e.key) - 1;
    else { var k = 'abcd'.indexOf(e.key.toLowerCase()); if (k >= 0) i = k; }
    var q = st.qs[st.i];
    if (i >= 0 && q && !q.typed && i < q.options.length) { e.preventDefault(); answer(i); }
  }

  return {
    render: function () { if (!st) renderSetup(); },
    reset: renderSetup,
    init: function () {
      document.addEventListener('keydown', onKey);
      root().addEventListener('click', function (e) {
        if (e.target && e.target.id === 'qquit') quit();
      });
    }
  };
})();
