# Windsurf Agent Prompt — Compact MAP mode UI for Discord iframe

## Problem

The MAP mode shows a grid of image thumbnails as a map selector. Inside Discord's small iframe this wastes space. We need a compact text-only list instead, and the map canvas should be as large as possible.

## Fix in `src/app/war/page.tsx` — MapBoard component

### 1. Replace the thumbnail grid with a compact scrollable list

Remove all `<Image>` thumbnail rendering from the map selector sidebar.

Replace with a simple vertical list of text buttons:

```tsx
// Map selector: compact text list, no image previews
<div
  style={{
    width: "100%",
    overflowY: "auto",
    maxHeight: 260,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  }}
>
  {filteredMaps.map(map => {
    const count = markerCounts[map.id] ?? 0;
    const isActive = selectedMapId === map.id;
    const cfg = ZONE_CATEGORY_CONFIG[map.category];
    return (
      <button
        key={map.id}
        onClick={() => setSelectedMapId(map.id)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "7px 12px",
          borderRadius: 8,
          border: isActive
            ? `1px solid ${cfg.borderColor}`
            : "1px solid rgba(255,255,255,0.06)",
          background: isActive ? cfg.bgColor : "rgba(255,255,255,0.03)",
          color: isActive ? cfg.color : "#94a3b8",
          fontSize: 12,
          fontWeight: isActive ? 600 : 400,
          cursor: "pointer",
          textAlign: "left",
          transition: "all 0.15s ease",
        }}
      >
        <span>{map.name}</span>
        {count > 0 && (
          <span style={{
            background: cfg.color,
            color: "#000",
            borderRadius: 10,
            padding: "1px 7px",
            fontSize: 10,
            fontWeight: 700,
            marginLeft: 6,
            flexShrink: 0,
          }}>
            {count}
          </span>
        )}
      </button>
    );
  })}
</div>
```

### 2. Make the layout vertical (stacked), not side-by-side

Change the outer layout from `flex-row` to always `flex-col`:

```tsx
<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
  {/* TOP: category filter pills + map list */}
  <div>
    {/* category pills — horizontal scroll */}
    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
      {categories.map(cat => { ... })}
    </div>
    {/* compact map list */}
    {/* ... text list from above ... */}
  </div>

  {/* BOTTOM: marker toolbar + full-width canvas */}
  <div>
    {/* marker type buttons + squad selector + clear */}
    {/* MapCanvas — full width */}
  </div>
</div>
```

### 3. Map canvas — full width, taller aspect ratio

```tsx
// Change aspectRatio from "16/9" to "4/3" so it fills more vertical space in Discord
style={{ ..., aspectRatio: "4/3" }}
```

### 4. Marker toolbar — compact, single row with small buttons

Make marker type buttons smaller — icon only on mobile, icon+label on wider screens:

```tsx
<button style={{ padding: "5px 10px", fontSize: 11, borderRadius: 8, ... }}>
  <MarkerIcon type={...} color={...} size={14} />
  <span style={{ marginLeft: 4 }}>{MARKER_CONFIG[type].label}</span>
</button>
```

Squad buttons stay the same size (28px circles).

### 5. Category filter pills — smaller text

```tsx
// font size 11px instead of 13px, padding "4px 10px" instead of "6px 14px"
```

---

After editing:
```bash
git add src/app/war/page.tsx
git commit -m "fix: compact MAP ui for Discord iframe — text list, no thumbnails, full-width canvas"
git push
```
