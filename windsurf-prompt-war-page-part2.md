# Windsurf Agent Prompt — /war Page FULL IMPLEMENTATION (Part 2)

The file `src/app/war/page.tsx` exists but is a skeleton/placeholder. You must now **replace it entirely** with the complete implementation. Do not create a new file — overwrite the existing one.

**Rules:**
- Zero emojis anywhere
- No external icon libraries — inline SVG only
- Single file `src/app/war/page.tsx`
- All data, all components, all logic in one file

---

## COMPLETE DATA — replace the placeholder stubs

### Full WAR_ZONES array (replace the single example)

```ts
const WAR_ZONES: WarZone[] = [
  // ── LABYRINTHS ─────────────────────────────────────────────────────────
  { id:"abandoned-mine-lab", name:"Abandoned Mine Labyrinth 4F", category:"lab", scheduleLabel:"Daily 10:00 / 20:00", scheduleTimes:["10:00","20:00"], scheduleType:"daily", weekday:undefined, mapIds:["abandoned-mine-lab-4f"], description:undefined },
  { id:"bicheon-lab",        name:"Bicheon Labyrinth 4F",        category:"lab", scheduleLabel:"Daily 10:00 / 20:00", scheduleTimes:["10:00","20:00"], scheduleType:"daily", weekday:undefined, mapIds:["bicheon-lab-4f"],        description:undefined },
  { id:"demonbull-lab",      name:"Demonbull Labyrinth 4F",      category:"lab", scheduleLabel:"Daily 10:00 / 20:00", scheduleTimes:["10:00","20:00"], scheduleType:"daily", weekday:undefined, mapIds:["demonbull-lab-4f"],      description:undefined },
  { id:"heavens-way-lab",    name:"Heavens Way Labyrinth 4F",    category:"lab", scheduleLabel:"Daily 10:00 / 20:00", scheduleTimes:["10:00","20:00"], scheduleType:"daily", weekday:undefined, mapIds:["heavens-way-lab-4f"],    description:undefined },
  { id:"nine-dragon-lab",    name:"Nine Dragon Labyrinth 4F",    category:"lab", scheduleLabel:"Daily 10:00 / 20:00", scheduleTimes:["10:00","20:00"], scheduleType:"daily", weekday:undefined, mapIds:["nine-dragon-lab-4f"],    description:undefined },
  { id:"phantasia-lab",      name:"Phantasia Labyrinth 4F",      category:"lab", scheduleLabel:"Daily 10:00 / 20:00", scheduleTimes:["10:00","20:00"], scheduleType:"daily", weekday:undefined, mapIds:["phantasia-lab-4f"],      description:undefined },
  { id:"redmoon-lab",        name:"Redmoon Labyrinth 4F",        category:"lab", scheduleLabel:"Daily 10:00 / 20:00", scheduleTimes:["10:00","20:00"], scheduleType:"daily", weekday:undefined, mapIds:["redmoon-lab-4f"],        description:undefined },
  { id:"rockcut-lab",        name:"Rockcut Labyrinth 4F",        category:"lab", scheduleLabel:"Daily 10:00 / 20:00", scheduleTimes:["10:00","20:00"], scheduleType:"daily", weekday:undefined, mapIds:["rockcut-lab-4f"],        description:undefined },
  { id:"sabuk-lab",          name:"Sabuk Labyrinth 4F",          category:"lab", scheduleLabel:"Daily 10:00 / 20:00", scheduleTimes:["10:00","20:00"], scheduleType:"daily", weekday:undefined, mapIds:["sabuk-lab-4f"],          description:undefined },
  { id:"snake-pit-lab",      name:"Snake Pit Labyrinth 4F",      category:"lab", scheduleLabel:"Daily 10:00 / 20:00", scheduleTimes:["10:00","20:00"], scheduleType:"daily", weekday:undefined, mapIds:["snake-pit-lab-4f"],      description:undefined },

  // ── VALLEYS ────────────────────────────────────────────────────────────
  { id:"bicheon-valley",   name:"Bicheon Valley 4F",   category:"valley", scheduleLabel:"Daily 12:00 / 22:00", scheduleTimes:["12:00","22:00"], scheduleType:"daily", weekday:undefined, mapIds:["bicheon-valley-4f"],    description:"Krukan portal — Monday 22:00" },
  { id:"phantasia-valley", name:"Phantasia Valley 4F", category:"valley", scheduleLabel:"Daily 12:00 / 22:00", scheduleTimes:["12:00","22:00"], scheduleType:"daily", weekday:undefined, mapIds:["phantasia-valley-4f"],  description:"Turkan portal — Thursday 23:00" },
  { id:"redmoon-valley",   name:"Redmoon Valley 4F",   category:"valley", scheduleLabel:"Daily 12:00 / 22:00", scheduleTimes:["12:00","22:00"], scheduleType:"daily", weekday:undefined, mapIds:["redmoon-valley-4f"],    description:"Nerkan portal — Tuesday 23:00" },
  { id:"sagitation-valley",name:"Sagitation Valley 4F",category:"valley", scheduleLabel:"Daily 12:00 / 22:00", scheduleTimes:["12:00","22:00"], scheduleType:"daily", weekday:undefined, mapIds:["sagitation-valley-4f"], description:undefined },
  { id:"snake-valley",     name:"Snake Valley 4F",     category:"valley", scheduleLabel:"Daily 12:00 / 22:00", scheduleTimes:["12:00","22:00"], scheduleType:"daily", weekday:undefined, mapIds:["snake-valley-4f"],      description:"Utukan portal — Friday 22:00" },

  // ── WEEKLY BOSSES ──────────────────────────────────────────────────────
  { id:"krukan",         name:"Krukan — Bicheon Valley 4F",       category:"weekly", scheduleLabel:"Monday 22:00",    scheduleTimes:["22:00"], scheduleType:"weekly", weekday:1, mapIds:["bicheon-valley-4f"],                                      description:"Demon Spider of Hell — Shackling Abaddon" },
  { id:"nerkan",         name:"Nerkan — Redmoon Valley 4F",       category:"weekly", scheduleLabel:"Tuesday 23:00",   scheduleTimes:["23:00"], scheduleType:"weekly", weekday:2, mapIds:["redmoon-valley-4f"],                                      description:"Black Flame Arch Demon" },
  { id:"valley-capture", name:"Hidden Valley Capture",            category:"weekly", scheduleLabel:"Wednesday 22:00", scheduleTimes:["22:00"], scheduleType:"weekly", weekday:3, mapIds:["bicheon-valley-4f","snake-valley-4f","redmoon-valley-4f"], description:"All clan — 22:00–23:00" },
  { id:"helbar",         name:"Helbar — Purgatory 7F",            category:"weekly", scheduleLabel:"Wednesday 23:00", scheduleTimes:["23:00"], scheduleType:"weekly", weekday:3, mapIds:["purgatory-7f"],                                           description:"Special boss — floor 7" },
  { id:"wraiths",        name:"Attack of the Living Wraiths",     category:"weekly", scheduleLabel:"Thursday 22:00",  scheduleTimes:["22:00"], scheduleType:"weekly", weekday:4, mapIds:["bicheon-valley-4f","snake-valley-4f","redmoon-valley-4f"], description:"All three valleys 4F simultaneously" },
  { id:"turkan",         name:"Turkan — Phantasia Valley 4F",     category:"weekly", scheduleLabel:"Thursday 23:00",  scheduleTimes:["23:00"], scheduleType:"weekly", weekday:4, mapIds:["phantasia-valley-4f"],                                    description:"Violet Demon God" },
  { id:"rallying-void",  name:"Rallying of the Void — Mirage Ship",category:"weekly",scheduleLabel:"Thursday 23:00", scheduleTimes:["23:00"], scheduleType:"weekly", weekday:4, mapIds:[],                                                          description:"Mirage Ship — 23:00–00:00" },
  { id:"utukan",         name:"Utukan — Snake Valley 4F",         category:"weekly", scheduleLabel:"Friday 22:00",    scheduleTimes:["22:00"], scheduleType:"weekly", weekday:5, mapIds:["snake-valley-4f"],                                        description:"Crimson Emperor — Crimson Abaddon" },

  // ── PURGATORY ──────────────────────────────────────────────────────────
  { id:"purgatory", name:"Purgatory — All Floors", category:"purgatory", scheduleLabel:"Daily 06:00 / 12:00 / 18:00 / 00:00", scheduleTimes:["06:00","12:00","18:00","00:00"], scheduleType:"daily", weekday:undefined,
    mapIds:["purgatory-1f","purgatory-2f","purgatory-3f","purgatory-4f","purgatory-5f","purgatory-6f","purgatory-7f"], description:undefined },

  // ── MIRAGE ─────────────────────────────────────────────────────────────
  { id:"mirage-void-bull",  name:"Void Bull Specter — Demon Bull Temple 3F", category:"mirage", scheduleLabel:"Permanent field boss", scheduleTimes:[], scheduleType:"daily", weekday:undefined, mapIds:["world1-demon-bull-temple-3f"], description:"Layer 1 — W1 danger zone" },
  { id:"mirage-ice-demon",  name:"Heavenly Ice Demon — Abandoned Mine 3F",   category:"mirage", scheduleLabel:"Permanent field boss", scheduleTimes:[], scheduleType:"daily", weekday:undefined, mapIds:["world8-abandoned-mine-3f"],    description:"Layer 8 — W8 danger zone" },

  // ── TOWER OF BLACK DRAGON ──────────────────────────────────────────────
  { id:"tower-juja",    name:"Tower — Juja Neoul",       category:"tower", scheduleLabel:"Daily 11:00 / 17:00 / 23:00",              scheduleTimes:["11:00","17:00","23:00"],               scheduleType:"daily", weekday:undefined,
    mapIds:["tower-black-dragon-1f","tower-black-dragon-2f","tower-black-dragon-3f","tower-black-dragon-4f"], description:"All 4 floors" },
  { id:"tower-wraiths", name:"Tower — Living Wraiths",   category:"tower", scheduleLabel:"Daily 10:00/12:00/16:00/18:00/22:00/00:00", scheduleTimes:["10:00","12:00","16:00","18:00","22:00","00:00"], scheduleType:"daily", weekday:undefined,
    mapIds:["tower-black-dragon-1f","tower-black-dragon-2f","tower-black-dragon-3f","tower-black-dragon-4f"], description:"All 4 floors" },
];
```

