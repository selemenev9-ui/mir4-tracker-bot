"use client";

import { useState } from "react";

export type Stat = {
  icon: string;
  name: string;
  min: string;
  max: string;
};

export type PrimalItem = {
  name: string;
  img: string;
  stones: string[];
  mainStats: Stat[];
  secStats: Stat[];
};

const EN_NAMES: Record<string, string> = {
  "Arma": "Weapon",
  "Arma Secundaria": "Off-hand",
  "Armadura": "Chest Armor",
  "Calça": "Pants",
  "Luva": "Gloves",
  "Bota": "Boots",
  "Colar": "Necklace",
  "Bracelete": "Bracelet",
  "Anel": "Ring",
  "Brinco": "Earring",
  "Medalha": "Medal",
  "Berloque": "Trinket",
};

const FILTER_STATS = [
  { name: "Accuracy",                      icon: "9.png"  },
  { name: "All ATK DMG Boost",             icon: "5.png"  },
  { name: "All DMG Reduction",             icon: "6.png"  },
  { name: "Antidemon Power",               icon: "39.png" },
  { name: "Bash ATK DMG Boost",            icon: "17.png" },
  { name: "Bash DMG Reduction",            icon: "18.png" },
  { name: "Basic ATK DMG Boost",           icon: "19.png" },
  { name: "Basic DMG Reduction",           icon: "20.png" },
  { name: "Boss ATK DMG Boost",            icon: "25.png" },
  { name: "Boss DMG Reduction",            icon: "26.png" },
  { name: "CRIT",                          icon: "1.png"  },
  { name: "CRIT ATK DMG Boost",            icon: "3.png"  },
  { name: "CRIT DMG Reduction",            icon: "4.png"  },
  { name: "CRIT EVA",                      icon: "2.png"  },
  { name: "Debilitation RES Boost",        icon: "34.png" },
  { name: "Debilitation Success Boost",    icon: "33.png" },
  { name: "Drop Chance Boost",             icon: "35.png" },
  { name: "EVA",                           icon: "10.png" },
  { name: "HP",                            icon: "40.png" },
  { name: "Hunting Copper Gain Boost",     icon: "38.png" },
  { name: "Hunting EXP Boost",             icon: "37.png" },
  { name: "Knockdown RES Boost",           icon: "32.png" },
  { name: "Knockdown Success Boost",       icon: "31.png" },
  { name: "Lucky Drop Chance Boost",       icon: "36.png" },
  { name: "Monster Accuracy Boost",        icon: "23.png" },
  { name: "Monster ATK DMG Boost",         icon: "21.png" },
  { name: "Monster DMG Reduction",         icon: "22.png" },
  { name: "Monster EVA Boost",             icon: "24.png" },
  { name: "MP",                            icon: "41.png" },
  { name: "PHYS ATK",                      icon: "7.png"  },
  { name: "PHYS DEF",                      icon: "11.png" },
  { name: "PvP ATK DMG Boost",             icon: "13.png" },
  { name: "PvP DMG Reduction",             icon: "14.png" },
  { name: "Silence RES Boost",             icon: "30.png" },
  { name: "Silence Success Boost",         icon: "29.png" },
  { name: "Skill ATK DMG Boost",           icon: "15.png" },
  { name: "Skill DMG Reduction",           icon: "16.png" },
  { name: "Spell ATK",                     icon: "8.png"  },
  { name: "Spell DEF",                     icon: "12.png" },
  { name: "Stun RES Boost",                icon: "28.png" },
  { name: "Stun Success Boost",            icon: "27.png" },
];

function itemMatchesFilter(item: PrimalItem, activeFilters: string[]): boolean {
  if (activeFilters.length === 0) return false;
  return [...item.mainStats, ...item.secStats].some((s) =>
    activeFilters.includes(s.name)
  );
}

function getBarWidth(max: string): number {
  const m = max.match(/([\d.]+)%/);
  if (m) return Math.min(parseFloat(m[1]), 100);
  return 45;
}

const STONE_LABELS = ["Stone I", "Stone II", "Stone III"];

