/* =========================================================================
   data.js — the 20 proteinogenic amino acids.
   `rFull` is the side chain written out; `rShort` is the label used on
   quiz cards. pKa values are the usual textbook approximations.
   ========================================================================= */
window.CAT = {
  nonpolar: {
    label: 'Nonpolar / hydrophobic', short: 'Nonpolar', color: '#e0a53f', deep: '#8a6116',
    desc: 'Uncharged, largely hydrocarbon side chains. They avoid water and pack into the protein core.'
  },
  polar: {
    label: 'Polar, uncharged', short: 'Polar', color: '#3fbcae', deep: '#186b62',
    desc: 'Hydroxyl and amide groups that hydrogen-bond with water and with each other.'
  },
  basic: {
    label: 'Basic / positively charged', short: 'Basic', color: '#7f93f2', deep: '#414fa6',
    desc: 'Nitrogen-rich side chains that hold a proton at pH 7, carrying a full + charge.'
  },
  acidic: {
    label: 'Acidic / negatively charged', short: 'Acidic', color: '#ee6f7a', deep: '#a4363f',
    desc: 'A second carboxyl group that gives up its proton at pH 7, carrying a full − charge.'
  }
};
window.CAT_ORDER = ['nonpolar', 'polar', 'basic', 'acidic'];

