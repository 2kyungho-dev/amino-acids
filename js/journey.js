/* =========================================================================
   journey.js — the memory palace walk-through: 20 steps, in order, grouped
   by room. "이름 가리기" blurs the amino acid so you can test yourself on
   each cue before revealing it.
   ========================================================================= */
window.Journey = (function () {
  'use strict';
  var built = false, hide = false;

  function byKey(k) { return window.AA.filter(function (a) { return a.key === k; })[0]; }

  function step(j) {
    var a = byKey(j.key), cat = window.CAT[a.cat];
    return '<li class="jstep" style="--acc:' + cat.color + '" data-key="' + a.key + '">' +
      '<span class="jnum">' + a.step + '</span>' +
      '<div class="jbody">' +
        '<div class="jkey">' + j.k + '</div>' +
        '<p class="jstory">' + j.s + '</p>' +
      '</div>' +
      '<div class="jaa">' +
        '<div class="jpanel">' + window.art(a) + '</div>' +
        '<div class="jname"><span class="badge sm">' + a.one + '</span>' +
          '<span class="jn">' + a.name + '</span><span class="jc">' + a.three + '</span></div>' +
      '</div>' +
      '<span class="jveil">tap to reveal</span>' +
    '</li>';
  }

  function body() {
    var out = '';
    window.PLACES.forEach(function (p, i) {
      var items = window.JOURNEY.filter(function (j) { return j.place === p.id; });
      if (!items.length) return;
      out += '<section class="jplace">' +
        '<div class="section-h"><span class="jroom">' + (i + 1) + '</span>' +
        '<h2>' + p.label + '</h2><span class="n">' + p.en + '</span></div>' +
        '<ol class="jsteps">' + items.map(step).join('') + '</ol></section>';
    });
    return out;
  }

  function paint() {
    var list = document.getElementById('journey-list');
    list.className = hide ? 'hide-names' : '';
    list.innerHTML = body();
  }

  function render() {
    var root = document.getElementById('view-journey');
    if (!built) {
      root.innerHTML =
        '<p class="section-d" style="margin-top:10px">' +
          '글라이더를 타고 착륙해 집 안을 한 바퀴 도는 스토리입니다. 순서 자체가 20개 아미노산의 순서예요 — ' +
          '큐(cue)를 먼저 읽고 어떤 아미노산인지 떠올린 뒤 확인하세요.' +
        '</p>' +
        '<div class="toolbar"><div class="chips">' +
          '<button class="chip plain" id="j-hide" aria-pressed="false">이름 가리기 · self-test</button>' +
          '<button class="chip plain" id="j-all">모두 펼치기</button>' +
        '</div><span class="jhint">큐를 먼저 읽고 떠올린 뒤 카드를 눌러 확인하세요.</span></div>' +
        '<div id="journey-list"></div>';
      built = true;
      document.getElementById('j-hide').addEventListener('click', function () {
        hide = !hide;
        this.setAttribute('aria-pressed', String(hide));
        paint();
      });
      document.getElementById('j-all').addEventListener('click', function () {
        root.querySelectorAll('.jstep').forEach(function (s) { s.classList.add('shown'); });
      });
      root.addEventListener('click', function (e) {
        var s = e.target.closest ? e.target.closest('.jstep') : null;
        if (s) s.classList.toggle('shown');
      });
    }
    paint();
  }

  return { render: render, refresh: function () { if (built) paint(); } };
})();