### Full MAP_FILES record (replace the single example)

```ts
const MAP_FILES: Record<string, MapFile> = {
  "abandoned-mine-lab-4f":          { id:"abandoned-mine-lab-4f",          name:"Abandoned Mine Lab 4F",    src:"/maps/war/abandoned-mine-lab-4f.png",          category:"lab" },
  "bicheon-lab-4f":                 { id:"bicheon-lab-4f",                  name:"Bicheon Lab 4F",           src:"/maps/war/bicheon-lab-4f.png",                 category:"lab" },
  "demonbull-lab-4f":               { id:"demonbull-lab-4f",                name:"Demonbull Lab 4F",         src:"/maps/war/demonbull-lab-4f.png",               category:"lab" },
  "heavens-way-lab-4f":             { id:"heavens-way-lab-4f",              name:"Heavens Way Lab 4F",       src:"/maps/war/heavens-way-lab-4f.png",             category:"lab" },
  "nine-dragon-lab-4f":             { id:"nine-dragon-lab-4f",              name:"Nine Dragon Lab 4F",       src:"/maps/war/nine-dragon-lab-4f.png",             category:"lab" },
  "phantasia-lab-4f":               { id:"phantasia-lab-4f",                name:"Phantasia Lab 4F",         src:"/maps/war/phantasia-lab-4f.png",               category:"lab" },
  "redmoon-lab-4f":                 { id:"redmoon-lab-4f",                  name:"Redmoon Lab 4F",           src:"/maps/war/redmoon-lab-4f.png",                 category:"lab" },
  "rockcut-lab-4f":                 { id:"rockcut-lab-4f",                  name:"Rockcut Lab 4F",           src:"/maps/war/rockcut-lab-4f.png",                 category:"lab" },
  "sabuk-lab-4f":                   { id:"sabuk-lab-4f",                    name:"Sabuk Lab 4F",             src:"/maps/war/sabuk-lab-4f.png",                   category:"lab" },
  "snake-pit-lab-4f":               { id:"snake-pit-lab-4f",                name:"Snake Pit Lab 4F",         src:"/maps/war/snake-pit-lab-4f.png",               category:"lab" },
  "bicheon-valley-4f":              { id:"bicheon-valley-4f",               name:"Bicheon Valley 4F",        src:"/maps/war/bicheon-valley-4f.png",              category:"valley" },
  "phantasia-valley-4f":            { id:"phantasia-valley-4f",             name:"Phantasia Valley 4F",      src:"/maps/war/phantasia-valley-4f.png",            category:"valley" },
  "redmoon-valley-4f":              { id:"redmoon-valley-4f",               name:"Redmoon Valley 4F",        src:"/maps/war/redmoon-valley-4f.png",              category:"valley" },
  "sagitation-valley-4f":           { id:"sagitation-valley-4f",            name:"Sagitation Valley 4F",     src:"/maps/war/sagitation-valley-4f.png",           category:"valley" },
  "snake-valley-4f":                { id:"snake-valley-4f",                 name:"Snake Valley 4F",          src:"/maps/war/snake-valley-4f.png",                category:"valley" },
  "purgatory-1f":                   { id:"purgatory-1f",   name:"Purgatory 1F",  src:"/maps/war/purgatory-1f.png",  category:"purgatory", floor:1 },
  "purgatory-2f":                   { id:"purgatory-2f",   name:"Purgatory 2F",  src:"/maps/war/purgatory-2f.png",  category:"purgatory", floor:2 },
  "purgatory-3f":                   { id:"purgatory-3f",   name:"Purgatory 3F",  src:"/maps/war/purgatory-3f.png",  category:"purgatory", floor:3 },
  "purgatory-4f":                   { id:"purgatory-4f",   name:"Purgatory 4F",  src:"/maps/war/purgatory-4f.png",  category:"purgatory", floor:4 },
  "purgatory-5f":                   { id:"purgatory-5f",   name:"Purgatory 5F",  src:"/maps/war/purgatory-5f.png",  category:"purgatory", floor:5 },
  "purgatory-6f":                   { id:"purgatory-6f",   name:"Purgatory 6F",  src:"/maps/war/purgatory-6f.png",  category:"purgatory", floor:6 },
  "purgatory-7f":                   { id:"purgatory-7f",   name:"Purgatory 7F",  src:"/maps/war/purgatory-7f.png",  category:"purgatory", floor:7 },
  "world1-demon-bull-temple-3f":    { id:"world1-demon-bull-temple-3f", name:"Demon Bull Temple 3F (W1)", src:"/maps/war/world1-demon-bull-temple-3f.png", category:"mirage" },
  "world2-heavens-way-peak":        { id:"world2-heavens-way-peak",     name:"Heavens Way Peak (W2)",     src:"/maps/war/world2-heavens-way-peak.png",     category:"mirage" },
  "world3-rockcut-tomb":            { id:"world3-rockcut-tomb",         name:"Rockcut Tomb (W3)",         src:"/maps/war/world3-rockcut-tomb.png",         category:"mirage" },
  "world4-bladehaven-2f":           { id:"world4-bladehaven-2f",        name:"Bladehaven 2F (W4)",        src:"/maps/war/world4-bladehaven-2f.png",        category:"mirage" },
  "world5-illusion-temple":         { id:"world5-illusion-temple",      name:"Illusion Temple (W5)",      src:"/maps/war/world5-illusion-temple.png",      category:"mirage" },
  "world6-bicheon-lab":             { id:"world6-bicheon-lab",          name:"Bicheon Lab (W6)",          src:"/maps/war/world6-bicheon-lab.png",          category:"mirage" },
  "world7-redmoon-gorge-3f":        { id:"world7-redmoon-gorge-3f",     name:"Redmoon Gorge 3F (W7)",     src:"/maps/war/world7-redmoon-gorge-3f.png",     category:"mirage" },
  "world8-abandoned-mine-3f":       { id:"world8-abandoned-mine-3f",    name:"Abandoned Mine 3F (W8)",    src:"/maps/war/world8-abandoned-mine-3f.png",    category:"mirage" },
  "tower-black-dragon-1f":          { id:"tower-black-dragon-1f", name:"Tower of Black Dragon 1F", src:"/maps/war/tower-black-dragon.jpg", category:"tower", floor:1 },
  "tower-black-dragon-2f":          { id:"tower-black-dragon-2f", name:"Tower of Black Dragon 2F", src:"/maps/war/tower-black-dragon.jpg", category:"tower", floor:2 },
  "tower-black-dragon-3f":          { id:"tower-black-dragon-3f", name:"Tower of Black Dragon 3F", src:"/maps/war/tower-black-dragon.jpg", category:"tower", floor:3 },
  "tower-black-dragon-4f":          { id:"tower-black-dragon-4f", name:"Tower of Black Dragon 4F", src:"/maps/war/tower-black-dragon.jpg", category:"tower", floor:4 },
};
```

