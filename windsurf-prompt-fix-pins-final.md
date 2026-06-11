# Windsurf Agent Prompt — Final Pin Position Fix (user-measured)

## One file only: `src/lib/gameData.ts`

Replace the following blocks exactly as shown. Do not touch anything else.

---

### Replace `SECRET_PEAK_TEAL_COORDS`:

Find:
```typescript
const SECRET_PEAK_TEAL_COORDS = [
  { suffix: "teal1", pinX: 20, pinY: 7 },
  { suffix: "teal2", pinX: 10, pinY: 14 },
  { suffix: "teal3", pinX: 19, pinY: 25 },
  { suffix: "teal4", pinX: 33, pinY: 29 },
] as const;
```

Replace with:
```typescript
const SECRET_PEAK_TEAL_COORDS = [
  { suffix: "teal1", pinX: 38, pinY: 59 },
  { suffix: "teal2", pinX: 69, pinY: 76 },
  { suffix: "teal3", pinX: 33, pinY: 37 },
  { suffix: "teal4", pinX: 48, pinY: 29 },
] as const;
```

---

### Replace `SECRET_PEAK_GOLD_COORDS`:

Find:
```typescript
const SECRET_PEAK_GOLD_COORDS = [
  { suffix: "gold1", pinX: 35, pinY: 12 },
  { suffix: "gold2", pinX: 9, pinY: 27 },
] as const;
```

Replace with:
```typescript
const SECRET_PEAK_GOLD_COORDS = [
  { suffix: "gold1", pinX: 77, pinY: 41 },
  { suffix: "gold2", pinX: 26, pinY: 68 },
] as const;
```

---

### Replace Red Lord (Lower) pin:

Find:
```
      pinX: 11,
      pinY: 41,
```
(this is inside the `sp_f${floor}_red_lower` block)

Replace with:
```
      pinX: 27,
      pinY: 86,
```

---

### Replace Red Lord (Upper) pin:

Find:
```
      pinX: 34,
      pinY: 2,
```
(this is inside the `sp_f${floor}_red_upper` block)

Replace with:
```
      pinX: 70,
      pinY: 14,
```

---

## After changes

```bash
npm run lint && npx tsc --noEmit
```

If clean — commit and push.
