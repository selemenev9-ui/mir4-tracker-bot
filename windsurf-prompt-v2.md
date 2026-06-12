# War page fixes — src/app/war/page.tsx

Make the following changes to `src/app/war/page.tsx`. Read the file first, understand the existing structure, then implement each change cleanly.

## 1. Add MAP_SORT_ORDER constant
Add a `MAP_SORT_ORDER: Record<string, number>` constant somewhere near the top of the file (after MAP_FILES). It assigns a sort number to each map id, ordered from weakest to strongest monsters:
- Labs: demonbull(1), bicheon(2), snake-pit(3), abandoned-mine(4), heavens-way(5), redmoon(6), phantasia(7), rockcut(8), sabuk(9), nine-dragon(10)
- Valleys: bicheon(1), snake(2), redmoon(3), phantasia(4), sagitation(5)
- Purgatory: floors 1–7 in order
- Mirage: world1 through world8 in order
- Tower: floors 1–4 in order

## 2. Sort filteredMaps in MapBoard
In the `MapBoard` component, when computing the filtered map list, add `.sort()` using `MAP_SORT_ORDER[map.id] ?? 99`.

## 3. Replace map list with a `<select>` dropdown
In `MapBoard`, replace whatever currently renders the list of maps (buttons, grid, or vertical list) with a single styled `<select>` element. The dropdown should:
- Be full width
- Show `— Select a map —` as the empty/default option
- List all `filteredMaps` as `<option>` elements
- Show marker count in parentheses after the name if `markerCounts[map.id] > 0`
- Be dark-themed matching the rest of the page
- On change, call `setSelectedMapId`

Keep the category filter pills (All/Labyrinth/Valley/etc.) above the dropdown unchanged.

## 4. Optimistic marker updates in MapBoard
In `handlePlaceMarker`:
- Before the `supabase.insert()` call, immediately add the marker to local state with a temporary id (e.g. `temp-${Date.now()}`)
- After the insert returns with real data, replace the temp marker with the real one

In `handleRemoveMarker`:
- Before the `supabase.delete()` call, immediately remove the marker from local state

## 5. Add 5-second polling fallback to both components
In `MapBoard`, in the `useEffect` that handles the `war_map_markers` realtime subscription:
- Add `setInterval(() => loadMarkers(selectedMapId), 5000)` 
- Clear it in the cleanup function alongside `removeChannel`

In `DeployBoard`, in the `useEffect` that handles the `war_assignments` realtime subscription:
- Add `setInterval(() => loadAssignments(), 5000)`
- Clear it in the cleanup function

## After all changes:
Run `npx tsc --noEmit`. Fix any TypeScript errors in war/page.tsx. Then:
```
git add src/app/war/page.tsx
git commit -m "fix: optimistic markers, polling fallback, dropdown map selector, sorted map order"
git push
```
