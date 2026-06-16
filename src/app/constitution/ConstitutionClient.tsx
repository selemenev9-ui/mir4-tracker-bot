"use client";

import { useState, useMemo } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
type Constitution = {
  id: string;
  name: string;
  stat: string;
  item1: string;
  img1: string;
  item2: string;
  img2: string;
  keepItem2HighTier: boolean;
  equalAmounts: boolean;
};

type GradeKey = "" | "UC" | "R" | "E" | "L";

type PromotionDef = {
  grade: GradeKey;
  stone: number;
  devil: number;
  water: number;
  pill: number;
  copper: number;
  capNeedLevel: number;
};

// ── Constitutions ────────────────────────────────────────────────────────────
const CONSTITUTIONS: Constitution[] = [
  { id: "iron_skin",  name: "Iron Wall",  stat: "Phys DEF",
    item1: "Herb Leaf",     img1: "/constitution/herb_leaf.png",
    item2: "Reishi",        img2: "/constitution/reishi.png",
    keepItem2HighTier: true, equalAmounts: true },
  { id: "agility",   name: "Agility",    stat: "EVA",
    item1: "Reishi",        img1: "/constitution/reishi.png",
    item2: "Unihorn Slice", img2: "/constitution/unihorn_slice.png",
    keepItem2HighTier: false, equalAmounts: false },
  { id: "insightful",name: "Insightful", stat: "HP",
    item1: "Herb Leaf",     img1: "/constitution/herb_leaf.png",
    item2: "Unihorn Slice", img2: "/constitution/unihorn_slice.png",
    keepItem2HighTier: false, equalAmounts: false },
  { id: "strength",  name: "Strength",   stat: "Phys ATK + Spell ATK",
    item1: "Herb Root",     img1: "/constitution/herb_root.png",
    item2: "Century Fruit", img2: "/constitution/century_fruit.png",
    keepItem2HighTier: true, equalAmounts: false },
  { id: "clever",    name: "Clever",     stat: "Spell DEF",
    item1: "Herb Leaf",     img1: "/constitution/herb_leaf.png",
    item2: "Herb Root",     img2: "/constitution/herb_root.png",
    keepItem2HighTier: true, equalAmounts: true },
  { id: "awakened",  name: "Awakened",   stat: "MP",
    item1: "Herb Leaf",     img1: "/constitution/herb_leaf.png",
    item2: "Flower Oil",    img2: "/constitution/flower_oil.png",
    keepItem2HighTier: false, equalAmounts: false },
  { id: "focused",   name: "Focused",    stat: "Accuracy",
    item1: "Reishi",        img1: "/constitution/reishi.png",
    item2: "Flower Oil",    img2: "/constitution/flower_oil.png",
    keepItem2HighTier: false, equalAmounts: false },
];

// ── Item 1 amounts (index 1–105) ─────────────────────────────────────────────
const ITEM1_AMOUNTS: number[] = [
  0,
  2, 3, 4, 6, 9,
  5, 7, 10, 15, 22,
  4, 6, 9, 13, 19,
  10, 15, 22, 33, 49,
  4, 6, 9, 13, 19,
  10, 15, 22, 33, 49,
  20, 30, 45, 67, 100,
  4, 6, 9, 13, 19,
  10, 15, 22, 33, 49,
  20, 30, 45, 67, 100,
  20, 30, 45, 67, 100,
  50, 50, 50, 50, 50,
  60, 60, 60, 60, 60,
  8,  8,  8,  8,  8,
  10, 10, 10, 10, 10,
  15, 15, 15, 15, 15,
  20, 20, 20, 20, 20,
  25, 25, 25, 25, 25,
  30, 30, 30, 30, 30,
  35, 35, 35, 35, 35,
  40, 40, 40, 40, 40,
];

