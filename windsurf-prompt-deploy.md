# Windsurf Agent Prompt — TypeScript Check + Deploy

1. Run `npx tsc --noEmit` in the terminal.
2. If there are TypeScript errors in `src/app/war/page.tsx` or `src/app/page.tsx` — fix them. Ignore any pre-existing errors in `src/data/mir4tools/`.
3. Once those files are error-free, run:
   ```
   git add src/app/war/page.tsx src/app/page.tsx public/maps/war/
   git commit -m "feat: /war tactical war board — deploy + map modes with realtime"
   git push
   ```
