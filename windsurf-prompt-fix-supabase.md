# Windsurf Agent Prompt — Fix Supabase client in war/page.tsx

## Problem

`src/app/war/page.tsx` imports `getSupabaseClient` from `@/lib/supabase`.
That file throws `new Error("SUPABASE_SERVICE_ROLE_KEY is not set")` at module load time.
Since `/war` is a `"use client"` component, it runs in the browser where `SUPABASE_SERVICE_ROLE_KEY` is not available — crashing the page.

## Fix

In `src/app/war/page.tsx`:

1. **Remove** the import of `getSupabaseClient` from `@/lib/supabase`.
2. **Add** this import at the top:
   ```ts
   import { createClient } from "@supabase/supabase-js";
   ```
3. **Replace** the line `const supabase = getSupabaseClient();` with:
   ```ts
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   ```
   Place this at module level (outside the component function), same position as before.

Do not change anything else in the file.

After editing, run:
```bash
npx tsc --noEmit
```
Confirm no new errors in `src/app/war/page.tsx`, then:
```bash
git add src/app/war/page.tsx
git commit -m "fix: use anon supabase client in war page (client-side safe)"
git push
```