// ── Item 2 amounts for levels 1–55 (unequal constitutions) ───────────────────
const ITEM2_AMOUNTS_UNEQUAL: number[] = [
  0,
  1, 1, 1, 1, 1,
  1, 1, 1, 1, 1,
  8, 8, 8, 8, 8,
  14, 14, 14, 14, 14,
  10, 10, 10, 10, 10,
  20, 20, 20, 20, 20,
  30, 30, 30, 30, 30,
  20, 20, 20, 20, 20,
  30, 30, 30, 30, 30,
  40, 40, 40, 40, 40,
  50, 50, 50, 50, 50,
];

// ── Century Fruit amounts for Strength, levels 56–105 ────────────────────────
const CENTURY_FRUIT_HIGH: number[] = [
  ...Array(56).fill(0),
  60, 60, 60, 60, 60,
  70, 70, 70, 70, 70,
  4,  4,  4,  4,  4,
  5,  5,  5,  5,  5,
  6,  6,  6,  6,  6,
  7,  7,  7,  7,  7,
  8,  8,  8,  8,  8,
  9,  9,  9,  9,  9,
  10, 10, 10, 10, 10,
  11, 11, 11, 11, 11,
];

// ── Eternal Snow Panax amounts, levels 56–105 ─────────────────────────────────
const PANAX_AMOUNTS: number[] = [
  ...Array(56).fill(0),
  1, 2, 2, 3, 3,
  2, 3, 3, 4, 4,
  3, 4, 4, 5, 5,
  4, 5, 5, 6, 6,
  5, 6, 6, 7, 7,
  6, 7, 7, 8, 8,
  7, 8, 8, 9, 9,
  8, 9, 9, 10, 10,
  9, 10, 10, 11, 11,
  10, 11, 11, 12, 12,
];

// ── Copper per level upgrade ──────────────────────────────────────────────────
const COPPER_PER_LEVEL: number[] = [
  0,
  100, 100, 100, 100, 100,
  500, 500, 500, 500, 500,
  1000, 1000, 1000, 1000, 1000,
  2000, 2000, 2000, 2000, 2000,
  4000, 4000, 4000, 4000, 4000,
  8000, 8000, 8000, 8000, 8000,
  15000, 15000, 15000, 15000, 15000,
  30000, 30000, 30000, 30000, 30000,
  60000, 60000, 60000, 60000, 60000,
  100000, 100000, 100000, 100000, 100000,
  100000, 100000, 100000, 100000, 100000,
  120000, 120000, 120000, 120000, 120000,
  150000, 150000, 150000, 150000, 150000,
  200000, 200000, 200000, 200000, 200000,
  250000, 250000, 250000, 250000, 250000,
  300000, 300000, 300000, 300000, 300000,
  400000, 400000, 400000, 400000, 400000,
  500000, 500000, 500000, 500000, 500000,
  700000, 700000, 700000, 700000, 700000,
  900000, 900000, 900000, 900000, 900000,
  1100000, 1100000, 1100000, 1100000, 1100000,
];

