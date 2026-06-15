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

export default function PotentialClient({ data }: { data: PotentialData }) {
  const classes = Object.keys(data);
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]);
  const [selectedNode, setSelectedNode] = useState<PotentialNode | null>(null);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [scale, setScale] = useState<number>(0.4);

  const classData = data[selectedClass];
  const stage = selectedNode ? selectedNode.stages[currentStage] : null;
  const totalStages = selectedNode ? selectedNode.stages.length : 0;

  return (
    <div className="flex bg-[#0a0a0f] text-zinc-100" style={{ height: "100dvh", overflow: "hidden" }}>
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
            src="/potential/5700011.webp"
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

          {/* Node buttons */}
          {classData.nodes.map((node) => {
            const isSelected = selectedNode?.pid === node.pid;
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
                  transform: "translate(-50%, -50%)",
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: isSelected ? "#f59e0b" : "#4b5563",
                  border: isSelected ? "3px solid #fde68a" : "2px solid #374151",
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 0 10px 4px rgba(245,158,11,0.6)" : "none",
                  transition: "all 0.1s",
                  zIndex: isSelected ? 10 : 1,
                  padding: 0,
                }}
              />
            );
          })}
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
    </div>
  );
}
