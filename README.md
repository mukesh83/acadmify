# Acadmify — website (frontend)

React 18 + Vite, hosted on Vercel at https://acadmify.com. Reads website text, prices and gallery
photos straight from Supabase; places and tracks orders through the backend on Render.

## Run it on your PC (CMD)

```
cd C:\Projects\acadmify
npm install
copy .env.example .env
npm run dev
```

Open http://localhost:5173. Fill in `.env` first (see `.env.example`), otherwise the site shows
its built-in default text and prices and the admin panel says it is not set up.

`npm run build` checks that everything compiles — run it before every push.

## Pages

| Address | What it is |
|---|---|
| `/` | Homepage: hero with cover-colour preview, calculator, prices, reviews, FAQ |
| `/upload` | Place an order in 3 steps (details + PDF, print options, review) |
| `/track` | Track an order with its number + last 4 digits of the phone |
| `/contact` | Address, hours, map |
| `/privacy` `/terms` `/refund` `/shipping` | Policies |
| `/admin` | Admin panel (Supabase login). The old `/#admin-mukesh` link redirects here. |

## Where to change things

| To change… | Go to |
|---|---|
| Any website text, hours, phone, social links, YouTube videos, reviews | Admin → Website text (no code) |
| Prices | Admin → Pricing (no code) — the calculator, price list, FAQ and orders all follow |
| Gallery photos | Admin → Gallery (no code) |
| Cover colours | `src/constants.js` (also update the list in the backend `src/routes/orders.js`) |
| Price maths | `src/lib/pricing-core.js` — keep it identical to the backend copy |
| Policy wording | `src/pages/policies.js` |
| Look and layout | `src/styles.css` |
| Search engine tags | `index.html` and `src/lib/seo.js` |

## Environment variables (Vercel → Settings → Environment Variables, then Redeploy)

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://<project>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | anon (legacy) or `sb_publishable_…` key — public by design |
| `VITE_API_URL` | `https://acadmify-api.onrender.com` |
| `VITE_GA_ID` | optional Google Analytics id `G-XXXXXXX` |

Never put the Supabase service_role / secret key here.

## Deploy

```
git add .
git commit -m "describe the change"
git push
```

Vercel publishes about a minute later.
