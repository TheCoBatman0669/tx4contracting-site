# Supabase

The schema and edge function here are already applied to the live
`tx4-contracting` project (ref `jhcyijhcdjgnrcurpyzn`, region us-east-2). These
files exist so the database is under version control alongside the site.

## Required edge function secrets

Set in the dashboard under Project Settings -> Edge Functions -> Secrets.
The function refuses submissions without TURNSTILE_SECRET_KEY.

- TURNSTILE_SECRET_KEY   Cloudflare Turnstile secret (private half of the pair)
- IP_HASH_SALT           Long random string, generated once, never rotated
- ALLOWED_ORIGINS        Comma-separated site origins
- N8N_WEBHOOK_URL        Optional override, defaults to the configured webhook
- NOTIFICATION_EMAIL     Optional override, defaults to contracts@tx4contracting.com

SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
The service role key must never appear in the Next.js build or in Netlify.
