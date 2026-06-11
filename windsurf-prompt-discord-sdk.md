# Windsurf Agent Prompt: Discord Activity SDK + User Identity

## Задача

Исправить аутентификацию в Discord Activity. Текущий код вызывает `sdk.commands.authenticate({})` без access_token — это ломается с ошибкой. Нужно заменить на рабочую систему.

**Важно:** Мы используем Discord Activity (Embedded App SDK). Приложение открывается внутри Discord в голосовом канале. Никакие изменения в логику таймеров, карту, данные боссов — НЕ вносить. Менять только систему идентификации пользователя.

---

## Что нужно сделать

### 1. Обновить `.env.local` — добавить переменную

Добавить в файл `.env.local` следующую строку (если её там ещё нет):

```
NEXT_PUBLIC_DISCORD_APP_ID=1514160020520964146
```

Текущий код в `page.tsx` делает:
```typescript
const clientId = process.env.NEXT_PUBLIC_DISCORD_APP_ID ?? process.env.DISCORD_APP_ID;
```
Поскольку `page.tsx` — это `"use client"` компонент, только переменные с префиксом `NEXT_PUBLIC_` доступны на клиенте. `DISCORD_APP_ID` (без префикса) там не работает.

---

### 2. Изменить `src/app/page.tsx` — только `useEffect` инициализации SDK

Найди в `DashboardPage` (основной компонент) `useEffect` который инициализирует Discord SDK. Сейчас он выглядит примерно так:

```typescript
useEffect(() => {
  if (typeof window === "undefined") return;
  let mounted = true;

  async function init() {
    try {
      const clientId =
        process.env.NEXT_PUBLIC_DISCORD_APP_ID ?? process.env.DISCORD_APP_ID;
      if (!clientId) {
        setSdkError(true);
        return;
      }

      const sdk = new DiscordSDK(clientId);
      await sdk.ready();
      const auth = (await sdk.commands.authenticate({})) as {
        access_token: string;
        user: { id: string; username: string };
      };

      if (!auth?.user || !mounted) return;
      setCurrentUser({ id: auth.user.id, username: auth.user.username });
      setSdkReady(true);
    } catch {
      if (mounted) setSdkError(true);
    }
  }

  void init();
  return () => {
    mounted = false;
  };
}, []);
```

**Заменить весь этот `useEffect` на следующий:**

```typescript
useEffect(() => {
  if (typeof window === "undefined") return;
  let mounted = true;

  async function init() {
    // Try to restore saved username from localStorage first
    const savedUsername = localStorage.getItem("mir4_username");
    const savedId = localStorage.getItem("mir4_user_id");
    if (savedUsername && savedId && mounted) {
      setCurrentUser({ id: savedId, username: savedUsername });
      setSdkReady(true);
      // Still try Discord SDK in background to get real identity
    }

    try {
      const clientId =
        process.env.NEXT_PUBLIC_DISCORD_APP_ID ?? process.env.DISCORD_APP_ID;
      if (!clientId) {
        if (!savedUsername && mounted) setSdkError(true);
        return;
      }

      const sdk = new DiscordSDK(clientId);
      await sdk.ready();
      // SDK is ready — we're inside Discord Activity
      // Mark as Discord-connected (no full OAuth needed for basic functionality)
      if (mounted) {
        setSdkReady(true);
        // If no saved username, prompt will show (sdkError stays false = "Connecting...")
        // But we know we're in Discord, so set a flag
        if (!savedUsername) {
          // Will show name prompt via sdkError=false + currentUser=null state
          setSdkError(false);
        }
      }
    } catch {
      // Not in Discord (browser/web mode) — still allow use with saved username
      if (mounted && !savedUsername) {
        setSdkError(true);
      }
    }
  }

  void init();
  return () => {
    mounted = false;
  };
}, []);
```

---

### 3. Добавить состояние и UI для ввода имени пользователя

В компоненте `DashboardPage` нужно добавить:

**a) Новое состояние** рядом с другими `useState`:
```typescript
const [showNamePrompt, setShowNamePrompt] = useState(false);
const [nameInput, setNameInput] = useState("");
```