window.AA = [
{ key:'Gly', name:'Glycine', three:'Gly', one:'G', cat:'nonpolar', essential:false,
  rShort:'–H', rFull:'–H',
  chem:'The only achiral amino acid — its "side chain" is a single hydrogen, so it fits where nothing else can and gives backbones unusual flexibility.',
  ety:'Greek <b>glykys</b> ("sweet"). Isolated in 1820 from boiled gelatin; it tasted sweet, so it was first called a "sugar" before being renamed glycine.',
  codeNote:'Code = first letter (nothing else claims G).' },

{ key:'Ala', name:'Alanine', three:'Ala', one:'A', cat:'nonpolar', essential:false,
  rShort:'–CH₃', rFull:'–CH₃',
  chem:'A single methyl group — the smallest hydrophobic side chain, and the reference point everything else is compared to.',
  ety:'From <b>aldehyde</b>. First made synthetically in 1850 by Adolph Strecker starting from acetaldehyde, and the name echoes that starting material.',
  codeNote:'Code = first letter (nothing else claims A).' },

{ key:'Val', name:'Valine', three:'Val', one:'V', cat:'nonpolar', essential:true,
  rShort:'–CH(CH₃)₂', rFull:'–CH(CH₃)₂',
  chem:'Branches immediately at the β carbon. That bulk right next to the backbone stiffens the chain and favours β sheets.',
  ety:'From <b>valeric acid</b> (itself named after the valerian plant). Valine’s name is a shortening of "aminovaleric acid."',
  codeNote:'Code = first letter (nothing else claims V).' },

{ key:'Leu', name:'Leucine', three:'Leu', one:'L', cat:'nonpolar', essential:true,
  rShort:'–CH₂CH(CH₃)₂', rFull:'–CH₂–CH(CH₃)₂',
  chem:'One CH₂ spacer, then a fork. The most common amino acid in proteins, and the classic filler of hydrophobic cores.',
  ety:'Greek <b>leukos</b> ("white"). Named in 1820 for the white crystals isolated from acid-treated muscle fibre.',
  codeNote:'Code = first letter — leucine "wins" the L over lysine.' },

{ key:'Ile', name:'Isoleucine', three:'Ile', one:'I', cat:'nonpolar', essential:true,
  rShort:'–CH(CH₃)CH₂CH₃', rFull:'–CH(CH₃)–CH₂CH₃',
  chem:'Same atoms as leucine, wired differently: the branch sits on the β carbon, giving it a second stereocentre.',
  ety:'Literally <b>iso-leucine</b> — an isomer of leucine, recognised in 1903 once chemists noticed a second compound hiding in "pure" leucine samples.',
  codeNote:'Code = "I" (first letter); "L" was already claimed by leucine.' },

{ key:'Pro', name:'Proline', three:'Pro', one:'P', cat:'nonpolar', essential:false,
  rShort:'ring back to backbone N', rFull:'–CH₂CH₂CH₂– (closes onto the backbone N)',
  chem:'Its side chain loops back and bonds the backbone nitrogen. That locked five-membered ring is why proline kinks helices and breaks sheets.',
  ety:'A contraction of <b>pyrrolidine</b>-carboxylic acid. "Pyrrolidine" traces to Greek <b>pyrrhos</b> ("fiery/red"), from a colour test once used to identify related ring compounds.',
  codeNote:'Code = first letter (nothing else claims P).' },

{ key:'Cys', name:'Cysteine', three:'Cys', one:'C', cat:'nonpolar', essential:false, pka:'≈ 8.3',
  catTag:'polar in some texts',
  catNote:'Textbooks disagree about this one. Grouped here as nonpolar/hydrophobic — the S–H bond is barely polar and cysteine buries itself readily, and hydropathy scales score it among the more hydrophobic residues. Lehninger and several others file it under polar, uncharged instead, because the thiol can hydrogen-bond and does ionise (pKa ≈ 8.3). Go with whichever your course uses.',
  rShort:'–CH₂SH', rFull:'–CH₂–SH',
  chem:'A thiol. Two cysteines can oxidise into a disulfide bridge — the only covalent cross-link in ordinary protein folding.',
  ety:'Greek <b>kystis</b> ("bladder"). Related to cystine, first isolated from bladder stones in 1810.',
  codeNote:'Code = first letter (nothing else claims C).' },

{ key:'Met', name:'Methionine', three:'Met', one:'M', cat:'nonpolar', essential:true,
  rShort:'–CH₂CH₂SCH₃', rFull:'–CH₂CH₂–S–CH₃',
  chem:'A sulfur sitting inside the chain (a thioether), not at the end. Unreactive, mildly hydrophobic — and the start codon of every protein.',
  ety:'Named for its <b>methylthiol</b> group: methyl + thio (Greek <b>theion</b>, "sulfur"). Identified in 1928 as a sulfur-containing amino acid from casein.',
  codeNote:'Code = first letter (nothing else claims M).' },

{ key:'Phe', name:'Phenylalanine', three:'Phe', one:'F', cat:'nonpolar', essential:true,
  rShort:'–CH₂–C₆H₅', rFull:'–CH₂–phenyl',
  chem:'Alanine with a benzene ring bolted on. Big, flat and greasy — rings like this stack against each other inside proteins.',
  ety:'Literally <b>phenyl-alanine</b>: alanine with a phenyl (benzene) ring attached, discovered in the 1880s.',
  codeNote:'Code = "F", from the sound of the second syllable ("<b>F</b>enylalanine"); "P" was taken by proline.' },

{ key:'Trp', name:'Tryptophan', three:'Trp', one:'W', cat:'nonpolar', essential:true,
  rShort:'–CH₂–indole', rFull:'–CH₂–indole (fused 5+6 ring with NH)',
  chem:'The largest side chain: a two-ring indole with an N–H that can still hydrogen-bond. It dominates a protein’s UV absorbance at 280 nm.',
  ety:'From <b>tryptic</b> (produced by trypsin digestion) + Greek <b>phainein</b> ("to appear") — it was noticed as a substance that appeared during tryptic digestion of proteins.',
  codeNote:'Code = "W": the double ring of indole is said to look like a "W."' },

{ key:'Ser', name:'Serine', three:'Ser', one:'S', cat:'polar', essential:false,
  rShort:'–CH₂OH', rFull:'–CH₂–OH',
  chem:'A tiny hydroxyl. Small enough to sit anywhere, reactive enough to be the nucleophile in serine proteases and a favourite phosphorylation site.',
  ety:'Latin <b>sericum</b> ("silk"). First isolated in 1865 from sericin, a silk protein.',
  codeNote:'Code = first letter (nothing else claims S).' },

{ key:'Thr', name:'Threonine', three:'Thr', one:'T', cat:'polar', essential:true,
  rShort:'–CH(OH)CH₃', rFull:'–CH(OH)–CH₃',
  chem:'Serine’s hydroxyl plus a methyl on the same carbon — a secondary alcohol, and one of only two side chains with a second stereocentre.',
  ety:'Named for its structural resemblance to the sugar <b>threose</b>. The last of the 20 standard amino acids to be discovered, in 1935.',
  codeNote:'Code = first letter (nothing else claims T).' },

{ key:'Tyr', name:'Tyrosine', three:'Tyr', one:'Y', cat:'polar', essential:false, pka:'≈ 10.5',
  rShort:'–CH₂–C₆H₄–OH', rFull:'–CH₂–phenol',
  chem:'Phenylalanine plus a para hydroxyl. That one OH makes it polar, weakly acidic, and the third classic phosphorylation target.',
  ety:'Greek <b>tyros</b> ("cheese"). Discovered by Justus von Liebig in 1846 from casein, a cheese/milk protein.',
  codeNote:'Code = "Y": the phenol ring on its stalk is said to look like a "Y."' },

{ key:'Asn', name:'Asparagine', three:'Asn', one:'N', cat:'polar', essential:false,
  rShort:'–CH₂CONH₂', rFull:'–CH₂–C(=O)NH₂',
  chem:'The neutral amide of aspartic acid. Never carries a charge, and its NH₂ is where N-linked glycosylation attaches sugars.',
  ety:'Named directly after <b>asparagus</b>, the plant it was first isolated from in 1806 — possibly the very first amino acid ever named.',
  codeNote:'Code = "N" — it’s sitting right there in "asparagi<b>n</b>e."' },

{ key:'Gln', name:'Glutamine', three:'Gln', one:'Q', cat:'polar', essential:false,
  rShort:'–CH₂CH₂CONH₂', rFull:'–CH₂CH₂–C(=O)NH₂',
  chem:'Asparagine with one extra CH₂. The blood’s main nitrogen shuttle, and the most abundant free amino acid in the body.',
  ety:'The amide counterpart of glutamic acid — named by analogy once chemists inferred a "hidden" precursor was turning into that acid during hydrolysis.',
  codeNote:'Code = "Q" (say "<b>Q</b>-tamine"); G and E were already taken.' },

{ key:'Lys', name:'Lysine', three:'Lys', one:'K', cat:'basic', essential:true, pka:'≈ 10.5',
  rShort:'–(CH₂)₄NH₃⁺', rFull:'–CH₂CH₂CH₂CH₂–NH₃⁺',
  chem:'A long flexible arm ending in a primary amine. Solidly protonated at pH 7, so it sits on protein surfaces and grips DNA’s phosphates.',
  ety:'From Greek <b>lysis</b> ("loosening/breaking down"), reflecting its isolation via acid hydrolysis of the protein casein in 1889.',
  codeNote:'Code = "K", the letter next to L in the alphabet, since leucine took "L."' },

{ key:'Arg', name:'Arginine', three:'Arg', one:'R', cat:'basic', essential:false, pka:'≈ 12.5',
  rShort:'–(CH₂)₃–guanidinium', rFull:'–(CH₂)₃–NH–C(=NH₂⁺)NH₂',
  chem:'The guanidinium cap spreads its + charge over three nitrogens, so arginine is the most reliably positive residue — charged at essentially any pH life uses.',
  ety:'From Greek <b>arginoeis</b> ("bright, shining white"), describing the strikingly white precipitate formed when it was first isolated from lupine seedlings in 1886.',
  codeNote:'Code = "R" (second letter); "A" was already taken by alanine.' },

{ key:'His', name:'Histidine', three:'His', one:'H', cat:'basic', essential:true, pka:'≈ 6.0',
  rShort:'–CH₂–imidazole', rFull:'–CH₂–imidazole ring',
  chem:'Its pKa sits right at physiological pH, so it flips between neutral and + as conditions shift — which is why it turns up in nearly every enzyme active site.',
  ety:'From Greek <b>histos</b> ("tissue"), reflecting its abundance in proteins extracted from animal tissue (identified in the 1890s).',
  codeNote:'Code = first letter (nothing else claims H).' },

{ key:'Asp', name:'Aspartic acid', three:'Asp', one:'D', cat:'acidic', essential:false, pka:'≈ 3.9',
  alias:['aspartate','aspartic'],
  catTag:'a.k.a. aspartate',
  catNote:'Two names, one amino acid. "Aspartic acid" is the neutral molecule; at pH 7 the side chain has given its proton away, so what is drawn here — and what exists in your cells — is the anion, aspartate. Both names refer to the same residue, and papers use them interchangeably.',
  rShort:'–CH₂COO⁻', rFull:'–CH₂–COO⁻',
  chem:'A short arm ending in a carboxylate — deprotonated and negative at pH 7, so it pairs with lysine and arginine in salt bridges.',
  ety:'Derived from <b>asparagine</b>; chemists tweaked the spelling to "aspartic" specifically to flag it as a lab-made derivative rather than a compound found free in nature.',
  codeNote:'Code = "D" — think "aspar<b>D</b>ate."' },

{ key:'Glu', name:'Glutamic acid', three:'Glu', one:'E', cat:'acidic', essential:false, pka:'≈ 4.2',
  alias:['glutamate','glutamic'],
  catTag:'a.k.a. glutamate',
  catNote:'Two names, one amino acid. "Glutamic acid" is the neutral molecule; at pH 7 the side chain is deprotonated, so the drawing here shows the anion, glutamate — the form MSG delivers and the one the brain uses as a neurotransmitter.',
  rShort:'–CH₂CH₂COO⁻', rFull:'–CH₂CH₂–COO⁻',
  chem:'Glutamic acid is aspartic acid plus one CH₂. That extra reach lets it grab metal ions, and free glutamate is the brain’s main excitatory neurotransmitter.',
  ety:'From German <b>Kleber</b> / Latin <b>gluten</b> ("glue") — the gluey wheat material it was first isolated from in 1866.',
  codeNote:'Code = "E" — paired by elimination with glutamine’s "Q."' }
];