export default function PrimalClient({ data }: { data: PrimalItem[] }) {
  const [selected, setSelected] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filterSearch, setFilterSearch] = useState("");

  const item = data[selected];
  const visibleStats = FILTER_STATS.filter((s) =>
    s.name.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <div
      style={{
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        color: "#d4d4d8",
      }}
    >
      <style>{`
        @keyframes bgPulse {
          0%   { filter: brightness(1) saturate(1); }
          100% { filter: brightness(1.15) saturate(1.3); }
        }
        @keyframes matchPulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(80,220,130,0.6), 0 0 20px rgba(80,220,130,0.2); }
          50%       { box-shadow: 0 0 0 2px rgba(80,220,130,1),   0 0 30px rgba(80,220,130,0.4); }
        }
        @keyframes statBarIn {
          from { width: 0; }
        }
        .primal-card:hover { border-color: rgba(255,200,60,0.4) !important; box-shadow: 0 0 20px rgba(255,180,0,0.15) !important; }
        .primal-card:hover img { transform: scale(1.08); }
      `}</style>

      {/* Animated background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(120,40,200,0.12) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(200,140,20,0.08) 0%, transparent 50%),
            #070b14
          `,
          animation: "bgPulse 8s ease-in-out infinite alternate",
        }}
      />

      {/* ── Header ── */}
      <header
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          borderBottom: "1px solid rgba(255,200,60,0.15)",
          background: "rgba(7,11,20,0.85)",
          backdropFilter: "blur(10px)",
          flexShrink: 0,
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a
            href="/"
            style={{
              background: "rgba(10,10,20,0.85)",
              border: "1px solid #3a3a5a",
              color: "#c9a84c",
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 13,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            ‹ Back
          </a>
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "0.12em",
                fontVariant: "small-caps",
                color: "#f0c040",
                lineHeight: 1.2,
              }}
            >
              PRIMAL FORCE
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>
              Equipment Stats Reference
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {activeFilters.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,200,60,0.1)",
                border: "1px solid rgba(255,200,60,0.3)",
                borderRadius: 20,
                padding: "4px 10px",
                fontSize: 12,
                color: "#f0c040",
                whiteSpace: "nowrap",
              }}
            >
              {activeFilters.length} filter(s) active
              <button
                type="button"
                onClick={() => setActiveFilters([])}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f0c040",
                  cursor: "pointer",
                  fontSize: 14,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            style={{
              background: "rgba(10,10,20,0.8)",
              border: "1px solid rgba(255,200,60,0.4)",
              color: "#f0c040",
              padding: "7px 16px",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            ⚙ Filter Stats
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Left sidebar — item cards */}
        <aside
          style={{
            width: 340,
            flexShrink: 0,
            overflowY: "auto",
            borderRight: "1px solid rgba(255,200,60,0.08)",
            background: "rgba(0,0,0,0.25)",
            padding: 12,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            {data.map((it, i) => {
              const isSel = selected === i;
              const isMatch = itemMatchesFilter(it, activeFilters);
              const isDimmed = activeFilters.length > 0 && !isMatch;

              let border = "1px solid rgba(255,200,60,0.1)";
              let boxShadow = "none";
              let animation = "none";

              if (isSel) {
                border = "1px solid rgba(255,200,60,0.7)";
                boxShadow =
                  "0 0 30px rgba(255,180,0,0.25), inset 0 0 20px rgba(255,180,0,0.05)";
              }
              if (isMatch && activeFilters.length > 0) {
                border = "1px solid rgba(80,220,130,0.5)";
                animation = "matchPulse 1.5s ease-in-out infinite";
              }

              return (
                <button
                  key={i}
                  type="button"
                  className="primal-card"
                  onClick={() => setSelected(i)}
                  style={{
                    background: isSel
                      ? "linear-gradient(135deg, rgba(255,200,60,0.08), rgba(255,200,60,0.03))"
                      : "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(8px)",
                    border,
                    borderRadius: 12,
                    padding: "10px 8px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 5,
                    boxShadow,
                    animation,
                    opacity: isDimmed ? 0.32 : 1,
                    transition: "opacity 0.2s, border 0.2s, box-shadow 0.2s",
                    color: "inherit",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/primal/${it.img}`}
                    alt={EN_NAMES[it.name] ?? it.name}
                    width={52}
                    height={52}
                    style={{
                      objectFit: "contain",
                      transition: "transform 0.2s",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isSel ? "#f0c040" : "#b8b8b8",
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    {EN_NAMES[it.name] ?? it.name}
                  </span>
                  <span style={{ fontSize: 9, color: "#444" }}>
                    16 Main · 8 Secondary
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right — item detail */}
        <main
          key={selected}
          style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}
        >
          {/* Item header card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 20,
              padding: "16px 20px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,200,60,0.15)",
              borderRadius: 16,
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                style={{
                  position: "absolute",
                  inset: -12,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,200,60,0.18) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/primal/${item.img}`}
                alt={EN_NAMES[item.name] ?? item.name}
                width={96}
                height={96}
                style={{ objectFit: "contain", position: "relative" }}
              />
            </div>
            <div>
              <div
                style={{ fontSize: 24, fontWeight: 700, color: "#f0c040", lineHeight: 1.2 }}
              >
                {EN_NAMES[item.name] ?? item.name}
              </div>
              <div style={{ fontSize: 13, color: "#555", marginTop: 5 }}>
                Primal Force Equipment
              </div>
            </div>
          </div>

          {/* Enhancement Stones */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: "#666",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Enhancement Stones
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {item.stones.map((stone, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,200,60,0.2)",
                      borderRadius: 8,
                      padding: 6,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/primal/${stone}`}
                      width={48}
                      height={48}
                      alt={STONE_LABELS[i]}
                      style={{ objectFit: "contain", display: "block" }}
                    />
                  </div>
                  <span style={{ fontSize: 10, color: "#555" }}>
                    {STONE_LABELS[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats — two columns */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            {/* Main Stats */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "#666",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Main Stats{" "}
                <span style={{ color: "#444", fontWeight: 400 }}>
                  ({item.mainStats.length})
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {item.mainStats.map((stat, i) => {
                  const isHL = activeFilters.includes(stat.name);
                  const barW = getBarWidth(stat.max);
                  return (
                    <div
                      key={i}
                      style={{
                        borderLeft: isHL
                          ? "2px solid rgba(255,200,60,0.7)"
                          : "2px solid transparent",
                        paddingLeft: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          marginBottom: 3,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/primal/status/${stat.icon}`}
                          width={18}
                          height={18}
                          alt=""
                          style={{ objectFit: "contain", flexShrink: 0 }}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            color: isHL ? "#7dff9f" : "#c4c4c4",
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          {stat.name}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span style={{ color: "#777" }}>{stat.min}</span>
                          <span style={{ color: "#333", margin: "0 3px" }}>–</span>
                          <span style={{ color: "#c9a84c" }}>{stat.max}</span>
                        </span>
                      </div>
                      <div
                        style={{
                          height: 3,
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${barW}%`,
                            background:
                              "linear-gradient(90deg, rgba(255,200,60,0.4), rgba(255,200,60,0.85))",
                            borderRadius: 2,
                            animation: "statBarIn 0.5s ease-out",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Secondary Stats */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "#666",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Secondary Stats{" "}
                <span style={{ color: "#444", fontWeight: 400 }}>
                  ({item.secStats.length})
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {item.secStats.map((stat, i) => {
                  const isHL = activeFilters.includes(stat.name);
                  const barW = getBarWidth(stat.max);
                  return (
                    <div
                      key={i}
                      style={{
                        borderLeft: isHL
                          ? "2px solid rgba(255,200,60,0.7)"
                          : "2px solid transparent",
                        paddingLeft: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          marginBottom: 3,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/primal/status/${stat.icon}`}
                          width={18}
                          height={18}
                          alt=""
                          style={{ objectFit: "contain", flexShrink: 0 }}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            color: isHL ? "#7dff9f" : "#c4c4c4",
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          {stat.name}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span style={{ color: "#777" }}>{stat.min}</span>
                          <span style={{ color: "#333", margin: "0 3px" }}>–</span>
                          <span style={{ color: "#c9a84c" }}>{stat.max}</span>
                        </span>
                      </div>
                      <div
                        style={{
                          height: 3,
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${barW}%`,
                            background:
                              "linear-gradient(90deg, rgba(255,200,60,0.4), rgba(255,200,60,0.85))",
                            borderRadius: 2,
                            animation: "statBarIn 0.5s ease-out",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Filter Modal ── */}
      {filterOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.78)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setFilterOpen(false);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 600,
              margin: "0 16px",
              background: "rgba(8,11,24,0.97)",
              border: "1px solid rgba(255,200,60,0.3)",
              borderRadius: 16,
              backdropFilter: "blur(16px)",
              display: "flex",
              flexDirection: "column",
              maxHeight: "85vh",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,200,60,0.1)",
              }}
            >
              <span
                style={{ fontSize: 15, fontWeight: 700, color: "#f0c040" }}
              >
                Filter Stats
              </span>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <input
                type="text"
                placeholder="Search stats..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,200,60,0.2)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#ccc",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Stat pills grid */}
            <div
              style={{ overflowY: "auto", padding: "12px 20px", flex: 1 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 6,
                }}
              >
                {visibleStats.map((s) => {
                  const isChecked = activeFilters.includes(s.name);
                  return (
                    <label
                      key={s.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 12px",
                        borderRadius: 20,
                        border: isChecked
                          ? "1px solid rgba(255,200,60,0.6)"
                          : "1px solid rgba(255,255,255,0.07)",
                        background: isChecked
                          ? "rgba(255,200,60,0.08)"
                          : "rgba(255,255,255,0.02)",
                        cursor: "pointer",
                        fontSize: 12,
                        color: isChecked ? "#f0c040" : "#999",
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveFilters((prev) => [...prev, s.name]);
                          } else {
                            setActiveFilters((prev) =>
                              prev.filter((f) => f !== s.name)
                            );
                          }
                        }}
                        style={{ display: "none" }}
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/primal/status/${s.icon}`}
                        width={18}
                        height={18}
                        alt=""
                        style={{ objectFit: "contain", flexShrink: 0 }}
                      />
                      {s.name}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                padding: "14px 20px",
                borderTop: "1px solid rgba(255,200,60,0.1)",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveFilters([])}
                style={{
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#888",
                  padding: "8px 20px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                style={{
                  background: "rgba(255,200,60,0.85)",
                  border: "none",
                  color: "#000",
                  padding: "8px 20px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
