# Windsurf Agent Prompt: Revert Conquest Tab

## Goal

Completely undo the last commit (Conquest Tower tab). Revert `src/app/page.tsx` and `src/data/mir4tools/ConquestTowerData.ts` to the state before the conquest tab was added.

---

## Step 1 — Check what the last commit was

```bash
git log --oneline -3
```

The last commit should be something like `feat: add Conquest Tower tab`. Confirm it before proceeding.

---

## Step 2 — Revert the commit

```bash
git revert HEAD --no-edit
```

This creates a new revert commit that undoes all changes from the conquest tab commit.

---

## Step 3 — Verify the revert worked

```bash
wc -l src/app/page.tsx
grep -c "conquest" src/app/page.tsx
```

- `page.tsx` should be back to ~1488 lines  
- `grep` should return **0** (no mention of "conquest")

---

## Step 4 — Push

```bash
git push
```

---

## НЕ трогать

- Anything other than what git revert touches automatically.
