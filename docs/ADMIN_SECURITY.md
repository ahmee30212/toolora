# Toolora admin security setup

The owner sign-in form is served separately at `/owner-auth/`. The actual moderation dashboard at `/admin/` returns HTTP 404 unless a valid active owner session is presented. The Worker gates the page request before static assets are served. Pending records are never returned by public endpoints.

## Required Worker secrets

Before using the dashboard, configure these as **Worker secrets** for the production `toolora` Worker in Cloudflare. Do not add them to GitHub, `wrangler.toml`, source files, or chat.

- `ADMIN_PASSWORD`: a unique password with at least 20 characters. Use a password manager to generate and store it.
- `ADMIN_SESSION_SECRET`: an independently generated random secret with at least 32 characters. Do not reuse the admin password.

In Cloudflare Dashboard, open **Workers & Pages → toolora → Settings → Variables and Secrets → Add → Secret**. Add each secret separately and deploy/redeploy the Worker after saving if Cloudflare prompts you.

Apply `migrations/0002_admin_sessions.sql` to the production D1 database before enabling admin login. The application deliberately returns HTTP 503 for admin login until the migration and both secrets are configured. Do not weaken this check or put secrets in client-side code.

## Security behavior

- Password verification happens inside the Worker; the password is never stored in D1.
- Successful login issues a 4-hour `__Host-` cookie with `Secure`, `HttpOnly`, `SameSite=Strict`, and `Path=/`.
- D1 stores only a SHA-256 digest of the active session token in a singleton row. A successful login replaces that row, immediately invalidating any previous browser/device session. Only one active session exists globally.
- Session signatures use HMAC-SHA-256 and the separate session secret.
- Login attempts are limited to five per client hash per 10-minute window using the existing D1 rate-limit table.
- `/admin/` and all admin queue/moderation endpoints require the same valid, currently active session. Unauthenticated `/admin` requests receive a plain 404.
- The sign-in page contains only a password form; it does not expose the dashboard or pending content.
- Mutating admin requests require same-origin checks.
- Only pending reviews/tool requests can be transitioned to approved or rejected.
- The public API continues to expose approved reviews only.

## Owner responsibilities

Keep both secrets in a password manager. If either secret is exposed, rotate it immediately in Cloudflare. A password rotation invalidates the ability to log in with the old password; rotating the session secret invalidates all existing admin sessions.

This is an application-level owner password gate, not Cloudflare Access. Use a unique high-entropy password, protect the email/account used for Cloudflare, and do not share admin credentials with testers. The dashboard is not ready for use until production secrets are configured and the deployed login flow has been tested.
