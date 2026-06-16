"use client";

import { useState, useMemo } from "react";

// ── Items ─────────────────────────────────────────────────────────────────────
const ITEMS = {
  greaterYang: { name: "Greater Yang Pill", img: "/inner-force/greater_yang_pill.png" },
  greaterYin:  { name: "Greater Yin Pill",  img: "/inner-force/greater_yin_pill.png"  },
  lesserYang:  { name: "Lesser Yang Pill",  img: "/inner-force/lesser_yang_pill.png"  },
  lesserYin:   { name: "Lesser Yin Pill",   img: "/inner-force/lesser_yin_pill.png"   },
} as const;

type ItemKey = keyof typeof ITEMS;

// ── Panels ────────────────────────────────────────────────────────────────────
const PANELS = [
  { id: 1001, name: "Sky Palace",   primaryItem: "greaterYang" as ItemKey, stats: "Phys ATK · Phys DEF · Spell ATK · Spell DEF" },
  { id: 1002, name: "Royal Decree", primaryItem: "greaterYin"  as ItemKey, stats: "CRIT · CRIT EVA · CRIT ATK DMG · CRIT DMG Reduction" },
  { id: 1003, name: "Pulsing Sky",  primaryItem: "lesserYang"  as ItemKey, stats: "HP · EVA · Accuracy · All ATK DMG" },
  { id: 1004, name: "Great Ruler",  primaryItem: "lesserYin"   as ItemKey, stats: "All DMG Reduction · PvP ATK · PvP DEF · Boss DMG" },
  { id: 1005, name: "Panel V",      primaryItem: "greaterYang" as ItemKey, stats: "—" },
  { id: 1006, name: "Panel VI",     primaryItem: "greaterYin"  as ItemKey, stats: "—" },
];

// ── Level cost table ──────────────────────────────────────────────────────────
type LevelCost = {
  level: number;
  greaterYang: number;
  greaterYin: number;
  lesserYang: number;
  lesserYin: number;
  copper: number;
  tier: 2 | 3 | 4;
};

const PANEL_LEVEL_COSTS: LevelCost[] = [
  { level: 1,  greaterYang: 10, greaterYin: 10, lesserYang: 5,  lesserYin: 2,  copper: 20000,   tier: 2 },
  { level: 2,  greaterYang: 30, greaterYin: 30, lesserYang: 15, lesserYin: 6,  copper: 50000,   tier: 2 },
  { level: 3,  greaterYang: 10, greaterYin: 10, lesserYang: 5,  lesserYin: 3,  copper: 80000,   tier: 3 },
  { level: 4,  greaterYang: 30, greaterYin: 30, lesserYang: 10, lesserYin: 6,  copper: 120000,  tier: 3 },
  { level: 5,  greaterYang: 50, greaterYin: 50, lesserYang: 20, lesserYin: 9,  copper: 200000,  tier: 3 },
  { level: 6,  greaterYang: 6,  greaterYin: 6,  lesserYang: 3,  lesserYin: 2,  copper: 600000,  tier: 4 },
  { level: 7,  greaterYang: 12, greaterYin: 12, lesserYang: 6,  lesserYin: 3,  copper: 1200000, tier: 4 },
  { level: 8,  greaterYang: 20, greaterYin: 20, lesserYang: 10, lesserYin: 5,  copper: 1800000, tier: 4 },
  { level: 9,  greaterYang: 40, greaterYin: 40, lesserYang: 20, lesserYin: 10, copper: 2800000, tier: 4 },
  { level: 10, greaterYang: 80, greaterYin: 80, lesserYang: 40, lesserYin: 20, copper: 3500000, tier: 4 },
];

// ── Tier labels & colors ──────────────────────────────────────────────────────
const TIER_LABEL: Record<number, string> = { 2: "Common", 3: "Uncommon", 4: "Rare" };
const TIER_COLOR: Record<number, string> = { 2: "#9ca3af", 3: "#60a5fa", 4: "#c084fc" };
const TIER_BG:    Record<number, string> = { 2: "rgba(156,163,175,0.12)", 3: "rgba(96,165,250,0.12)", 4: "rgba(192,132,252,0.12)" };

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtNum(n: number) { return n.toLocaleString(); }

type Totals = {
  greaterYang: number;
  greaterYin: number;
  lesserYang: number;
  lesserYin: number;
  copper: number;
  byTier: Record<number, { greaterYang: number; greaterYin: number; lesserYang: number; lesserYin: number }>;
  tiersHit: Set<number>;
};

