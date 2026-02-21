# The Foundation of Change — Site Analysis & Migration Plan

> **Client**: The Foundation of Change (501(c)(3) Nonprofit — EIN: 33-5003265)
> **Current Platform**: Wix
> **Target Platform**: Vercel (Next.js) + Supabase
> **Date**: 2026-02-21

---

## 1. Organization Overview

**The Foundation of Change** is a 501(c)(3) nonprofit providing **court-recognized online community service hours**. Participants complete self-paced educational coursework from home, earn verified certificates of completion, and use them to meet court, school, or probation requirements.

- **Founded**: 2025
- **Coverage**: All 50 US states + select Canadian provinces
- **Email**: info@thefoundationofchange.org
- **Phone**: 734-834-6934
- **Partner**: Schroeder Counseling (provides additional course content)
- **Pricing**: Programs start at $28.99, based on hours required

---

## 2. Current Site Map (13+ pages)

### Primary Navigation
| Page | URL Path | Purpose |
|------|----------|---------|
| Home | `/` | Landing page — hero, transparency section, certificate preview, CTA |
| Community Service Program | `/community` | Program details, who it's for, state-by-state acceptance, FAQ |
| FAQ | `/faq` | 7 accordion-style Q&A items |
| Coursework | `/coursework` | Wix Members Area (courses/LMS) — locked behind auth |
| Additional Services | `/additional-services` | Partner services (Schroeder Counseling links) |
| Contact Us | `/contact-us` | Contact form, 1-2 business day response |

### Secondary/Supporting Pages
| Page | URL Path | Purpose |
|------|----------|---------|
| How to Register | `/how-to-register` | 5-step registration walkthrough |
| How It Works | `/how-it-works` | System explanation for institutions |
| Certificate Verification | `/certificate-verification` | **Portal** — form lookup by name/code, displays status/hours |
| About Us | `/about-us` | Mission, org overview, legal info, program details |
| Our Guarantee | `/our-guarantee` | Program breakdown, pricing tiers, commitment |
| Letters of Introduction | `/letter-of-introductions` | PDF downloads for courts/schools/probation |
| Start Now | `/start-now` | Program selection (Wix pricing/plans widget) |

### Legal Pages
| Page | URL Path |
|------|----------|
| Privacy Policy | `/privacy-policy` |
| Terms of Service | `/terms-of-service` |
| Refund Policy | `/terms-of-service-1` |

### Auth/Member Pages
| Page | URL Path |
|------|----------|
| Register | `/register` |
| Members Area/Login | `/members-area/my/my-account` |

---

## 3. Key Features & Functionality

### 3.1 Certificate Verification Portal
- **Public-facing** form where courts/probation officers enter participant details
- Looks up by: Name, Location, Verification Code
- Returns: Status, hours completed, certificate ID, completion date
- Includes "Download PDF Hour Log" functionality
- Manual verification fallback via email

### 3.2 Member/Student System (Wix Members Area)
- User registration & login
- Coursework/LMS (100+ educational courses)
- Built-in time tracking (pauses when inactive)
- Progress auto-save
- 8-hour daily limit enforcement
- Reflection/engagement submissions
- Certificate auto-generation upon completion

### 3.3 Payment System
- One-time fee based on selected hours
- Programs start at $28.99
- Tiered: 1-5h, 6-10h, 11-25h, up to 1000h
- Refund policy: before coursework started & within 2 days

### 3.4 Certificate Generation
- PDF with: full name, verified hours, timestamp, unique verification code, provider signature, EIN
- Includes daily hour log PDF

### 3.5 Contact Form
- Standard contact form (name, email, message)
- 1-2 business day response time

### 3.6 Static Content
- About Us (mission, legal, transparency)
- FAQ (accordion)
- How It Works (step-by-step process)
- Letters of Introduction (PDF downloads)
- Partner links to Schroeder Counseling

---

## 4. Shared Layout Elements

### Header
- Logo + org name
- Nav: Home, Community Service Program, FAQ, Coursework, Additional Services, Contact Us
- CTA button: "Get Started" → `/how-to-register`

### Footer (3-column)
- **Column 1 — About the program**: How It Works, FAQ, Court Acceptance
- **Column 2 — Verification & Documents**: Verify a Certificate, Sample Enrollment Letter, Attendance Policy, Refund Policy
- **Column 3 — Contact Us**: Email, Secure Contact Form link
- Partner section: "Other Programs" with Schroeder Counseling links
- Legal links: Privacy, Terms, Refund Policy
- Copyright: © 2026 The Foundation of Change - 501(c)(3) Nonprofit - EIN: 33-5003265

