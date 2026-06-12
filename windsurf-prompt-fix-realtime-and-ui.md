# Windsurf Agent Prompt — Fix realtime markers + dropdown + map order

## Problem 1: Markers only appear after page refresh

The realtime Supabase subscription works on desktop browser but **not in Discord iframe** (WebSocket may be blocked). Also, the placing user sees their own marker only after refresh — there's no optimistic update.

### Fix: Optimistic updates + polling fallback

**In `MapBoard` (or wherever `handlePlaceMarker` and `handleRemoveMarker` are defined):**

```ts
async function handlePlaceMarker({ mapId, marker_type, x_pct, y_pct }: {
  mapId: string; marker_type: MarkerType; x_pct: number; y_pct: number;
}) {
  // Optimistic: add to local state immediately with a temp id
  const tempId = `temp-${Date.now()}`;
  const optimistic: MapMarker = {
    id: tempId,
    map_id: mapId,
    marker_type,
    x_pct,
    y_pct,
    color: SQUAD_COLORS[activeSquad],
    label: null,
    placed_by: username,
  };
  setMarkers(prev => [...prev, optimistic]);

  // Persist to Supabase
  const { data } = await supabase.from("war_map_markers").insert({
    map_id: mapId, marker_type, x_pct, y_pct,
    color: SQUAD_COLORS[activeSquad],
    placed_by: username,
  }).select().single();

  // Replace temp marker with real one (has real id from DB)
  if (data) {
    setMarkers(prev => prev.map(m => m.id === tempId ? (data as MapMarker) : m));
  }
}

async function handleRemoveMarker(id: string) {
  // Optimistic: remove immediately
  setMarkers(prev => prev.filter(m => m.id !== id));
  await supabase.from("war_map_markers").delete().eq("id", id);
}
```

**Add a polling fallback** — reload markers every 5 seconds (covers Discord where WebSockets may not work):

```ts
// In the useEffect that subscribes to realtime, also start a polling interval:
useEffect(() => {
  if (!selectedMapId) return;
  loadMarkers(selectedMapId);

  // Realtime subscription (works on desktop browser)
  const channel = supabase
    .channel(`war-map-${selectedMapId}`)
    .on("postgres_changes", {
      event: "*", schema: "public", table: "war_map_markers",
      filter: `map_id=eq.${selectedMapId}`,
    }, () => {
      // On any change just reload to stay in sync
      loadMarkers(selectedMapId);
    })
    .subscribe();

  // Polling fallback for Discord iframe (every 5 seconds)
  const pollInterval = setInterval(() => loadMarkers(selectedMapId), 5000);

  return () => {
    supabase.removeChannel(channel);
    clearInterval(pollInterval);
  };
}, [selectedMapId]);
```

**Same polling fix for DeployBoard** — reload assignments every 5 seconds:

```ts
useEffect(() => {
  loadAssignments();
  const channel = supabase
    .channel(`war-deploy-${selectedDate}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "war_assignments",
      filter: `war_date=eq.${selectedDate}` }, () => loadAssignments())
    .subscribe();

  const pollInterval = setInterval(() => loadAssignments(), 5000);

  return () => {
    supabase.removeChannel(channel);
    clearInterval(pollInterval);
  };
}, [selectedDate]);
```

---

## Problem 2: Replace map list with a dropdown `<select>`

Remove the vertical text list entirely. Replace with a styled `<select>` dropdown.

```tsx
<select
  value={selectedMapId ?? ""}
  onChange={e => setSelectedMapId(e.target.value || null)}
  style={{
    width: "100%",
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(148,163,184,0.3)",
    borderRadius: 8,
    color: "#e2e8f0",
    padding: "8px 12px",
    fontSize: 13,
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2394a3b8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    paddingRight: 32,
  }}
>
  <option value="" style={{ background: "#0f172a" }}>— Select a map —</option>
  {filteredMaps.map(map => (
    <option key={map.id} value={map.id} style={{ background: "#0f172a" }}>
      {map.name}{markerCounts[map.id] ? ` (${markerCounts[map.id]})` : ""}
    </option>
  ))}
</select>
```

The category filter pills (All/Labyrinth/Valley/etc.) remain above the dropdown and filter what appears in it.

---

## Problem 3: Correct map ordering by monster power

Add a sort order constant and use it to sort `filteredMaps` before rendering:

```ts
const MAP_SORT_ORDER: Record<string, number> = {
  // Labyrinths — weakest to strongest
  "demonbull-lab-4f":      1,
  "bicheon-lab-4f":        2,
  "snake-pit-lab-4f":      3,
  "abandoned-mine-lab-4f": 4,
  "heavens-way-lab-4f":    5,
  "redmoon-lab-4f":        6,
  "phantasia-lab-4f":      7,
  "rockcut-lab-4f":        8,
  "sabuk-lab-4f":          9,
  "nine-dragon-lab-4f":   10,

  // Valleys — same regional order
  "bicheon-valley-4f":     1,
  "snake-valley-4f":       2,
  "redmoon-valley-4f":     3,
  "phantasia-valley-4f":   4,
  "sagitation-valley-4f":  5,

  // Purgatory — by floor
  "purgatory-1f":  1,
  "purgatory-2f":  2,
  "purgatory-3f":  3,
  "purgatory-4f":  4,
  "purgatory-5f":  5,
  "purgatory-6f":  6,
  "purgatory-7f":  7,

  // Mirage — by world number
  "world1-demon-bull-temple-3f": 1,
  "world2-heavens-way-peak":     2,
  "world3-rockcut-tomb":         3,
  "world4-bladehaven-2f":        4,
  "world5-illusion-temple":      5,
  "world6-bicheon-lab":          6,
  "world7-redmoon-gorge-3f":     7,
  "world8-abandoned-mine-3f":    8,

  // Tower — by floor
  "tower-black-dragon-1f": 1,
  "tower-black-dragon-2f": 2,
  "tower-black-dragon-3f": 3,
  "tower-black-dragon-4f": 4,
};
```

When computing `filteredMaps`, sort by `MAP_SORT_ORDER[map.id] ?? 99`:

```ts
const filteredMaps = Object.values(MAP_FILES)
  .filter(m => categoryFilter === "all" || m.category === categoryFilter)
  // Deduplicate tower (same image for all floors — show all 4, sorted by floor)
  .sort((a, b) => (MAP_SORT_ORDER[a.id] ?? 99) - (MAP_SORT_ORDER[b.id] ?? 99));
```

---

## After all fixes:

```bash
git add src/app/war/page.tsx
git commit -m "fix: optimistic markers, polling fallback for Discord, dropdown map selector, sorted map order"
git push
```
