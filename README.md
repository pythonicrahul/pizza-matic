# 🍕 SliceMatic

Full-stack pizza ordering + delivery app. Customers build a pizza and order it;
admins manage orders, kitchen, delivery and see analytics/forecasts; riders
fulfil deliveries. Built with **Next.js 16 (App Router) + TypeScript + Tailwind**,
**Supabase Postgres/Auth**, **Razorpay** payments, and an **OpenAI**-powered
recommendation engine.

## Features

- **Customer:** phone (mock-OTP) login, Zomato-style pizza builder, AI menu pick,
  cart with topping upsell, delivery with a 4 km geofence **or** take-away/dine-in
  (auto-selected when you're at the store), saved addresses, Razorpay/COD, live
  order tracking, order history.
- **Admin:** orders + filters + CSV, revenue / top pizza / busiest hour, live
  kitchen board, rider onboarding + FIFO delivery dispatch, demand-forecast heatmap.
- **Rider:** online toggle, assigned delivery, pickup → delivered.

## Quick start

```bash
npm install
cp .env.sample .env            # fill in Supabase / Razorpay / OpenAI keys (see below)

# database (Supabase CLI)
npx supabase login && npx supabase link --project-ref <your-ref>
npx supabase db push           # applies migrations (schema, RLS, RPCs)
npm run seed:menu              # load menu items from supabase/seed/menu/*.txt
npm run seed:admin             # create the admin login
npm run seed:orders            # optional: demo order history (analytics/upsell)

npm run dev                    # http://localhost:3000
```

Three surfaces: customer at `/`, **admin** at `/admin` (login from `ADMIN_EMAIL`/
`ADMIN_PASSWORD`), **rider** at `/rider` (onboard riders from the admin Delivery
tab). Customer login OTP in demo mode is **`123456`**.

### Env (`.env`)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_SECRET_KEY` · `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` +
`NEXT_PUBLIC_RAZORPAY_KEY_ID` · `AI_PROVIDER` + `OPENAI_API_KEY`/`OPENAI_MODEL` ·
`SESSION_SECRET` · `OTP_MOCK`/`OTP_DEV_CODE` · `ADMIN_EMAIL`/`ADMIN_PASSWORD` ·
store: `NEXT_PUBLIC_SHOP_{NAME,AREA,LAT,LNG}` + `NEXT_PUBLIC_DELIVERY_RADIUS_KM` /
`NEXT_PUBLIC_TAKEAWAY_RADIUS_KM`.

## Scripts

`npm run dev | build | start | lint | test` · `seed:menu | seed:admin | seed:orders`
Demand forecast (Python): `pip install -r forecast/requirements.txt && python forecast/train.py`

## API

Auth uses an httpOnly session cookie (customer) or Supabase Auth (admin/rider).

**Customer**
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/otp/request` · `/verify` | request / verify OTP (sets session) |
| GET · POST | `/api/auth/me` · `/api/auth/logout` | current session · sign out |
| POST | `/api/cart/price` | authoritative cart total |
| POST | `/api/cart/upsell` | topping suggestions per pizza |
| GET | `/api/ai/recommend` | personalized pizza pick |
| GET · POST · DELETE | `/api/addresses` | saved delivery addresses |
| POST | `/api/orders` | place an order (delivery/take-away) |
| POST | `/api/payments/create` · `/verify` | Razorpay order + signature verify |
| POST | `/api/webhooks/razorpay` | async payment status |

**Admin** (Supabase Auth, role=admin)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/kitchen` | live kitchen board feed |
| POST | `/api/admin/kitchen/done` | mark order ready (auto-dispatch) |
| GET | `/api/admin/orders/csv` | export filtered orders |
| POST · DELETE | `/api/admin/riders` | onboard / remove a rider |

**Rider** (Supabase Auth, role=rider)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/rider/current` | current assignment + online state |
| POST | `/api/rider/online` | toggle availability |
| POST | `/api/rider/advance` | pickup → delivered |

## Business rules

Money is integer paise with banker's rounding. `unit = base + pizza + Σ toppings`;
`discount = 10%` of subtotal when qty ≥ 5; `GST = 18%` on (subtotal − discount);
`total = subtotal − discount + GST`. Pricing is recomputed server-side from DB
prices on every order — client totals are never trusted. Business params
(discount threshold/%, GST) live in the `settings` table (changeable without a
deploy); store location + radii come from env.

## Testing & deploy

`npm test` runs the Vitest suite (pricing, money, validators, geo, cart, AI,
Razorpay signatures, admin utils). Deploy the app to **Vercel** and keep the
data on **Supabase**; set the same env vars in the Vercel project.
