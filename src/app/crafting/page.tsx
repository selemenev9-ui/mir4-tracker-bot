"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const ICON = (file: string) => `/crafting/${file}`;

type EquipmentMaterial = {
  id: string;
  name: string;
  need: number;
  icon: string;
};

type EquipmentType = {
  id: string;
  label: string;
  dragonPieces: { name: string; icon: string }[];
  materials: EquipmentMaterial[];
};

const EQUIPMENT_TYPES: EquipmentType[] = [
  {
    id: "scale",
    label: "Dragon Scale / Claw",
    dragonPieces: [
      { name: "Dragon Scale", icon: ICON("DragonScale.png") },
      { name: "Dragon Claw", icon: ICON("DragonClaw.png") },
    ],
    materials: [
      { id: "steel", name: "Steel", need: 300, icon: ICON("Steel.png") },
      {
        id: "evil-minded-orb",
        name: "Evil Minded Orb",
        need: 100,
        icon: ICON("EvilMindedOrb.png"),
      },
      {
        id: "moon-shadow-stone",
        name: "Moon Shadow Stone",
        need: 100,
        icon: ICON("MoonShadowStone.png"),
      },
    ],
  },
  {
    id: "leather",
    label: "Dragon Leather",
    dragonPieces: [{ name: "Dragon Leather", icon: ICON("DragonLeather.png") }],
    materials: [
      { id: "steel", name: "Steel", need: 300, icon: ICON("Steel.png") },
      {
        id: "quintessence",
        name: "Quintessence",
        need: 100,
        icon: ICON("Quintessence.png"),
      },
      {
        id: "exorcism-bauble",
        name: "Exorcism Bauble",
        need: 100,
        icon: ICON("ExorcismBauble.png"),
      },
    ],
  },
  {
    id: "horn",
    label: "Dragon Horn / Eye",
    dragonPieces: [
      { name: "Dragon Horn", icon: ICON("DragonHorn.png") },
      { name: "Dragon Eye", icon: ICON("DragonEye.png") },
    ],
    materials: [
      { id: "platinum", name: "Platinum", need: 300, icon: ICON("Platinum.png") },
      {
        id: "illuminating-fragment",
        name: "Illuminating Fragment",
        need: 100,
        icon: ICON("IlluminatingFragment.png"),
      },
      {
        id: "anima-stone",
        name: "Anima Stone",
        need: 100,
        icon: ICON("AnimaStone.png"),
      },
    ],
  },
];

const DRAGON_ARTIFACTS = [
  {
    id: "scepter",
    name: "Majestic Scepter",
    eternal: "Eternal Steel",
    dragonPiece: "Dragon Scale",
    icon: ICON("ArtifactScepter.png"),
    eternalIcon: ICON("EternalSteel.png"),
    pieceIcon: ICON("DragonScale.png"),
  },
  {
    id: "seal",
    name: "Majestic Seal",
    eternal: "Eternal Steel",
    dragonPiece: "Dragon Claw",
    icon: ICON("ArtifactSeal.png"),
    eternalIcon: ICON("EternalSteel.png"),
    pieceIcon: ICON("DragonClaw.png"),
  },
  {
    id: "bell",
    name: "Heavenly Bell",
    eternal: "Eternal Steel",
    dragonPiece: "Dragon Leather",
    icon: ICON("ArtifactBell.png"),
    eternalIcon: ICON("EternalSteel.png"),
    pieceIcon: ICON("DragonLeather.png"),
  },
  {
    id: "cape",
    name: "Majestic Cape",
    eternal: "Eternal Coldsteel",
    dragonPiece: "Dragon Leather",
    icon: ICON("ArtifactCape.png"),
    eternalIcon: ICON("EternalColdsteel.png"),
    pieceIcon: ICON("DragonLeather.png"),
  },
  {
    id: "blade",
    name: "Ornate Blade",
    eternal: "Eternal Coldsteel",
    dragonPiece: "Dragon Scale",
    icon: ICON("ArtifactBlade.png"),
    eternalIcon: ICON("EternalColdsteel.png"),
    pieceIcon: ICON("DragonScale.png"),
  },
  {
    id: "jade",
    name: "Crescent Jade",
    eternal: "Eternal Coldsteel",
    dragonPiece: "Dragon Claw",
    icon: ICON("ArtifactJade.png"),
    eternalIcon: ICON("EternalColdsteel.png"),
    pieceIcon: ICON("DragonClaw.png"),
  },
  {
    id: "crown",
    name: "Majestic Crown",
    eternal: "Eternal Cold Jade",
    dragonPiece: "Dragon Horn",
    icon: ICON("ArtifactCrown.png"),
    eternalIcon: ICON("EternalColdJade.png"),
    pieceIcon: ICON("DragonHorn.png"),
  },
  {
    id: "burner",
    name: "Incense Burner",
    eternal: "Eternal Cold Jade",
    dragonPiece: "Dragon Horn",
    icon: ICON("ArtifactBurner.png"),
    eternalIcon: ICON("EternalColdJade.png"),
    pieceIcon: ICON("DragonHorn.png"),
  },
  {
    id: "mirror",
    name: "Bronze Mirror",
    eternal: "Eternal Cold Jade",
    dragonPiece: "Dragon Eye",
    icon: ICON("ArtifactMirror.png"),
    eternalIcon: ICON("EternalColdJade.png"),
    pieceIcon: ICON("DragonEye.png"),
  },
] as const;

