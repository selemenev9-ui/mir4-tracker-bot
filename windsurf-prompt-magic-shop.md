# Windsurf Agent Prompt: Magic Square Shop Browser

## Overview

Add a **Shop** sub-section to the existing `MagicSquareView` in `page.tsx`. Users can browse items by category (Special, Equipment, Promotion, Training, Material) and see each item's exchange costs with icons.

**Files to touch:** `src/app/page.tsx`  
**Do NOT touch:** any other files.

---

## Step 0 — Verify page.tsx integrity

```bash
wc -l src/app/page.tsx
```

Must be **≥ 1400 lines** and contain `export default function DashboardPage`. If not:
```bash
git checkout HEAD -- src/app/page.tsx
```

---

## Step 1 — Add import

After all existing imports at the top of the file:
```tsx
import MagicSquareShopItems from "@/data/mir4tools/MagicSquareShopItems";
```

---

## Step 2 — Add a `MagicSquareShopView` component

Add this complete component **before** `export default function DashboardPage()`:

```tsx
// ─── Magic Square Shop View ───────────────────────────────────────────────────

type ShopCategory = "Special" | "Equipment" | "Promotion" | "Training" | "Material";

const SHOP_CATEGORY_ICONS: Record<ShopCategory, string> = {
  Special:   "✨",
  Equipment: "⚔️",
  Promotion: "⬆️",
  Training:  "📚",
  Material:  "🪨",
};

// Map item/currency names to images
function shopItemImage(name: string): string | null {
  const stripped = name.replace(/^\[(UC|R|E|L)\]\s*/, "").toLowerCase().trim();
  const map: Record<string, string> = {
    "copper":               "/items/copper.webp",
    "darksteel":            "/items/darksteel.webp",
    "energy":               "/items/energy.webp",
    "ethereal shard":       "/items/ethereal_shard.webp",
    "lunar shard":          "/items/lunar_shard.webp",
    "solar shard":          "/items/solar_shard.webp",
    "boundless shard":      "/items/boundless_shard.webp",
    "glittering powder":    "/items/glittering_powder.webp",
    "glittering powder box":"/items/glittering_powder_box.webp",
    "herb leaf":            "/items/herb_leaf.webp",
    "herb root":            "/items/herb_root.webp",
    "reishi":               "/items/reishi.webp",
    "century fruit":        "/items/century_fruit.webp",
    "eternal snow panax":   "/items/eternal_snow_panax.webp",
    "life essence":         "/items/life_essence.webp",
    "anima stone":          "/items/anima_stone.webp",
    "dragon scale":         "/items/dragon_scale.webp",
    "dragon claw":          "/items/dragon_claw.webp",
    "dragon eye":           "/items/dragon_eye.webp",
    "dragon horn":          "/items/dragon_horn.webp",
    "dragon leather":       "/items/dragon_leather.webp",
    "blue devil stone":     "/items/blue_devil_stone.webp",
    "epic azureum mineral fluid": "/items/epic_azureum_mineral_fluid.webp",
    "moon shadow stone":    "/items/moon_shadow_stone.webp",
    "exorcism bauble":      "/items/exorcism_bauble.webp",
    "evil minded orb":      "/items/evil_minded_orb.webp",
    "illuminating fragment":"/items/illuminating_fragment.webp",
  };
  return map[stripped] ?? null;
}

// Normalize item names to a display-friendly short form
function shopItemDisplayName(name: string): string {
  return name.replace(/^\[(UC|R|E|L)\]\s*/, "").trim();
}

// A single shop item with potentially multiple cost options (array) or a single cost (object)
type CostOption = Record<string, number>;

function MagicSquareShopView() {
  const categories = Object.keys(MagicSquareShopItems) as ShopCategory[];
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("Special");
  const [search, setSearch] = useState("");

  const categoryItems = MagicSquareShopItems[activeCategory] as Record<string, CostOption | CostOption[]>;
  const filteredEntries = Object.entries(categoryItems).filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Category tabs */}
      <div className="mb-3 flex gap-1 overflow-x-auto scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => { setActiveCategory(cat); setSearch(""); }}
            className={[
              "shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all",
              activeCategory === cat
                ? "border-red-500/60 bg-red-500/10 text-red-300"
                : "border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300",
            ].join(" ")}
          >
            {SHOP_CATEGORY_ICONS[cat]} {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-3 relative">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-red-500/40"
        />
      </div>

      {/* Items list */}
      <div className="flex flex-col gap-2">
        {filteredEntries.length === 0 && (
          <p className="text-[11px] text-zinc-600">No items found.</p>
        )}
        {filteredEntries.map(([itemName, costData]) => {
          // Cost can be a single object or array of options
          const costOptions: CostOption[] = Array.isArray(costData)
            ? costData
            : [costData];

          return (
            <div
              key={itemName}
              className="rounded-xl p-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Item name with rarity color */}
              <p className={[
                "mb-2 text-xs font-semibold",
                itemName.startsWith("[L]") ? "text-amber-300" :
                itemName.startsWith("[E]") ? "text-violet-300" :
                itemName.startsWith("[R]") ? "text-blue-300" :
                "text-zinc-200"
              ].join(" ")}>
                {shopItemDisplayName(itemName)}
              </p>

              {/* Cost options */}
              {costOptions.map((option, optIdx) => (
                <div
                  key={optIdx}
                  className={[
                    "flex flex-wrap items-center gap-3",
                    costOptions.length > 1 && optIdx < costOptions.length - 1
                      ? "mb-2 pb-2 border-b border-zinc-800"
                      : "",
                  ].join(" ")}
                >
                  {costOptions.length > 1 && (
                    <span className="text-[10px] text-zinc-600 shrink-0">Option {optIdx + 1}:</span>
                  )}
                  {Object.entries(option).map(([currency, amount]) => {
                    const imgSrc = shopItemImage(currency);
                    return (
                      <div key={currency} className="flex items-center gap-1.5">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={currency}
                            width={18}
                            height={18}
                            className="rounded shrink-0"
                            unoptimized
                          />
                        ) : (
                          <span className="text-[10px] text-zinc-500 shrink-0">{shopItemDisplayName(currency)}</span>
                        )}
                        <span className={[
                          "font-mono text-xs font-semibold",
                          currency === "Copper" ? "text-yellow-300" :
                          currency === "Darksteel" ? "text-sky-300" :
                          currency === "Energy" ? "text-emerald-300" :
                          "text-zinc-300",
                        ].join(" ")}>
                          {(amount as number).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Step 3 — Integrate the Shop into `MagicSquareView`

Inside `MagicSquareView`, at the **very top of the function body** (before any existing `return`), add a state for the active sub-view:

```tsx
  const [magicSquareTab, setMagicSquareTab] = useState<"bosses" | "shop">("bosses");
