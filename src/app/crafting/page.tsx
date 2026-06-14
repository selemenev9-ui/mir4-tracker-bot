"use client";

import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const EQUIPMENT_CATEGORIES = [
  {
    id: "scale",
    label: "Dragon Scale / Claw",
    epic: {
      rawMaterials: [
        { name: "Steel", qty: 300 },
        { name: "Evil Minded Orb", qty: 100 },
        { name: "Moon Shadow Stone", qty: 100 },
      ],
      darksteel: 28750,
      powder: 8750000,
      gold: 25000000,
    },
    legendary: {
      rawMaterials: [
        { name: "Steel", qty: 300 },
        { name: "Evil Minded Orb", qty: 100 },
        { name: "Moon Shadow Stone", qty: 100 },
      ],
      darksteel: 287500,
      powder: 87500000,
      gold: 250000000,
    },
  },
  {
    id: "leather",
    label: "Dragon Leather",
    epic: {
      rawMaterials: [
        { name: "Steel", qty: 300 },
        { name: "Quintessence", qty: 100 },
        { name: "Exorcism Bauble", qty: 100 },
      ],
      darksteel: 28750,
      powder: 8750000,
      gold: 25000000,
    },
    legendary: {
      rawMaterials: [
        { name: "Steel", qty: 300 },
        { name: "Quintessence", qty: 100 },
        { name: "Exorcism Bauble", qty: 100 },
      ],
      darksteel: 287500,
      powder: 87500000,
      gold: 250000000,
    },
  },
  {
    id: "horn",
    label: "Dragon Horn / Eye",
    epic: {
      rawMaterials: [
        { name: "Platinum", qty: 300 },
        { name: "Illuminating Fragment", qty: 100 },
        { name: "Anima Stone", qty: 100 },
      ],
      darksteel: 28750,
      powder: 8750000,
      gold: 25000000,
    },
    legendary: {
      rawMaterials: [
        { name: "Platinum", qty: 300 },
        { name: "Illuminating Fragment", qty: 100 },
        { name: "Anima Stone", qty: 100 },
      ],
      darksteel: 287500,
      powder: 87500000,
      gold: 250000000,
    },
  },
] as const;

const DRAGON_ARTIFACTS = [
  { id: "scepter", label: "Majestic Scepter",  eternal: "Eternal Steel",     dragonPiece: "Dragon Scale"   },
  { id: "seal",    label: "Majestic Seal",      eternal: "Eternal Steel",     dragonPiece: "Dragon Claw"    },
  { id: "bell",    label: "Heavenly Bell",       eternal: "Eternal Steel",     dragonPiece: "Dragon Leather" },
  { id: "cape",    label: "Majestic Cape",       eternal: "Eternal Coldsteel", dragonPiece: "Dragon Leather" },
  { id: "blade",   label: "Ornate Blade",        eternal: "Eternal Coldsteel", dragonPiece: "Dragon Scale"   },
  { id: "jade",    label: "Crescent Jade",       eternal: "Eternal Coldsteel", dragonPiece: "Dragon Claw"    },
  { id: "crown",   label: "Majestic Crown",      eternal: "Eternal Cold Jade", dragonPiece: "Dragon Horn"    },
  { id: "burner",  label: "Incense Burner",      eternal: "Eternal Cold Jade", dragonPiece: "Dragon Horn"    },
  { id: "mirror",  label: "Bronze Mirror",       eternal: "Eternal Cold Jade", dragonPiece: "Dragon Eye"     },
] as const;

const ETERNAL_GROUPS = ["Eternal Steel", "Eternal Coldsteel", "Eternal Cold Jade"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString();
}

// ─── Equipment Calculator ─────────────────────────────────────────────────────

