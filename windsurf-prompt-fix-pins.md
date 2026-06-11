# Windsurf Agent Prompt — Fix Secret Peak Pin Positions + Map Gradient

## Two changes only. Do not touch any other files.

---

## Change 1: `src/lib/gameData.ts` — Fix Secret Peak boss pinX/pinY values

In `SECRET_PEAK_BOSSES` array, update **only** the `pinX` and `pinY` fields for each boss as shown below. Do NOT change any other fields (id, name, spawnTimes, respawnMinutes, color, etc.).

### Teal Guardian bosses (4 total):

Find the Teal Guardian entry with `pinX: 46, pinY: 26` → change to:
```
pinX: 20, pinY: 7,
```

Find the Teal Guardian entry with `pinX: 28, pinY: 37` → change to:
```
pinX: 10, pinY: 14,
```

Find the Teal Guardian entry with `pinX: 47, pinY: 53` → change to:
```
pinX: 19, pinY: 25,
```

Find the Teal Guardian entry with `pinX: 68, pinY: 60` → change to:
```
pinX: 33, pinY: 29,
```

### Gold Warden bosses (2 total):

Find the Gold Warden entry with `pinX: 68, pinY: 34` → change to:
```
pinX: 35, pinY: 12,
```

Find the Gold Warden entry with `pinX: 27, pinY: 52` → change to:
```
pinX: 9, pinY: 27,
```

### Red Lord bosses (2 total):

Find the Red Lord entry with `pinX: 18, pinY: 72` → change to:
```
pinX: 11, pinY: 41,
```

Find the Red Lord entry with `pinX: 73, pinY: 12` → change to:
```
pinX: 34, pinY: 2,
```

---

## Change 2: `src/app/page.tsx` — Remove dark gradient overlay on map

Find the gradient overlay div inside the Secret Peak map container. It will look something like:

```tsx
<div className="... bg-gradient-to-b from-transparent via-black/20 to-black/60 ..." />
```

or it might be part of a className string containing `via-black/20` and `to-black/60`.

**Replace** those two Tailwind classes only:
- `via-black/20` → `via-transparent`
- `to-black/60` → `to-black/10`

Leave all other classes in that div unchanged.

If there is no gradient div, or if the gradient uses different opacity values, reduce the darkest opacity class to at most `/10`.

---

## After both changes

Run:
```bash
npm run lint && npx tsc --noEmit
```

If clean — commit and push.

---

## Context (do not include in code)

These pinX/pinY values were measured by clicking directly on boss sprites in the live site
using a JS click listener calibrated to the map container's getBoundingClientRect().
The map PNG (1337×732 natural, rendered 1086×595) has all boss sprites in the
left-center region (x: 9–35%, y: 2–41%) of the container.
The previous values (x: 18–73%, y: 12–72%) were pointing to the wrong area (dark ocean).