```

Then at the start of the `return (` JSX, **wrap the existing content in a fragment** and add a sub-nav and conditional rendering.

Find the opening of `MagicSquareView`'s return:
```tsx
    <div className="flex flex-col gap-3">
```

Replace with:
```tsx
    <div className="flex flex-col gap-3">
      {/* Sub-nav */}
      <div className="flex gap-1 border-b border-zinc-800/80 pt-1">
        {(["bosses", "shop"] as const).map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setMagicSquareTab(view)}
            className={[
              "-mb-px border-b-2 px-3 py-1 text-[11px] font-semibold capitalize transition-all",
              magicSquareTab === view
                ? "border-red-500 text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-300",
            ].join(" ")}
          >
            {view === "bosses" ? "⏱ Bosses" : "🛒 Shop"}
          </button>
        ))}
      </div>

      {magicSquareTab === "shop" && <MagicSquareShopView />}
      {magicSquareTab === "bosses" && (
```

Then find the **end** of the existing boss content JSX inside `MagicSquareView` (the closing `</div>` of the outermost `<div className="flex flex-col gap-3">`) and close the conditional:
```tsx
      )}
```

*(Effectively you wrap all the existing boss content in `{magicSquareTab === "bosses" && ( ... )}`)*

---

## Step 4 — Verify

```bash
npx tsc --noEmit
```

Must return **zero errors**.

```bash
git add src/app/page.tsx
git commit -m "feat: add Magic Square Shop browser with category filter and item costs"
git push
```

---

## НЕ трогать

- `src/lib/gameData.ts`
- `src/app/api/`
- `src/data/mir4tools/MagicSquareShopItems.ts` (read-only)
- Any other files not listed above
