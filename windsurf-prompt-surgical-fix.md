# Fix war/page.tsx — 4 small targeted edits

Open `src/app/war/page.tsx` and make exactly these 4 changes. Do not rewrite large sections — make surgical edits only.

---

## Edit 1: Add MAP_SORT_ORDER constant

Find the line that says exactly:
```
const MAP_FILES: Record<string, MapFile> = {
```

Insert this block BEFORE that line:

```ts
const MAP_SORT_ORDER: Record<string, number> = {
  "demonbull-lab-4f":1,"bicheon-lab-4f":2,"snake-pit-lab-4f":3,"abandoned-mine-lab-4f":4,
  "heavens-way-lab-4f":5,"redmoon-lab-4f":6,"phantasia-lab-4f":7,"rockcut-lab-4f":8,
  "sabuk-lab-4f":9,"nine-dragon-lab-4f":10,
  "bicheon-valley-4f":1,"snake-valley-4f":2,"redmoon-valley-4f":3,"phantasia-valley-4f":4,"sagitation-valley-4f":5,
  "purgatory-1f":1,"purgatory-2f":2,"purgatory-3f":3,"purgatory-4f":4,"purgatory-5f":5,"purgatory-6f":6,"purgatory-7f":7,
  "world1-demon-bull-temple-3f":1,"world2-heavens-way-peak":2,"world3-rockcut-tomb":3,"world4-bladehaven-2f":4,
  "world5-illusion-temple":5,"world6-bicheon-lab":6,"world7-redmoon-gorge-3f":7,"world8-abandoned-mine-3f":8,
  "tower-black-dragon-1f":1,"tower-black-dragon-2f":2,"tower-black-dragon-3f":3,"tower-black-dragon-4f":4,
};
```

---

## Edit 2: Sort filteredMaps and add dropdown

In the `MapBoard` function, find the `filteredMaps` computation (it filters `Object.values(MAP_FILES)` by category). Add `.sort(...)` at the end of the chain:

```ts
.sort((a, b) => (MAP_SORT_ORDER[a.id] ?? 99) - (MAP_SORT_ORDER[b.id] ?? 99))
```

Then find where `filteredMaps` is rendered (the part that maps over filteredMaps and renders buttons or a list). Replace that entire rendering block with this single `<select>`:

```tsx
<select
  value={selectedMapId ?? ""}
  onChange={e => setSelectedMapId(e.target.value || null)}
  style={{
    width:"100%", background:"rgba(15,23,42,0.95)",
    border:"1px solid rgba(148,163,184,0.3)", borderRadius:8,
    color:"#e2e8f0", padding:"8px 12px", fontSize:13,
    outline:"none", cursor:"pointer",
  }}
>
  <option value="">— Select a map —</option>
  {filteredMaps.map(map => (
    <option key={map.id} value={map.id}>
      {map.name}{markerCounts[map.id] ? ` (${markerCounts[map.id]})` : ""}
    </option>
  ))}
</select>
```

---

## Edit 3: Optimistic marker placement

In `MapBoard`, find `handlePlaceMarker`. Inside it, BEFORE the `supabase.from("war_map_markers").insert(...)` call, add these lines:

```ts
const tempId = `temp-${Date.now()}`;
setMarkers(prev => [...prev, { id: tempId, map_id: mapId, marker_type, x_pct, y_pct, color: SQUAD_COLORS[activeSquad], label: null, placed_by: username }]);
```

Then AFTER the insert, replace the result handling with:

```ts
const { data } = await supabase.from("war_map_markers").insert({
  map_id: mapId, marker_type, x_pct, y_pct,
  color: SQUAD_COLORS[activeSquad], placed_by: username,
}).select().single();
if (data) setMarkers(prev => prev.map(m => m.id === tempId ? data as MapMarker : m));
```

In `handleRemoveMarker`, add this line BEFORE the `supabase.delete()` call:
```ts
setMarkers(prev => prev.filter(m => m.id !== id));
```

---

## Edit 4: Add polling fallback to both useEffects

In `MapBoard`, find the `useEffect` that subscribes to `war_map_markers`. In its return cleanup function it calls `supabase.removeChannel(channel)`. 

Add a polling interval to that same effect:

```ts
const pollInterval = setInterval(() => { void loadMarkers(selectedMapId); }, 5000);
// add to cleanup:
return () => { supabase.removeChannel(channel); clearInterval(pollInterval); };
```

In `DeployBoard`, find the `useEffect` that subscribes to `war_assignments`. Same pattern — add:

```ts
const pollInterval = setInterval(() => { void loadAssignments(); }, 5000);
return () => { supabase.removeChannel(channel); clearInterval(pollInterval); };
```

---

## After all edits:

```bash
git add src/app/war/page.tsx
git commit -m "fix: optimistic markers, 5s polling, dropdown map selector, sorted order"
git push
```
