# Deployment Guide — The Foundation of Change

## Architecture Overview
```
WordPress (thefoundationofchange.org)     →  SEO, marketing, 50 state pages
Vercel    (app.thefoundationofchange.org) →  Dashboard, coursework, admin, payments
Supabase  (cloud)                         →  Database, auth, storage
Stripe    (cloud)                         →  Payment processing
```

---

## Step 1: Supabase Setup (10 minutes)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name: `thefoundationofchange`
3. Choose region closest to your users (US East recommended)
4. Save your generated **database password**
5. Once created, go to **SQL Editor** and run:
   - First: paste the contents of `supabase/schema.sql` → **Run**
   - Then: paste `supabase/seed.sql` → **Run** (sample data)
6. Go to **Settings → API** and copy:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → this is your `SUPABASE_SERVICE_ROLE_KEY`

### Make Yourself Admin
Go to **Table Editor → profiles** → find your row → change `role` to `admin`

---

## Step 2: Stripe Setup (10 minutes)

1. Go to [stripe.com](https://stripe.com) → create account or sign in
2. Use **Test Mode** first (toggle in top bar)
3. Go to **Developers → API Keys** and copy:
   - `Secret key` → `STRIPE_SECRET_KEY`
4. Go to **Developers → Webhooks → Add Endpoint**:
   - URL: `https://app.thefoundationofchange.org/api/webhook`
   - Events: select `checkout.session.completed`
   - Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## Step 3: Deploy to Vercel (5 minutes)

1. Push your repo to GitHub (if not already)
2. Go to [vercel.com](https://vercel.com) → **Import Project**
3. Select your GitHub repo: `thefoundationofchange`
4. Framework: **Next.js** (auto-detected)
5. Add **Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

6. Click **Deploy** — wait ~60 seconds
7. Your app is live at `your-project.vercel.app`

### Custom Domain
1. In Vercel → **Settings → Domains**
2. Add `app.thefoundationofchange.org`
3. Add the DNS records Vercel gives you to your domain registrar

---

## Step 4: WordPress Setup (30 minutes)

See [WORDPRESS_SETUP.md](wordpress/WORDPRESS_SETUP.md) for full WordPress instructions.

Quick version:
1. Get WordPress hosting (Cloudways or SiteGround)
2. Install WordPress, point `thefoundationofchange.org` to it
3. Install GeneratePress + Elementor Pro + RankMath
4. Create pages from the 50 HTML files in `wordpress/state-pages/`
5. All "Enroll Now" buttons link to `https://app.thefoundationofchange.org/start-now`

---

## Step 5: Register Your First Real Account

1. Go to `app.thefoundationofchange.org/register`
2. Sign up with your real email
3. In Supabase **Table Editor → profiles** → set your `role` to `admin`
4. Now visit `app.thefoundationofchange.org/admin` — you're the admin!

---

## Step 6: Clean Up Sample Data

When you're ready to remove the sample accounts:
1. Go to Supabase **SQL Editor**
2. Paste the contents of `supabase/cleanup-samples.sql`
3. Click **Run** — all sample data is removed

---

## Environment Variables Checklist

| Variable | Source | Required |
|----------|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | ✅ |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API Keys | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks | ✅ |

---

## Going Live Checklist

- [ ] Supabase: Schema + seed data loaded
- [ ] Supabase: Your account set to admin
- [ ] Stripe: Test mode working, webhook configured
- [ ] Vercel: Deployed with all env vars
- [ ] Custom domain: `app.thefoundationofchange.org` pointing to Vercel
- [ ] WordPress: Hosting set up, theme installed
- [ ] WordPress: 50 state pages created
- [ ] WordPress: RankMath configured, sitemap submitted to Google
- [ ] Stripe: Switch from test to live keys when ready
- [ ] Supabase: Run cleanup-samples.sql to remove demo data