function EquipmentCalculator() {
  const [categoryId, setCategoryId] = useState<string>(EQUIPMENT_CATEGORIES[0].id);
  const [grade, setGrade] = useState<"epic" | "legendary">("epic");
  const [count, setCount] = useState(1);

  const category = EQUIPMENT_CATEGORIES.find((c) => c.id === categoryId)!;
  const data = category[grade];
  const safeCount = Math.max(1, count || 1);

  return (
    <div className="space-y-5">
      {/* Category selector */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Equipment Type
        </p>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              className={[
                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                categoryId === cat.id
                  ? "border-zinc-500 bg-zinc-600 text-white"
                  : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200",
              ].join(" ")}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grade selector */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Grade
        </p>
        <div className="flex gap-2">
          {(["epic", "legendary"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrade(g)}
              className={[
                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                grade === g
                  ? "border-zinc-500 bg-zinc-600 text-white"
                  : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200",
              ].join(" ")}
            >
              {g === "epic" ? "Rare → Epic" : "Epic → Legendary"}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div>
        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          How many items?
        </label>
        <input
          type="number"
          min={1}
          value={count}
          onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-24 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        />
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Raw Materials */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Raw Materials
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
            {data.rawMaterials.map((mat) => (
              <div
                key={mat.name}
                className="rounded-xl border border-zinc-700/60 bg-zinc-800 p-4"
              >
                <p className="text-[11px] text-zinc-500">{mat.name}</p>
                <p className="mt-1 text-base font-bold text-zinc-100">
                  {fmt(mat.qty * safeCount)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Crafting Fees */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Crafting Fees
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
            <div className="rounded-xl border border-zinc-700/60 bg-zinc-800 p-4">
              <p className="text-[11px] text-zinc-500">🔩 Darksteel</p>
              <p className="mt-1 text-base font-bold text-zinc-100">
                {fmt(data.darksteel * safeCount)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-700/60 bg-zinc-800 p-4">
              <p className="text-[11px] text-zinc-500">⚗️ Powder</p>
              <p className="mt-1 text-base font-bold text-zinc-100">
                {fmt(data.powder * safeCount)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-700/60 bg-zinc-800 p-4">
              <p className="text-[11px] text-zinc-500">🪙 Gold</p>
              <p className="mt-1 text-base font-bold text-zinc-100">
                {fmt(data.gold * safeCount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dragon Artifact Calculator ───────────────────────────────────────────────

function DragonArtifactCalculator() {
  const [artifactId, setArtifactId] = useState<string>(DRAGON_ARTIFACTS[0].id);
  const [count, setCount] = useState(1);

  const artifact = DRAGON_ARTIFACTS.find((a) => a.id === artifactId)!;
  const safeCount = Math.max(1, count || 1);

  return (
    <div className="space-y-5">
      {/* Artifact selector grouped by eternal type */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Artifact
        </p>
        <div className="space-y-3">
          {ETERNAL_GROUPS.map((group) => (
            <div key={group}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                {group}
              </p>
              <div className="flex flex-wrap gap-2">
                {DRAGON_ARTIFACTS.filter((a) => a.eternal === group).map((art) => (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => setArtifactId(art.id)}
                    className={[
                      "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                      artifactId === art.id
                        ? "border-zinc-500 bg-zinc-600 text-white"
                        : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200",
                    ].join(" ")}
                  >
                    {art.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Count */}
      <div>
        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          How many artifacts?
        </label>
        <input
          type="number"
          min={1}
          value={count}
          onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-24 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        />
      </div>

      {/* Results */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Materials Required
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
          <div className="rounded-xl border border-amber-500/30 bg-zinc-800 p-4">
            <p className="text-[11px] text-zinc-500">{artifact.eternal}</p>
            <p className="mt-1 text-base font-bold text-amber-300">
              {fmt(30 * safeCount)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-700/60 bg-zinc-800 p-4">
            <p className="text-[11px] text-zinc-500">{artifact.dragonPiece}</p>
            <p className="mt-1 text-base font-bold text-zinc-100">
              {fmt(1 * safeCount)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-700/60 bg-zinc-800 p-4">
            <p className="text-[11px] text-zinc-500">Dragon Sphere</p>
            <p className="mt-1 text-base font-bold text-zinc-100">
              {fmt(1 * safeCount)}
            </p>
          </div>
          <div className="rounded-xl border border-cyan-500/30 bg-zinc-800 p-4">
            <p className="text-[11px] text-zinc-500">🐉 Dragon Steel</p>
            <p className="mt-1 text-base font-bold text-cyan-300">
              {fmt(250 * safeCount)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-700/60 bg-zinc-800 p-4">
            <p className="text-[11px] text-zinc-500">⚗️ Powder</p>
            <p className="mt-1 text-base font-bold text-zinc-100">
              {fmt(2500000 * safeCount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CraftingPage() {
  const [tab, setTab] = useState<"equipment" | "artifact">("equipment");

  return (
    <div
      className="min-h-screen text-zinc-100 antialiased"
      style={{
        background: "#05080f",
        backgroundImage:
          "radial-gradient(ellipse 70% 50% at 15% 85%, rgba(99,40,220,0.22) 0%, transparent 65%), radial-gradient(ellipse 55% 45% at 85% 65%, rgba(6,182,212,0.10) 0%, transparent 65%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div className="mx-auto max-w-2xl p-4">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <a
            href="/"
            className="flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
          >
            ← Back
          </a>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-100">
              ⛏ Crafting Calculator
            </h1>
            <p className="text-[10px] text-zinc-500">
              built for guilds · by devilren (AKA Balor)
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mb-5 flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1">
          <button
            type="button"
            onClick={() => setTab("equipment")}
            className={[
              "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors",
              tab === "equipment"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-zinc-500 hover:text-zinc-300",
            ].join(" ")}
          >
            Equipment
          </button>
          <button
            type="button"
            onClick={() => setTab("artifact")}
            className={[
              "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors",
              tab === "artifact"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-zinc-500 hover:text-zinc-300",
            ].join(" ")}
          >
            Dragon Artifact
          </button>
        </div>

        {/* Content */}
        <div
          className="rounded-2xl border border-zinc-800/80 p-5"
          style={{ background: "rgba(9,11,18,0.85)" }}
        >
          {tab === "equipment" ? <EquipmentCalculator /> : <DragonArtifactCalculator />}
        </div>
      </div>
    </div>
  );
}
