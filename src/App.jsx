import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, animate as fmAnimate } from "framer-motion";
import PlasmidMap from "./PlasmidMap.jsx";
import { FEATURES } from "./plasmid.js";

/* ---------- reveal-on-scroll wrapper ---------- */
function Reveal({ children, delay = 0, y = 22, className, style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.21, 0.5, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- count-up number ---------- */
function CountUp({ to, prefix = "", suffix = "", decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = fmAnimate(mv, to, { duration: 1.3, ease: [0.16, 1, 0.3, 1] });
    const unsub = mv.on("change", (v) => setVal(v));
    return () => { controls.stop(); unsub(); };
  }, [inView, to]);
  return (
    <span ref={ref}>{prefix}{val.toLocaleString(undefined, {
      minimumFractionDigits: decimals, maximumFractionDigits: decimals,
    })}{suffix}</span>
  );
}

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
const ICONS = {
  file: (<svg viewBox="0 0 24 24" {...stroke}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 16.5h6" /></svg>),
  primer: (<svg viewBox="0 0 24 24" {...stroke}><path d="M4 8.5h12" /><path d="M13 5.5l3 3-3 3" /><path d="M20 15.5H8" /><path d="M11 18.5l-3-3 3-3" /></svg>),
  protocol: (<svg viewBox="0 0 24 24" {...stroke}><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9.5 4V3h5v1" /><path d="M9 12.5l1.8 1.8L15 10" /></svg>),
  send: (<svg viewBox="0 0 24 24" {...stroke}><path d="M21 3L10.5 13.5" /><path d="M21 3l-6.5 18-4-8-8-4L21 3z" /></svg>),
};

const STAGES = [
  { n: "L1", h: "Interpret", p: "Plain English becomes a structured DesignBrief (NLU)." },
  { n: "L2", h: "Retrieve", p: "RAG across 100K+ Addgene plasmids for close templates." },
  { n: "L3", h: "Generate", p: "A biological transformer composes the sequence." },
  { n: "L4", h: "Validate", p: "A deterministic engine checks every biological rule." },
  { n: "L5", h: "Assemble", p: "Annotated map, GenBank and FASTA, primers, order files." },
];

const CHECKS = [
  { s: "pass", n: "Restriction-site conflicts", m: "No cut sites clash with the MCS cloning strategy." },
  { s: "pass", n: "Regulatory compatibility", m: "CMV and TRE3G are valid mammalian promoters for HEK293. AmpR and the pUC ori are matched to the host." },
  { s: "pass", n: "Selectable marker present", m: "AmpR is present and correctly oriented for propagation in E. coli." },
  { s: "pass", n: "Terminators downstream", m: "BGH and SV40 polyA sit downstream of each coding sequence." },
  { s: "warn", n: "Codon optimization", m: "EGFP scores 0.82 for human usage. Two rare-codon clusters are flagged but not blocking." },
  { s: "pass", n: "Repeat and GC stability", m: "No destabilizing repeats. GC content is 51 percent, inside the synthesis window." },
];

const PROBLEMS = [
  { h: "Weeks of design time", p: "A skilled molecular biologist can spend two to four weeks on a single complex construct, reading papers, checking compatibility, and starting over when something fails." },
  { h: "The cost of failure", p: "Every failed construct burns reagents and synthesis orders that run $500 to $5,000 each. One dead experiment can cost more than $10,000 once you count labor and materials." },
  { h: "Knowledge gatekeeping", p: "Design still demands deep expertise, so students and scientists from nearby fields are mostly locked out. That quietly narrows who gets to try new ideas." },
  { h: "Hard to search", p: "Addgene holds more than 100,000 plasmids, but its keyword search takes real expertise and a bit of luck to surface the right one, let alone adapt it." },
  { h: "High failure rate", p: "Somewhere between 30 and 50 percent of constructs fail validation on the first try, usually from sequence errors, context mismatches, or incompatible regulatory elements." },
  { h: "No real generation", p: "SnapGene and Benchling are excellent editors. They visualize and annotate beautifully, but they cannot design or suggest anything on their own." },
];

const EXPORTS = [
  { icon: "file", h: "GenBank and FASTA", p: "A fully annotated sequence that opens cleanly in SnapGene from day one." },
  { icon: "primer", h: "Primer design", p: "Forward and reverse primers for the insert, with predicted melting temperatures." },
  { icon: "protocol", h: "Validation protocol", p: "What to expect at the bench, from sequencing reads to expression." },
  { icon: "send", h: "Synthesis handoff", p: "A deep-linked order to Twist, IDT, or GenScript, one confirmation away." },
];

export default function App() {
  const [hovered, setHovered] = useState(null);
  const [runId, setRunId] = useState(0);
  const [running, setRunning] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);
  const [doneStages, setDoneStages] = useState(-1);
  const mapRef = useRef(null);
  const mapInView = useInView(mapRef, { once: true, margin: "-120px" });

  function runDesign() {
    if (running) return;
    setRunning(true);
    setActiveStage(-1);
    setDoneStages(-1);
    let i = 0;
    const tick = () => {
      setActiveStage(i);
      setDoneStages(i - 1);
      if (i < STAGES.length - 1) {
        i += 1;
        setTimeout(tick, 600);
      } else {
        setTimeout(() => {
          setDoneStages(STAGES.length - 1);
          setActiveStage(-1);
          setRunning(false);
          setRunId((r) => r + 1);
          mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 600);
      }
    };
    tick();
  }

  return (
    <>
      <div className="bg-field" />
      <div className="bg-grid" />

      <nav className="nav">
        <div className="brand"><span className="dot">●</span> PlasmidAI</div>
        <div className="nav-links">
          <a href="#problem">The problem</a>
          <a href="#demo">How it works</a>
          <a href="#map">The construct</a>
        </div>
        <a className="nav-cta" href="#demo">Try the demo</a>
      </nav>

      <div className="shell">
        {/* ================= HERO ================= */}
        <section className="hero">
          <div className="wrap">
            <div className="hero-grid">
              <div className="hero-copy">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <span className="eyebrow">Intelligent plasmid design</span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}>
                  Describe an experiment.<br /><span className="grad">Get a plasmid.</span>
                </motion.h1>
                <motion.p className="sub"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.28 }}>
                  PlasmidAI turns a plain-English goal into a complete, validated construct that is
                  ready to synthesize. You get an annotated map, sequence files, primers, and a
                  one-click path to your vendor, in minutes instead of weeks.
                </motion.p>
                <motion.div className="hero-actions"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.42 }}>
                  <a className="btn btn-primary" href="#demo">Design a construct</a>
                  <a className="btn btn-ghost" href="#map">See the live map</a>
                </motion.div>
              </div>

              <motion.div className="hero-visual"
                initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}>
                <PlasmidMap runId={runId} hovered={hovered} onHover={setHovered} size={430} />
              </motion.div>
            </div>

            <Reveal delay={0.1} style={{ marginTop: 72 }}>
              <div className="stats">
                <div className="stat"><div className="num"><CountUp to={28} prefix="$" suffix="B+" /></div><div className="lbl">Wasted each year on failed experiments in the US</div></div>
                <div className="stat"><div className="num"><CountUp to={50} suffix="%" /></div><div className="lbl">Of constructs fail on the very first attempt</div></div>
                <div className="stat"><div className="num">3 to 4<span style={{ fontSize: "0.5em", color: "var(--ink-dim)" }}> wks</span></div><div className="lbl">Manual design time for one complex plasmid</div></div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= PROBLEM ================= */}
        <section id="problem" className="band gray">
          <div className="wrap">
            <Reveal className="section-head">
              <div className="kicker">The problem</div>
              <h2 className="title">Plasmid design is stuck in 1995.</h2>
              <p className="lead">
                It is indispensable to modern biology and still shockingly manual. Nearly every other
                corner of science has been reshaped by software. Plasmid design has not.
              </p>
            </Reveal>
            <Reveal>
              <div className="cards">
                {PROBLEMS.map((c, i) => (
                  <div className="card" key={c.h}>
                    <div className="idx">{String(i + 1).padStart(2, "0")}</div>
                    <h3>{c.h}</h3>
                    <p>{c.p}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= DEMO CONSOLE + PIPELINE ================= */}
        <section id="demo" className="band">
          <div className="wrap">
            <Reveal className="section-head">
              <div className="kicker">How it works</div>
              <h2 className="title">One sentence in. A working construct out.</h2>
              <p className="lead">
                A researcher types a goal. Five layers turn it into a grounded, validated design. The
                general-purpose language model only handles the wording, and purpose-built biology does
                the rest.
              </p>
            </Reveal>

            <Reveal>
              <div className="console">
                <div className="console-bar">
                  <span className="tl" style={{ background: "#c6ccd8" }} />
                  <span className="tl" style={{ background: "#c6ccd8" }} />
                  <span className="tl" style={{ background: "#c6ccd8" }} />
                  <span className="title">plasmidai · new design session</span>
                </div>
                <div className="console-body">
                  <div className="prompt-label">Researcher goal</div>
                  <div className="prompt-box">
                    <span className="chev">&gt;</span>
                    <span className="txt">
                      I need a <span className="hlv">doxycycline-inducible</span> <span className="hl">GFP</span> reporter,
                      expressed in <span className="hl">HEK293</span> cells, with <span className="hla">ampicillin resistance</span> for
                      cloning, so I can do live imaging of gene expression.
                      <span className="caret" />
                    </span>
                  </div>

                  <div className="demo-run">
                    <button className="btn btn-primary" onClick={runDesign} disabled={running}>
                      {running ? "Designing…" : "Run PlasmidAI"}
                    </button>
                    <span className="pill-note">Watch the pipeline run, then the plasmid assembles below.</span>
                  </div>

                  <div className="pipeline">
                    {STAGES.map((s, i) => {
                      const on = activeStage === i;
                      const done = i <= doneStages;
                      return (
                        <motion.div key={s.n}
                          className={`stage ${on ? "on" : ""} ${done ? "done" : ""}`}
                          animate={on ? { scale: 1.03 } : { scale: 1 }}
                          transition={{ duration: 0.25 }}>
                          <div className="n">{s.n}</div>
                          <h4>{s.h}</h4>
                          <p>{s.p}</p>
                          {done && <motion.span className="tick"
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>✓</motion.span>}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="split" style={{ marginTop: 30 }}>
              <Reveal>
                <div className="codecard">
                  <div className="hd"><span>DesignBrief · structured intent</span><span style={{ color: "var(--accent)" }}>NLU ✓</span></div>
                  <pre dangerouslySetInnerHTML={{ __html: brief }} />
                </div>
              </Reveal>
              <Reveal delay={0.1} className="brief-copy">
                <h3>Thinking in goals, not parts.</h3>
                <p className="lead" style={{ fontSize: 16.5 }}>
                  Every other tool asks you to name components first: promoters, origins, markers.
                  PlasmidAI asks for your goal and works out the rest. It is the jump from assembly
                  language to Python, a real step up in speed and access.
                </p>
                <p className="lead" style={{ fontSize: 16.5, marginTop: 16 }}>
                  The brief on the left is what the model pulls out before a single base is generated.
                  It is normalized to a controlled vocabulary, with the ambiguity resolved, and ready
                  for retrieval and generation.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================= PLASMID MAP ================= */}
        <section id="map" className="band gray" ref={mapRef}>
          <div className="wrap">
            <Reveal className="section-head">
              <div className="kicker">The construct</div>
              <h2 className="title">pTet-GFP, assembled one piece at a time.</h2>
              <p className="lead">
                This is a Tet-On 3G design. A constitutive CMV promoter drives the rtTA transactivator,
                which switches on the TRE3G promoter only when doxycycline is present, so EGFP is
                expressed on demand. Hover any element to inspect it.
              </p>
            </Reveal>

            <div className="map-stage">
              <Reveal className="map-holder" style={{ minHeight: 460 }}>
                {mapInView && <PlasmidMap runId={runId} hovered={hovered} onHover={setHovered} />}
              </Reveal>
              <Reveal delay={0.15}>
                <div className="legend">
                  {FEATURES.map((f) => (
                    <div key={f.key} className="leg-item"
                      onMouseEnter={() => setHovered(f.key)}
                      onMouseLeave={() => setHovered(null)}>
                      <span className="leg-swatch" style={{ background: f.hex }} />
                      <div className="leg-txt">
                        <div className="n">{f.name} <span className="role">{f.role}</span></div>
                        <div className="d">{f.detail}</div>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-ghost" style={{ marginTop: 12, alignSelf: "flex-start" }} onClick={() => setRunId((r) => r + 1)}>
                    Replay assembly
                  </button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================= VALIDATION + CONFIDENCE ================= */}
        <section className="band">
          <div className="wrap">
            <Reveal className="section-head">
              <div className="kicker">The trust layer</div>
              <h2 className="title">Nothing ships unvalidated.</h2>
              <p className="lead">
                A deterministic constraint engine, not the language model, checks every design against
                hard biological rules. One impossible construct would break trust, so we treat this
                layer as safety-critical.
              </p>
            </Reveal>

            <div className="val-list">
              {CHECKS.map((c, i) => (
                <Reveal key={c.n} delay={i * 0.05}>
                  <div className="val-row">
                    <span className={`badge ${c.s}`}>{c.s.toUpperCase()}</span>
                    <div>
                      <div className="vn">{c.n}</div>
                      <div className="vm">{c.m}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1}>
              <div className="confidence">
                <div className="conf-top">
                  <div className="conf-band">
                    <span className="b high serif">High</span>
                    <span style={{ color: "var(--ink-dim)" }}>generation confidence</span>
                  </div>
                  <span className="conf-score">score 0.91 of 1.00, calibrated against v2.3</span>
                </div>
                <div className="conf-bar">
                  <motion.div className="conf-fill"
                    initial={{ width: 0 }} whileInView={{ width: "91%" }} viewport={{ once: true }}
                    transition={{ duration: 1.1, ease: "easeOut" }} />
                </div>
                <div className="conf-signals">
                  {[
                    { v: "0.94", l: "Template similarity" },
                    { v: "0.88", l: "Model likelihood" },
                    { v: "10 of 10", l: "Components re-annotated" },
                    { v: "89%", l: "Historical pass rate" },
                  ].map((s) => (
                    <div key={s.l} className="sig"><div className="sv">{s.v}</div><div className="sl">{s.l}</div></div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= EXPORTS ================= */}
        <section className="band gray">
          <div className="wrap">
            <Reveal className="section-head">
              <div className="kicker">Ready to order</div>
              <h2 className="title">From map to mailbox.</h2>
              <p className="lead">
                One click turns the validated design into order-ready files and sends it straight to a
                synthesis vendor.
              </p>
            </Reveal>
            <div className="export-grid">
              {EXPORTS.map((e, i) => (
                <Reveal key={e.h} delay={i * 0.06}>
                  <div className="exp">
                    <div className="ei">{ICONS[e.icon]}</div>
                    <h4>{e.h}</h4>
                    <p>{e.p}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <footer>
          <div className="wrap">
            <div className="foot-row">
              <div className="brand"><span className="dot">●</span> PlasmidAI</div>
              <div>An interactive concept demo.</div>
            </div>
            <p className="disc">
              This is a product concept demo built from the PlasmidAI brief and market research. The
              construct shown, pTet-GFP, is an illustrative Tet-On 3G design meant for demonstration
              only. It is not a validated, orderable sequence. Any real tool that outputs orderable DNA
              has to pass biosecurity screening and bench validation before synthesis.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

/* syntax-highlighted DesignBrief JSON */
const brief = `<span class="j-punc">{</span>
  <span class="j-key">"organism"</span><span class="j-punc">:</span> <span class="j-str">"Homo sapiens"</span><span class="j-punc">,</span>
  <span class="j-key">"cell_line"</span><span class="j-punc">:</span> <span class="j-str">"HEK293"</span><span class="j-punc">,</span>
  <span class="j-key">"vector_type"</span><span class="j-punc">:</span> <span class="j-str">"mammalian expression"</span><span class="j-punc">,</span>
  <span class="j-key">"genes"</span><span class="j-punc">:</span> <span class="j-punc">[</span><span class="j-str">"EGFP"</span><span class="j-punc">],</span>
  <span class="j-key">"promoter_type"</span><span class="j-punc">:</span> <span class="j-str">"inducible (TRE3G)"</span><span class="j-punc">,</span>
  <span class="j-key">"inducer"</span><span class="j-punc">:</span> <span class="j-str">"doxycycline"</span><span class="j-punc">,</span>
  <span class="j-key">"markers"</span><span class="j-punc">:</span> <span class="j-punc">[</span><span class="j-str">"AmpR"</span><span class="j-punc">],</span>
  <span class="j-key">"application"</span><span class="j-punc">:</span> <span class="j-str">"live-cell imaging"</span><span class="j-punc">,</span>
  <span class="j-key">"cloning_method"</span><span class="j-punc">:</span> <span class="j-str">"restriction / MCS"</span><span class="j-punc">,</span>
  <span class="j-key">"clarification_needed"</span><span class="j-punc">:</span> <span class="j-num">false</span>
<span class="j-punc">}</span>`;
