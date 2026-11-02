begin;

-- ============================================================================
-- F.SOCIETY.DEV — PAINEL ADMIN (CAMPOS DE SELEÇÃO, NOTAS E CONFIGURAÇÕES)
-- Tudo isolado com prefixo fsociety_ e project_tag = 'recrutamento-fsociety'
-- ============================================================================

alter table public.fsociety_applications
  add column if not exists selection_status text not null default 'em_analise'
    check (selection_status in ('em_analise', 'pre_selecionado', 'entrevistado', 'selecionado', 'recusado')),
  add column if not exists admin_notes text not null default '',
  add column if not exists admin_score integer
    check (admin_score is null or (admin_score >= 0 and admin_score <= 10));

create index if not exists fsociety_applications_selection_idx
  on public.fsociety_applications (selection_status, created_at desc);

create table if not exists public.fsociety_settings (
  key text primary key,
  project_tag text not null default 'recrutamento-fsociety'
    check (project_tag = 'recrutamento-fsociety'),
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.fsociety_settings enable row level security;

insert into public.fsociety_settings (key, project_tag, value)
values (
  'config',
  'recrutamento-fsociety',
  jsonb_build_object(
    'recruitmentOpen', true,
    'deadlineIso', '2026-11-10T23:59:59-03:00',
    'deadlineLabel', '10/11',
    'totalSpots', 3,
    'signalAmountCents', 1000,
    'pixEnabled', true,
    'cardEnabled', true,
    'discordUrl', 'https://discord.gg/qyEd3vrgd',
    'instagramHandle', '@daflones_',
    'instagramUrl', 'https://instagram.com/daflones_',
    'announcementBanner', ''
  )
)
on conflict (key) do nothing;

commit;