/* =========================================================================
   The memory palace — the walk through the house, in the same order as the
   AA array above. Each step is attached to its amino acid as `a.mnemo`.
   ========================================================================= */
window.PLACES = [
  { id:'yard',   label:'마당 & 현관',   en:'Yard & front door' },
  { id:'room',   label:'누나방',        en:"Sister's room" },
  { id:'hall',   label:'복도',          en:'Hallway' },
  { id:'living', label:'거실',          en:'Living room' },
  { id:'bath',   label:'화장실 약장',   en:'Bathroom cabinet' },
  { id:'living2',label:'다시 거실',     en:'Back to the living room' }
];

window.JOURNEY = [
  { key:'Gly', place:'yard',   k:'글라이더',        s:'글라이더를 타고 날아와 마당에 착륙한다.' },
  { key:'Ala', place:'yard',   k:'알라신',          s:'현관문을 열고 들어가기 전, 알라신께 기도를 올린다.' },
  { key:'Val', place:'yard',   k:'발',              s:'기도를 마치고 발을 씻는다.' },
  { key:'Leu', place:'yard',   k:'리신 발차기',     s:'발을 다 씻고 리신 발차기를 한다.' },
  { key:'Ile', place:'yard',   k:'두 번 더',        s:'이어서 발차기를 두 번 더 한다. (iso = 하나 더)' },
  { key:'Pro', place:'yard',   k:'프로게이머',      s:'발차기 연습을 계속하다 실력이 늘어 프로게이머가 된다.' },

  { key:'Cys', place:'room',   k:'누나방',          s:'프로게이머가 되어 누나방에 들어간다.' },
  { key:'Met', place:'room',   k:'멧돼지',          s:'방에 들어가자마자 멧돼지가 튀어나와 깜짝 놀란다!' },
  { key:'Phe', place:'room',   k:'다시 알라신',     s:'너무 놀라서 다시 한 번 알라신께 기도를 드린다. (페닐 + 알라닌)' },
  { key:'Trp', place:'room',   k:'트림',            s:'기도를 마치고 일어나는데 갑자기 크게 트림을 한다.' },

  { key:'Ser', place:'hall',   k:'세제',            s:'복도로 나오니 바닥에 세제가 쏟아져 있어 밟을 뻔한다.' },
  { key:'Thr', place:'hall',   k:'당구공 3번',      s:'조심조심 피해 가다가 굴러다니던 당구공 3번을 발로 툭 차버린다.' },
  { key:'Tyr', place:'hall',   k:'타이어',          s:'당구공이 굴러가 복도에 있던 타이어에 부딪혀 멈춘다.' },

  { key:'Asn', place:'living', k:'아스파라거스',    s:'거실 테이블 위에 싱싱한 아스파라거스 한 다발이 놓여 있다.' },
  { key:'Gln', place:'living', k:'글루건',          s:'그 옆에서 누군가 글루건으로 무언가를 붙이고 있다.' },

  { key:'Lys', place:'bath',   k:'라이신 연고',     s:'화장실 약장을 열면 입술 물집에 바르는 라이신 연고가 있다.' },
  { key:'Arg', place:'bath',   k:'아르기닌 영양제', s:'그 옆에는 피로회복용 아르기닌 영양제가 놓여 있다.' },
  { key:'His', place:'bath',   k:'항히스타민제',    s:'그리고 알레르기 때문에 먹는 항히스타민제가 놓여 있다.' },

  { key:'Asp', place:'living2',k:'제로콜라 캔',     s:'거실로 돌아오니 아스파라거스 옆에 제로콜라 캔이 놓여 있다. (아스파탐)' },
  { key:'Glu', place:'living2',k:'MSG 조미료 통',   s:'글루건 옆 조미료 통에는 MSG라고 적혀 있다.' }
];

