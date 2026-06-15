"use client";

import { useState } from "react";

export type Material = {
  name: string;
  rarity: string;
  qty: number;
  iconUrl: string;
  frameUrl: string;
};

export type PotentialStage = {
  stage: number;
  stats: { name: string; from: string; to: string; delta: string }[];
  successRate: string;
  materials: Material[];
  trainingCost: number;
};

export type PotentialNode = {
  pid: string;
  x: number;
  y: number;
  title: string;
  desc: string;
  stages: PotentialStage[];
};

export type PotentialLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
};

export type ClassData = {
  nodes: PotentialNode[];
  lines: PotentialLine[];
};

export type PotentialData = Record<string, ClassData>;

function getPotentialImgSrc(url: string): string {
  const filename = url.split("/").pop();
  return `/potential/${filename}`;
}

const CLASS_ICONS: Record<string, string> = {
  Warrior: "/potential/warrior01.webp",
  Sorcerer: "/potential/sorcerer01.webp",
  Taoist: "/potential/taoist01.webp",
  Arbalist: "/potential/arbalist01.webp",
  Lancer: "/potential/lancer01.webp",
  Darkist: "/potential/darkist01.webp",
  Lionheart: "/potential/lionheart01.webp",
};

const RARITY_COLORS: Record<string, string> = {
  incomum: "#9ca3af",
  raro: "#60a5fa",
  epico: "#c084fc",
  lendario: "#fbbf24",
  legendario: "#fbbf24",
};

const FILTER_STATS = [
  "Accuracy", "All ATK DMG Boost", "All DMG Reduction", "Antidemon Power",
  "Bash ATK DMG Boost", "Bash DMG Reduction", "Basic ATK DMG Boost", "Basic DMG Reduction",
  "Boss ATK DMG Boost", "Boss DMG Reduction", "Box Open Time Boost",
  "CRIT", "CRIT ATK DMG Boost", "CRIT DMG Reduction", "CRIT EVA",
  "Darksteel Gain Boost", "Debilitation RES Boost", "Debilitation Success Boost",
  "Divine Water Cooldown Reduction",
  "Dragon Artifact Enhancement Success Chance Boost (E)",
  "Dragon Artifact Enhancement Success Chance Boost (L)",
  "Dragon Artifact Enhancement Success Chance Boost (R)",
  "Dragon Artifact Enhancement Success Chance Boost (UC-L)",
  "Drop Chance Boost", "Energy Gain Boost", "Energy Gathering Boost",
  "Equipment Enhancement Success Chance Boost (E)",
  "Equipment Enhancement Success Chance Boost (L)",
  "Equipment Enhancement Success Chance Boost (R)",
  "Equipment Enhancement Success Chance Boost (UC-L)",
  "Equipment Enhancement Success Chance Boost (UC)",
  "EVA", "Gathering Boost", "HP", "HP Potion Effect Boost",
  "Hunting Copper Gain Boost", "Hunting EXP Boost",
  "Knockdown RES Boost", "Knockdown Success Boost",
  "Lucky Drop Chance Boost", "Max Vigor Boost (sec)", "Mining Boost",
  "Monster ATK DMG Boost", "Monster DMG Reduction", "MP", "MP Potion Effect Boost",
  "PHYS ATK", "PHYS DEF", "PvP ATK DMG Boost", "PvP DMG Reduction",
  "Silence RES Boost", "Silence Success Boost",
  "Skill ATK DMG Boost", "Skill DMG Reduction", "Skill HP Recovery Am't Boost",
  "Solitude Training Success Chance Boost",
  "Spell ATK", "Spell DEF", "Stun RES Boost", "Stun Success Boost",
];

function nodeMatchesFilter(node: PotentialNode, activeFilters: string[]): boolean {
  if (activeFilters.length === 0) return false;
  return node.stages.some((stage) =>
    stage.stats.some((stat) => activeFilters.includes(stat.name))
  );
}

