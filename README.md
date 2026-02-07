# AI X-ray Sourcer

Minimal Next.js (App Router) app with Supabase Auth, basic data model, and a starter UI that mirrors the target workflow.

## Local setup

1. Install dependencies

```bash
npm install
```

2. Create a local env file (optional for local dev)

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=YOUR_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

3. Run the dev server

```bash
npm run dev
```

4. Build

```bash
npm run build
```

## Vercel settings

- Framework: Next.js
- Root Directory: `./`
- Build Command: `npm run build`
- Install Command: `npm install`

## Environment variables

Add these in Vercel (Project → Settings → Environment Variables):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL` (same as NEXT_PUBLIC_SUPABASE_URL)
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `OPENAI_API_KEY` (server-side only, optional for later AI)
- `BRAVE_SEARCH_API_KEY` (server-side only, used to run searches)

## Auth

The homepage uses Supabase Auth and shows a login form if no session exists.

For password sign-in, make sure email/password auth is enabled in Supabase.

## Password reset (SMTP required)

If you want “Forgot password” emails to work, configure SMTP in Supabase:

Authentication → Email → SMTP Settings.

Also add `/reset` to your redirect URLs in Supabase Auth URL Configuration.

## Database setup

Run the SQL in:

`supabase/schema.sql`
