-- Cart upsell engine: given a pizza, suggest toppings ranked by
--   1) affinity  — how often that topping is added to THIS pizza (co-occurrence)
--   2) popularity — how often the topping is added to ANY pizza
--   3) default menu order (so we always return something, even with no history)
-- Excludes toppings already on the line. Aggregate-only output (no PII), so it's
-- SECURITY DEFINER + granted to anon so the customer cart can call it.

create or replace function public.cart_topping_suggestions(
  p_pizza_id uuid,
  p_exclude  uuid[] default '{}',
  p_limit    int    default 3
) returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with pizza_lines as (
    select id from order_items where pizza_id = p_pizza_id
  ),
  pizza_total as (
    select count(*)::int as n from pizza_lines
  ),
  affinity as (
    select oit.topping_id, count(*)::int as cnt
    from order_item_toppings oit
    join pizza_lines pl on pl.id = oit.order_item_id
    group by oit.topping_id
  ),
  popularity as (
    select topping_id, count(*)::int as cnt
    from order_item_toppings
    group by topping_id
  )
  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  from (
    select
      m.id                              as topping_id,
      m.name,
      m.price_paise,
      m.is_veg,
      coalesce(a.cnt, 0)                as affinity,
      (select n from pizza_total)       as pizza_total,
      coalesce(p.cnt, 0)                as popularity
    from menu_items m
    left join affinity a   on a.topping_id = m.id
    left join popularity p on p.topping_id = m.id
    where m.category = 'topping'
      and m.is_available
      and not (m.id = any(coalesce(p_exclude, '{}'::uuid[])))
    order by coalesce(a.cnt, 0) desc, coalesce(p.cnt, 0) desc, m.sort_order
    limit p_limit
  ) t;
$$;

grant execute on function public.cart_topping_suggestions(uuid, uuid[], int) to anon, authenticated;
