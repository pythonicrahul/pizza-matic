-- Delivery dispatch module.
--
-- Model: a rider handles ONE delivery at a time. Deliveries become dispatchable
-- when the kitchen marks the order "ready". dispatch_deliveries() pairs the
-- oldest ready-and-unassigned delivery with the longest-waiting available rider,
-- FIFO, until it runs out of one side (the rest stay queued). It's re-run
-- whenever the pool changes: order ready, rider goes online, delivery completed.

alter table profiles add column if not exists is_online boolean not null default false;

-- --------------------------------------------------------------------------- --
-- dispatch_deliveries(): assign queued deliveries to available riders.
-- --------------------------------------------------------------------------- --
create or replace function public.dispatch_deliveries() returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assigned  int := 0;
  v_delivery  uuid;
  v_rider     uuid;
begin
  perform pg_advisory_xact_lock(hashtext('slicematic_dispatch'));

  loop
    -- oldest ready + unassigned delivery
    select d.id
      into v_delivery
      from deliveries d
      join orders o on o.id = d.order_id
     where d.status = 'unassigned'
       and o.status = 'ready'
     order by o.placed_at asc
     limit 1;
    exit when v_delivery is null;

    -- an online rider who is not already on a delivery (longest idle first)
    select p.id
      into v_rider
      from profiles p
     where p.role = 'rider'
       and p.is_online = true
       and not exists (
         select 1 from deliveries dd
          where dd.rider_id = p.id
            and dd.status in ('assigned', 'picked_up', 'out_for_delivery')
       )
     order by p.created_at asc
     limit 1;
    exit when v_rider is null;

    update deliveries
       set rider_id = v_rider, status = 'assigned', assigned_at = now()
     where id = v_delivery;

    v_assigned := v_assigned + 1;
  end loop;

  return v_assigned;
end;
$$;

-- --------------------------------------------------------------------------- --
-- rider_set_online(): a rider toggles their own availability, then dispatch.
-- --------------------------------------------------------------------------- --
create or replace function public.rider_set_online(p_online boolean) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rider uuid := auth.uid();
begin
  if v_rider is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from profiles where id = v_rider and role = 'rider') then
    raise exception 'not a rider';
  end if;

  update profiles set is_online = p_online where id = v_rider;
  if p_online then perform public.dispatch_deliveries(); end if;
end;
$$;

-- --------------------------------------------------------------------------- --
-- rider_advance_delivery(): move the caller's active delivery forward.
--   'pickup'  → out_for_delivery   (order out_for_delivery)
--   'deliver' → delivered          (order delivered, then dispatch next)
-- Only ever touches the caller's own delivery (auth.uid()).
-- --------------------------------------------------------------------------- --
create or replace function public.rider_advance_delivery(p_action text) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rider    uuid := auth.uid();
  v_delivery uuid;
  v_order    uuid;
  v_status   delivery_status;
begin
  if v_rider is null then raise exception 'not authenticated'; end if;

  select d.id, d.order_id, d.status
    into v_delivery, v_order, v_status
    from deliveries d
   where d.rider_id = v_rider
     and d.status in ('assigned', 'picked_up', 'out_for_delivery')
   order by d.assigned_at asc
   limit 1;
  if v_delivery is null then return 'none'; end if;

  if p_action = 'pickup' and v_status in ('assigned', 'picked_up') then
    update deliveries set status = 'out_for_delivery', picked_up_at = coalesce(picked_up_at, now())
     where id = v_delivery;
    update orders set status = 'out_for_delivery' where id = v_order;
    return 'out_for_delivery';

  elsif p_action = 'deliver' and v_status = 'out_for_delivery' then
    update deliveries set status = 'delivered', delivered_at = now() where id = v_delivery;
    update orders set status = 'delivered' where id = v_order;
    perform public.dispatch_deliveries(); -- assign the rider's next job
    return 'delivered';
  end if;

  return v_status::text; -- no-op if action doesn't match current state
end;
$$;

grant execute on function public.dispatch_deliveries()          to authenticated;
grant execute on function public.rider_set_online(boolean)      to authenticated;
grant execute on function public.rider_advance_delivery(text)   to authenticated;
