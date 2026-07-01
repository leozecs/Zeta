create table if not exists public.zeta_checkout_orders (
  id uuid primary key default gen_random_uuid(),
  external_reference text not null unique,
  asaas_payment_id text unique,
  plan_slug text not null,
  plan_name text not null,
  amount numeric(10, 2) not null check (amount > 0),
  customer_name text not null,
  customer_email text not null,
  briefing text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'approved', 'overdue', 'refunded', 'cancelled', 'failed')),
  asaas_status text,
  invoice_url text,
  paid_at timestamptz,
  approved_at timestamptz,
  webhook_event_ids text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists zeta_checkout_orders_payment_id_idx
on public.zeta_checkout_orders(asaas_payment_id);

create index if not exists zeta_checkout_orders_status_idx
on public.zeta_checkout_orders(status);

create index if not exists zeta_checkout_orders_customer_email_idx
on public.zeta_checkout_orders(customer_email);

create or replace function public.set_zeta_checkout_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists zeta_checkout_orders_set_updated_at on public.zeta_checkout_orders;

create trigger zeta_checkout_orders_set_updated_at
before update on public.zeta_checkout_orders
for each row execute function public.set_zeta_checkout_orders_updated_at();

alter table public.zeta_checkout_orders enable row level security;

drop policy if exists "zeta_checkout_orders_no_public_access" on public.zeta_checkout_orders;

create policy "zeta_checkout_orders_no_public_access"
on public.zeta_checkout_orders
for all
to anon, authenticated
using (false)
with check (false);

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.zeta_checkout_orders to service_role;