### Bottom Footer
- Compact nav: Home, Contact Us, Terms, Privacy, Certificate Verification, FAQ

---

## 5. Migration Plan — Vercel + Supabase

### Tech Stack
| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Hosting** | Vercel |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Storage** | Supabase Storage (PDFs, certificates) |
| **Payments** | Stripe (replaces Wix payments) |
| **Email** | Resend or Supabase Edge Functions + SMTP |
| **Styling** | CSS Modules or Tailwind (TBD with client) |

### ⚠️ Design Note: Google Stitch Redesign In Progress
The client is actively working on a **UI redesign in Google Stitch**. This means:
- **The visual design is NOT final** — expect new layouts, components, and styles to arrive
- Stitch can export design tokens, CSS, and component structures
- **Our architecture must separate content/logic from presentation** so we can swap UI without touching business logic

**Architecture decisions to support this:**
1. **Component-based structure** — small, reusable UI components in `/components/ui/` that can be replaced wholesale
2. **Design tokens** — colors, typography, spacing in a central `tokens.css` or theme file, easy to overwrite with Stitch exports
3. **Content in data layer** — page content (FAQ items, program descriptions, etc.) stored in Supabase or JSON files, not hardcoded in JSX
4. **Layout vs. content separation** — layouts in `layout.tsx`, page content in `page.tsx`, UI primitives in `components/`
5. **CSS Modules preferred** — scoped styles per component, easy to replace one at a time without side effects

---

### Phase 1: Foundation & Static Pages 🏗️
**Goal**: Recreate the public-facing site with identical content, improved design

**Tasks**:
1. Initialize Next.js project, deploy to Vercel
2. Set up shared layout (header, footer, navigation)
3. Build static pages:
   - `/` — Home (hero, transparency, certificate preview, CTAs)
   - `/about-us` — About Us
   - `/community` — Community Service Program (with state list)
   - `/faq` — FAQ (accordion component)
   - `/how-it-works` — How It Works
   - `/how-to-register` — Registration walkthrough
   - `/our-guarantee` — Program breakdown & pricing
   - `/additional-services` — Partner services
   - `/letter-of-introductions` — PDF download links
   - `/contact-us` — Contact form (basic, sends email)
4. Legal pages: `/privacy-policy`, `/terms-of-service`, `/refund-policy`
5. SEO: meta tags, OG images, structured data (NonprofitOrganization schema)
6. Responsive design (mobile-first)

**Deliverable**: Fully deployed static site on Vercel, visual parity with Wix

---

### Phase 2: Auth & User System 🔐
**Goal**: Replace Wix Members Area with Supabase Auth

**Tasks**:
1. Set up Supabase project
2. Design user schema:
   - `profiles` (name, email, phone, state, created_at)
   - `enrollments` (user_id, program_type, hours_required, hours_completed, status, payment_id)
3. Implement auth flows:
   - Registration (`/register`)
   - Login (`/login`)
   - Password reset
   - Email verification
4. Build member dashboard (`/dashboard`)
   - View enrollment status
   - View progress (hours completed / required)
   - Download certificates

**Deliverable**: Users can register, log in, and view their dashboard

---

### Phase 3: Payment Integration 💳
**Goal**: Accept payments for program enrollment

**Tasks**:
1. Set up Stripe account (nonprofit pricing if available)
2. Create product catalog matching current tiers:
   - 1-5 hours ($28.99+)
   - 6-10 hours
   - 11-25 hours
   - Up to 1000 hours
3. Build program selection page (`/start-now`)
4. Stripe Checkout integration
5. Webhook handler: on payment success → create enrollment record in Supabase
6. Receipt emails

**Deliverable**: End-to-end payment flow, enrollment auto-created on purchase

---

### Phase 4: Coursework / LMS Engine 📚
**Goal**: Replace Wix's built-in course system

**Tasks**:
1. Design course schema:
   - `courses` (title, description, content, order)
   - `articles` (course_id, title, body, read_time_minutes, order)
   - `reflections` (article_id, user_id, response_text, submitted_at, status)
   - `time_logs` (user_id, enrollment_id, date, seconds_tracked, articles_completed)
2. Build coursework page (`/coursework`)
   - Article reader with progress tracking
   - Built-in timer (pauses on inactivity — idle detection)
   - Reflection submission forms after articles
   - 8-hour daily cap enforcement
   - Auto-save progress
