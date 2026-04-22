# Acadmify — Frontend Website

**Stack:** React 18 + Vite | **Hosting:** Vercel (free) | **Domain:** acadmify.com

---

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open http://localhost:5173
```

---

## Deploy to Vercel (Free — Recommended)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial Acadmify website"
git remote add origin https://github.com/YOUR_USERNAME/acadmify.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New Project** → Import your `acadmify` repo
3. Framework: **Vite** (auto-detected)
4. Click **Deploy** — done in ~60 seconds

### Step 3: Connect Your Domain (acadmify.com)
1. In Vercel project → **Settings → Domains**
2. Add `acadmify.com` and `www.acadmify.com`
3. Vercel shows you DNS records to add in your domain registrar
4. Add the A record and CNAME — propagates in 5–30 minutes

---

## Project Structure

```
acadmify/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       ← Top navigation
│   │   ├── Home.jsx         ← Landing page
│   │   ├── Upload.jsx       ← 4-step order flow
│   │   ├── Track.jsx        ← Order tracking
│   │   ├── AdminLogin.jsx   ← Protected admin login
│   │   └── Admin.jsx        ← Orders + pricing dashboard
│   ├── constants/
│   │   └── index.js         ← Brand colours, bindings, demo data
│   ├── utils/
│   │   ├── pricing.js       ← Quote calculator
│   │   └── styles.js        ← Shared style helpers
│   ├── App.jsx              ← Page router
│   ├── main.jsx             ← React entry point
│   └── index.css            ← Global styles + scrollbar
├── index.html               ← Google Fonts, meta tags
├── vite.config.js
├── vercel.json              ← SPA rewrite rules
└── package.json
```

---

## Admin Panel

- **URL:** Click "Admin" in navbar → `/adminlogin`
- **Password:** `acadmify2025`
- **Change password:** Edit `ADMIN_PASSWORD` in `src/constants/index.js`

> ⚠ For production, move admin auth to Supabase (next phase).

---

## Pricing Configuration

Edit rates in **Admin Panel → Pricing tab** (in-memory for now).

To make pricing persistent, update `src/constants/index.js` and redeploy,
or connect Supabase in the next backend phase.

---

## Next Phase: Backend Integration

| Feature              | Tool             | Status    |
|----------------------|------------------|-----------|
| Real order storage   | Supabase (DB)    | Planned   |
| Thesis PDF uploads   | Supabase Storage | Planned   |
| Payment gateway      | Razorpay         | Planned   |
| WhatsApp notify      | WATI.io          | Planned   |
| Admin auth           | Supabase Auth    | Planned   |

> Ask Mukesh's Claude assistant to generate the Supabase schema and backend API next.

---

## Brand Reference

| Element   | Value                         |
|-----------|-------------------------------|
| Primary   | Academic Maroon `#7B2437`     |
| Accent    | Antique Gold `#C9A84C`        |
| Display   | EB Garamond                   |
| Mono      | DM Mono                       |
| Tagline   | PRINT • BIND • SUBMIT         |

---

*Built for Acadmify, Jodhpur, Rajasthan. © 2025*