// ── Tier promotions ───────────────────────────────────────────────────────────
const TIER_PROMOTIONS: PromotionDef[] = [
  { grade: "",   stone: 0,   devil: 0,   water: 0,  pill: 0,  copper: 0,       capNeedLevel: 0   },
  { grade: "",   stone: 10,  devil: 10,  water: 5,  pill: 2,  copper: 4000,    capNeedLevel: 0   },
  { grade: "UC", stone: 10,  devil: 10,  water: 5,  pill: 2,  copper: 10000,   capNeedLevel: 0   },
  { grade: "UC", stone: 30,  devil: 30,  water: 15, pill: 6,  copper: 30000,   capNeedLevel: 0   },
  { grade: "R",  stone: 10,  devil: 10,  water: 5,  pill: 3,  copper: 60000,   capNeedLevel: 0   },
  { grade: "R",  stone: 30,  devil: 30,  water: 10, pill: 6,  copper: 100000,  capNeedLevel: 0   },
  { grade: "R",  stone: 50,  devil: 50,  water: 20, pill: 9,  copper: 150000,  capNeedLevel: 0   },
  { grade: "E",  stone: 6,   devil: 6,   water: 3,  pill: 2,  copper: 500000,  capNeedLevel: 0   },
  { grade: "E",  stone: 12,  devil: 12,  water: 6,  pill: 3,  copper: 800000,  capNeedLevel: 0   },
  { grade: "E",  stone: 20,  devil: 20,  water: 10, pill: 5,  copper: 1200000, capNeedLevel: 0   },
  { grade: "E",  stone: 40,  devil: 40,  water: 20, pill: 10, copper: 2000000, capNeedLevel: 0   },
  { grade: "E",  stone: 80,  devil: 80,  water: 40, pill: 20, copper: 2500000, capNeedLevel: 95  },
  { grade: "L",  stone: 12,  devil: 12,  water: 6,  pill: 4,  copper: 3000000, capNeedLevel: 100 },
  { grade: "L",  stone: 24,  devil: 24,  water: 12, pill: 8,  copper: 3500000, capNeedLevel: 105 },
  { grade: "L",  stone: 36,  devil: 36,  water: 18, pill: 12, copper: 4000000, capNeedLevel: 110 },
  { grade: "L",  stone: 48,  devil: 48,  water: 24, pill: 16, copper: 4500000, capNeedLevel: 115 },
  { grade: "L",  stone: 60,  devil: 60,  water: 30, pill: 20, copper: 5000000, capNeedLevel: 120 },
  { grade: "L",  stone: 72,  devil: 72,  water: 36, pill: 24, copper: 6000000, capNeedLevel: 125 },
  { grade: "L",  stone: 84,  devil: 84,  water: 42, pill: 28, copper: 7000000, capNeedLevel: 130 },
  { grade: "L",  stone: 96,  devil: 96,  water: 48, pill: 32, copper: 8000000, capNeedLevel: 135 },
  { grade: "L",  stone: 108, devil: 108, water: 54, pill: 36, copper: 9000000, capNeedLevel: 140 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getItemGrade(level: number): GradeKey {
  if (level <= 10) return "";
  if (level <= 20) return "UC";
  if (level <= 35) return "R";
  if (level <= 65) return "E";
  return "L";
}

function getItem2Amount(c: Constitution, level: number, item1: number): number {
  if (level < 56) {
    return c.equalAmounts ? item1 : (ITEM2_AMOUNTS_UNEQUAL[level] ?? 0);
  }
  if (!c.keepItem2HighTier) return 0;
  if (c.equalAmounts) return item1;
  return CENTURY_FRUIT_HIGH[level] ?? 0;
}

function getCenturyFruitGrade(level: number): GradeKey {
  if (level < 56) return getItemGrade(level);
  if (level <= 65) return "E";
  return "L";
}

function gradeLabel(grade: GradeKey): string {
  return grade ? `[${grade}] ` : "";
}

function formatItem(name: string, level: number, isPanax = false, isCentury = false): string {
  if (isPanax) return "[E] Eternal Snow Panax";
  if (isCentury) return `${gradeLabel(getCenturyFruitGrade(level))}Century Fruit`;
  return `${gradeLabel(getItemGrade(level))}${name}`;
}

function fmtNum(n: number): string {
  return n.toLocaleString();
}

const GRADE_COLOR: Record<string, string> = {
  "":   "#9ca3af",
  "UC": "#94a3b8",
  "R":  "#60a5fa",
  "E":  "#c084fc",
  "L":  "#fb923c",
};

const GRADE_BG: Record<string, string> = {
  "":   "rgba(156,163,175,0.15)",
  "UC": "rgba(148,163,184,0.15)",
  "R":  "rgba(96,165,250,0.15)",
  "E":  "rgba(192,132,252,0.15)",
  "L":  "rgba(251,146,60,0.18)",
};

// ── Totals computation ────────────────────────────────────────────────────────
type Totals = {
  item1: number;
  item2: number;
  panax: number;
  upgradeCopper: number;
  promotionCopper: number;
  stones: Record<GradeKey, number>;
  devils: Record<GradeKey, number>;
  waters: Record<GradeKey, number>;
  pills:  Record<GradeKey, number>;
  promotionsHit: Array<{ idx: number; def: PromotionDef; level: number }>;
};

function emptyGradeMap(): Record<GradeKey, number> {
  return { "": 0, UC: 0, R: 0, E: 0, L: 0 };
}

function computeTotals(c: Constitution, from: number, to: number): Totals {
  const t: Totals = {
    item1: 0, item2: 0, panax: 0,
    upgradeCopper: 0, promotionCopper: 0,
    stones: emptyGradeMap(), devils: emptyGradeMap(),
    waters: emptyGradeMap(), pills: emptyGradeMap(),
    promotionsHit: [],
  };

  for (let lv = from + 1; lv <= to; lv++) {
    const i1 = ITEM1_AMOUNTS[lv] ?? 0;
    const i2 = getItem2Amount(c, lv, i1);
    t.item1 += i1;
    t.item2 += i2;
    t.panax += PANAX_AMOUNTS[lv] ?? 0;
    t.upgradeCopper += COPPER_PER_LEVEL[lv] ?? 0;

    if (lv % 5 === 0) {
      const idx = lv / 5 - 1;
      const applyPromo = (pIdx: number) => {
        const p = TIER_PROMOTIONS[pIdx];
        if (!p) return;
        const g = p.grade;
        t.promotionCopper += p.copper;
        t.stones[g] += p.stone;
        t.devils[g] += p.devil;
        t.waters[g] += p.water;
        t.pills[g]  += p.pill;
        t.promotionsHit.push({ idx: pIdx, def: p, level: lv });
      };
      applyPromo(idx);
      if (lv === 100 && to >= 101) applyPromo(20);
    }
  }
  return t;
}

// ── Grade pill component ──────────────────────────────────────────────────────
function GradePill({ grade }: { grade: GradeKey }) {
  if (!grade) return null;
  return (
    <span style={{
      display: "inline-block", padding: "1px 6px", borderRadius: 10,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
      background: GRADE_BG[grade], color: GRADE_COLOR[grade],
      border: `1px solid ${GRADE_COLOR[grade]}44`,
      marginLeft: 5, verticalAlign: "middle",
    }}>
      {grade}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ConstitutionClient() {
  const [selIdx, setSelIdx] = useState(0);
  const [fromLevel, setFromLevel] = useState(0);
  const [toLevel, setToLevel] = useState(55);

  const c = CONSTITUTIONS[selIdx];

  const clampedFrom = Math.max(0, Math.min(104, fromLevel));
  const clampedTo   = Math.max(clampedFrom + 1, Math.min(105, toLevel));
  const valid = clampedFrom < clampedTo;

  const totals = useMemo(() => {
    if (!valid) return null;
    return computeTotals(c, clampedFrom, clampedTo);
  }, [c, clampedFrom, clampedTo, valid]);

  const item1Grade = getItemGrade(clampedTo);
  const item2Grade = c.id === "strength" ? getCenturyFruitGrade(clampedTo) : getItemGrade(clampedTo);
  const hasItem2 = totals && totals.item2 > 0;
  const hasPanax = totals && totals.panax > 0;

  const gradeKeys: GradeKey[] = ["", "UC", "R", "E", "L"];
  const gradeNames: Record<string, string> = {
    "": "Common", "UC": "Uncommon", "R": "Rare", "E": "Epic", "L": "Legendary"
  };

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      color: "#d4d4d8",
    }}>
      <style>{`
        @keyframes bgPulse {
          0%   { filter: brightness(1) saturate(1); }
          100% { filter: brightness(1.1) saturate(1.2); }
        }
        .const-card:hover { border-color: rgba(255,200,60,0.5) !important; }
        .const-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,200,60,0.2); border-radius: 8px; padding: 8px 12px; color: #d4d4d8; font-size: 15px; width: 100%; outline: none; box-sizing: border-box; }
        .const-input:focus { border-color: rgba(255,200,60,0.5); }
      `}</style>

      {/* Animated bg */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 25% 40%, rgba(100,30,180,0.1) 0%, transparent 55%), radial-gradient(ellipse at 75% 15%, rgba(180,120,20,0.07) 0%, transparent 50%), #070b14`,
        animation: "bgPulse 8s ease-in-out infinite alternate",
      }} />

      {/* ── Header ── */}
      <header style={{
        position: "relative", zIndex: 10, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "10px 20px",
        borderBottom: "1px solid rgba(255,200,60,0.15)",
        background: "rgba(7,11,20,0.85)", backdropFilter: "blur(10px)",
        flexShrink: 0, gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/" style={{
            background: "rgba(10,10,20,0.85)", border: "1px solid #3a3a5a",
            color: "#c9a84c", padding: "6px 14px", borderRadius: 6,
            fontSize: 13, textDecoration: "none", whiteSpace: "nowrap",
          }}>
            ‹ Back
          </a>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.12em", fontVariant: "small-caps", color: "#f0c040", lineHeight: 1.2 }}>
              CONSTITUTION CALCULATOR
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>
              Levels 1–105 · 7 Constitutions · 21 Tiers
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ position: "relative", zIndex: 10, flex: 1, padding: "20px", maxWidth: 900, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

        {/* Constitution selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", marginBottom: 10 }}>
            Select Constitution
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {CONSTITUTIONS.map((con, i) => {
              const isSel = selIdx === i;
              return (
                <button key={con.id} type="button" className="const-card"
                  onClick={() => setSelIdx(i)}
                  style={{
                    flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 5, padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                    background: isSel ? "rgba(255,200,60,0.08)" : "rgba(255,255,255,0.03)",
                    border: isSel ? "1px solid rgba(255,200,60,0.65)" : "1px solid rgba(255,200,60,0.1)",
                    boxShadow: isSel ? "0 0 20px rgba(255,180,0,0.2)" : "none",
                    transition: "all 0.15s", color: "inherit",
                  }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={con.img1} width={28} height={28} alt="" style={{ objectFit: "contain" }} />
                    {(!con.equalAmounts || i === 0) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={con.img2} width={28} height={28} alt="" style={{ objectFit: "contain" }} />
                    )}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isSel ? "#f0c040" : "#bbb", whiteSpace: "nowrap" }}>{con.name}</span>
                  <span style={{ fontSize: 9, color: "#555", textAlign: "center" }}>{con.stat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level range inputs */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
          marginBottom: 20, padding: "16px 20px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,60,0.12)",
          borderRadius: 12,
        }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              From Level
            </label>
            <input type="number" className="const-input" min={0} max={104} value={fromLevel}
              onChange={(e) => setFromLevel(parseInt(e.target.value) || 0)} />
            <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>Range: 0 – 104</div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              To Level
            </label>
            <input type="number" className="const-input" min={1} max={105} value={toLevel}
              onChange={(e) => setToLevel(parseInt(e.target.value) || 1)} />
            <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>Range: 1 – 105</div>
          </div>
          {!valid && (
            <div style={{ gridColumn: "1/-1", fontSize: 12, color: "#f87171", padding: "6px 10px", background: "rgba(248,113,113,0.08)", borderRadius: 6 }}>
              ⚠ From level must be less than To level.
            </div>
          )}
        </div>

        {/* Results */}
        {totals && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Items needed */}
            <div style={{
              padding: "16px 20px", background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,200,60,0.12)", borderRadius: 12,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", marginBottom: 14 }}>
                Items Needed · Levels {clampedFrom} → {clampedTo}
              </div>

              {/* Item 1 */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img1} width={32} height={32} alt="" style={{ objectFit: "contain", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#e5e5e5" }}>
                    {c.item1}
                  </span>
                  <GradePill grade={item1Grade} />
                  <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>
                    {formatItem(c.item1, clampedTo)}
                  </div>
                </div>
                <span style={{ fontSize: 22, fontWeight: 700, color: "#f0c040", minWidth: 80, textAlign: "right" }}>
                  ×{fmtNum(totals.item1)}
                </span>
              </div>

              {/* Item 2 */}
              {hasItem2 && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.img2} width={32} height={32} alt="" style={{ objectFit: "contain", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#e5e5e5" }}>{c.item2}</span>
                    <GradePill grade={item2Grade} />
                    <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>
                      {formatItem(c.item2, clampedTo, false, c.id === "strength")}
                    </div>
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "#f0c040", minWidth: 80, textAlign: "right" }}>
                    ×{fmtNum(totals.item2)}
                  </span>
                </div>
              )}

              {/* Note: item2 dropped */}
              {!hasItem2 && !c.equalAmounts && clampedTo >= 56 && (
                <div style={{ fontSize: 11, color: "#555", padding: "6px 10px", background: "rgba(255,255,255,0.02)", borderRadius: 6, marginBottom: 8 }}>
                  ℹ {c.item2} is not required at levels 56+
                </div>
              )}

              {/* Eternal Snow Panax */}
              {hasPanax && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                    background: "rgba(192,132,252,0.15)", border: "1px solid rgba(192,132,252,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  }}>❄</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#e5e5e5" }}>Eternal Snow Panax</span>
                    <GradePill grade="E" />
                    <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>Required from level 56+</div>
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "#c084fc", minWidth: 80, textAlign: "right" }}>
                    ×{fmtNum(totals.panax)}
                  </span>
                </div>
              )}
            </div>

            {/* Promotion materials */}
            {totals.promotionsHit.length > 0 && (() => {
              const hasPromoMats = gradeKeys.some(g => totals.stones[g] > 0);
              if (!hasPromoMats) return null;
              return (
                <div style={{
                  padding: "16px 20px", background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,200,60,0.12)", borderRadius: 12,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", marginBottom: 14 }}>
                    Promotion Materials
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {gradeKeys.filter(g => totals.stones[g] > 0).map(g => (
                      <div key={g} style={{
                        padding: "10px 14px", borderRadius: 8,
                        background: GRADE_BG[g] || "rgba(255,255,255,0.03)",
                        border: `1px solid ${GRADE_COLOR[g] || "#444"}33`,
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: GRADE_COLOR[g] || "#888", marginBottom: 8 }}>
                          {g ? `[${g}]` : "Base"} {gradeNames[g]} Promotions
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6 }}>
                          {[
                            { label: "Moonlight Magic Stone", val: totals.stones[g], emoji: "🌙" },
                            { label: "Blue Devil Stone",      val: totals.devils[g], emoji: "💎" },
                            { label: "Purified Water",        val: totals.waters[g], emoji: "💧" },
                            { label: "Virtue Pill",           val: totals.pills[g],  emoji: "💊" },
                          ].filter(r => r.val > 0).map(row => (
                            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{row.emoji}</span>
                              <div>
                                <div style={{ fontSize: 11, color: "#888" }}>{row.label}</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "#e5e5e5" }}>×{fmtNum(row.val)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {/* capNeedLevel notes */}
                    {totals.promotionsHit.some(p => p.def.capNeedLevel > 0) && (
                      <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>
                        {totals.promotionsHit.filter(p => p.def.capNeedLevel > 0).map(p => (
                          <div key={p.idx}>ℹ Tier {p.idx + 2} promotion (after L{p.level}) requires character level {p.def.capNeedLevel}+</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Copper totals */}
            <div style={{
              padding: "16px 20px", background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,200,60,0.12)", borderRadius: 12,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", marginBottom: 14 }}>
                Copper Cost
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[
                  { label: "Upgrade Cost", val: totals.upgradeCopper, color: "#d4d4d8" },
                  { label: "Promotion Cost", val: totals.promotionCopper, color: "#d4d4d8" },
                  { label: "Total Copper", val: totals.upgradeCopper + totals.promotionCopper, color: "#f0c040" },
                ].map(row => (
                  <div key={row.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>{row.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: row.color }}>{fmtNum(row.val)}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