---

## REAL DATE (replace the hardcoded "2024-01-01")

```ts
function todayUTC8(): string {
  // UTC+8: add 8 hours to UTC, then format as YYYY-MM-DD
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return utc8.toISOString().slice(0, 10);
}
```

Use `useState<string>(todayUTC8)` for `selectedDate`.

In the DEPLOY header, add a date picker:
```tsx
<input
  type="date"
  value={selectedDate}
  onChange={e => setSelectedDate(e.target.value)}
  style={{
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 8,
    color: "#e2e8f0",
    padding: "4px 10px",
    fontSize: 13,
    outline: "none",
  }}
/>
```

---

## DEPLOY MODE — full `<DeployBoard />` implementation

Replace the placeholder content block with the real DeployBoard. It must be a separate component function `DeployBoard` receiving props: `{ selectedDate, username, supabase }`.

### Which zones to show

```ts
function getZonesForDate(date: string): WarZone[] {
  const d = new Date(date + "T00:00:00");
  const dow = d.getDay(); // 0=Sun
  return WAR_ZONES.filter(z =>
    z.scheduleType === "daily" ||
    (z.scheduleType === "weekly" && z.weekday === dow)
  );
}
```

Sort the result: daily zones first grouped by category order (lab → valley → purgatory → mirage → tower), then weekly zones sorted by scheduleTimes[0].