**b) Новый `useEffect`** для показа промпта (добавить после существующих useEffect):
```typescript
// Show name prompt if SDK initialized but no user yet
useEffect(() => {
  if (!currentUser && (sdkReady || sdkError)) {
    // Give SDK a moment to potentially restore from localStorage
    const timer = setTimeout(() => {
      if (!currentUser) setShowNamePrompt(true);
    }, 1500);
    return () => clearTimeout(timer);
  }
}, [sdkReady, sdkError, currentUser]);
```

**c) Функция сохранения имени** (добавить рядом с `handleReportKill`):
```typescript
const handleSaveName = useCallback(() => {
  const trimmed = nameInput.trim();
  if (!trimmed) return;
  const userId = `user_${Date.now()}`;
  localStorage.setItem("mir4_username", trimmed);
  localStorage.setItem("mir4_user_id", userId);
  setCurrentUser({ id: userId, username: trimmed });
  setSdkReady(true);
  setShowNamePrompt(false);
}, [nameInput]);
```

**d) Модальное окно ввода имени** — добавить внутри JSX возврата компонента, прямо перед закрывающим `</div>` основного контейнера:

```tsx
{/* Name Prompt Modal */}
{showNamePrompt && !currentUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-2xl border border-zinc-700/80 bg-zinc-950 p-6 shadow-2xl">
      <h2 className="mb-1 text-base font-bold text-zinc-50">
        Кто ты?
      </h2>
      <p className="mb-4 text-xs text-zinc-500">
        Введи своё Discord-имя чтобы репортить убийства боссов.
        Сохранится автоматически.
      </p>
      <input
        type="text"
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSaveName();
        }}
        placeholder="Твой ник в Discord"
        autoFocus
        className="mb-3 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20"
      />
      <button
        type="button"
        disabled={!nameInput.trim()}
        onClick={handleSaveName}
        className="w-full rounded-xl border border-red-500/80 bg-red-500/20 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Войти
      </button>
    </div>
  </div>
)}
```

---

### 4. Обновить отображение статуса подключения в header

Найди в JSX header блок где показывается статус пользователя:

```tsx
{currentUser ? (
  <span className="text-xs text-zinc-500">
    <span className="font-medium text-zinc-300">
      {currentUser.username}
    </span>
  </span>
) : (
  <span className="text-xs text-zinc-600">
    {sdkError
      ? "Web mode — Discord not connected"
      : sdkReady
      ? "Web mode — Discord auth pending"
      : "Connecting to Discord..."}
  </span>
)}
```

**Заменить на:**

```tsx
{currentUser ? (
  <div className="flex items-center gap-2">
    <span className="text-xs text-zinc-500">
      <span className="font-medium text-zinc-300">
        {currentUser.username}
      </span>
    </span>
    <button
      type="button"
      onClick={() => {
        localStorage.removeItem("mir4_username");
        localStorage.removeItem("mir4_user_id");
        setCurrentUser(null);
        setSdkReady(false);
        setSdkError(false);
        setShowNamePrompt(true);
        setNameInput("");
      }}
      className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
    >
      изменить
    </button>
  </div>
) : (
  <button
    type="button"
    onClick={() => setShowNamePrompt(true)}
    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
  >
    {sdkError ? "Войти (веб-режим)" : "Войти"}
  </button>
)}
```

---

### 5. Добавить `NEXT_PUBLIC_DISCORD_APP_ID` в Vercel

**Важно:** После изменений нужно добавить env-переменную в Vercel:
- Имя: `NEXT_PUBLIC_DISCORD_APP_ID`
- Значение: `1514160020520964146`
- Environment: Production, Preview, Development

Без этого клиентский код не получит App ID.

---

## Что НЕ менять

- Логику таймеров и `handleReportKill`
- Компоненты `SecretPeakView`, `MirageView`, `MagicSquareView`, `WorldBossesView`
- API routes (`/api/get-timers`, `/api/report-kill`, `/api/cron/notify`)
- Файлы `gameData.ts`, `supabase.ts`, `discord.ts`
- Карту, пины, флоры — ничего визуального кроме модального окна и header-статуса

---

## Итог

После этих изменений:
1. Пользователь открывает приложение (в Discord Activity или в браузере)
2. Если имя сохранено в localStorage — сразу работает
3. Если нет — появляется модалка "Кто ты?" с вводом имени
4. После ввода имени кнопки "Report Kill" становятся активными
5. Имя сохраняется навсегда (до ручного сброса)

Это работает и в Discord Activity, и в браузере — без необходимости в Discord OAuth Client Secret.
