-- X Barber Shop booking database
-- Run this in the Supabase SQL Editor. Replace the sample services and barbers in the dashboard.
create extension if not exists pgcrypto;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  duration_minutes integer not null default 30 check (duration_minutes between 10 and 240),
  active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.barbers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id),
  barber_id uuid not null references public.barbers(id),
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  total_cents integer not null check (total_cents >= 0),
  status text not null default 'pending_payment' check (status in ('pending_payment','confirmed','cancelled','expired')),
  payment_reference text,
  created_at timestamptz not null default now(),
  constraint booking_time_valid check (ends_at > starts_at)
);

create index if not exists bookings_barber_time_idx on public.bookings(barber_id, starts_at, ends_at);
create index if not exists bookings_status_idx on public.bookings(status);

alter table public.services enable row level security;
alter table public.barbers enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Anyone can view active services" on public.services;
create policy "Anyone can view active services" on public.services for select using (active = true);
drop policy if exists "Anyone can view active barbers" on public.barbers;
create policy "Anyone can view active barbers" on public.barbers for select using (active = true);
-- Customers cannot read or directly insert bookings. Booking creation is handled by the RPC below.

-- Expose only occupied appointment intervals, never customer details.
create or replace function public.get_busy_times(p_barber_id uuid, p_date date)
returns table(starts_at timestamptz, ends_at timestamptz)
language sql
security definer
set search_path = public
as $
  select b.starts_at, b.ends_at
  from public.bookings b
  where b.barber_id = p_barber_id
    and b.status in ('pending_payment','confirmed')
    and b.starts_at < (p_date + interval '1 day')
    and b.ends_at > p_date::timestamptz;
$;
revoke all on function public.get_busy_times(uuid,date) from public;
grant execute on function public.get_busy_times(uuid,date) to anon, authenticated;

create or replace function public.create_booking(
  p_service_id uuid,
  p_barber_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_starts_at timestamptz
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service public.services%rowtype;
  v_barber public.barbers%rowtype;
  v_ends_at timestamptz;
  v_booking_id uuid;
begin
  if length(trim(p_customer_name)) < 2 or length(trim(p_customer_phone)) < 7
     or position('@' in p_customer_email) < 2 then
    raise exception 'Please provide valid contact details.';
  end if;

  select * into v_service from public.services where id = p_service_id and active = true;
  if not found then raise exception 'This service is no longer available.'; end if;
  select * into v_barber from public.barbers where id = p_barber_id and active = true;
  if not found then raise exception 'This barber is no longer available.'; end if;

  v_ends_at := p_starts_at + make_interval(mins => v_service.duration_minutes);
  if p_starts_at <= now() then raise exception 'Please choose a future time.'; end if;

  -- Serialise booking attempts for this barber to prevent simultaneous overlapping appointments.
  perform pg_advisory_xact_lock(hashtext(p_barber_id::text));
  if exists (
    select 1 from public.bookings b
    where b.barber_id = p_barber_id
      and b.status in ('pending_payment','confirmed')
      and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(p_starts_at, v_ends_at, '[)')
  ) then
    raise exception 'That time has just been booked. Please choose another slot.';
  end if;

  insert into public.bookings(service_id, barber_id, customer_name, customer_phone, customer_email, starts_at, ends_at, total_cents)
  values (p_service_id, p_barber_id, trim(p_customer_name), trim(p_customer_phone), lower(trim(p_customer_email)), p_starts_at, v_ends_at, v_service.price_cents)
  returning id into v_booking_id;

  return jsonb_build_object('booking_id', v_booking_id, 'status', 'pending_payment');
end;
$$;

revoke all on function public.create_booking(uuid,uuid,text,text,text,timestamptz) from public;
grant execute on function public.create_booking(uuid,uuid,text,text,text,timestamptz) to anon, authenticated;

-- Initial editable examples. Change these prices, names and durations in Supabase before launch.
insert into public.services(name, description, price_cents, duration_minutes, sort_order)
select v.name,v.description,v.price_cents,v.duration_minutes,v.sort_order
from (values
  ('Standard Haircut','A clean, classic cut.',15000,30,1),
  ('Skin Fade','A detailed fade, finished sharp.',20000,45,2),
  ('Haircut & Beard','A fresh cut with beard shaping.',25000,60,3),
  ('Kids Haircut','A neat cut for the young ones.',12000,30,4)
) as v(name,description,price_cents,duration_minutes,sort_order)
where not exists (select 1 from public.services);

insert into public.barbers(name, bio, sort_order)
select v.name,v.bio,v.sort_order
from (values ('Barber 1','Your barber. Your style.',1),('Barber 2','Your barber. Your style.',2))
as v(name,bio,sort_order)
where not exists (select 1 from public.barbers);