begin;

-- ============================================================================
-- F.SOCIETY.DEV — RECRUTAMENTO (TABELAS E FUNÇÕES ISOLADAS COM PREFIXO fsociety_)
-- Indicador obrigatório project_tag = 'recrutamento-fsociety' em todos os registros
-- para nunca misturar com os dados do SeekerAI no mesmo banco Supabase.
-- ============================================================================

create table if not exists public.fsociety_applications (
  id uuid primary key default gen_random_uuid(),
  project_tag text not null default 'recrutamento-fsociety'
    check (project_tag = 'recrutamento-fsociety'),
  operative_code text not null default (
    'FSOC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
  ),
  full_name text not null check (length(trim(full_name)) between 2 and 160),
  email text not null check (length(trim(email)) between 5 and 200),
  whatsapp text not null check (length(trim(whatsapp)) between 8 and 40),
  discord_handle text not null check (length(trim(discord_handle)) between 2 and 80),

  -- Respostas do Wizard de Recrutamento
  knows_ai text not null,
  codes_with_ai text not null,
  has_computer boolean not null default false,
  has_discord boolean not null default false,
  has_microphone boolean not null default false,
  has_internet boolean not null default false,
  experience_level text,
  daily_availability text,
  motivation text,
  wizard_answers jsonb not null default '{}'::jsonb,

  -- Dados do Pagamento do Sinal de Confiança (R$ 10,00 = 1000 centavos)
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'expired', 'review')),
  payment_method text check (payment_method is null or payment_method in ('pix', 'card')),
  payment_provider text check (payment_provider is null or payment_provider in ('mercosulpay', 'mercadopago')),
  payment_ref text unique,
  payment_amount_cents integer not null default 1000 check (payment_amount_cents = 1000),
  payment_qr_code text,
  payment_qr_image text,
  payment_checkout_url text,
  payment_expires_at timestamptz,
  paid_at timestamptz,

  metadata jsonb not null default '{"origin": "fsociety.dev", "campaign": "saas_30_days_nov_2026"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fsociety_applications_email_idx
  on public.fsociety_applications (lower(email));
create index if not exists fsociety_applications_discord_idx
  on public.fsociety_applications (lower(discord_handle));
create index if not exists fsociety_applications_status_idx
  on public.fsociety_applications (payment_status, created_at desc);

create table if not exists public.fsociety_payments (
  id uuid primary key default gen_random_uuid(),
  project_tag text not null default 'recrutamento-fsociety'
    check (project_tag = 'recrutamento-fsociety'),
  application_id uuid not null references public.fsociety_applications(id) on delete cascade,
  provider text not null check (provider in ('mercosulpay', 'mercadopago')),
  provider_ref text not null unique,
  external_id text,
  method text not null check (method in ('pix', 'card')),
  amount_cents integer not null default 1000 check (amount_cents > 0),
  currency text not null default 'brl',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'expired', 'review')),
  qr_code text,
  qr_code_image text,
  checkout_url text,
  expires_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fsociety_payments_app_idx
  on public.fsociety_payments (application_id, created_at desc);
create index if not exists fsociety_payments_ref_idx
  on public.fsociety_payments (provider, provider_ref);

-- Trigger de updated_at isolada para fsociety
create or replace function public.fsociety_set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists fsociety_applications_updated_at on public.fsociety_applications;
create trigger fsociety_applications_updated_at
  before update on public.fsociety_applications
  for each row execute function public.fsociety_set_updated_at();

drop trigger if exists fsociety_payments_updated_at on public.fsociety_payments;
create trigger fsociety_payments_updated_at
  before update on public.fsociety_payments
  for each row execute function public.fsociety_set_updated_at();

alter table public.fsociety_applications enable row level security;
alter table public.fsociety_payments enable row level security;

-- Confirma pagamento do sinal de confiança do recrutamento F.SOCIETY.DEV
create or replace function public.fsociety_confirm_payment(
  p_provider text,
  p_provider_ref text,
  p_paid_cents integer default 1000,
  p_external_id text default null,
  p_payload jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pay public.fsociety_payments%rowtype;
  v_app public.fsociety_applications%rowtype;
begin
  select * into v_pay
  from public.fsociety_payments
  where provider = p_provider and provider_ref = p_provider_ref
  for update;

  if not found then
    return jsonb_build_object('found', false, 'status', 'not_found');
  end if;

  if v_pay.status = 'paid' then
    select * into v_app from public.fsociety_applications where id = v_pay.application_id;
    return jsonb_build_object(
      'found', true,
      'status', 'already_paid',
      'application_id', v_pay.application_id,
      'operative_code', v_app.operative_code
    );
  end if;

  if p_paid_cents is not null and p_paid_cents < v_pay.amount_cents then
    update public.fsociety_payments
      set status = 'review',
          external_id = coalesce(p_external_id, external_id),
          raw_payload = v_pay.raw_payload || jsonb_build_object('webhook_review', p_payload)
      where id = v_pay.id;

    update public.fsociety_applications
      set payment_status = 'review'
      where id = v_pay.application_id;

    return jsonb_build_object(
      'found', true,
      'status', 'review',
      'application_id', v_pay.application_id
    );
  end if;

  update public.fsociety_payments
    set status = 'paid',
        paid_at = now(),
        external_id = coalesce(p_external_id, external_id),
        raw_payload = v_pay.raw_payload || jsonb_build_object('webhook_confirm', p_payload)
    where id = v_pay.id;

  update public.fsociety_applications
    set payment_status = 'paid',
        payment_method = v_pay.method,
        payment_provider = v_pay.provider,
        payment_ref = v_pay.provider_ref,
        paid_at = now()
    where id = v_pay.application_id
    returning * into v_app;

  return jsonb_build_object(
    'found', true,
    'status', 'paid',
    'application_id', v_app.id,
    'operative_code', v_app.operative_code,
    'full_name', v_app.full_name,
    'email', v_app.email,
    'whatsapp', v_app.whatsapp,
    'discord_handle', v_app.discord_handle
  );
end;
$$;

revoke all on function public.fsociety_confirm_payment(text, text, integer, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.fsociety_confirm_payment(text, text, integer, text, jsonb)
  to service_role;

commit;