const ARTIFACT_GROUPS = ["Eternal Steel", "Eternal Coldsteel", "Eternal Cold Jade"] as const;

type ArtifactId = (typeof DRAGON_ARTIFACTS)[number]["id"];

type TierStock = {
  legendary: number;
  epic: number;
  rare: number;
  uncommon: number;
};

type CraftToggles = {
  ucr: boolean;
  re: boolean;
  el: boolean;
};

type CalcResult = {
  gap: TierStock;
  totals: {
    gp: number;
    darksteel: number;
    copper: number;
  };
};

const EMPTY_STOCK: TierStock = {
  legendary: 0,
  epic: 0,
  rare: 0,
  uncommon: 0,
};

const DEFAULT_TOGGLES: CraftToggles = { ucr: true, re: true, el: true };

function fmt(value: number) {
  return value.toLocaleString();
}

function calcMaterial(
  targetGrade: "epic" | "legendary",
  need: number,
  stock: TierStock,
  toggles: CraftToggles
): CalcResult {
  if (targetGrade === "legendary") {
    const craftsEL = Math.max(0, need - stock.legendary);
    const eMats = craftsEL * 10;
    const craftsRE = toggles.re ? Math.max(0, eMats - stock.epic) : 0;
    const rMats = craftsRE * 10;
    const craftsUCR = toggles.ucr ? Math.max(0, rMats - stock.rare) : 0;
    const ucNeeded = Math.max(0, craftsUCR * 10 - stock.uncommon);

    return {
      gap: {
        legendary: craftsEL,
        epic: eMats,
        rare: rMats,
        uncommon: ucNeeded,
      },
      totals: {
        gp: craftsEL * 250 + craftsRE * 25 + craftsUCR * 2,
        darksteel: craftsEL * 50_000 + craftsRE * 5_000 + craftsUCR * 1_000,
        copper: craftsEL * 200_000 + craftsRE * 20_000 + craftsUCR * 2_000,
      },
    };
  }

  const craftsRE = Math.max(0, need - stock.epic);
  const rMats = craftsRE * 10;
  const craftsUCR = toggles.ucr ? Math.max(0, rMats - stock.rare) : 0;
  const ucNeeded = Math.max(0, craftsUCR * 10 - stock.uncommon);

  return {
    gap: {
      legendary: 0,
      epic: craftsRE,
      rare: rMats,
      uncommon: ucNeeded,
    },
    totals: {
      gp: craftsRE * 25 + craftsUCR * 2,
      darksteel: craftsRE * 5_000 + craftsUCR * 1_000,
      copper: craftsRE * 20_000 + craftsUCR * 2_000,
    },
  };
}

function CraftIcon({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={["rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-200", className]
        .filter(Boolean)
        .join(" ")}
      >
        {alt}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className ?? "h-8 w-8 object-contain"}
      onError={() => setFailed(true)}
    />
  );
}

const tierOrder: { key: keyof TierStock; label: string }[] = [
  { key: "legendary", label: "[L] Have" },
  { key: "epic", label: "[E] Have" },
  { key: "rare", label: "[R] Have" },
  { key: "uncommon", label: "[UC] Have" },
];