const NODE_IMAGES: Record<string, { src: string; size: number }> = {
  "1":{"src":"5700001.webp","size":44},"2":{"src":"5700002.webp","size":50},"3":{"src":"5700002.webp","size":50},"4":{"src":"5700001.webp","size":44},"5":{"src":"5700002.webp","size":50},"6":{"src":"5700001.webp","size":44},"7":{"src":"5700002.webp","size":50},"8":{"src":"5700002.webp","size":50},"9":{"src":"5700002.webp","size":50},"10":{"src":"5700002.webp","size":50},
  "11":{"src":"5700001.webp","size":44},"12":{"src":"5700001.webp","size":44},"13":{"src":"5700002.webp","size":50},"14":{"src":"5700001.webp","size":44},"15":{"src":"5700002.webp","size":50},"16":{"src":"5700001.webp","size":44},"17":{"src":"5700002.webp","size":50},"18":{"src":"5700001.webp","size":44},"19":{"src":"5700002.webp","size":50},"20":{"src":"5700002.webp","size":50},
  "21":{"src":"5700001.webp","size":44},"22":{"src":"5700002.webp","size":50},"23":{"src":"5700003.webp","size":56},"24":{"src":"5700002.webp","size":50},"25":{"src":"5700001.webp","size":44},"26":{"src":"5700002.webp","size":50},"27":{"src":"5700003.webp","size":56},"28":{"src":"5700003.webp","size":56},"29":{"src":"5700003.webp","size":56},"30":{"src":"5700003.webp","size":56},
  "31":{"src":"5700003.webp","size":56},"32":{"src":"5700003.webp","size":56},"33":{"src":"5700003.webp","size":56},"34":{"src":"5700003.webp","size":56},"35":{"src":"5700003.webp","size":56},"36":{"src":"5700003.webp","size":56},"37":{"src":"5700003.webp","size":56},"38":{"src":"5700003.webp","size":56},"39":{"src":"5700003.webp","size":56},"40":{"src":"5700004.webp","size":64},
  "41":{"src":"5700003.webp","size":56},"42":{"src":"5700003.webp","size":56},"43":{"src":"5700003.webp","size":56},"44":{"src":"5700004.webp","size":64},"45":{"src":"5700003.webp","size":56},"46":{"src":"5700003.webp","size":56},"47":{"src":"5700003.webp","size":56},"48":{"src":"5700003.webp","size":56},"49":{"src":"5700004.webp","size":64},"50":{"src":"5700004.webp","size":64},
  "51":{"src":"5700004.webp","size":64},"52":{"src":"5700003.webp","size":56},"53":{"src":"5700004.webp","size":64},"54":{"src":"5700003.webp","size":56},"55":{"src":"5700003.webp","size":56},"56":{"src":"5700003.webp","size":56},"57":{"src":"5700003.webp","size":56},"58":{"src":"5700003.webp","size":56},"59":{"src":"5700003.webp","size":56},"60":{"src":"5700003.webp","size":56},
  "61":{"src":"5700003.webp","size":56},"62":{"src":"5701001.webp","size":100},"63":{"src":"5701002.webp","size":100},
  "101":{"src":"5700001.webp","size":44},"102":{"src":"5700002.webp","size":50},"103":{"src":"5700002.webp","size":50},"104":{"src":"5700002.webp","size":50},"105":{"src":"5700002.webp","size":50},"106":{"src":"5700002.webp","size":50},"107":{"src":"5700002.webp","size":50},"108":{"src":"5700001.webp","size":44},"109":{"src":"5700002.webp","size":50},"110":{"src":"5700001.webp","size":44},
  "111":{"src":"5700002.webp","size":50},"112":{"src":"5700001.webp","size":44},"113":{"src":"5700001.webp","size":44},"114":{"src":"5700001.webp","size":44},"115":{"src":"5700002.webp","size":50},"116":{"src":"5700001.webp","size":44},"117":{"src":"5700002.webp","size":50},"118":{"src":"5700001.webp","size":44},"119":{"src":"5700002.webp","size":50},"120":{"src":"5700002.webp","size":50},
  "121":{"src":"5700002.webp","size":50},"122":{"src":"5700002.webp","size":50},"123":{"src":"5700003.webp","size":56},"124":{"src":"5700001.webp","size":44},"125":{"src":"5700003.webp","size":56},"126":{"src":"5700003.webp","size":56},"127":{"src":"5700002.webp","size":50},"128":{"src":"5700003.webp","size":56},"129":{"src":"5700003.webp","size":56},"130":{"src":"5700001.webp","size":44},
  "131":{"src":"5700003.webp","size":56},"132":{"src":"5700003.webp","size":56},"133":{"src":"5700003.webp","size":56},"134":{"src":"5700003.webp","size":56},"135":{"src":"5700003.webp","size":56},"136":{"src":"5700003.webp","size":56},"137":{"src":"5700003.webp","size":56},"138":{"src":"5700004.webp","size":64},"139":{"src":"5700003.webp","size":56},"140":{"src":"5700004.webp","size":64},
  "141":{"src":"5700003.webp","size":56},"142":{"src":"5700004.webp","size":64},"143":{"src":"5700003.webp","size":56},"144":{"src":"5700004.webp","size":64},"145":{"src":"5700003.webp","size":56},"146":{"src":"5700003.webp","size":56},"147":{"src":"5700003.webp","size":56},"148":{"src":"5700004.webp","size":64},"149":{"src":"5700003.webp","size":56},"150":{"src":"5700003.webp","size":56},
  "151":{"src":"5700004.webp","size":64},"152":{"src":"5700003.webp","size":56},"153":{"src":"5700004.webp","size":64},"154":{"src":"5700003.webp","size":56},"155":{"src":"5700003.webp","size":56},"156":{"src":"5700003.webp","size":56},"157":{"src":"5700003.webp","size":56},"158":{"src":"5700003.webp","size":56},"159":{"src":"5700003.webp","size":56},"160":{"src":"5700003.webp","size":56},
  "161":{"src":"5700003.webp","size":56},"162":{"src":"5701003.webp","size":100},"163":{"src":"5701004.webp","size":100},
  "201":{"src":"5700001.webp","size":44},"202":{"src":"5700002.webp","size":50},"203":{"src":"5700002.webp","size":50},"204":{"src":"5700001.webp","size":44},"205":{"src":"5700001.webp","size":44},"206":{"src":"5700002.webp","size":50},"207":{"src":"5700001.webp","size":44},"208":{"src":"5700001.webp","size":44},"209":{"src":"5700001.webp","size":44},"210":{"src":"5700002.webp","size":50},
  "211":{"src":"5700001.webp","size":44},"212":{"src":"5700002.webp","size":50},"213":{"src":"5700001.webp","size":44},"214":{"src":"5700002.webp","size":50},"215":{"src":"5700001.webp","size":44},"216":{"src":"5700002.webp","size":50},"217":{"src":"5700001.webp","size":44},"218":{"src":"5700002.webp","size":50},"219":{"src":"5700002.webp","size":50},"220":{"src":"5700002.webp","size":50},
  "221":{"src":"5700002.webp","size":50},"222":{"src":"5700003.webp","size":56},"223":{"src":"5700002.webp","size":50},"224":{"src":"5700002.webp","size":50},"225":{"src":"5700002.webp","size":50},"226":{"src":"5700002.webp","size":50},"227":{"src":"5700003.webp","size":56},"228":{"src":"5700003.webp","size":56},"229":{"src":"5700003.webp","size":56},"230":{"src":"5700004.webp","size":64},
  "231":{"src":"5700003.webp","size":56},"232":{"src":"5700003.webp","size":56},"233":{"src":"5700003.webp","size":56},"234":{"src":"5700003.webp","size":56},"235":{"src":"5700003.webp","size":56},"236":{"src":"5700003.webp","size":56},"237":{"src":"5700004.webp","size":64},"238":{"src":"5700003.webp","size":56},"239":{"src":"5700003.webp","size":56},"240":{"src":"5700003.webp","size":56},
  "241":{"src":"5700003.webp","size":56},"242":{"src":"5700004.webp","size":64},"243":{"src":"5700003.webp","size":56},"244":{"src":"5700004.webp","size":64},"245":{"src":"5700004.webp","size":64},"246":{"src":"5700003.webp","size":56},"247":{"src":"5700004.webp","size":64},"248":{"src":"5700003.webp","size":56},"249":{"src":"5700003.webp","size":56},"250":{"src":"5700003.webp","size":56},
  "251":{"src":"5700004.webp","size":64},"252":{"src":"5700004.webp","size":64},"253":{"src":"5700003.webp","size":56},"254":{"src":"5700004.webp","size":64},"255":{"src":"5700003.webp","size":56},"256":{"src":"5700003.webp","size":56},"257":{"src":"5700003.webp","size":56},"258":{"src":"5700004.webp","size":64},"259":{"src":"5700004.webp","size":64},"260":{"src":"5700004.webp","size":64},
  "261":{"src":"5700003.webp","size":56},"262":{"src":"5701005.webp","size":100},"263":{"src":"5701016.webp","size":100},
};

