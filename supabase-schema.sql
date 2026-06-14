-- Run this in Supabase SQL Editor (SQL → New query)

-- Table for one-time personal boss reminders (bell subscriptions)
create table if not exists personal_reminders (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  boss_id text not null,
  notify_minutes_before int default 10,
  created_at timestamp with time zone default now(),
  unique (user_id, boss_id)
);

-- Table for deduplication of sent notifications (prevents double-sending)
create table if not exists notifications_sent (
  id uuid default gen_random_uuid() primary key,
  notification_key text not null unique,
  sent_at timestamp with time zone default now()
);

-- Table for dynamic boss kill timers (Secret Peak, Magic Square Chamber I/II)
create table if not exists boss_timers (
  id uuid default gen_random_uuid() primary key,
  boss_id text not null,
  boss_name text not null,
  next_spawn timestamp with time zone not null,
  last_killed timestamp with time zone default now(),
  updated_by text,
  created_at timestamp with time zone default now()
);

-- Index for fast cron queries on boss_timers
create index if not exists idx_boss_timers_next_spawn on boss_timers(next_spawn);
