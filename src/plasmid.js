// Construct: doxycycline-inducible EGFP reporter (Tet-On 3G) for HEK293,
// ampicillin-selectable, pUC origin. ~7420 bp.
export const TOTAL_BP = 7420;

// order = the sequence in which features fade in during assembly (backbone first,
// then the constitutive rtTA cassette, then the inducible GFP cassette).
export const FEATURES = [
  {
    key: "ori", name: "pUC ori", role: "Origin of replication",
    start: 60, end: 749, hex: "#1f6f78", order: 0,
    detail: "The high-copy pUC origin. It tells E. coli where to start copying the plasmid, so the construct sticks around.",
  },
  {
    key: "ampr", name: "AmpR", role: "Selectable marker",
    start: 950, end: 1810, hex: "#b26a1a", order: 1,
    detail: "Beta-lactamase gives ampicillin resistance, so only the cells that took up the plasmid survive.",
  },
  {
    key: "cmv", name: "CMV promoter", role: "Constitutive promoter",
    start: 2050, end: 2640, hex: "#6a4bb0", order: 2,
    detail: "An always-on mammalian promoter that drives the rtTA transactivator in HEK293 cells.",
  },
  {
    key: "rtta", name: "rtTA3G", role: "Tet-On transactivator",
    start: 2670, end: 3410, hex: "#3f5aa6", order: 3,
    detail: "The reverse tet transactivator. It binds the TRE only when doxycycline is present.",
  },
  {
    key: "bgh", name: "BGH polyA", role: "Terminator",
    start: 3440, end: 3660, hex: "#8b9099", order: 4,
    detail: "A polyadenylation signal that cleanly ends the rtTA transcript.",
  },
  {
    key: "tre", name: "TRE3G", role: "Dox-inducible promoter",
    start: 3860, end: 4260, hex: "#9c4a8b", order: 5,
    detail: "The tet-responsive element. It stays silent until dox-bound rtTA switches it on. This is the inducible switch.",
  },
  {
    key: "gfp", name: "EGFP", role: "Gene of interest",
    start: 4290, end: 5010, hex: "#2f9e6f", order: 6,
    detail: "Enhanced green fluorescent protein, the reporter payload. It is expressed only under doxycycline.",
  },
  {
    key: "wpre", name: "WPRE", role: "Expression enhancer",
    start: 5040, end: 5640, hex: "#2f8f9b", order: 7,
    detail: "A post-transcriptional element that boosts GFP mRNA stability and yield.",
  },
  {
    key: "sv40", name: "SV40 polyA", role: "Terminator",
    start: 5670, end: 5900, hex: "#adb2ba", order: 8,
    detail: "Ends and polyadenylates the GFP transcript for clean, complete expression.",
  },
  {
    key: "mcs", name: "MCS", role: "Multiple cloning site",
    start: 6100, end: 6240, hex: "#c0567e", order: 9,
    detail: "A cluster of unique restriction sites for swapping the payload, checked to be conflict-free.",
  },
];

// polar geometry: 0 bp at top (-90deg), running clockwise
export function bpToAngle(bp) {
  return (bp / TOTAL_BP) * 360 - 90;
}
export function polar(cx, cy, r, angleDeg) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
// arc path along a circle of radius r from a1->a2 (clockwise)
export function arcPath(cx, cy, r, a1, a2) {
  const p1 = polar(cx, cy, r, a1);
  const p2 = polar(cx, cy, r, a2);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}