### Zone event card

For each zone, render a glass card with 3D hover effect.

```tsx
<div
  style={{
    background: "radial-gradient(ellipse at top left, rgba(148,163,184,0.06) 0%, transparent 60%), rgba(15,23,42,0.92)",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 12,
    padding: 16,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "default",
  }}
  onMouseEnter={e => {
    (e.currentTarget as HTMLDivElement).style.transform = "perspective(800px) rotateX(-1deg) rotateY(2deg) translateY(-3px)";
    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(148,163,184,0.3)";
  }}
  onMouseLeave={e => {
    (e.currentTarget as HTMLDivElement).style.transform = "none";
    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
  }}
>
```

Card layout:
1. Top row: `<ZoneBadge>` + zone name (font-semibold zinc-100) + time badge (right-aligned)
2. Description text if present (zinc-400, text-xs, mt-1)
3. Divider line `<hr style={{borderColor:"rgba(255,255,255,0.07)", margin:"12px 0"}} />`
4. Three role rows: ATTACK / DEFEND / SUPPORT — each row:
   - Role label (text-xs font-bold tracking-widest, color matches category color)
   - Six squad buttons + current assignment badge

### Time badge colors

```ts
function timeBadgeStyle(timeStr: string): React.CSSProperties {
  if (!timeStr) return { background:"rgba(100,116,139,0.3)", color:"#94a3b8", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 };
  const [h, m] = timeStr.split(":").map(Number);
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const nowMins = utc8.getUTCHours() * 60 + utc8.getUTCMinutes();
  const eventMins = h * 60 + m;
  const diff = eventMins - nowMins;
  let bg = "rgba(100,116,139,0.3)", color = "#94a3b8";
  if (diff >= 0 && diff <= 15)  { bg = "rgba(239,68,68,0.8)";   color = "#fff"; }
  else if (diff > 0 && diff <= 60) { bg = "rgba(234,179,8,0.8)";  color = "#000"; }
  else if (diff < 0 && diff >= -30){ bg = "rgba(34,197,94,0.8)";  color = "#000"; } // recently spawned
  return { background:bg, color, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 };
}
```

