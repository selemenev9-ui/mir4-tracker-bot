# Windsurf Agent Prompt: Fix gameData.ts (восстановление + REDMOON)

## Проблема

`src/lib/gameData.ts` обрезан до 584 строк (правильная версия — 703 строки).
Предыдущие попытки `git checkout HEAD` не помогали, потому что Windsurf
сразу обрезал файл снова при редактировании.

## Решение — один terminal-команды, никаких редакторов

Выполни **только в терминале**, не трогая файл в редакторе:

```bash
cd /path/to/mir4-tracker-bot

# Шаг 1: Восстановить полный файл из git + добавить REDMOON блок одной командой
git show HEAD:src/lib/gameData.ts > src/lib/gameData.ts

# Шаг 2: Добавить REDMOON блок в конец файла через bash heredoc
cat >> src/lib/gameData.ts << 'REDMOON_EOF'

// ─── REDMOON PURGATORY ──────────────────────────────────────────────────────

export interface RedmoonBoss {
  id: string;
  name: string;
  description: string;
  spawnHoursUTC8: number[];
  notifyMinutesBefore: number;
  /** Optional: weekday filter (0=Sun … 6=Sat). If set, only fires on that day. */
  dayOfWeek?: number;
}

export const REDMOON_BOSSES: RedmoonBoss[] = [
  {
    id: "redmoon_quest",
    name: "Redmoon Purgatory Quest Bosses",
    description:
      "Quest Boss Monsters spawn on all floors (1F–7F). Active for 5 minutes only — be ready!",
    spawnHoursUTC8: [6, 12, 18, 0],
    notifyMinutesBefore: 10,
  },
  {
    id: "redmoon_helbar",
    name: "[Hellish Lord] Helbar",
    description:
      "Special boss on Redmoon Purgatory 7F. Spawns every Wednesday at 23:00 UTC+8.",
    spawnHoursUTC8: [23],
    notifyMinutesBefore: 10,
    dayOfWeek: 3,
  },
];
REDMOON_EOF

# Шаг 3: Проверить количество строк (должно быть ~740)
wc -l src/lib/gameData.ts

# Шаг 4: Проверить что REDMOON появился
grep -n "REDMOON_BOSSES" src/lib/gameData.ts

# Шаг 5: TypeScript проверка
npx tsc --noEmit
```

## После успешного `tsc --noEmit` (0 ошибок)

```bash
git add src/lib/gameData.ts
git commit -m "fix: restore gameData utilities + add REDMOON_BOSSES"
git push
```

## НЕ трогать

- `src/app/api/cron/notify/route.ts` — уже правильный
- `src/app/page.tsx` — не трогать
- Любые другие файлы
