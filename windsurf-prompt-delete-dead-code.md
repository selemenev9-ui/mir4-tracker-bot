Delete the folder `src/data/mir4tools` and everything inside it. It is unused dead code that causes TypeScript errors.

Then run:
```
npx tsc --noEmit
```

Confirm zero errors, then:
```
git add -A
git commit -m "chore: remove unused mir4tools dead code"
git push
```