### Squad selector row

```tsx
function RoleRow({
  zoneId, role, roleColor, assignments, onAssign
}: {
  zoneId: string;
  role: "attack" | "defend" | "support";
  roleColor: string;
  assignments: Assignment[];
  onAssign: (zoneId: string, role: "attack"|"defend"|"support", squad: Squad|null) => void;
}) {
  const current = assignments.find(a => a.zone_id === zoneId && a.role === role);
  return (
    <div className="flex items-center gap-2 mt-2">
      <span style={{ color: roleColor, fontSize: 10, fontWeight: 700, letterSpacing: 2, width: 52, flexShrink: 0 }}>
        {role.toUpperCase()}
      </span>
      <div className="flex gap-1">
        {SQUADS.map(sq => (
          <button
            key={sq}
            onClick={() => onAssign(zoneId, role, current?.squad === sq ? null : sq)}
            style={{
              width: 28, height: 28, borderRadius: "50%",
              background: current?.squad === sq ? SQUAD_COLORS[sq] : "rgba(255,255,255,0.06)",
              border: `2px solid ${current?.squad === sq ? SQUAD_COLORS[sq] : "rgba(255,255,255,0.15)"}`,
              color: current?.squad === sq ? "#fff" : "#94a3b8",
              fontWeight: 700, fontSize: 11, cursor: "pointer",
              boxShadow: current?.squad === sq ? `0 0 10px ${SQUAD_COLORS[sq]}80` : "none",
              transition: "all 0.15s ease",
            }}
          >
            {sq}
          </button>
        ))}
      </div>
      {current?.assigned_by && current.squad && (
        <span style={{ fontSize: 10, color: "#64748b", marginLeft: 4 }}>
          {current.assigned_by}
        </span>
      )}
    </div>
  );
}
```