function EquipmentCalculator() {
  const [categoryId, setCategoryId] = useState(EQUIPMENT_TYPES[0].id);
  const [grade, setGrade] = useState<"epic" | "legendary">("epic");
  const [stockByMaterial, setStockByMaterial] = useState<Record<string, TierStock>>(() => {
    const initial: Record<string, TierStock> = {};
    EQUIPMENT_TYPES.forEach((cat) => {
      cat.materials.forEach((mat) => {
        initial[`${cat.id}:${mat.id}`] = { ...EMPTY_STOCK };
      });
    });
    return initial;
  });
  const [togglesByMaterial, setTogglesByMaterial] = useState<Record<string, CraftToggles>>(() => {
    const initial: Record<string, CraftToggles> = {};
    EQUIPMENT_TYPES.forEach((cat) => {
      cat.materials.forEach((mat) => {
        initial[`${cat.id}:${mat.id}`] = { ...DEFAULT_TOGGLES };
      });
    });
    return initial;
  });
  const [ucExpanded, setUcExpanded] = useState<Record<string, boolean>>({});

  const currentCategory = EQUIPMENT_TYPES.find((cat) => cat.id === categoryId)!;

  const breakdown = useMemo(() => {
    return currentCategory.materials.map((mat) => {
      const key = `${currentCategory.id}:${mat.id}`;
      const stock = stockByMaterial[key] ?? { ...EMPTY_STOCK };
      const toggles = togglesByMaterial[key] ?? { ...DEFAULT_TOGGLES };
      const calc = calcMaterial(grade, mat.need, stock, toggles);
      return { key, mat, stock, calc, toggles };
    });
  }, [currentCategory, grade, stockByMaterial, togglesByMaterial]);

  const totals = breakdown.reduce(
    (acc, item) => {
      acc.gp += item.calc.totals.gp;
      acc.copper += item.calc.totals.copper;
      acc.darksteel += item.calc.totals.darksteel;
      return acc;
    },
    { gp: 0, copper: 0, darksteel: 0 }
  );

  const ucAlerts = breakdown.filter((item) => item.calc.gap.uncommon > 0);

  function updateStock(key: string, tier: keyof TierStock, value: number) {
    setStockByMaterial((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? { ...EMPTY_STOCK }),
        [tier]: Math.max(0, value),
      },
    }));
  }

  function updateToggle(key: string, field: keyof CraftToggles, value: boolean) {
    setTogglesByMaterial((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? { ...DEFAULT_TOGGLES }),
        [field]: value,
      },
    }));
  }

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Equipment Type
        </p>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_TYPES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                categoryId === cat.id ? "bg-amber-500 text-black" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600",
              ].join(" ")}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Target Grade
        </p>
        <div className="flex flex-wrap gap-2">
          {(["epic", "legendary"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrade(g)}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                grade === g ? "bg-amber-500 text-black" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600",
              ].join(" ")}
            >
              {g === "epic" ? "Epic craft" : "Legendary craft"}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Dragon pieces needed
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          {currentCategory.dragonPieces.map((piece) => (
            <div key={piece.name} className="flex items-center gap-2 text-sm text-zinc-300">
              <CraftIcon src={piece.icon} alt={piece.name} className="h-6 w-6" />
              <span>{piece.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Materials on hand
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {breakdown.map(({ key, mat, stock, calc, toggles }) => (
            <div key={key} className="rounded-xl border border-zinc-800 bg-zinc-800/70 p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
                {grade === "legendary" && (
                  <>
                    <label className="flex cursor-pointer items-center gap-1">
                      <input
                        type="checkbox"
                        checked={toggles.el}
                        onChange={(e) => updateToggle(key, "el", e.target.checked)}
                        className="accent-amber-400"
                      />
                      E→L
                    </label>
                    <label className="flex cursor-pointer items-center gap-1">
                      <input
                        type="checkbox"
                        checked={toggles.re}
                        onChange={(e) => updateToggle(key, "re", e.target.checked)}
                        className="accent-amber-400"
                      />
                      R→E
                    </label>
                  </>
                )}
                {grade === "epic" && (
                  <label className="flex cursor-pointer items-center gap-1">
                    <input
                      type="checkbox"
                      checked={toggles.re}
                      onChange={(e) => updateToggle(key, "re", e.target.checked)}
                      className="accent-amber-400"
                    />
                    R→E
                  </label>
                )}
                <label className="flex cursor-pointer items-center gap-1">
                  <input
                    type="checkbox"
                    checked={toggles.ucr}
                    onChange={(e) => updateToggle(key, "ucr", e.target.checked)}
                    className="accent-amber-400"
                  />
                  UC→R
                </label>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CraftIcon src={mat.icon} alt={mat.name} />
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{mat.name}</p>
                    <p className="text-xs text-zinc-500">Need: {fmt(mat.need)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-[11px]">
                  {grade === "legendary" && (
                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-purple-200">
                      Gap: {fmt(calc.gap.legendary)} [L]
                    </span>
                  )}
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-200">
                    Gap: {fmt(calc.gap.epic)} [E]
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {tierOrder.map((tier) => {
                  if (tier.key === "legendary" && grade === "epic") {
                    return null;
                  }
                  if (tier.key === "uncommon" && !ucExpanded[key]) {
                    return (
                      <button
                        key={`${key}-${tier.key}-toggle`}
                        type="button"
                        onClick={() => setUcExpanded((prev) => ({ ...prev, [key]: !prev[key] }))}
                        className="text-left text-[11px] font-semibold text-zinc-400 hover:text-zinc-200"
                      >
                        {ucExpanded[key] ? "▾ Hide UC" : "▸ UC reserve"}
                      </button>
                    );
                  }

                  return (
                    <label
                      key={`${key}-${tier.key}`}
                      className="flex items-center justify-between text-[13px] text-zinc-300"
                    >
                      <span>{tier.label}</span>
                      <input
                        type="number"
                        min={0}
                        value={stock[tier.key] ?? 0}
                        onChange={(event) =>
                          updateStock(key, tier.key, Number(event.target.value) || 0)
                        }
                        className="w-24 rounded border border-zinc-600 bg-zinc-700 px-2 py-1 text-right text-sm text-white focus:border-amber-400 focus:outline-none"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {ucAlerts.length > 0 && (
        <section className="space-y-2 rounded-xl border border-amber-500/30 bg-zinc-800/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
            Farm / buy (Uncommon tier)
          </p>
          <div className="space-y-2">
            {ucAlerts.map(({ key, mat, calc }) => (
              <div key={`${key}-uc`} className="flex items-center gap-2 text-sm text-amber-100">
                <CraftIcon src={mat.icon} alt={mat.name} className="h-6 w-6" />
                <span>
                  {fmt(calc.gap.uncommon)} [UC] {mat.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Crafting fees
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-800/70 p-4">
            <CraftIcon src={ICON("GlitteringPowder.png")} alt="Glittering Powder" />
            <div>
              <p className="text-xs text-zinc-400">Glittering Powder</p>
              <p className="text-lg font-semibold text-zinc-100">{fmt(totals.gp)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-800/70 p-4">
            <CraftIcon src={ICON("Darksteel.png")} alt="Darksteel" />
            <div>
              <p className="text-xs text-zinc-400">Darksteel</p>
              <p className="text-lg font-semibold text-zinc-100">{fmt(totals.darksteel)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-800/70 p-4">
            <CraftIcon src={ICON("Copper.png")} alt="Copper" />
            <div>
              <p className="text-xs text-zinc-400">Copper</p>
              <p className="text-lg font-semibold text-zinc-100">{fmt(totals.copper)}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

type ArtifactState = {
  count: number;
  eternal: number;
  piece: number;
  sphere: number;
};

function DragonArtifactCalculator() {
  const [grade, setGrade] = useState<"epic" | "legendary">("epic");
  const [artifactId, setArtifactId] = useState<ArtifactId>(DRAGON_ARTIFACTS[0].id);
  const [artifactState, setArtifactState] = useState<Record<ArtifactId, ArtifactState>>(() => {
    const initial = {} as Record<ArtifactId, ArtifactState>;
    DRAGON_ARTIFACTS.forEach((artifact) => {
      initial[artifact.id] = { count: 1, eternal: 0, piece: 0, sphere: 0 };
    });
    return initial;
  });

  const artifact = DRAGON_ARTIFACTS.find((a) => a.id === artifactId)!;
  const inputs = artifactState[artifact.id];
  const safeCount = Math.max(1, inputs.count || 1);

  const eternalPerCraft = grade === "epic" ? 30 : 50;
  const needEternal = Math.max(0, safeCount * eternalPerCraft - inputs.eternal);
  const needPiece = Math.max(0, safeCount - inputs.piece);
  const needSphere = Math.max(0, safeCount - inputs.sphere);
  const dragonSteel = safeCount * (grade === "epic" ? 250 : 2_500);
  const darksteelCost = safeCount * (grade === "epic" ? 2_500_000 : 25_000_000);

  function update(field: keyof ArtifactState, value: number) {
    setArtifactState((prev) => ({
      ...prev,
      [artifact.id]: {
        ...prev[artifact.id],
        [field]: Math.max(0, value),
      },
    }));
  }

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Artifact grade
        </p>
        <div className="flex flex-wrap gap-2">
          {(["epic", "legendary"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrade(g)}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                grade === g ? "bg-amber-500 text-black" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600",
              ].join(" ")}
            >
              {g === "epic" ? "Epic" : "Legendary"}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {ARTIFACT_GROUPS.map((group) => (
          <div key={group} className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              {group}
            </p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {DRAGON_ARTIFACTS.filter((item) => item.eternal === group).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setArtifactId(item.id)}
                  className={[
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors",
                    artifactId === item.id
                      ? "border-amber-500 bg-amber-500/20 text-amber-200"
                      : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
                  ].join(" ")}
                >
                  <CraftIcon src={item.icon} alt={item.name} className="h-8 w-8" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Inventory
        </p>
        <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-800/70 p-4">
          <label className="flex items-center justify-between text-sm text-zinc-300">
            <span>Craft:</span>
            <input
              type="number"
              min={1}
              value={inputs.count}
              onChange={(event) => update("count", Number(event.target.value) || 1)}
              className="w-28 rounded border border-zinc-600 bg-zinc-700 px-2 py-1 text-right text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </label>
          <label className="flex items-center justify-between text-sm text-zinc-300">
            <span>Have {artifact.eternal}:</span>
            <input
              type="number"
              min={0}
              value={inputs.eternal}
              onChange={(event) => update("eternal", Number(event.target.value) || 0)}
              className="w-28 rounded border border-zinc-600 bg-zinc-700 px-2 py-1 text-right text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </label>
          <label className="flex items-center justify-between text-sm text-zinc-300">
            <span>Have {artifact.dragonPiece}:</span>
            <input
              type="number"
              min={0}
              value={inputs.piece}
              onChange={(event) => update("piece", Number(event.target.value) || 0)}
              className="w-28 rounded border border-zinc-600 bg-zinc-700 px-2 py-1 text-right text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </label>
          <label className="flex items-center justify-between text-sm text-zinc-300">
            <span>Have Dragon Sphere:</span>
            <input
              type="number"
              min={0}
              value={inputs.sphere}
              onChange={(event) => update("sphere", Number(event.target.value) || 0)}
              className="w-28 rounded border border-zinc-600 bg-zinc-700 px-2 py-1 text-right text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Result
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-800/70 p-4">
            <CraftIcon src={artifact.eternalIcon} alt={artifact.eternal} />
            <div>
              <p className="text-xs text-zinc-400">{artifact.eternal} needed</p>
              <p className="text-lg font-semibold text-zinc-100">{fmt(needEternal)}</p>
              <p className="text-[11px] text-zinc-500">Need: {fmt(safeCount * eternalPerCraft)} (×{eternalPerCraft} each)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-800/70 p-4">
            <CraftIcon src={artifact.pieceIcon} alt={artifact.dragonPiece} />
            <div>
              <p className="text-xs text-zinc-400">{artifact.dragonPiece} needed</p>
              <p className="text-lg font-semibold text-zinc-100">{fmt(needPiece)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-800/70 p-4">
            <CraftIcon src={ICON("DragonSphere.png")} alt="Dragon Sphere" />
            <div>
              <p className="text-xs text-zinc-400">Dragon Sphere needed</p>
              <p className="text-lg font-semibold text-zinc-100">{fmt(needSphere)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-zinc-800/70 p-4">
            <span className="rounded bg-cyan-500/30 px-2 py-1 text-xs font-semibold text-cyan-100">
              DS★
            </span>
            <div>
              <p className="text-xs text-cyan-300">Dragon Steel (не Darksteel)</p>
              <p className="text-lg font-semibold text-cyan-200">{fmt(dragonSteel)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-800/70 p-4">
            <CraftIcon src={ICON("Darksteel.png")} alt="Darksteel" />
            <div>
              <p className="text-xs text-zinc-400">Darksteel</p>
              <p className="text-lg font-semibold text-zinc-100">{fmt(darksteelCost)}</p>
              <p className="text-[11px] text-zinc-500">Craft cost</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CraftingPage() {
  const [tab, setTab] = useState<"equipment" | "artifact">("equipment");

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <header className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            ← Back
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Crafting Calculator</h1>
            <p className="text-[11px] text-zinc-500">
              built for guilds · by devilren (AKA Balor)
            </p>
          </div>
        </header>

        <div className="flex gap-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab("equipment")}
            className={[
              "flex-1 rounded-xl py-1.5 transition-colors",
              tab === "equipment" ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-zinc-200",
            ].join(" ")}
          >
            Equipment
          </button>
          <button
            type="button"
            onClick={() => setTab("artifact")}
            className={[
              "flex-1 rounded-xl py-1.5 transition-colors",
              tab === "artifact" ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-zinc-200",
            ].join(" ")}
          >
            Dragon Artifact
          </button>
        </div>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
          {tab === "equipment" ? <EquipmentCalculator /> : <DragonArtifactCalculator />}
        </section>
      </div>
    </div>
  );
}
