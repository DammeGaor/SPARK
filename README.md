# 📚 Scholarly — Academic Writing Repository

A department-level academic writing repository built with **Next.js 15**, **Supabase**, and **Tailwind CSS**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Radix UI |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Forms | React Hook Form + Zod |
| Data Fetching | TanStack Query |
| Notifications | Resend (email) |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/scholarly.git
cd scholarly
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In your project dashboard, go to **SQL Editor**.
3. Run the entire contents of `supabase/schema.sql` — this sets up all tables, RLS policies, triggers, and seed data.
4. Go to **Storage** and create two buckets:
   - `study-files` — set to **Private**
   - `avatars` — set to **Public**
5. In **Storage → Policies**, add a policy on `study-files`:
   - Allow authenticated users to **INSERT** (upload)
   - Allow authenticated users to **SELECT** (download) their own files

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_resend_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Scholarly
```

> ⚠️ Never commit `.env.local` to git. It's in `.gitignore`.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 👤 Roles & Access

| Feature | Student | Faculty | Admin |
|---------|---------|---------|-------|
| Browse approved studies | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ |
| Submit study | ✅ | ✅ | ✅ |
| Comment | ✅ | ✅ | ✅ |
| Download | ✅ | ✅ | ✅ |
| View own submissions | ✅ | ✅ | ✅ |
| Validate/reject studies | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Manage categories | ❌ | ❌ | ✅ |

To make a user an admin or faculty: update their `role` in the `profiles` table in Supabase.

---

## 📁 Project Structure

```
scholarly/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Login, Register
│   ├── (main)/            # Public-facing pages
│   ├── admin/             # Admin/Faculty dashboard
│   └── api/               # API routes (download notify, etc.)
├── components/             # Reusable UI components
│   ├── ui/                # Primitive components (Button, Badge, etc.)
│   ├── layout/            # Navbar, Footer, Sidebar
│   ├── studies/           # Study-specific components
│   ├── search/            # Search components
│   └── admin/             # Admin-specific components
├── lib/
│   ├── supabase/          # Supabase client helpers
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript types
│   └── utils/             # Formatters, validators, helpers
├── supabase/
│   └── schema.sql         # Full database schema — run this first!
├── middleware.ts           # Auth route protection
├── tailwind.config.ts
├── next.config.ts
└── .env.local             # Your secrets (never commit)
```

---

## 📦 Key Dependencies Explained

- **`@supabase/ssr`** — Supabase client that works correctly in Next.js App Router (server + client components)
- **`react-hook-form` + `zod`** — Type-safe form handling and validation
- **`@tanstack/react-query`** — Smart data fetching with caching, loading states, and invalidation
- **`@radix-ui/*`** — Unstyled, accessible UI primitives (modals, dropdowns, tabs, etc.)
- **`resend`** — Transactional email for download notifications
- **`lucide-react`** — Icon library
- **`clsx` + `tailwind-merge`** — Safe Tailwind class merging utility
- **`date-fns`** — Date formatting

---

## 📧 Download Notifications

When a user downloads a study:
1. A row is inserted into the `downloads` table.
2. A Supabase database trigger fires and inserts a record into `notifications`.
3. The `/api/notify-download` Next.js API route can optionally send an email via Resend.

---

## 🗂️ Categories

The system supports a **maximum of 5 categories**, enforced at the database level via a PostgreSQL trigger. Default categories:

1. Thesis
2. Capstone Project
3. Research Paper
4. Case Study
5. Feasibility Study

Admins can rename/recolor these but cannot add more than 5.

---

## 🔍 Search

Full-text search is powered by PostgreSQL's `tsvector` with weighted fields:
- **A (highest)** — Title
- **B** — Abstract, Keywords  
- **C** — Adviser name

Advanced search supports filtering by category, year range, adviser, and sorting by relevance, date, or download count.