### Supabase upsert + load + realtime

```ts
// In DeployBoard:
const [assignments, setAssignments] = useState<Assignment[]>([]);

async function loadAssignments() {
  const { data } = await supabase
    .from("war_assignments")
    .select("*")
    .eq("war_date", selectedDate);
  setAssignments(data ?? []);
}

async function handleAssign(zoneId: string, role: "attack"|"defend"|"support", squad: Squad|null) {
  if (squad === null) {
    await supabase.from("war_assignments")
      .delete()
      .eq("war_date", selectedDate)
      .eq("zone_id", zoneId)
      .eq("role", role);
  } else {
    await supabase.from("war_assignments").upsert({
      war_date: selectedDate,
      zone_id: zoneId,
      role,
      squad,
      assigned_by: username,
      updated_at: new Date().toISOString(),
    }, { onConflict: "war_date,zone_id,role" });
  }
  loadAssignments();
}

useEffect(() => {
  loadAssignments();
  const channel = supabase
    .channel(`war-deploy-${selectedDate}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "war_assignments", filter: `war_date=eq.${selectedDate}` },
      () => loadAssignments())
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [selectedDate]);
```

---

## MAP MODE — full `<MapBoard />` + `<MapCanvas />` implementation

Replace the placeholder with the real MapBoard. It must be a separate component function `MapBoard` receiving props: `{ username, supabase }`.

### State in MapBoard

```ts
const [categoryFilter, setCategoryFilter] = useState<ZoneCategory | "all">("all");
const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
const [markers, setMarkers] = useState<MapMarker[]>([]);
const [activeMarkerType, setActiveMarkerType] = useState<MarkerType>("attack");
const [activeSquad, setActiveSquad] = useState<Squad>("A");
```

### Layout

Two-panel layout on desktop, stacked on mobile:

```tsx
<div className="flex flex-col md:flex-row gap-4">
  {/* LEFT PANEL — map selector */}
  <div className="w-full md:w-64 shrink-0">
    {/* Category filter pills */}
    {/* Map thumbnail grid */}
  </div>

  {/* RIGHT PANEL — map canvas */}
  <div className="flex-1 min-w-0">
    {selectedMapId ? <MapCanvas ... /> : <EmptyMapPrompt />}
  </div>