(function () {
  var byKey = {};
  window.AA.forEach(function (a) { byKey[a.key] = a; });
  window.JOURNEY.forEach(function (j, i) {
    var a = byKey[j.key];
    if (a) { a.mnemo = j; a.step = i + 1; }
  });
})();

/* =========================================================================
   Structure codes — a shorthand for the side-chain skeleton, so the shape
   can be recalled from the name (and back) without drawing anything.
      1 = one carbon      O = –OH        S = sulfur      N = chain –NH–
      0 = no side chain   카 = –COO⁻     아 = –NH₃⁺      CON = amide
      헥 = six-ring       펜 = five-ring
   ========================================================================= */
window.CODE_KEY = [
  { s:'1',   m:'탄소 하나',            e:'one carbon in the chain' },
  { s:'0',   m:'곁사슬 없음 (–H)',     e:'no side chain at all' },
  { s:'O',   m:'하이드록시 –OH',       e:'hydroxyl' },
  { s:'S',   m:'황 –SH / –S–',         e:'sulfur' },
  { s:'N',   m:'사슬 중간의 –NH–',     e:'nitrogen inside the chain' },
  { s:'CON', m:'아마이드 –CONH₂',      e:'amide' },
  { s:'카',  m:'카복실기 –COO⁻',       e:'carboxylate' },
  { s:'아',  m:'아민 –NH₃⁺',           e:'amine' },
  { s:'헥',  m:'육각 고리 (벤젠)',      e:'six-membered ring' },
  { s:'펜',  m:'오각 고리',            e:'five-membered ring' }
];

