/* =========================================================================
   chem.js — a tiny skeletal-formula drawing engine.

   Design goals (things the old drawings got wrong):
     * every bond is the same length and sits on a 30/60/90 degree grid,
       so molecules look like textbook skeletal formulas
     * bonds are TRIMMED so they never run underneath an atom label
     * hydrogens live inside the label ("OH", "NH2+"), not as loose letters
       joined by hand-placed stubs
     * double bonds know which side to sit on (inside a ring, or symmetric)
     * the viewBox is centred on the molecule, so every structure is drawn
       at exactly the same scale but stays optically centred in its panel
   ========================================================================= */
window.CHEM = (function () {
  'use strict';

  var FS   = 15;        // atom label font size
  var CH   = FS * 0.6;  // advance width of one mono glyph
  var SS    = 0.72;     // sub/superscript scale
  var L    = 27;        // standard bond length
  var PAD  = 2.6;       // clearance between a label and the bonds touching it

  /* ---------- geometry helpers ---------- */
  function step(p, deg, len) {
    if (len == null) len = L;
    var a = deg * Math.PI / 180;
    return { x: p.x + Math.cos(a) * len, y: p.y - Math.sin(a) * len };
  }
  function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function num(n) { return Math.round(n * 10) / 10; }

  /* A regular n-ring hung off `attach`; `dir` points from the attachment
     atom towards the ring centre. Returns pts[0] === attach. */
  function ring(attach, dir, n, len) {
    if (len == null) len = L;
    var R = len / (2 * Math.sin(Math.PI / n));
    var c = step(attach, dir, R);
    var pts = [];
    for (var i = 0; i < n; i++) pts.push(step(c, dir + 180 - i * (360 / n), R));
    return { pts: pts, c: c };
  }

  /* A ring fused onto the existing edge A–B, built on the far side of
     `away`. Returns pts[0] === A, pts[1] === B. */
  function ringOnEdge(A, B, away, n) {
    var len = dist(A, B);
    var R = len / (2 * Math.sin(Math.PI / n));
    var ap = R * Math.cos(Math.PI / n);
    var m = mid(A, B);
    var nx = -(B.y - A.y) / len, ny = (B.x - A.x) / len;
    var c1 = { x: m.x + nx * ap, y: m.y + ny * ap };
    var c2 = { x: m.x - nx * ap, y: m.y - ny * ap };
    var c = dist(c1, away) > dist(c2, away) ? c1 : c2;
    var a0 = Math.atan2(A.y - c.y, A.x - c.x);
    var aB = Math.atan2(B.y - c.y, B.x - c.x);
    var d = aB - a0;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    var s = d > 0 ? 1 : -1, pts = [];
    for (var i = 0; i < n; i++) {
      var a = a0 + s * i * 2 * Math.PI / n;
      pts.push({ x: c.x + R * Math.cos(a), y: c.y + R * Math.sin(a) });
    }
    return { pts: pts, c: c };
  }

  /* ---------- label spec ----------
     "NH_3^+"  ->  N H ₃ ⁺      "_-O" -> ⁻O
     `head` says which token is the atom the bonds actually attach to. */
  function parseSpec(spec) {
    var toks = [], i = 0, k;
    while (i < spec.length) {
      k = null;
      if (spec[i] === '_' || spec[i] === '^') { k = spec[i] === '_' ? 'sub' : 'sup'; i++; }
      toks.push({ c: spec[i++], k: k });
    }
    return toks;
  }

  /* ---------- the molecule builder ---------- */
  function Mol() { this.atoms = []; this.bonds = []; this.deco = []; this.under = []; this.pts = []; }

  Mol.prototype._see = function (p) { this.pts.push(p); return p; };

  Mol.prototype.atom = function (p, spec, o) {
    o = o || {};
    var toks = parseSpec(spec);
    var w = toks.map(function (t) { return CH * (t.k ? SS : 1); });
    var head = o.head || 0, before = 0, i;
    for (i = 0; i < head; i++) before += w[i];
    var total = w.reduce(function (a, b) { return a + b; }, 0);
    var x0 = p.x - (before + w[head] / 2);          // left edge of the whole label
    this.atoms.push({
      p: p, toks: toks, w: w, x0: x0, tw: total, cls: o.cls || '',
      // asymmetric clearance box: bonds leaving on the side where the
      // trailing hydrogens sit have to clear the whole string
      box: { wl: (p.x - x0) + PAD, wr: (x0 + total - p.x) + PAD, h: FS * 0.48 + 2.0 }
    });
    this._see(p);
    this.pts.push({ x: x0 - 1, y: p.y - FS * 0.6 }, { x: x0 + total + 1, y: p.y + FS * 0.6 });
    return p;
  };

  Mol.prototype.bond = function (a, b, o) {
    o = o || {};
    this.bonds.push({ a: a, b: b, order: o.order || 1, inner: o.inner || null, cls: o.cls || '' });
    this._see(a); this._see(b);
    return b;
  };

  /* walk a zig-zag of bonds, returns every vertex including the start */
  Mol.prototype.chain = function (p, dirs, o) {
    var out = [p], cur = p;
    for (var i = 0; i < dirs.length; i++) { var n = step(cur, dirs[i]); this.bond(cur, n, o); out.push(n); cur = n; }
    return out;
  };

  /* close a ring: `dbl` lists indices of bonds i -> i+1 drawn as doubles */
  Mol.prototype.ring = function (pts, c, dbl, o) {
    o = o || {}; dbl = dbl || [];
    for (var i = 0; i < pts.length; i++) {
      var j = (i + 1) % pts.length;
      if (o.skip && o.skip.indexOf(i) >= 0) continue;
      this.bond(pts[i], pts[j], {
        order: dbl.indexOf(i) >= 0 ? 2 : 1,
        inner: dbl.indexOf(i) >= 0 ? c : null,
        cls: o.cls || ''
      });
    }
  };

  /* the little dashed "the side chain starts here" tick + R tag */
  Mol.prototype.cut = function (a, b) { this.deco.push({ k: 'cut', a: a, b: b }); };

  /* highlight box drawn behind every atom added from index `start` onwards
     (textbook style: the R group boxed and reversed out) */
  /* maxY, when given, keeps backbone-level points out of the box */
  Mol.prototype.boxFrom = function (mk, pad, maxY) {
    this.under.push({ k: 'box', mk: mk, pad: pad == null ? 9 : pad, maxY: maxY });
  };
  Mol.prototype.mark = function () { return { a: this.atoms.length, b: this.bonds.length }; };

  /* ---------- rendering ---------- */
  function line(p, q, cls) {
    return '<line x1="' + num(p.x) + '" y1="' + num(p.y) + '" x2="' + num(q.x) + '" y2="' + num(q.y) +
           '" class="bnd ' + cls + '"/>';
  }

  Mol.prototype.render = function (o) {
    o = o || {};
    var self = this, out = '';

    function boxAt(p) {
      for (var i = 0; i < self.atoms.length; i++) {
        var a = self.atoms[i];
        if (Math.abs(a.p.x - p.x) < 0.8 && Math.abs(a.p.y - p.y) < 0.8) return a.box;
      }
      return null;
    }
    function trim(box, ux, uy) {
      if (!box) return 0;
      var hw = ux > 0 ? box.wr : box.wl;
      var tx = Math.abs(ux) > 1e-6 ? hw / Math.abs(ux) : 1e9;
      var ty = Math.abs(uy) > 1e-6 ? box.h / Math.abs(uy) : 1e9;
      return Math.min(tx, ty) + 1.2;
    }

    this.under.forEach(function (u) {
      if (u.k !== 'box') return;
      var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, seen = false;
      self.atoms.slice(u.mk.a).forEach(function (a) {
        seen = true;
        x0 = Math.min(x0, a.x0); x1 = Math.max(x1, a.x0 + a.tw);
        y0 = Math.min(y0, a.p.y - FS * 0.66); y1 = Math.max(y1, a.p.y + FS * 0.66);
      });
      self.bonds.slice(u.mk.b).forEach(function (b) {          // ring bonds carry no label
        [b.a, b.b].forEach(function (p) {
          if (u.maxY != null && p.y > u.maxY) return;
          seen = true;
          x0 = Math.min(x0, p.x - 2); x1 = Math.max(x1, p.x + 2);
          y0 = Math.min(y0, p.y - 2); y1 = Math.max(y1, p.y + 2);
        });
      });
      if (!seen) return;
      out += '<rect class="hlbox" fill="' + (o.hl || '#6d3f7c') + '" x="' + num(x0 - u.pad) +
             '" y="' + num(y0 - u.pad) + '" width="' + num(x1 - x0 + u.pad * 2) +
             '" height="' + num(y1 - y0 + u.pad * 2) + '"/>';
      self.pts.push({ x: x0 - u.pad, y: y0 - u.pad }, { x: x1 + u.pad, y: y1 + u.pad });
    });

    this.bonds.forEach(function (bd) {
      var dx = bd.b.x - bd.a.x, dy = bd.b.y - bd.a.y;
      var len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
      var ta = trim(boxAt(bd.a), ux, uy), tb = trim(boxAt(bd.b), -ux, -uy);
      var p1 = { x: bd.a.x + ux * ta, y: bd.a.y + uy * ta };
      var p2 = { x: bd.b.x - ux * tb, y: bd.b.y - uy * tb };
      var nx = -uy, ny = ux, off = 3.0;

      if (bd.order === 1) { out += line(p1, p2, bd.cls); return; }

      if (bd.inner) {                                  // ring-style: second line inside
        var s = ((bd.inner.x - bd.a.x) * nx + (bd.inner.y - bd.a.y) * ny) >= 0 ? 1 : -1;
        var ins = 5;
        out += line(p1, p2, bd.cls);
        out += line({ x: p1.x + ux * ins + nx * off * s, y: p1.y + uy * ins + ny * off * s },
                    { x: p2.x - ux * ins + nx * off * s, y: p2.y - uy * ins + ny * off * s }, bd.cls);
      } else {                                         // symmetric pair
        out += line({ x: p1.x + nx * off, y: p1.y + ny * off }, { x: p2.x + nx * off, y: p2.y + ny * off }, bd.cls);
        out += line({ x: p1.x - nx * off, y: p1.y - ny * off }, { x: p2.x - nx * off, y: p2.y - ny * off }, bd.cls);
      }
    });

    this.deco.forEach(function (d) {
      if (d.k !== 'cut') return;
      var m = mid(d.a, d.b);
      var dx = d.b.x - d.a.x, dy = d.b.y - d.a.y, len = Math.hypot(dx, dy) || 1;
      var nx = -dy / len, ny = dx / len;
      var side = nx > 0 ? 1 : -1;   // push the tag clear of the backbone
      var tx = m.x + nx * side * 14, ty = m.y + ny * side * 14;
      out += '<circle cx="' + num(tx) + '" cy="' + num(ty) + '" r="8" class="rdisc"/>' +
             '<text x="' + num(tx) + '" y="' + num(ty) + '" class="rtag">R</text>';
      self.pts.push({ x: tx + 9, y: ty + 9 }, { x: tx - 9, y: ty - 9 });
    });

    this.atoms.forEach(function (a) {
      var x = a.x0;
      for (var i = 0; i < a.toks.length; i++) {
        var t = a.toks[i];
        var fs = t.k ? FS * SS : FS;
        var dy = t.k === 'sub' ? FS * 0.30 : (t.k === 'sup' ? -FS * 0.36 : 0);
        out += '<text x="' + num(x + a.w[i] / 2) + '" y="' + num(a.p.y + dy) +
               '" font-size="' + num(fs) + '" class="al ' + a.cls + '">' + t.c + '</text>';
        x += a.w[i];
      }
    });

    var VW = o.w || 240, VH = o.h || 120;
    var xs = this.pts.map(function (p) { return p.x; }), ys = this.pts.map(function (p) { return p.y; });
    var cx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
    var cy = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;

    return '<svg class="mol ' + (o.cls || '') + '" viewBox="' + num(cx - VW / 2) + ' ' + num(cy - VH / 2) + ' ' + VW + ' ' + VH +
           '" role="img" aria-label="' + (o.alt || '').replace(/"/g, '&quot;') + '">' + out + '</svg>';
  };

  return { Mol: Mol, step: step, mid: mid, dist: dist, ring: ring, ringOnEdge: ringOnEdge, L: L };
})();
