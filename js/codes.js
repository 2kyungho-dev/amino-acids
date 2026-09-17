/* =========================================================================
   codes.js — the structure-code sheet. Every side chain written as a short
   string, with the notation key and the pairs worth learning together.
   Two self-test modes hide one column so the other can be recalled.
   ========================================================================= */
window.Codes = (function () {
  'use strict';
  var built = false, hide = 'none';        // 'none' | 'code' | 'name'

  function byKey(k) { return window.AA.filter(function (a) { return a.key === k; })[0]; }

  function legend() {
    return '<div class="ckeys">' + window.CODE_KEY.map(function (k) {
      return '<div class="ckey"><b>' + k.s + '</b><span>' + k.m + '</span></div>';
    }).join('') + '</div>';
  }

  function card(a) {
    var cat = window.CAT[a.cat];
    return '<article class="ccard" style="--acc:' + cat.color + '" data-key="' + a.key + '">' +
      '<div class="ccode">' + a.scode + '</div>' +
      '<div class="cpanel">' + window.art(a) + '</div>' +
      '<div class="cmeta">' +
        '<span class="badge sm">' + a.one + '</span>' +
        '<span class="cn">' + a.name + '</span><span class="cc">' + a.three + '</span>' +
      '</div>' +
      '<p class="chint">' + a.scodeNote + '</p>' +
      '<span class="cveil">tap to reveal</span>' +
    '</article>';
  }

  function pairs() {
    return '<div class="cpairs">' + window.CODE_PAIRS.map(function (p) {
      var x = byKey(p.a), y = byKey(p.b);
      return '<div class="cpair">' +
        '<div class="cpairhd"><span>' + x.name + '</span><i>·</i><span>' + y.name + '</span></div>' +
        '<p>' + p.note + '</p></div>';
    }).join('') + '</div>';
  }

  function body() {
    var out = '';
    window.CAT_ORDER.forEach(function (c) {
      var items = window.AA.filter(function (a) { return a.cat === c; });
      var i = window.CAT[c];
      out += '<section style="--acc:' + i.color + '">' +
        '<div class="section-h"><span class="dot"></span><h2>' + i.label + '</h2>' +
        '<span class="n">' + items.length + '</span></div>' +
        '<div class="cgrid">' + items.map(card).join('') + '</div></section>';
    });
    return out;
  }

  function paint() {
    var list = document.getElementById('codes-list');
    list.className = hide === 'none' ? '' : 'hide-' + hide;
    list.innerHTML = body();
  }

  function render() {
    var root = document.getElementById('view-codes');
    if (!built) {
      root.innerHTML =
        '<p class="section-d" style="margin-top:10px">' +
          '곁사슬 뼈대만 짧은 문자열로 적는 방식입니다. 숫자는 탄소 개수, 나머지 기호는 붙어 있는 작용기예요. ' +
          '이름 ↔ 코드는 <b>Quiz</b> 탭의 “Name → code” / “Code → name” 유형으로 연습할 수 있습니다.' +
        '</p>' +
        legend() +
        '<div class="toolbar"><div class="chips">' +
          '<button class="chip plain" data-hide="code" aria-pressed="false">코드 가리기</button>' +
          '<button class="chip plain" data-hide="name" aria-pressed="false">이름·그림 가리기</button>' +
        '</div><span class="jhint">카드를 누르면 가려진 쪽이 열립니다.</span></div>' +
        '<div id="codes-list"></div>' +
        '<h3 class="cph">같이 외우면 좋은 짝</h3>' + pairs();
      built = true;
      root.querySelectorAll('[data-hide]').forEach(function (b) {
        b.addEventListener('click', function () {
          hide = (hide === b.dataset.hide) ? 'none' : b.dataset.hide;
          root.querySelectorAll('[data-hide]').forEach(function (x) {
            x.setAttribute('aria-pressed', String(x.dataset.hide === hide));
          });
          paint();
        });
      });
      root.addEventListener('click', function (e) {
        var c = e.target.closest ? e.target.closest('.ccard') : null;
        if (c) c.classList.toggle('shown');
      });
    }
    paint();
  }

  return { render: render, refresh: function () { if (built) paint(); } };
})();
