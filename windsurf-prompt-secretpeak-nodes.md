# Windsurf Agent Prompt: Secret Peak Node Overlay

## Overview

Add colored node dots (mining, energy, gather, darksteel, chest) on the existing Secret Peak map in `SecretPeakView`. Use real coordinates from the data files. Nodes should be toggleable and color-coded by type with rarity-based opacity.

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

## Step 1 — Fix missing type in SecretPeak data files

The data files reference `mapNodesObject` type which isn't defined. Before importing them, add type definitions.

**In each of the 4 SecretPeak data files**, if the file starts with `export const secretPeakXX: mapNodesObject = {` without defining `mapNodesObject`, add this line at the very top:

```ts
type mapNodesObject = { [id: string]: { pos: [number, number]; rarity: 'Epic' | 'Legendary' | 'Rare'; type: 'mining' | 'darksteel' | 'energy' | 'gather' | 'chest' } }
```

The files to check:
- `src/data/mir4tools/Maps/SecretPeak/1f-6f.ts`
- `src/data/mir4tools/Maps/SecretPeak/7f.ts`
- `src/data/mir4tools/Maps/SecretPeak/8f.ts`
- `src/data/mir4tools/Maps/SecretPeak/9f.ts`

---

## Step 2 — Add imports to `page.tsx`

After all existing imports at the top of the file, add:

```tsx
import secretPeak1f6f from "@/data/mir4tools/Maps/SecretPeak/1f-6f";
import secretPeak7f from "@/data/mir4tools/Maps/SecretPeak/7f";
import secretPeak8f from "@/data/mir4tools/Maps/SecretPeak/8f";
import secretPeak9f from "@/data/mir4tools/Maps/SecretPeak/9f";
```

---

## Step 3 — Add node data constants before `SecretPeakView`

Add these constants right before the `function SecretPeakView(` declaration:

```tsx
type NodeType = "mining" | "darksteel" | "energy" | "gather" | "chest";
type NodeRarity = "Epic" | "Legendary" | "Rare";

interface MapNode {
  pos: [number, number];
  rarity: NodeRarity;
  type: NodeType;
}

const NODE_TYPE_COLORS: Record<NodeType, { dot: string; label: string }> = {
  mining:    { dot: "#60a5fa", label: "Mining" },     // blue
  energy:    { dot: "#34d399", label: "Energy" },     // green
  gather:    { dot: "#a78bfa", label: "Gathering" },  // purple
  darksteel: { dot: "#f97316", label: "Darksteel" },  // orange
  chest:     { dot: "#fbbf24", label: "Chest" },      // amber
};

const NODE_RARITY_OPACITY: Record<NodeRarity, number> = {
  Legendary: 1.0,
  Epic: 0.8,
  Rare: 0.55,
};

const SECRET_PEAK_FLOOR_NODES: Record<string, Record<string, MapNode>> = {
  "1F-6F": secretPeak1f6f as Record<string, MapNode>,
  "7F":    secretPeak7f as Record<string, MapNode>,
  "8F":    secretPeak8f as Record<string, MapNode>,
  "9F":    secretPeak9f as Record<string, MapNode>,
};
```

---

## Step 4 — Modify `SecretPeakView` to show the node toggle and dots

Inside `SecretPeakView`, add a `showNodes` state and `activeNodeTypes` state at the top of the function (alongside the existing `useState` calls):

```tsx
  const [showNodes, setShowNodes] = useState(true);
  const [activeNodeTypes, setActiveNodeTypes] = useState<Set<NodeType>>(
    new Set(["mining", "energy", "gather", "darksteel"] as NodeType[])
  );
```

Then locate the floor/map section inside `SecretPeakView`. Find the `<div>` that wraps the `<Image>` of the map (it has `relative` positioning and shows boss pins). This is the map container.

**After the existing floor selector buttons** (the row of floor buttons like "1F-6F", "7F", etc.), and **before** the map container `<div>`, insert the node type toggle bar:

```tsx
          {/* Node type toggles */}
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowNodes((v) => !v)}
              className={[
                "rounded px-2 py-0.5 text-[10px] font-semibold transition-all border",
                showNodes
                  ? "border-zinc-600 bg-zinc-700 text-zinc-200"
                  : "border-zinc-800 bg-zinc-900 text-zinc-600",
              ].join(" ")}
            >
              {showNodes ? "Nodes ✓" : "Nodes"}
            </button>
            {showNodes &&
              (Object.keys(NODE_TYPE_COLORS) as NodeType[]).map((ntype) => {
                const active = activeNodeTypes.has(ntype);
                const color = NODE_TYPE_COLORS[ntype];
                return (
                  <button
                    key={ntype}
                    type="button"
                    onClick={() => {
                      setActiveNodeTypes((prev) => {
                        const next = new Set(prev);
                        if (next.has(ntype)) next.delete(ntype);
                        else next.add(ntype);
                        return next;
                      });
                    }}
                    className="flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold transition-all"
                    style={{
                      borderColor: active ? color.dot : "rgba(255,255,255,0.1)",
                      background: active ? `${color.dot}18` : "transparent",
                      color: active ? color.dot : "#52525b",
                    }}
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: active ? color.dot : "#52525b" }}
                    />
                    {color.label}
                  </button>
                );
              })}
          </div>
```

**Inside the map container `<div>` (the one with `relative` class that contains the `<Image>` of the map)**, after the `<Image>` tag and after the existing boss pin rendering, add the node dots rendering:

```tsx
              {/* Node dots overlay */}
              {showNodes &&
                Object.entries(
                  SECRET_PEAK_FLOOR_NODES[activeFloor] ?? {}
                ).map(([id, node]) => {
                  if (!activeNodeTypes.has(node.type)) return null;
                  const color = NODE_TYPE_COLORS[node.type];
                  const opacity = NODE_RARITY_OPACITY[node.rarity];
                  return (
                    <div
                      key={id}
                      title={`${node.type} (${node.rarity})`}
                      className="pointer-events-none absolute"
                      style={{
                        left: `${node.pos[0]}%`,
                        top: `${node.pos[1]}%`,
                        transform: "translate(-50%, -50%)",
                        opacity,
                        zIndex: node.rarity === "Legendary" ? 3 : node.rarity === "Epic" ? 2 : 1,
                      }}
                    >
                      <span
                        className="block rounded-full"
                        style={{
                          width: node.rarity === "Legendary" ? "9px" : node.rarity === "Epic" ? "7px" : "5px",
                          height: node.rarity === "Legendary" ? "9px" : node.rarity === "Epic" ? "7px" : "5px",
                          background: color.dot,
                          boxShadow: `0 0 4px ${color.dot}`,
                        }}
                      />
                    </div>
                  );
                })}
```

**Important:** The existing `SecretPeakView` has a floor selector that controls which floor is shown. The `activeFloor` variable (or whatever variable tracks the current floor) must match the keys in `SECRET_PEAK_FLOOR_NODES`. Make sure the floor button labels match: `"1F-6F"`, `"7F"`, `"8F"`, `"9F"`. If the existing code uses different floor keys, adjust `SECRET_PEAK_FLOOR_NODES` keys to match.

---

## Step 5 — Verify

```bash
npx tsc --noEmit
```

Must return **zero errors**.

```bash
git add src/app/page.tsx src/data/mir4tools/Maps/SecretPeak/
git commit -m "feat: add resource node overlay on Secret Peak map"
git push
```

---

## НЕ трогать

- `src/lib/gameData.ts`
- `src/app/api/`
- Any other files not listed above