function computeTotals(from: number, to: number): Totals {
  const t: Totals = {
    greaterYang: 0, greaterYin: 0, lesserYang: 0, lesserYin: 0, copper: 0,
    byTier: { 2: { greaterYang: 0, greaterYin: 0, lesserYang: 0, lesserYin: 0 },
              3: { greaterYang: 0, greaterYin: 0, lesserYang: 0, lesserYin: 0 },
              4: { greaterYang: 0, greaterYin: 0, lesserYang: 0, lesserYin: 0 } },
    tiersHit: new Set(),
  };
  for (let lv = from + 1; lv <= to; lv++) {
    const row = PANEL_LEVEL_COSTS[lv - 1];
    if (!row) continue;
    t.greaterYang += row.greaterYang;
    t.greaterYin  += row.greaterYin;
    t.lesserYang  += row.lesserYang;
    t.lesserYin   += row.lesserYin;
    t.copper      += row.copper;
    t.byTier[row.tier].greaterYang += row.greaterYang;
    t.byTier[row.tier].greaterYin  += row.greaterYin;
    t.byTier[row.tier].lesserYang  += row.lesserYang;
    t.byTier[row.tier].lesserYin   += row.lesserYin;
    t.tiersHit.add(row.tier);
  }
  return t;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function InnerForceClient() {
  const [panelIdx, setPanelIdx] = useState(0);
  const [fromLevel, setFromLevel] = useState(0);
  const [toLevel, setToLevel]   = useState(5);

  const panel = PANELS[panelIdx];

  const clampedFrom = Math.max(0, Math.min(9,  fromLevel));
  const clampedTo   = Math.max(clampedFrom + 1, Math.min(10, toLevel));
  const valid = clampedFrom < clampedTo;
  const exceedsData = clampedTo > 10;

  const totals = useMemo(() => {
    if (!valid || clampedTo > 10) return null;
    return computeTotals(clampedFrom, clampedTo);
  }, [clampedFrom, clampedTo, valid]);

  const multiTier = totals && totals.tiersHit.size > 1;

  const itemRows = (["greaterYang", "greaterYin", "lesserYang", "lesserYin"] as const)
    .map(key => ({ key, total: totals ? totals[key] : 0 }))
    .filter(r => r.total > 0);

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", position: "relative", color: "#d4d4d8" }}>
      <style>{`
        @keyframes bgPulse {
          0%   { filter: brightness(1) saturate(1); }
          100% { filter: brightness(1.1) saturate(1.2); }
        }
        .if-panel-btn:hover { border-color: rgba(255,200,60,0.45) !important; }
        .if-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,200,60,0.2); border-radius: 8px; padding: 8px 12px; color: #d4d4d8; font-size: 15px; width: 100%; outline: none; box-sizing: border-box; }
        .if-input:focus { border-color: rgba(255,200,60,0.5); }
      `}</style>

      {/* Animated background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 30% 40%, rgba(80,20,160,0.1) 0%, transparent 55%), radial-gradient(ellipse at 70% 15%, rgba(160,100,20,0.07) 0%, transparent 50%), #070b14",
        animation: "bgPulse 8s ease-in-out infinite alternate",
      }} />

      {/* ── Header ── */}
      <header style={{
        position: "relative", zIndex: 10, display: "flex", alignItems: "center",
        gap: 16, padding: "10px 20px",
        borderBottom: "1px solid rgba(255,200,60,0.15)",
        background: "rgba(7,11,20,0.85)", backdropFilter: "blur(10px)",
        flexShrink: 0, flexWrap: "wrap",
      }}>
        <a href="/" style={{
          background: "rgba(10,10,20,0.85)", border: "1px solid #3a3a5a",
          color: "#c9a84c", padding: "6px 14px", borderRadius: 6,
          fontSize: 13, textDecoration: "none", whiteSpace: "nowrap",
        }}>‹ Back</a>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.12em", fontVariant: "small-caps", color: "#f0c040", lineHeight: 1.2 }}>
            INNER FORCE CALCULATOR
          </div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>
            Muscle Strength manual — train your inner energy to boost combat power
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{
        position: "relative", zIndex: 10, flex: 1,
        padding: "20px", maxWidth: 860, margin: "0 auto",
        width: "100%", boxSizing: "border-box",
      }}>

        {/* Panel selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", marginBottom: 10 }}>
            Select Panel
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {PANELS.map((p, i) => {
              const isSel = panelIdx === i;
              return (
                <button key={p.id} type="button" className="if-panel-btn"
                  onClick={() => setPanelIdx(i)}
                  style={{
                    flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 4, padding: "10px 18px", borderRadius: 10, cursor: "pointer",
                    background: isSel ? "rgba(255,200,60,0.08)" : "rgba(255,255,255,0.03)",
                    border: isSel ? "1px solid rgba(255,200,60,0.65)" : "1px solid rgba(255,200,60,0.1)",
                    boxShadow: isSel ? "0 0 18px rgba(255,180,0,0.18)" : "none",
                    transition: "all 0.15s", color: "inherit",
                  }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ITEMS[p.primaryItem].img} width={28} height={28} alt="" style={{ objectFit: "contain" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: isSel ? "#f0c040" : "#bbb", whiteSpace: "nowrap" }}>{p.name}</span>
                  <span style={{ fontSize: 9, color: "#555", textAlign: "center", maxWidth: 110 }}>{p.stats}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level range inputs */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
          marginBottom: 20, padding: "16px 20px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,60,0.12)", borderRadius: 12,
        }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              From Level
            </label>
            <input type="number" className="if-input" min={0} max={9} value={fromLevel}
              onChange={e => setFromLevel(parseInt(e.target.value) || 0)} />
            <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>0 = not started yet</div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              To Level
            </label>
            <input type="number" className="if-input" min={1} max={10} value={toLevel}
              onChange={e => setToLevel(parseInt(e.target.value) || 1)} />
            <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>Max: 10 (data available)</div>
          </div>
          {!valid && (
            <div style={{ gridColumn: "1/-1", fontSize: 12, color: "#f87171", padding: "6px 10px", background: "rgba(248,113,113,0.08)", borderRadius: 6 }}>
              ⚠ From level must be less than To level.
            </div>
          )}
          {exceedsData && (
            <div style={{ gridColumn: "1/-1", fontSize: 12, color: "#fbbf24", padding: "6px 10px", background: "rgba(251,191,36,0.07)", borderRadius: 6 }}>
              ⚠ Level 11+ data not yet available — showing results up to level 10.
            </div>
          )}
        </div>

        {/* Tier legend */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {[2, 3, 4].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 20, background: TIER_BG[t], border: `1px solid ${TIER_COLOR[t]}44`, fontSize: 11, color: TIER_COLOR[t] }}>
              <span style={{ fontWeight: 700 }}>Tier {t}</span>
              <span style={{ color: "#666" }}>·</span>
              <span>{TIER_LABEL[t]} beads</span>
            </div>
          ))}
        </div>

        {/* Results */}
        {totals && (
          <div style={{
            padding: "16px 20px",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,200,60,0.12)", borderRadius: 12,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#666", textTransform: "uppercase", marginBottom: 4 }}>
              Materials Needed
            </div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>
              {panel.name} · Levels {clampedFrom} → {clampedTo}
            </div>

            {/* Item rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {itemRows.map(({ key, total }) => {
                const item = ITEMS[key];
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.img} width={36} height={36} alt="" style={{ objectFit: "contain", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#e5e5e5" }}>{item.name}</div>
                      {multiTier && (
                        <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                          {[2, 3, 4].filter(t => totals.byTier[t][key] > 0).map(t => (
                            <span key={t} style={{ fontSize: 10, padding: "1px 7px", borderRadius: 10, background: TIER_BG[t], color: TIER_COLOR[t], border: `1px solid ${TIER_COLOR[t]}44` }}>
                              T{t}: ×{fmtNum(totals.byTier[t][key])}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 24, fontWeight: 700, color: "#f0c040", minWidth: 80, textAlign: "right" }}>
                      ×{fmtNum(total)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Copper */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 28, width: 36, textAlign: "center", flexShrink: 0 }}>🪙</span>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#e5e5e5" }}>Copper</div>
              <span style={{ fontSize: 24, fontWeight: 700, color: "#f0c040", minWidth: 80, textAlign: "right" }}>
                {fmtNum(totals.copper)}
              </span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!totals && valid && !exceedsData && (
          <div style={{ textAlign: "center", color: "#444", fontSize: 13, padding: 40 }}>
            Select a valid level range to see materials.
          </div>
        )}
      </div>
    </div>
  );
}
