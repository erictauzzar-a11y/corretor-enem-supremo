create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  source_type text not null check (source_type in ('text', 'image')),
  original_text text,
  created_at timestamptz not null default now()
);

create index if not exists submissions_user_id_created_at_idx on public.submissions(user_id, created_at desc);
alter table public.submissions enable row level security;
alter table public.corrections add column if not exists submission_id uuid references public.submissions(id) on delete cascade;
create index if not exists corrections_submission_id_idx on public.corrections(submission_id);
