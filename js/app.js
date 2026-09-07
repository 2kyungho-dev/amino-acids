/* app.js — view switching + boot */
(function () {
  'use strict';
  var VIEWS = ['study', 'journey', 'quiz', 'table'];

  function show(name) {
    VIEWS.forEach(function (v) {
      document.getElementById('view-' + v).hidden = (v !== name);
      var b = document.getElementById('tab-' + v);
      b.setAttribute('aria-selected', String(v === name));
    });
    if (name === 'quiz') window.Quiz.render();
    if (name === 'study') window.Study.refresh();
    if (name === 'journey') window.Journey.render();
    if (location.hash.slice(1) !== name) history.replaceState(null, '', '#' + name);
    window.scrollTo({ top: 0 });
  }

  VIEWS.forEach(function (v) {
    document.getElementById('tab-' + v).addEventListener('click', function () { show(v); });
  });

  /* one switch repaints every view that shows a molecule */
  window.setDiagram = function (style) {
    window.DIAGRAM = style;
    document.body.dataset.diagram = style;
    window.Study.refresh();
    window.Study.renderTable();
    window.Journey.refresh();
  };

  document.body.dataset.diagram = window.DIAGRAM;
  window.Study.render();
  window.Study.renderTable();
  window.Quiz.init();

  var start = VIEWS.indexOf(location.hash.slice(1)) >= 0 ? location.hash.slice(1) : 'study';
  show(start);
})();