</div>
```

### Category filter pills

```tsx
const categories: Array<{ id: ZoneCategory | "all"; label: string }> = [
  { id: "all",       label: "All" },
  { id: "lab",       label: "Labyrinth" },
  { id: "valley",    label: "Valley" },
  { id: "purgatory", label: "Purgatory" },
  { id: "mirage",    label: "Mirage" },
  { id: "tower",     label: "Tower" },
];
```

Each pill button: active = colored bg, inactive = transparent with zinc border.

### Map thumbnail grid

Filter `Object.values(MAP_FILES)` by category. But **deduplicate tower maps** — tower uses the same image for all 4 floors, so only show one entry for the tower image (show "Tower of Black Dragon" with floor selector once selected).

For each map file show:
- 2-column grid: `grid grid-cols-2 gap-2`
- Each card: relative container, Next.js `<Image>` with `fill objectFit="cover"`, map name below (text-xs zinc-400)
- Active: colored ring border matching category color
- Marker count badge (top-right corner) if markers exist for this map

### Marker type toolbar (above canvas)

```tsx
const MARKER_CONFIG: Record<MarkerType, { label: string; color: string }> = {
  attack:  { label: "Attack",  color: "#ef4444" },
  defend:  { label: "Defend",  color: "#3b82f6" },
  gather:  { label: "Gather",  color: "#22c55e" },
  support: { label: "Support", color: "#eab308" },
  retreat: { label: "Retreat", color: "#a78bfa" },
};
```

Five buttons + squad selector + Clear All button (trash SVG icon):
```tsx
// Trash icon SVG path
// <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
```

Also show active squad selector (A–F colored buttons) in this toolbar.

### `<MapCanvas />` component

```tsx
interface ImgRect { x: number; y: number; w: number; h: number }

