create schema if not exists private;

create type public.zeta_member_role as enum ('owner', 'member', 'admin');
create type public.zeta_project_product as enum ('site', 'crm', 'os', 'complete');
create type public.zeta_request_status as enum ('draft', 'submitted', 'in_review', 'approved', 'in_progress', 'done', 'cancelled');
create type public.zeta_volume_status as enum ('planned', 'active', 'review', 'done');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.zeta_member_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.project_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  product public.zeta_project_product not null,
  status public.zeta_request_status not null default 'draft',
  company_name text not null,
  objective text,
  budget_range text,
  urgency text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.briefings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_request_id uuid not null references public.project_requests(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  answers jsonb not null default '{}'::jsonb,
  ai_summary text,
  ai_scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.delivery_volumes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_request_id uuid not null references public.project_requests(id) on delete cascade,
  volume_number integer not null check (volume_number > 0),
  title text not null,
  description text,
  status public.zeta_volume_status not null default 'planned',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_request_id, volume_number)
);

create index profiles_email_idx on public.profiles(email);
create index organizations_owner_id_idx on public.organizations(owner_id);
create index organization_members_user_id_idx on public.organization_members(user_id);
create index organization_members_org_role_idx on public.organization_members(organization_id, role);
create index project_requests_org_status_idx on public.project_requests(organization_id, status);
create index briefings_project_request_id_idx on public.briefings(project_request_id);
create index delivery_volumes_project_request_id_idx on public.delivery_volumes(project_request_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function private.set_updated_at();

create trigger project_requests_set_updated_at
before update on public.project_requests
for each row execute function private.set_updated_at();

create trigger briefings_set_updated_at
before update on public.briefings
for each row execute function private.set_updated_at();

create trigger delivery_volumes_set_updated_at
before update on public.delivery_volumes
for each row execute function private.set_updated_at();

create or replace function private.is_org_member(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_organization_id
      and om.user_id = (select auth.uid())
  );
$$;

create or replace function private.has_org_role(target_organization_id uuid, allowed_roles public.zeta_member_role[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_organization_id
      and om.user_id = (select auth.uid())
      and om.role = any(allowed_roles)
  );
$$;

revoke all on function private.is_org_member(uuid) from public;
revoke all on function private.has_org_role(uuid, public.zeta_member_role[]) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.has_org_role(uuid, public.zeta_member_role[]) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.project_requests enable row level security;
alter table public.briefings enable row level security;
alter table public.delivery_volumes enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "organizations_select_members"
on public.organizations for select
to authenticated
using (private.is_org_member(id));

create policy "organizations_insert_owner"
on public.organizations for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "organizations_update_owners_admins"
on public.organizations for update
to authenticated
using (private.has_org_role(id, array['owner', 'admin']::public.zeta_member_role[]))
with check (private.has_org_role(id, array['owner', 'admin']::public.zeta_member_role[]));

create policy "organization_members_select_members"
on public.organization_members for select
to authenticated
using (private.is_org_member(organization_id));

create policy "organization_members_insert_owners_admins"
on public.organization_members for insert
to authenticated
with check (
  private.has_org_role(organization_id, array['owner', 'admin']::public.zeta_member_role[])
  or ((select auth.uid()) = user_id and role = 'owner')
);

create policy "organization_members_update_owners_admins"
on public.organization_members for update
to authenticated
using (private.has_org_role(organization_id, array['owner', 'admin']::public.zeta_member_role[]))
with check (private.has_org_role(organization_id, array['owner', 'admin']::public.zeta_member_role[]));

create policy "organization_members_delete_owners_admins"
on public.organization_members for delete
to authenticated
using (private.has_org_role(organization_id, array['owner', 'admin']::public.zeta_member_role[]));

create policy "project_requests_all_members"
on public.project_requests for all
to authenticated
using (private.is_org_member(organization_id))
with check (private.is_org_member(organization_id) and (select auth.uid()) = created_by);

create policy "briefings_all_members"
on public.briefings for all
to authenticated
using (private.is_org_member(organization_id))
with check (private.is_org_member(organization_id) and (select auth.uid()) = created_by);

create policy "delivery_volumes_select_members"
on public.delivery_volumes for select
to authenticated
using (private.is_org_member(organization_id));

create policy "delivery_volumes_mutate_owners_admins"
on public.delivery_volumes for all
to authenticated
using (private.has_org_role(organization_id, array['owner', 'admin']::public.zeta_member_role[]))
with check (private.has_org_role(organization_id, array['owner', 'admin']::public.zeta_member_role[]));

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant select, insert, update, delete on public.project_requests to authenticated;
grant select, insert, update, delete on public.briefings to authenticated;
grant select, insert, update, delete on public.delivery_volumes to authenticated;
