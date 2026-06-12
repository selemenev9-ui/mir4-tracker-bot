# Windsurf Agent Prompt: Delete Wrong Map Images

## Goal

Delete all images in `/public/maps/` **except** `secret_peak.png`.  
Only `secret_peak.png` is correct — all others are wrong and must be removed.

---

## Step 1 — Verify what's there

```bash
ls public/maps/
```

Expected output (approximately):
```
global_map.webp
secret_peak.png       ← KEEP THIS
secret_peak.webp
secret_peak_miniature.webp
snake_pit.webp
snake_pit_area.webp
```

---

## Step 2 — Delete everything except `secret_peak.png`

```bash
cd public/maps && ls | grep -v "^secret_peak\.png$" | xargs rm -f
```

---

## Step 3 — Verify only secret_peak.png remains

```bash
ls public/maps/
```

Must output exactly: `secret_peak.png`

---

## Step 4 — Commit

```bash
git add public/maps/
git commit -m "chore: remove wrong map images, keep only secret_peak.png"
git push
```

---

## НЕ трогать

- `secret_peak.png` — the only correct image, MUST NOT be deleted
- Everything outside `/public/maps/`
