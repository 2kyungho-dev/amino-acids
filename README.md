# The 20 Amino Acids — study & quiz

A single-page study tool: every amino acid drawn as a proper skeletal formula,
plus an adaptive multiple-choice/typed quiz that remembers what you keep missing.

## Run it

Open `index.html` in a browser — no server, no build step, no dependencies.

For a version you can email or copy onto a phone, run `python3 build.py`
and use the self-contained `dist/amino-acids.html`.

## Layout

| file | what's in it |
|---|---|
| `js/chem.js` | the drawing engine: bond geometry, atom labels, ring builders, highlight boxes, SVG output |
| `js/structures.js` | **skeletal** style — the backbone + the 20 side chains as bonds and angles |
| `js/textbook.js` | **textbook** style — the same 20 as condensed stacked formulas in a class-coloured box |
| `js/data.js` | names, codes, class, pKa, R groups, chemistry notes, etymology, memory-palace steps |
| `js/journey.js` | the memory-palace walk-through tab |
| `js/store.js` | per-amino-acid scores and saved quiz settings (localStorage) |
| `js/study.js` | the browsable card view and the reference table |
| `js/quiz.js` | round building, the eight question types, scoring, results |
| `js/app.js` | tab switching |
| `css/style.css` | everything visual outside the molecules |

## Drawing conventions

Both styles show the free amino acid at pH 7 (zwitterion), and the Study
toolbar switches between them:

* **Skeletal** (abstract) — bonds as lines, carbons implied. The backbone
  (⁻OOC–Cα–NH₃⁺) is greyed out and an **R** marker sits where the side chain
  leaves the α-carbon, so the only thing in full ink is the part that differs.
  Histidine is the neutral Nε2–H tautomer.
* **Textbook** (specific) — the backbone written out horizontally as
  H₃N⁺–C(–H)–COO⁻ with every atom of the side chain stacked above it and
  reversed out of a box tinted with the class colour. Histidine is the
  protonated imidazolium, the way most textbooks print it.

Bond lengths and angles are identical across all twenty in both styles, so
shapes can be compared directly. Implicit hydrogens on carbon are not drawn.

## Memory palace

`JOURNEY` in `js/data.js` holds a 20-step story (Korean) that walks through a
house in the same order as the `AA` array; each step is attached to its amino
acid as `a.mnemo`. The **Journey** tab renders it grouped by room, with a
"이름 가리기" mode that blurs the answer so you can test yourself on each cue.

## Quiz

Seven question types, listed in `TYPES` in `js/quiz.js`. With **주관식 · typed
answers** on (the default) every type except "pick the structure" becomes free
text: a name is accepted as its full spelling, either code, or a documented
alias, and a single typo is forgiven — but only when the answer is
unambiguously aimed at the right amino acid, so `glutamine` never passes as
`glutamic acid`. Turn it off for plain multiple choice.

## Adding an amino acid (or a modified residue)

Add an entry to `AA` in `js/data.js`, then a matching `SIDE.<key>` function in
`js/structures.js`. Side chains are written as angles off Cα — e.g. serine is

```js
SIDE.Ser = function (m, bb) {
  var CB = step(bb.CA, 30);
  m.bond(bb.CA, CB); m.cut(bb.CA, CB);       // cut() places the R marker
  var O = step(CB, -30);
  m.bond(CB, O); m.atom(O, 'OH', { cls: 'o' });
};
```

For the textbook style, add a `TB.<key>` in `js/textbook.js` — those are
stacked rows rather than angles:

```js
TB.Ser = function (m, CA) { column(m, CA, [{ t: 'CH_2' }, { t: 'OH' }]); };
```

An amino acid with no `TB` entry simply falls back to its skeletal drawing.
