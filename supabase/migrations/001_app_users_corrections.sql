create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  manus_open_id text not null unique,
  name text,
  email text,
  login_method text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_signed_in timestamptz not null default now()
);

create table if not exists public.corrections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  source_type text not null check (source_type in ('text', 'image')),
  original_text text,
  transcription text not null,
  final_score integer not null check (final_score between 0 and 1000 and final_score % 40 = 0),
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists corrections_user_id_created_at_idx on public.corrections(user_id, created_at desc);
alter table public.app_users enable row level security;
alter table public.corrections enable row level security;
