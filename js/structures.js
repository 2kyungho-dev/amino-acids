/* =========================================================================
   structures.js — every amino acid drawn as the free molecule at pH 7
   (zwitterion). The backbone is greyed out; the R group is the only thing
   in full ink, with a dashed tick marking where it branches off Cα.
   ========================================================================= */
(function () {
  'use strict';
  var C = window.CHEM, step = C.step;

  var CA_POS = { x: 70, y: 80 };

  /* greyed-out ⁻OOC–CαH–NH₃⁺ backbone */
  function backbone(m, opt) {
    opt = opt || {};
    var CA = { x: CA_POS.x, y: CA_POS.y };
    var Cc = step(CA, 150);                       // carboxyl carbon
    var O1 = step(Cc, 90), O2 = step(Cc, 210);
    m.bond(CA, Cc, { cls: 'bb' });
    m.bond(Cc, O1, { order: 2, cls: 'bb' }); m.atom(O1, 'O', { cls: 'bb' });
    m.bond(Cc, O2, { cls: 'bb' });               m.atom(O2, '^-O', { head: 1, cls: 'bb' });
    var N = step(CA, 270);
    if (!opt.ringN) { m.bond(CA, N, { cls: 'bb' }); m.atom(N, 'NH_3^+', { cls: 'bb' }); }
    return { CA: CA, N: N, C: Cc };
  }

  /* ---------- the twenty side chains ---------- */
  var SIDE = {};

  SIDE.Gly = function (m, bb) {
    var H = step(bb.CA, 30);
    m.bond(bb.CA, H); m.atom(H, 'H');
    m.cut(bb.CA, H);
  };

  SIDE.Ala = function (m, bb) {
    var CB = step(bb.CA, 30);
    m.bond(bb.CA, CB); m.cut(bb.CA, CB);
  };

  SIDE.Val = function (m, bb) {
    var CB = step(bb.CA, 30);
    m.bond(bb.CA, CB); m.cut(bb.CA, CB);
    m.bond(CB, step(CB, 90));
    m.bond(CB, step(CB, -30));
  };

  SIDE.Leu = function (m, bb) {
    var p = m.chain(bb.CA, [30, -30]);            // CA, CB, CG
    m.cut(p[0], p[1]);
    m.bond(p[2], step(p[2], 30));
    m.bond(p[2], step(p[2], -90));
  };

  SIDE.Ile = function (m, bb) {
    var CB = step(bb.CA, 30);
    m.bond(bb.CA, CB); m.cut(bb.CA, CB);
    var CG1 = step(CB, -30);
    m.bond(CB, CG1); m.bond(CG1, step(CG1, 30));  // ethyl
    m.bond(CB, step(CB, 90));                     // methyl branch
  };

  SIDE.Pro = function (m, bb) {
    // the side chain closes back onto the backbone nitrogen
    var r = C.ringOnEdge(bb.CA, bb.N, bb.C, 5);   // CA, N, CD, CG, CB
    var pts = r.pts;
    m.bond(pts[0], pts[1], { cls: 'bb' });        // Cα–N is backbone
    m.atom(pts[1], 'H_2N^+', { head: 2, cls: 'bb' });
    m.bond(pts[1], pts[2]); m.bond(pts[2], pts[3]); m.bond(pts[3], pts[4]); m.bond(pts[4], pts[0]);
    m.cut(pts[0], pts[4]);
  };

  SIDE.Met = function (m, bb) {
    var p = m.chain(bb.CA, [30, -30]);            // CA, CB, CG
    m.cut(p[0], p[1]);
    var S = step(p[2], 30);
    m.bond(p[2], S); m.atom(S, 'S', { cls: 's' });
    m.bond(S, step(S, -30));                      // S-methyl
  };

  function benzene(m, ipso, dir) {
    var r = C.ring(ipso, dir, 6);
    m.ring(r.pts, r.c, [0, 2, 4]);
    return r;
  }

  SIDE.Phe = function (m, bb) {
    var p = m.chain(bb.CA, [30, -30]);            // CA, CB, CG(ipso)
    m.cut(p[0], p[1]);
    benzene(m, p[2], 0);
  };

  SIDE.Tyr = function (m, bb) {
    var p = m.chain(bb.CA, [30, -30]);
    m.cut(p[0], p[1]);
    var r = benzene(m, p[2], 0);
    var OH = step(r.pts[3], 0);                   // para position
    m.bond(r.pts[3], OH); m.atom(OH, 'OH', { cls: 'o' });
  };

  SIDE.Trp = function (m, bb) {
    var p = m.chain(bb.CA, [30, -30]);
    m.cut(p[0], p[1]);
    var CG = p[2];
    var r5 = C.ring(CG, 0, 5);                    // CG, CD2, CE2, NE1, CD1
    var pt = r5.pts, CD2 = pt[1], CE2 = pt[2], NE1 = pt[3], CD1 = pt[4];
    m.bond(CG, CD1, { order: 2, inner: r5.c });
    m.bond(CD1, NE1);
    m.bond(NE1, CE2);
    m.atom(NE1, 'NH', { cls: 'n' });
    m.bond(CD2, CG);
    var r6 = C.ringOnEdge(CD2, CE2, r5.c, 6);     // fused benzo ring
    var h = r6.pts;
    m.bond(h[0], h[1], { order: 2, inner: r6.c }); // CD2=CE2, shared edge
    m.bond(h[1], h[2]);
    m.bond(h[2], h[3], { order: 2, inner: r6.c });
    m.bond(h[3], h[4]);
    m.bond(h[4], h[5], { order: 2, inner: r6.c });
    m.bond(h[5], h[0]);
  };

  SIDE.Ser = function (m, bb) {
    var CB = step(bb.CA, 30);
    m.bond(bb.CA, CB); m.cut(bb.CA, CB);
    var O = step(CB, -30);
    m.bond(CB, O); m.atom(O, 'OH', { cls: 'o' });
  };

  SIDE.Thr = function (m, bb) {
    var CB = step(bb.CA, 30);
    m.bond(bb.CA, CB); m.cut(bb.CA, CB);
    var O = step(CB, 90);
    m.bond(CB, O); m.atom(O, 'OH', { cls: 'o' });
    m.bond(CB, step(CB, -30));                    // methyl
  };

  SIDE.Cys = function (m, bb) {
    var CB = step(bb.CA, 30);
    m.bond(bb.CA, CB); m.cut(bb.CA, CB);
    var S = step(CB, -30);
    m.bond(CB, S); m.atom(S, 'SH', { cls: 's' });
  };

  function amideOrAcid(m, CD, incoming, tail) {
    // incoming is the direction the chain arrived on; branches sit at ±60°
    var up = incoming + 60, down = incoming - 60;
    var O = step(CD, up), X = step(CD, down);
    m.bond(CD, O, { order: 2 }); m.atom(O, 'O', { cls: 'o' });
    m.bond(CD, X);
    if (tail === 'amide') m.atom(X, 'NH_2', { cls: 'n' });
    else                  m.atom(X, 'O^-',  { cls: 'o' });
  }

  SIDE.Asn = function (m, bb) { var p = m.chain(bb.CA, [30, -30]); m.cut(p[0], p[1]); amideOrAcid(m, p[2], -30, 'amide'); };
  SIDE.Asp = function (m, bb) { var p = m.chain(bb.CA, [30, -30]); m.cut(p[0], p[1]); amideOrAcid(m, p[2], -30, 'acid'); };
  SIDE.Gln = function (m, bb) { var p = m.chain(bb.CA, [30, -30, 30]); m.cut(p[0], p[1]); amideOrAcid(m, p[3], 30, 'amide'); };
  SIDE.Glu = function (m, bb) { var p = m.chain(bb.CA, [30, -30, 30]); m.cut(p[0], p[1]); amideOrAcid(m, p[3], 30, 'acid'); };

  SIDE.Lys = function (m, bb) {
    var p = m.chain(bb.CA, [30, -30, 30, -30]);   // CA CB CG CD CE
    m.cut(p[0], p[1]);
    var N = step(p[4], 30);
    m.bond(p[4], N); m.atom(N, 'NH_3^+', { cls: 'n' });
  };

  SIDE.Arg = function (m, bb) {
    var p = m.chain(bb.CA, [30, -30, 30]);        // CA CB CG CD
    m.cut(p[0], p[1]);
    var NE = step(p[3], -30);
    m.bond(p[3], NE); m.atom(NE, 'NH', { cls: 'n' });
    var CZ = step(NE, 30);
    m.bond(NE, CZ);
    var NH1 = step(CZ, 90), NH2 = step(CZ, -30);
    m.bond(CZ, NH1, { order: 2 }); m.atom(NH1, 'NH_2^+', { cls: 'n' });
    m.bond(CZ, NH2);               m.atom(NH2, 'NH_2',   { cls: 'n' });
  };

  SIDE.His = function (m, bb) {
    var p = m.chain(bb.CA, [30, -30]);
    m.cut(p[0], p[1]);
    var CG = p[2];
    var r = C.ring(CG, 0, 5);                     // CG, ND1, CE1, NE2, CD2
    var pt = r.pts, ND1 = pt[1], CE1 = pt[2], NE2 = pt[3], CD2 = pt[4];
    m.bond(CG, ND1);
    m.bond(ND1, CE1, { order: 2, inner: r.c });
    m.bond(CE1, NE2);
    m.bond(NE2, CD2);
    m.bond(CD2, CG, { order: 2, inner: r.c });
    m.atom(ND1, 'N',  { cls: 'n' });
    m.atom(NE2, 'NH', { cls: 'n' });
  };

  /* ---------- build every structure once ---------- */
  window.buildStructure = function (aa) {
    var m = new C.Mol();
    var bb = backbone(m, { ringN: aa.key === 'Pro' });
    SIDE[aa.key](m, bb);
    return m.render({ alt: aa.name + ': side chain ' + aa.rShort });
  };

  window.AA.forEach(function (a) { a.svg = window.buildStructure(a); });

  /* which of the two drawing styles the page is currently showing */
  window.DIAGRAM = 'skeletal';
  window.art = function (a) {
    return (window.DIAGRAM === 'textbook' && a.svgTb) ? a.svgTb : a.svg;
  };
})();
