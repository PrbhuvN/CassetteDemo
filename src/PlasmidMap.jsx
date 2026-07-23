import { motion } from "framer-motion";
import { FEATURES, TOTAL_BP, bpToAngle, polar, arcPath } from "./plasmid.js";

const SIZE = 480;
const C = SIZE / 2;
const R = 156;          // radius of the feature ring
const STROKE = 24;      // ring thickness

export default function PlasmidMap({ runId = 0, hovered, onHover, size = 480 }) {
  const active = FEATURES.find((f) => f.key === hovered);

  return (
    <svg
      key={runId}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width="100%"
      style={{ maxWidth: size, overflow: "visible" }}
      role="img"
      aria-label="Annotated circular plasmid map"
    >
      <defs>
        <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(28,63,124,0.05)" />
          <stop offset="70%" stopColor="rgba(18,21,28,0.015)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* soft core wash */}
      <circle cx={C} cy={C} r={R - 6} fill="url(#core)" />

      {/* faint backbone the features sit on */}
      <motion.circle
        cx={C} cy={C} r={R}
        fill="none" stroke="rgba(18,21,28,0.07)" strokeWidth={STROKE}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
      />
      {/* static dashed guide */}
      <motion.circle
        cx={C} cy={C} r={R + STROKE / 2 + 8}
        fill="none" stroke="rgba(18,21,28,0.14)" strokeWidth={1} strokeDasharray="2 8"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
      />

      {/* bp ticks at quarters */}
      {[0, 0.25, 0.5, 0.75].map((f, i) => {
        const a = f * 360 - 90;
        const p1 = polar(C, C, R - STROKE / 2 - 3, a);
        const p2 = polar(C, C, R - STROKE / 2 - 10, a);
        const lp = polar(C, C, R - STROKE / 2 - 22, a);
        return (
          <g key={i}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(18,21,28,0.22)" strokeWidth={1} />
            <text x={lp.x} y={lp.y} fill="#828a99" fontSize="9" fontFamily="var(--mono)"
              textAnchor="middle" dominantBaseline="middle">
              {Math.round(f * TOTAL_BP / 100) / 10}k
            </text>
          </g>
        );
      })}

      {/* feature arcs + labels */}
      {FEATURES.map((f) => {
        const a1 = bpToAngle(f.start);
        const a2 = bpToAngle(f.end);
        const mid = (a1 + a2) / 2;
        const dim = hovered && hovered !== f.key;

        const edge = polar(C, C, R + STROKE / 2, mid);
        const knee = polar(C, C, R + STROKE / 2 + 16, mid);
        const right = Math.cos((mid * Math.PI) / 180) >= 0;
        const labelX = knee.x + (right ? 10 : -10);
        const anchor = right ? "start" : "end";

        return (
          <g
            key={f.key}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => onHover(f.key)}
            onMouseLeave={() => onHover(null)}
          >
            <motion.path
              d={arcPath(C, C, R, a1, a2)}
              fill="none"
              stroke={f.hex}
              strokeWidth={hovered === f.key ? STROKE + 5 : STROKE}
              strokeLinecap="round"
              filter={hovered === f.key ? "url(#soft)" : undefined}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: dim ? 0.28 : 1 }}
              transition={{
                pathLength: { duration: 0.55, delay: 0.5 + f.order * 0.26, ease: "easeInOut" },
                opacity: { duration: dim ? 0.2 : 0.5, delay: hovered ? 0 : 0.5 + f.order * 0.26 },
                strokeWidth: { duration: 0.2 },
              }}
            />
            {/* leader + label appear once the arc has drawn */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: dim ? 0.3 : 1 }}
              transition={{ duration: 0.4, delay: hovered ? 0 : 0.5 + f.order * 0.26 + 0.35 }}
            >
              <line x1={edge.x} y1={edge.y} x2={knee.x} y2={knee.y}
                stroke={f.hex} strokeWidth={1.4} opacity={0.85} />
              <text x={labelX} y={knee.y - 4} fill="#12151c" fontSize="12.5" fontWeight="650"
                textAnchor={anchor} fontFamily="var(--sans)">{f.name}</text>
              <text x={labelX} y={knee.y + 10} fill="#828a99" fontSize="9.5"
                textAnchor={anchor} fontFamily="var(--mono)">
                {f.start}–{f.end}
              </text>
            </motion.g>
          </g>
        );
      })}

      {/* center readout */}
      <motion.g initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}>
        <text x={C} y={C - 14} textAnchor="middle" fill="#12151c" fontSize="23" fontWeight="600"
          letterSpacing="-0.3" fontFamily="var(--serif)">
          {active ? active.name : "pTet-GFP"}
        </text>
        <text x={C} y={C + 8} textAnchor="middle" fill="#4e5462" fontSize="12"
          fontFamily="var(--mono)">
          {active ? active.role : `${TOTAL_BP.toLocaleString()} bp · circular`}
        </text>
        <text x={C} y={C + 30} textAnchor="middle" fill={active ? active.hex : "#1c3f7c"} fontSize="10.5"
          fontFamily="var(--mono)" letterSpacing="0.5">
          {active ? `${active.start}–${active.end}` : "Tet-On 3G · HEK293"}
        </text>
      </motion.g>
    </svg>
  );
}
