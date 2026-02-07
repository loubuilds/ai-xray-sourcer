# AI X-ray Sourcer

Minimal Next.js (App Router) app with a safe Supabase client.

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

## Supabase test

The homepage runs a simple query:

`SELECT * FROM test LIMIT 1`

If the table doesn’t exist or env vars are missing, the page still renders and shows the error in the UI.