3. Admin review interface for reflections (stretch)

**Deliverable**: Participants can read articles, submit reflections, track time

---

### Phase 5: Certificate System 🎓
**Goal**: Auto-generate and verify certificates

**Tasks**:
1. Certificate PDF generation (use `@react-pdf/renderer` or server-side PDF lib)
   - Participant full name
   - Total verified hours + completion timestamp
   - Unique verification code (UUID or short hash)
   - Provider signature + EIN
2. Daily hour log PDF generation
3. Store certificates in Supabase Storage
4. Build Certificate Verification Portal (`/certificate-verification`)
   - Public form: name + verification code lookup
   - Returns: status, hours, certificate ID, completion date
   - "Download PDF Hour Log" button
5. Member dashboard: certificate download button

**Deliverable**: Auto-generated certificates, public verification portal

---

### Phase 6: Admin Panel & Operations 🛠️
**Goal**: Give the client tools to manage the platform

**Tasks**:
1. Admin dashboard (`/admin`)
   - View all enrollments, filter by status
   - Review submitted reflections (approve/flag)
   - Search participants
   - View payment history
2. Manual certificate verification (admin side)
3. Contact form submissions management
4. Basic analytics (enrollments/day, revenue, completion rates)

**Deliverable**: Operational admin panel for day-to-day management

---

### Phase 7: Polish & Launch 🚀
**Goal**: Production readiness

**Tasks**:
1. Domain transfer / DNS update to Vercel
2. Email setup (transactional: welcome, payment receipt, certificate ready)
3. Error monitoring (Sentry or similar)
4. Performance optimization (Core Web Vitals)
5. Accessibility audit (WCAG 2.1 AA)
6. Security review (RLS policies, input validation, rate limiting)
7. Client training / handoff documentation
8. Data migration from Wix (existing users, enrollments if any)

**Deliverable**: Live site at thefoundationofchange.org

---

## 6. Supabase Database Schema (Draft)

```sql
-- Users handled by Supabase Auth (auth.users)

-- Extended profile
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  state TEXT,
  role TEXT DEFAULT 'participant', -- 'participant' | 'admin'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Program enrollments
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  hours_required INTEGER NOT NULL,
  hours_completed NUMERIC(6,2) DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active' | 'completed' | 'suspended'
  stripe_payment_id TEXT,
  amount_paid NUMERIC(8,2),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Course content
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  estimated_minutes INTEGER DEFAULT 10,
  sort_order INTEGER DEFAULT 0
);

-- Participant reflections
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  enrollment_id UUID REFERENCES enrollments(id),
  article_id UUID REFERENCES articles(id),
  response_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'flagged'
  reviewed_by UUID REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- Time tracking
CREATE TABLE time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  enrollment_id UUID REFERENCES enrollments(id),
  date DATE NOT NULL,
  seconds_tracked INTEGER DEFAULT 0,
  articles_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Certificates
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES enrollments(id),
  user_id UUID REFERENCES profiles(id),
  verification_code TEXT UNIQUE NOT NULL,
  hours_verified NUMERIC(6,2) NOT NULL,
  pdf_url TEXT,
  hour_log_pdf_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT now()
);

-- Contact form submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- 'new' | 'replied' | 'closed'
  submitted_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. Priority Order & Recommendations

1. **Start with Phase 1** — get the static site live fast to prove the new platform
2. **Phase 2+3 together** — auth and payments are tightly coupled (no account without enrollment)
3. **Phase 4 is the big one** — the LMS/time-tracking is the core product and most complex
4. **Phase 5 follows naturally** — certificates depend on completed coursework
5. **Phase 6 can be minimal** — start with a simple admin view, iterate based on client needs
6. **Phase 7 is ongoing** — launch can happen after Phase 5, with Phase 6 following

### Key Risks
- **Course content migration** — need to extract 100+ articles from Wix (manual or API export)
- **Time tracking accuracy** — needs robust idle detection; this is the core compliance feature
- **Certificate trust** — verification portal must be reliable (99.9% uptime target per their docs)
- **Existing user data** — may need to migrate users/enrollments from Wix

### Quick Wins
- Modern, faster site (Wix is heavy)
- Better SEO (Next.js SSR/SSG)
- Custom certificate verification portal (not limited by Wix)
- Full control over the LMS experience
- Lower ongoing costs (no Wix subscription)
