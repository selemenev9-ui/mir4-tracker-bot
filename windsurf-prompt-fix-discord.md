# Windsurf Agent Prompt — Fix Discord SDK crash in war/page.tsx

## Problem

`new DiscordSDK(...)` throws synchronously when `frame_id` query param is missing — i.e. when the page is opened in a regular browser instead of a Discord iframe. This crashes the whole page.

## Fix

In `src/app/war/page.tsx`, find the `useEffect` that initializes the Discord SDK and wrap the **entire thing** in try-catch so it fails silently:

```ts
useEffect(() => {
  try {
    const sdk = new DiscordSDK(process.env.NEXT_PUBLIC_DISCORD_APP_ID ?? process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? "");
    sdk.ready()
      .then(async () => {
        try {
          const auth = await sdk.commands.authenticate({ access_token: "" });
          setUsername(auth?.user?.username ?? "unknown");
        } catch {
          setUsername("unknown");
        }
      })
      .catch(() => setUsername("unknown"));
  } catch {
    // Not running inside Discord iframe — that's fine
    setUsername("unknown");
  }
}, []);
```

The key change: `new DiscordSDK(...)` is inside `try {}` so it cannot crash the page.

Do not change anything else.

After editing:
```bash
git add src/app/war/page.tsx
git commit -m "fix: catch Discord SDK frame_id error when opened outside Discord"
git push
```
