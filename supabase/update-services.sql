-- X Barbershop: replace the active haircut menu with the two agreed services.
-- Run this once in Supabase Dashboard > SQL Editor > New query.
-- Existing bookings and old service records are preserved; old services are made inactive.

begin;

update public.services
set active = false
where active = true;

insert into public.services (name, description, price_cents, duration_minutes, active, sort_order)
select v.name, v.description, v.price_cents, 45, true, v.sort_order
from (values
  ('Fade', 'A clean, sharp fade.', 5000, 1),
  ('Fade with Dye', 'A fresh fade finished with hair dye.', 7000, 2)
) as v(name, description, price_cents, sort_order)
where not exists (
  select 1 from public.services s where lower(trim(s.name)) = lower(v.name)
);

update public.services
set description = case name
    when 'Fade' then 'A clean, sharp fade.'
    when 'Fade with Dye' then 'A fresh fade finished with hair dye.'
  end,
  price_cents = case name
    when 'Fade' then 5000
    when 'Fade with Dye' then 7000
  end,
  duration_minutes = 45,
  active = true,
  sort_order = case name
    when 'Fade' then 1
    when 'Fade with Dye' then 2
  end
where name in ('Fade', 'Fade with Dye');

commit;

-- Verify the active menu:
select name, price_cents, duration_minutes, active, sort_order
from public.services
where active = true
order by sort_order;
