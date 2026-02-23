# WordPress Setup Guide — The Foundation of Change

## Quick Start

### 1. Install WordPress
- Sign up at **Cloudways** (recommended) or **SiteGround**
- Install WordPress with SSL enabled
- Point your domain `thefoundationofchange.org` to the server

### 2. Essential Plugins
Install these in **Plugins → Add New**:

| Plugin | Purpose |
|--------|---------|
| GeneratePress Premium | Lightweight, SEO-optimized theme |
| Elementor Pro | Page builder for landing pages |
| RankMath SEO | SEO, schema, sitemaps |
| WP Rocket | Speed + caching |
| ShortPixel | Image optimization |
| WPForms Lite | Contact form |
| Redirection | 301 redirects |

### 3. Theme Setup
1. Install **GeneratePress** from Appearance → Themes
2. Activate the premium module
3. Import the "starter site" closest to your design, then customize

### 4. RankMath SEO Configuration
1. Run the setup wizard → set Site Type to "Small Business"
2. Enable: Sitemap, Schema, SEO Analysis, 404 Monitor, Redirections
3. Set homepage title: `The Foundation of Change | Online Community Service Hours`
4. Set homepage description: `Complete your court-approved community service hours online. 501(c)(3) nonprofit. Accepted by courts and probation departments nationwide. Start today.`

### 5. Create State Pages
For each of the 50 state HTML files in `wordpress/state-pages/`:

1. Pages → Add New
2. Set page title: e.g., "Online Community Service Hours in Alabama"
3. Switch to Elementor editor
4. Copy the HTML content sections into Elementor widgets
5. Set the slug: `community-service-in-alabama`
6. In RankMath → set focus keyword: `online community service hours Alabama`
7. Set meta title and description from the HTML `<head>` section
8. Add the FAQ schema from the `<script>` tag via RankMath's Schema tab
9. Publish

### 6. Create States Hub Page
Create a parent page at `/community-service-by-state/` with a grid linking to all 50 states.

### 7. Navigation
Set up your WordPress menu:
- Home
- How It Works
- State Pages (dropdown with all 50 states)
- About Us
- FAQ
- Contact Us
- **Enroll Now** (button) → `https://app.thefoundationofchange.org/start-now`

### 8. Connect to Next.js App
All "Enroll Now" buttons link to your Next.js app subdomain:
```
https://app.thefoundationofchange.org/start-now
```
Set up the subdomain `app.` pointing to your Vercel deployment.

### 9. Speed Optimization
1. WP Rocket → Enable page caching, browser caching, minify CSS/JS
2. ShortPixel → Compress all images
3. Target: < 2s load time, 90+ PageSpeed score

### 10. Supabase Schema Update
Run this in your Supabase SQL Editor to add the timezone column:
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/New_York';
```