/* typing 헥/펜/카/아 needs a Korean keyboard, so these spellings count too */
window.CODE_ROMAN = { '헥':'hex', '펜':'pen', '카':'cooh', '아':'nh3' };

window.CODES = {
  Gly:{ c:'0',      h:'곁사슬이 수소 하나뿐 — 탄소 0개.' },
  Ala:{ c:'1',      h:'탄소 하나(–CH₃)가 전부.' },
  Val:{ c:'12',     h:'탄소 하나에서 갈라져 메틸 둘. Pro의 21과 뒤집힌 짝.' },
  Leu:{ c:'112',    h:'한 칸 더 간 뒤 메틸 둘. Ile의 211과 뒤집힌 짝.' },
  Ile:{ c:'211',    h:'Leu(112)를 뒤집은 모양 — 갈라짐이 먼저 온다.' },
  Pro:{ c:'21',     h:'탄소 셋이 고리를 이뤄 골격 N으로 돌아간다. Val의 12와 뒤집힌 짝.' },
  Cys:{ c:'1S',     h:'탄소 하나 + 황(–SH). Ser의 1O에서 O만 S로.' },
  Met:{ c:'11S1',   h:'탄소 둘 + 황 + 메틸. 황이 사슬 끝이 아니라 안쪽에 있다.' },
  Phe:{ c:'1헥',    h:'탄소 하나 + 육각 고리.' },
  Trp:{ c:'1헥펜',  h:'탄소 하나 + 육각·오각이 붙은 두 고리(인돌).' },
  Ser:{ c:'1O',     h:'탄소 하나 + –OH.' },
  Thr:{ c:'11',     h:'탄소 하나에 –OH와 메틸이 함께 붙는다.' },
  Tyr:{ c:'1헥O',   h:'Phe(1헥)에 –OH 하나가 더 붙은 것.' },
  Asn:{ c:'1CON',   h:'탄소 하나 + 아마이드. Gln의 2CON과 한 칸 차이.' },
  Gln:{ c:'2CON',   h:'Asn(1CON)보다 탄소가 하나 더.' },
  Lys:{ c:'1111아', h:'탄소 넷을 쭉 간 뒤 아민. 곁사슬 중 가장 긴 직선.' },
  Arg:{ c:'111N1아',h:'탄소 셋 + N + 탄소 + 아민 — 끝이 구아니디늄.' },
  His:{ c:'1펜',    h:'탄소 하나 + 오각 고리(이미다졸).' },
  Asp:{ c:'1카',    h:'탄소 하나 + 카복실기. Glu의 2카와 한 칸 차이.' },
  Glu:{ c:'2카',    h:'Asp(1카)보다 탄소가 하나 더.' }
};

