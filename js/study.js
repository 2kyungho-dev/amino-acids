/* =========================================================================
   study.js — browsable reference: filter, search, and the structure cards.
   ========================================================================= */
window.Study = (function () {
  'use strict';
  var state = { q: '', cats: ['nonpolar', 'polar', 'basic', 'acidic'], bare: false, built: false };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function strip(s) { return String(s).replace(/<[^>]+>/g, ''); }

  function toolbar() {
    var chips = window.CAT_ORDER.map(function (c) {
      var i = window.CAT[c];
      return '<button class="chip" data-cat="' + c + '" style="--acc:' + i.color + '" aria-pressed="true">' +
             i.short + '</button>';
    }).join('');
    return '' +
    '<div class="toolbar">' +
      '<label class="search">' +
        '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
        '<input id="s-q" type="search" placeholder="Search name, code, structure or story…" autocomplete="off">' +
      '</label>' +
      '<div class="chips">' + chips + '</div>' +
      '<button class="chip plain" id="s-bare" aria-pressed="false" title="Fade the backbone so only the side chain stands out">R group only</button>' +
      '<div class="seg" id="s-style">' +
        '<button data-style="skeletal" aria-pressed="true" title="Skeletal formula — bonds as lines, carbons implied">Skeletal</button>' +
        '<button data-style="textbook" aria-pressed="false" title="Condensed textbook layout — every atom written out, R group boxed">Textbook</button>' +
      '</div>' +
    '</div>' +
    '<div id="study-list"></div>';
  }

  function mastery(a) {
    var s = window.Store.get(a.key);
    var pct = s.seen ? Math.round(100 * s.ok / s.seen) : 0;
    return '<div class="mastery" title="' + (s.seen ? s.ok + ' of ' + s.seen + ' quiz answers correct' : 'not quizzed yet') + '">' +
      '<div class="bar"><i style="width:' + (s.seen ? pct : 0) + '%"></i></div>' +
      '<span class="lbl">' + (s.seen ? pct + '% · ' + s.seen : 'new') + '</span></div>';
  }

  function card(a) {
    var cat = window.CAT[a.cat];
    var tags = '<span class="pill acc">' + cat.short + '</span>' +
      (a.catTag ? '<span class="pill warn" title="Classification varies between textbooks — see the note on the card">† ' + a.catTag + '</span>' : '') +
      (a.essential ? '<span class="pill">essential</span>' : '') +
      (a.pka ? '<span class="pill">pKa ' + a.pka + '</span>' : '');
    return '<article class="card" style="--acc:' + cat.color + '">' +
      '<div class="card-hd">' +
        '<div class="badge">' + a.one + '</div>' +
        '<div><div class="nm"><h3>' + a.name + '</h3><span class="three">' + a.three + '</span></div>' +
        '<div class="tags">' + tags + '</div></div>' +
        mastery(a) +
      '</div>' +
      '<div class="panel' + (state.bare ? ' bare' : '') + '"><span class="ptag">pH 7</span>' + window.art(a) + '</div>' +
      '<div class="rline"><span class="k">R</span><code>' + a.rShort + '</code></div>' +
      '<p class="chem">' + a.chem + '</p>' +
      '<details><summary>Name &amp; letter</summary>' +
        '<p>' + a.ety + '</p><p class="note">' + a.codeNote + '</p>' +
        (a.catNote ? '<p class="catnote"><b>†</b> ' + a.catNote + '</p>' : '') +
      '</details>' +
    '</article>';
  }

  function matches(a) {
    if (state.cats.indexOf(a.cat) < 0) return false;
    var q = state.q.trim().toLowerCase();
    if (!q) return true;
    var hay = [a.name, a.three, a.one, a.rShort, a.rFull, window.CAT[a.cat].label,
               strip(a.ety), strip(a.chem), strip(a.codeNote)].join(' ').toLowerCase();
    return hay.indexOf(q) >= 0;
  }

  function list() {
    var out = '', any = false;
    window.CAT_ORDER.forEach(function (c) {
      if (state.cats.indexOf(c) < 0) return;
      var items = window.AA.filter(function (a) { return a.cat === c && matches(a); });
      if (!items.length) return;
      any = true;
      var i = window.CAT[c];
      out += '<section class="catgroup" style="--acc:' + i.color + '">' +
        '<div class="section-h"><span class="dot"></span><h2>' + i.label + '</h2>' +
        '<span class="n">' + items.length + (items.length === 1 ? ' acid' : ' acids') + '</span></div>' +
        '<p class="section-d">' + i.desc + '</p>' +
        '<div class="grid">' + items.map(card).join('') + '</div></section>';
    });
    return any ? out : '<p class="empty">Nothing matches “' + esc(state.q) + '”.</p>';
  }

  function paint() { document.getElementById('study-list').innerHTML = list(); }

  function render() {
    var root = document.getElementById('view-study');
    if (!state.built) {
      root.innerHTML = toolbar();
      state.built = true;
      var q = document.getElementById('s-q');
      q.addEventListener('input', function () { state.q = q.value; paint(); });
      root.querySelectorAll('.chip[data-cat]').forEach(function (b) {
        b.addEventListener('click', function () {
          var c = b.dataset.cat, on = state.cats.indexOf(c) >= 0;
          if (on && state.cats.length === 1) return;           // never empty
          if (on) state.cats = state.cats.filter(function (x) { return x !== c; });
          else state.cats.push(c);
          b.setAttribute('aria-pressed', on ? 'false' : 'true');
          paint();
        });
      });
      root.querySelectorAll('#s-style button').forEach(function (b) {
        b.addEventListener('click', function () {
          root.querySelectorAll('#s-style button').forEach(function (x) {
            x.setAttribute('aria-pressed', String(x === b));
          });
          window.setDiagram(b.dataset.style);
          var bare = document.getElementById('s-bare');
          bare.disabled = b.dataset.style === 'textbook';
          bare.title = bare.disabled
            ? 'Textbook style already boxes the side chain'
            : 'Fade the backbone so only the side chain stands out';
        });
      });
      var bare = document.getElementById('s-bare');
      bare.addEventListener('click', function () {
        state.bare = !state.bare;
        bare.setAttribute('aria-pressed', String(state.bare));
        root.querySelectorAll('.panel').forEach(function (p) { p.classList.toggle('bare', state.bare); });
      });
    }
    paint();
  }

  function renderTable() {
    var rows = window.CAT_ORDER.reduce(function (acc, c) {
      return acc.concat(window.AA.filter(function (a) { return a.cat === c; }));
    }, []).map(function (a) {
      var cat = window.CAT[a.cat];
      return '<tr style="--acc:' + cat.color + '">' +
        '<td class="c1">' + a.one + '</td>' +
        '<td class="mono">' + a.three + '</td>' +
        '<td>' + a.name + (a.essential ? ' <span class="pill">ess.</span>' : '') + '</td>' +
        '<td><div class="mini">' + window.art(a) + '</div></td>' +
        '<td class="mono">' + a.rShort + '</td>' +
        '<td><span class="pill acc">' + cat.short + '</span>' +
          (a.catTag ? '<span class="dag" title="' + a.catTag.replace(/"/g, '&quot;') + '">†</span>' : '') + '</td>' +
        '<td class="mono">' + (a.pka || '—') + '</td>' +
      '</tr>';
    }).join('');
    document.getElementById('view-table').innerHTML =
      '<p class="section-d" style="margin-top:10px">Everything on one screen — sorted by class, then by the order they appear in the study view. ' +
      '“ess.” marks the nine amino acids humans cannot synthesise. pKa is for the side chain only.</p>' +
      '<div class="tablewrap"><table><thead><tr>' +
      '<th>1</th><th>3</th><th>Name</th><th>Structure</th><th>R group</th><th>Class</th><th>Side-chain pKa</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      window.AA.filter(function (a) { return a.catNote; }).map(function (a) {
        return '<p class="tfoot"><b>†</b> ' + a.name + ': ' + a.catNote + '</p>';
      }).join('');
  }

  return { render: render, renderTable: renderTable, refresh: function () { if (state.built) paint(); } };
})();
