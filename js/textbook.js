/* =========================================================================
   textbook.js — the second drawing style: the condensed, all-atom layout
   used by most biochemistry textbooks. The backbone is written out
   horizontally as H₃N⁺—C(—H)—COO⁻, the side chain is stacked vertically
   above the α-carbon and reversed out of a box tinted with the class colour.

   Same Mol engine as the skeletal drawings, so bond trimming, sub/super-
   scripts and the centred viewBox all come for free.
   ========================================================================= */
(function () {
  'use strict';
  var C = window.CHEM, step = C.step;
  var ROW  = 32;   // vertical gap between stacked groups
  var GAP  = 62;   // α-carbon to the flanking backbone groups
  var SPAN = 30;   // half-width of a two-branch row (H₃C  CH₃)
  var ARM  = 44;   // horizontal reach of a group hung off to one side
  var RL   = 26;   // ring bond length
  var W    = 'w';  // class for anything inside the highlight box

  /* ---- little helpers, all relative to the α-carbon at (0,0) ---- */
  function at(x, y) { return { x: x, y: y }; }
  function lbl(m, x, y, spec, head) {
    var p = at(x, y);
    m.atom(p, spec, { head: head || 0, cls: W });
    return p;
  }
  function bnd(m, a, b, order) { m.bond(a, b, { order: order || 1, cls: W }); }

  /* a straight stack upwards; specs[0] is the group bonded to Cα */
  function column(m, CA, specs) {
    var prev = CA, pts = [];
    specs.forEach(function (sp, i) {
      var p = lbl(m, 0, -(i + 1) * ROW, sp.t, sp.head);
      if (i === 0) m.bond(CA, p); else bnd(m, prev, p);
      prev = p; pts.push(p);
    });
    return pts;
  }
  /* the two methyls of valine / leucine, sitting above `below` */
  function fork(m, below, leftSpec, rightSpec) {
    var y = below.y - ROW;
    var l = lbl(m, below.x - SPAN, y, leftSpec.t, leftSpec.head);
    var r = lbl(m, below.x + SPAN, y, rightSpec.t, rightSpec.head);
    bnd(m, below, l); bnd(m, below, r);
    return [l, r];
  }
  /* the amide / carboxamide head of Asn, Gln and Arg */
  function amide(m, c, tail) {
    var o = lbl(m, c.x - SPAN, c.y - ROW, 'O');
    var n = lbl(m, c.x + SPAN + 6, c.y - ROW, tail);
    bnd(m, c, o, 2); bnd(m, c, n);
  }
  /* benzene, hung by its bottom vertex off `from` */
  function benzene(m, from) {
    var ipso = at(from.x, from.y - ROW);
    bnd(m, from, ipso);
    var r = C.ring(ipso, 90, 6, RL);
    m.ring(r.pts, r.c, [0, 2, 4], { cls: W });
    return r;
  }

  var TB = {};

  TB.Gly = function (m, CA) { column(m, CA, [{ t: 'H' }]); };
  TB.Ala = function (m, CA) { column(m, CA, [{ t: 'CH_3' }]); };

  TB.Val = function (m, CA) {
    var p = column(m, CA, [{ t: 'CH' }]);
    fork(m, p[0], { t: 'H_3C', head: 2 }, { t: 'CH_3' });
  };
  TB.Leu = function (m, CA) {
    var p = column(m, CA, [{ t: 'CH_2' }, { t: 'CH' }]);
    fork(m, p[1], { t: 'H_3C', head: 2 }, { t: 'CH_3' });
  };
  TB.Ile = function (m, CA) {
    var p = column(m, CA, [{ t: 'CH' }, { t: 'CH_2' }, { t: 'CH_3' }]);
    var me = lbl(m, -ARM, p[0].y, 'H_3C', 2);       // the extra branch on Cβ
    bnd(m, me, p[0]);
  };
  TB.Pro = function (m, CA) {
    /* the ring arches over the backbone and closes on the nitrogen */
    var N  = at(-GAP, 0);
    var CB = lbl(m, 0, -ROW, 'CH_2');
    var CD = lbl(m, -GAP, -ROW, 'H_2C', 2);
    var CG = lbl(m, -GAP / 2, -2 * ROW, 'CH_2');
    m.bond(CA, CB); bnd(m, CB, CG); bnd(m, CG, CD); m.bond(CD, N);
  };
  TB.Cys = function (m, CA) { column(m, CA, [{ t: 'CH_2' }, { t: 'SH' }]); };
  TB.Met = function (m, CA) { column(m, CA, [{ t: 'CH_2' }, { t: 'CH_2' }, { t: 'S' }, { t: 'CH_3' }]); };

  TB.Phe = function (m, CA) {
    var p = column(m, CA, [{ t: 'CH_2' }]);
    benzene(m, p[0]);
  };
  TB.Tyr = function (m, CA) {
    var p = column(m, CA, [{ t: 'CH_2' }]);
    var r = benzene(m, p[0]);
    var top = r.pts[3];
    var oh = lbl(m, top.x, top.y - RL, 'OH');
    bnd(m, top, oh);
  };
  TB.Trp = function (m, CA) {
    var p = column(m, CA, [{ t: 'CH_2' }]);
    var ipso = at(0, p[0].y - ROW);
    bnd(m, p[0], ipso);
    var r5 = C.ring(ipso, 90, 5, RL);
    var q = r5.pts, CG = q[0], CD2 = q[1], CE2 = q[2], NE1 = q[3], CD1 = q[4];
    bnd(m, CG, CD1, 2); bnd(m, CD1, NE1); bnd(m, NE1, CE2); bnd(m, CD2, CG);
    m.atom(NE1, 'N', { cls: W });
    var h = at(NE1.x + 12, NE1.y - 22);
    m.atom(h, 'H', { cls: W }); bnd(m, NE1, h);
    var r6 = C.ringOnEdge(CD2, CE2, r5.c, 6), g = r6.pts;
    bnd(m, g[0], g[1], 2); bnd(m, g[1], g[2]); bnd(m, g[2], g[3], 2);
    bnd(m, g[3], g[4]); bnd(m, g[4], g[5], 2); bnd(m, g[5], g[0]);
  };

  TB.Ser = function (m, CA) { column(m, CA, [{ t: 'CH_2' }, { t: 'OH' }]); };
  TB.Thr = function (m, CA) { column(m, CA, [{ t: 'HCOH', head: 1 }, { t: 'CH_3' }]); };
  TB.Asn = function (m, CA) {
    var p = column(m, CA, [{ t: 'CH_2' }, { t: 'C' }]);
    amide(m, p[1], 'NH_2');
  };
  TB.Gln = function (m, CA) {
    var p = column(m, CA, [{ t: 'CH_2' }, { t: 'CH_2' }, { t: 'C' }]);
    amide(m, p[2], 'NH_2');
  };

  TB.Lys = function (m, CA) {
    column(m, CA, [{ t: 'CH_2' }, { t: 'CH_2' }, { t: 'CH_2' }, { t: 'CH_2' }, { t: '^+NH_3', head: 1 }]);
  };
  TB.Arg = function (m, CA) {
    var p = column(m, CA, [{ t: 'CH_2' }, { t: 'CH_2' }, { t: 'CH_2' }, { t: 'NH' }, { t: 'C' }]);
    var cz = p[4];
    var nh2 = lbl(m, 0, cz.y - ROW, 'NH_2');  bnd(m, cz, nh2);
    var im  = lbl(m, ARM + 6, cz.y, '^+NH_2', 1); bnd(m, cz, im, 2);
  };
  TB.His = function (m, CA) {
    var p = column(m, CA, [{ t: 'CH_2' }]);
    var ipso = at(0, p[0].y - ROW);
    bnd(m, p[0], ipso);
    /* rotated so the ring has a vertex at the top and the two nitrogens sit
       upper-left / right, the way the textbook draws the imidazolium */
    var r = C.ring(ipso, 54, 5, RL);
    var q = r.pts, CG = q[0], ND1 = q[1], CE1 = q[2], NE2 = q[3], CD2 = q[4];
    m.atom(ND1, 'HN', { head: 1, cls: W });
    m.atom(NE2, '^+NH', { head: 1, cls: W });
    bnd(m, CG, ND1); bnd(m, ND1, CE1); bnd(m, CE1, NE2, 2);
    bnd(m, NE2, CD2); bnd(m, CD2, CG, 2);
  };

  TB.Asp = function (m, CA) { column(m, CA, [{ t: 'CH_2' }, { t: 'COO^-' }]); };
  TB.Glu = function (m, CA) { column(m, CA, [{ t: 'CH_2' }, { t: 'CH_2' }, { t: 'COO^-' }]); };

  /* ---- backbone + assembly ---- */
  function backbone(m, isPro) {
    var CA = at(0, 0), N = at(-GAP, 0), CO = at(GAP, 0), H = at(0, ROW);
    m.atom(CA, 'C');
    m.atom(N, isPro ? 'H_2N^+' : 'H_3N^+', { head: 2 });
    m.atom(CO, 'COO^-');
    m.atom(H, 'H');
    if (!isPro) m.bond(N, CA);                    // proline's N–Cα is part of the ring
    else m.bond(N, CA);
    m.bond(CA, CO); m.bond(CA, H);
    return CA;
  }

  window.buildTextbook = function (aa) {
    if (!TB[aa.key]) return null;
    var m = new C.Mol();
    var CA = backbone(m, aa.key === 'Pro');
    var mk = m.mark();
    TB[aa.key](m, CA);
    m.boxFrom(mk, 9, -14);   // never let the box swallow the backbone row
    return m.render({
      cls: 'tb', w: 236, h: 268, hl: window.CAT[aa.cat].deep,
      alt: aa.name + ' (textbook style): ' + aa.rShort
    });
  };

  window.AA.forEach(function (a) { a.svgTb = window.buildTextbook(a); });
})();