/* the pairs worth memorising together */
window.CODE_PAIRS = [
  { a:'Leu', b:'Ile', note:'<b>112 ↔ 211</b> — 뒤집으면 서로가 된다. 실제로도 서로 이성질체.' },
  { a:'Val', b:'Pro', note:'<b>12 ↔ 21</b> — 역시 뒤집힌 관계.' },
  { a:'Ser', b:'Cys', note:'<b>1O ↔ 1S</b> — O 자리에 S만 바뀐 꼴.' },
  { a:'Asp', b:'Glu', note:'<b>1카 → 2카</b> — 탄소 하나 차이.' },
  { a:'Asn', b:'Gln', note:'<b>1CON → 2CON</b> — 위와 똑같은 규칙.' },
  { a:'Phe', b:'Tyr', note:'<b>1헥 → 1헥O</b> — –OH 하나가 붙으면 타이로신.' }
];

(function () {
  window.AA.forEach(function (a) {
    var c = window.CODES[a.key];
    if (c) { a.scode = c.c; a.scodeNote = c.h; }
  });
  /* the same code written without Korean, for typed answers */
  window.romanCode = function (code) {
    var out = String(code);
    Object.keys(window.CODE_ROMAN).forEach(function (k) {
      out = out.split(k).join(window.CODE_ROMAN[k]);
    });
    return out;
  };
})();