export default function PotentialClient({ data }: { data: PotentialData }) {
  const classes = Object.keys(data);
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]);
  const [selectedNode, setSelectedNode] = useState<PotentialNode | null>(null);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [scale, setScale] = useState<number>(0.4);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const classData = data[selectedClass];
  const stage = selectedNode ? selectedNode.stages[currentStage] : null;
  const totalStages = selectedNode ? selectedNode.stages.length : 0;

  return (
    <div className="flex bg-[#0a0a0f] text-zinc-100" style={{ height: "100dvh", overflow: "hidden" }}>
      <style>{`
        @keyframes filterGlow {
          0%, 100% { filter: drop-shadow(0 0 4px #ffd24d); }
          50%       { filter: drop-shadow(0 0 16px #ffd24d) brightness(1.3); }
        }
      `}</style>
      {/* ── Left sidebar (class selector) ── */}
      <aside
        className="flex flex-col items-center py-3 gap-1 bg-[#111] border-r border-zinc-800 overflow-y-auto"
        style={{ width: 72, flexShrink: 0 }}
      >
        {classes.map((cls) => (
          <button
            key={cls}
            type="button"
            onClick={() => {
              setSelectedClass(cls);
              setSelectedNode(null);
            }}
            className="flex flex-col items-center gap-0.5 p-1 rounded-lg transition-colors w-full"
            style={{
              background: selectedClass === cls ? "rgba(245,158,11,0.2)" : "transparent",
              border: selectedClass === cls ? "1px solid #f59e0b" : "1px solid transparent",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CLASS_ICONS[cls] ?? ""}
              alt={cls}
              width={44}
              height={44}
              style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover" }}
            />
            <span style={{ fontSize: 9, color: "#9ca3af", lineHeight: 1, textAlign: "center" }}>{cls}</span>
          </button>
        ))}
      </aside>

      {/* ── Center mandala area ── */}
      <main className="flex-1 relative overflow-hidden">
        {/* Mandala canvas (2400×1800 logical space) */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center",
            width: 2400,
            height: 1800,
          }}
        >
          {/* Background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/potential/bgpotential.png"
            alt=""
            width={2400}
            height={1800}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />

          {/* SVG lines */}
          <svg
            viewBox="0 0 2400 1800"
            width={2400}
            height={1800}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {classData.lines.map((l, i) => (
              <line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke={l.color}
                strokeWidth={3}
              />
            ))}
          </svg>

          {/* Center connector gems — branch junction icons */}
          <div style={{ position: "absolute", left: 1201, top: 806, transform: "translate(-50%, -50%) rotate(180deg)", zIndex: 3, pointerEvents: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/potential/frame-esfera-2.webp" width={56} height={56} alt="" />
          </div>
          <div style={{ position: "absolute", left: 1139, top: 923, transform: "translate(-50%, -50%)", zIndex: 3, pointerEvents: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/potential/frame-esfera-1.webp" width={56} height={56} alt="" />
          </div>
          <div style={{ position: "absolute", left: 1264, top: 922, transform: "translate(-50%, -50%)", zIndex: 3, pointerEvents: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/potential/frame-esfera-3.webp" width={56} height={56} alt="" />
          </div>

          {/* Node buttons */}
          {classData.nodes.map((node) => {
            const isSelected = selectedNode?.pid === node.pid;
            const isFiltered = nodeMatchesFilter(node, activeFilters);
            const nodeImg = NODE_IMAGES[node.pid] ?? { src: "5700001.webp", size: 44 };
            return (
              <button
                key={node.pid}
                type="button"
                onClick={() => {
                  setSelectedNode(node);
                  setCurrentStage(0);
                }}
                title={node.title}
                style={{
                  position: "absolute",
                  left: node.x,
                  top: node.y,
                  transform: isSelected
                    ? "translate(-50%, -50%) scale(1.15)"
                    : "translate(-50%, -50%)",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: 0,
                  zIndex: isSelected || isFiltered ? 10 : 1,
                  filter: isSelected
                    ? "drop-shadow(0 0 10px rgba(255,200,50,0.8))"
                    : "none",
                  animation: isFiltered ? "filterGlow 1.5s ease-in-out infinite" : "none",
                  transition: "transform 0.1s, filter 0.1s",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/potential/${nodeImg.src}`}
                  width={nodeImg.size}
                  height={nodeImg.size}
                  style={{ display: "block", pointerEvents: "none", userSelect: "none" }}
                  alt=""
                />
              </button>
            );
          })}
        </div>

        {/* Back button */}
        <a
          href="/"
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 20,
            background: "rgba(10,10,20,0.85)",
            border: "1px solid #3a3a5a",
            color: "#c9a84c",
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 13,
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          ‹ Back
        </a>

        {/* Filter button */}
        <div className="absolute" style={{ top: 12, left: 90, zIndex: 20 }}>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-1.5 rounded bg-zinc-800 border px-3 py-1.5 text-xs font-semibold hover:bg-zinc-700 transition-colors"
            style={{
              borderColor: activeFilters.length > 0 ? "#f59e0b" : "#52525b",
              color: activeFilters.length > 0 ? "#fbbf24" : "#d4d4d8",
            }}
          >
            🔍 Filter Attributes{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
          </button>
        </div>

        {/* Zoom controls */}
        <div
          className="absolute bottom-4 flex items-center gap-1"
          style={{ left: "50%", transform: "translateX(-50%)", zIndex: 20 }}
        >
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(1, +(s + 0.1).toFixed(1)))}
            className="w-8 h-8 rounded bg-zinc-800 border border-zinc-600 text-zinc-100 hover:bg-zinc-700 font-bold text-base"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setScale(0.4)}
            className="w-8 h-8 rounded bg-zinc-800 border border-zinc-600 text-zinc-100 hover:bg-zinc-700 text-sm"
          >
            ⊙
          </button>
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.1, +(s - 0.1).toFixed(1)))}
            className="w-8 h-8 rounded bg-zinc-800 border border-zinc-600 text-zinc-100 hover:bg-zinc-700 font-bold text-base"
          >
            −
          </button>
          <span className="ml-1 text-xs text-zinc-500">{Math.round(scale * 100)}%</span>
        </div>
      </main>

      {/* ── Right detail panel ── */}
      <aside
        className="flex flex-col bg-[#111] border-l border-zinc-800 overflow-y-auto"
        style={{ width: 320, flexShrink: 0 }}
      >
        {!selectedNode ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm p-6 text-center h-full">
            ☯ Click a node on the mandala to see details
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Header */}
            <div>
              <p className="text-amber-400 font-bold text-sm leading-snug">{selectedNode.title}</p>
              <p className="text-zinc-400 italic text-xs mt-1">{selectedNode.desc}</p>
            </div>

            {/* Stage navigator */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={currentStage === 0}
                onClick={() => setCurrentStage((s) => Math.max(0, s - 1))}
                className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-base flex items-center justify-center"
              >
                ‹
              </button>
              <span className="text-xs text-zinc-300 text-center">
                Stage {currentStage + 1} / {totalStages}
              </span>
              <button
                type="button"
                disabled={currentStage === totalStages - 1}
                onClick={() => setCurrentStage((s) => Math.min(totalStages - 1, s + 1))}
                className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-base flex items-center justify-center"
              >
                ›
              </button>
            </div>

            {stage && (
              <>
                {/* Stage transition label */}
                <p className="text-[11px] text-zinc-500 text-center">
                  Stage {currentStage} → Stage {currentStage + 1}
                </p>

                {/* Stats */}
                <div className="space-y-1.5">
                  {stage.stats.map((stat, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-zinc-300 min-w-0 flex-1">{stat.name}</span>
                      <span className="text-zinc-400 whitespace-nowrap shrink-0">
                        {stat.from} → {stat.to}{" "}
                        <span className="text-green-400">{stat.delta}</span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Success rate */}
                <div className="rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">Success Rate</p>
                  <p className="text-2xl font-bold text-amber-400 mt-0.5">{stage.successRate}</p>
                </div>

                {/* Required materials */}
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-2">Required Materials</p>
                  <div className="space-y-2">
                    {stage.materials.map((mat, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg bg-zinc-800/60 border border-zinc-700/50 p-2">
                        {/* Icon + frame composite */}
                        <div className="relative shrink-0" style={{ width: 40, height: 40 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getPotentialImgSrc(mat.frameUrl)}
                            alt=""
                            width={40}
                            height={40}
                            style={{
                              position: "absolute",
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getPotentialImgSrc(mat.iconUrl)}
                            alt={mat.name}
                            width={28}
                            height={28}
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: 28,
                              height: 28,
                              objectFit: "contain",
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-xs font-semibold truncate"
                            style={{ color: RARITY_COLORS[mat.rarity] ?? "#9ca3af" }}
                          >
                            {mat.name}
                          </p>
                          <p className="text-[10px] text-zinc-500">Quantity: {mat.qty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Training cost */}
                <div className="rounded-lg bg-zinc-800/60 border border-zinc-700/50 p-3 text-center">
                  <p className="text-xs text-zinc-400">
                    Cost:{" "}
                    <span className="text-amber-300 font-semibold">{stage.trainingCost}</span>{" "}
                    Training
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </aside>

      {/* Filter modal */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setFilterOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-lg rounded-xl border bg-[#111] p-5 mx-4"
            style={{ borderColor: "#f59e0b", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-amber-400">Search Condition</h2>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="w-7 h-7 rounded bg-zinc-800 border border-zinc-600 text-zinc-300 hover:bg-zinc-700 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Checkbox grid */}
            <div className="overflow-y-auto" style={{ maxHeight: "24rem" }}>
              <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                {FILTER_STATS.map((stat) => (
                  <label
                    key={stat}
                    className="flex items-center gap-2 cursor-pointer rounded px-2 py-1 hover:bg-zinc-800 text-xs text-zinc-300"
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters.includes(stat)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setActiveFilters((prev) => [...prev, stat]);
                        } else {
                          setActiveFilters((prev) => prev.filter((f) => f !== stat));
                        }
                      }}
                      className="accent-amber-400 shrink-0"
                    />
                    {stat}
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveFilters([])}
                className="px-3 py-1.5 rounded bg-zinc-800 border border-zinc-600 text-xs text-zinc-300 hover:bg-zinc-700"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="px-3 py-1.5 rounded bg-amber-500 text-black text-xs font-semibold hover:bg-amber-400"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