function MapCanvas({
  mapId, markers, onPlaceMarker, onRemoveMarker, activeMarkerType, activeSquad,
}: {
  mapId: string;
  markers: MapMarker[];
  onPlaceMarker: (p: { mapId: string; marker_type: MarkerType; x_pct: number; y_pct: number }) => void;
  onRemoveMarker: (id: string) => void;
  activeMarkerType: MarkerType;
  activeSquad: Squad;
}) {
  const mapFile = MAP_FILES[mapId];
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgRect, setImgRect] = useState<ImgRect>({ x: 0, y: 0, w: 0, h: 0 });

  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const imgEl = containerRef.current.querySelector("img");
    if (!imgEl) return;
    const naturalW = imgEl.naturalWidth || container.width;
    const naturalH = imgEl.naturalHeight || container.height;
    const scale = Math.min(container.width / naturalW, container.height / naturalH);
    const renderedW = naturalW * scale;
    const renderedH = naturalH * scale;
    const offsetX = (container.width - renderedW) / 2;
    const offsetY = (container.height - renderedH) / 2;
    const clickX = e.clientX - container.left - offsetX;
    const clickY = e.clientY - container.top  - offsetY;
    if (clickX < 0 || clickY < 0 || clickX > renderedW || clickY > renderedH) return;
    onPlaceMarker({
      mapId,
      marker_type: activeMarkerType,
      x_pct: (clickX / renderedW) * 100,
      y_pct: (clickY / renderedH) * 100,
    });
  }

  return (
    <div
      ref={containerRef}
      onClick={handleMapClick}
      style={{
        position: "relative", width: "100%", aspectRatio: "16/9",
        borderRadius: 12, overflow: "hidden", cursor: "crosshair",
        border: "1px solid rgba(148,163,184,0.2)",
        background: "#0a0f1a",
      }}
    >
      <Image
        src={mapFile.src}
        alt={mapFile.name}
        fill
        style={{ objectFit: "contain" }}
        onLoad={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          if (!containerRef.current) return;
          const c = containerRef.current.getBoundingClientRect();
          const scale = Math.min(c.width / img.naturalWidth, c.height / img.naturalHeight);
          setImgRect({
            w: img.naturalWidth * scale,
            h: img.naturalHeight * scale,
            x: (c.width  - img.naturalWidth  * scale) / 2,
            y: (c.height - img.naturalHeight * scale) / 2,
          });
        }}
      />
      {/* SVG overlay exactly covering the image, not the full container */}
      <svg
        style={{
          position: "absolute",
          left: imgRect.x, top: imgRect.y,
          width: imgRect.w, height: imgRect.h,
          pointerEvents: "none", overflow: "visible",
        }}
      >
        {markers.map(m => (
          <g
            key={m.id}
            transform={`translate(${(m.x_pct / 100) * imgRect.w}, ${(m.y_pct / 100) * imgRect.h})`}
            style={{ cursor: "pointer", pointerEvents: "all" }}
            onClick={(e) => { e.stopPropagation(); onRemoveMarker(m.id); }}
          >
            <MarkerIcon type={m.marker_type} color={m.color} size={24} />
          </g>
        ))}
      </svg>
    </div>
  );
}
```

**Important:** in the SVG, marker position must be `(x_pct/100 * imgRect.w, y_pct/100 * imgRect.h)` — percentage of rendered image size, NOT `x_pct%` string (that would be % of SVG element size which IS the image area, so both approaches work — use whichever is cleaner).

### Supabase load + realtime for markers

```ts
async function loadMarkers(mapId: string) {
  const { data } = await supabase
    .from("war_map_markers")
    .select("*")
    .eq("map_id", mapId);
  setMarkers(data ?? []);
}

async function handlePlaceMarker({ mapId, marker_type, x_pct, y_pct }: {
  mapId: string; marker_type: MarkerType; x_pct: number; y_pct: number;
}) {
  await supabase.from("war_map_markers").insert({
    map_id: mapId, marker_type, x_pct, y_pct,
    color: SQUAD_COLORS[activeSquad],
    placed_by: username,
  });
}

async function handleRemoveMarker(id: string) {
  await supabase.from("war_map_markers").delete().eq("id", id);
}

useEffect(() => {
  if (!selectedMapId) return;
  loadMarkers(selectedMapId);
  const channel = supabase
    .channel(`war-map-${selectedMapId}`)
    .on("postgres_changes", {
      event: "*", schema: "public", table: "war_map_markers",
      filter: `map_id=eq.${selectedMapId}`,
    }, (payload) => {
      if (payload.eventType === "INSERT")
        setMarkers(prev => [...prev, payload.new as MapMarker]);
      else if (payload.eventType === "DELETE")
        setMarkers(prev => prev.filter(m => m.id !== (payload.old as { id: string }).id));
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [selectedMapId]);
```

---

## MOBILE NAV — WAR BOARD link visible on mobile too

In `src/app/page.tsx`, change `hidden sm:flex` to just `flex` so the WAR BOARD button is always visible, not hidden on mobile.

---

## VERIFICATION

After completing:

1. Run `npx tsc --noEmit` — fix all TypeScript errors.
2. Check that `WAR_ZONES` has exactly 27 entries (10 labs + 5 valleys + 8 weekly + 1 purgatory + 2 mirage + 1 rallying-void + 2 tower).
3. Check that `MAP_FILES` has exactly 35 entries (10 labs + 5 valleys + 7 purgatory + 8 mirage + 4 tower).
4. Confirm zero emojis: search the file for any non-ASCII characters in string literals.
5. Confirm no `localStorage` usage.
