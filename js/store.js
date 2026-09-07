/* =========================================================================
   store.js — per-amino-acid performance + saved quiz settings (localStorage,
   fails silently if storage is unavailable).
   ========================================================================= */
window.Store = (function () {
  'use strict';
  var KEY = 'aa-study-stats-v1', PREF = 'aa-study-prefs-v2';
  function load(k, d) { try { var s = localStorage.getItem(k); return s ? JSON.parse(s) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var stats = load(KEY, {}) || {};
  return {
    get: function (k) { return stats[k] || { seen: 0, ok: 0 }; },
    accuracy: function (k) { var s = stats[k]; return s && s.seen ? s.ok / s.seen : null; },
    record: function (k, ok) {
      var s = stats[k] || (stats[k] = { seen: 0, ok: 0 });
      s.seen++; if (ok) s.ok++;
      save(KEY, stats);
    },
    totals: function () {
      var seen = 0, ok = 0;
      Object.keys(stats).forEach(function (k) { seen += stats[k].seen; ok += stats[k].ok; });
      return { seen: seen, ok: ok };
    },
    reset: function () { stats = {}; save(KEY, stats); },
    prefs: function () { return load(PREF, null); },
    setPrefs: function (p) { save(PREF, p); }
  };
})();
