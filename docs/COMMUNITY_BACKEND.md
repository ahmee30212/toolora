# Toolora community backend setup

The production Worker already has a D1 database binding named DB connected to the Cloudflare database toolora-community-db. The public API accepts reviews and tool requests, but stores every new submission as pending; nothing is published automatically.

## Production database

- Cloudflare product: D1
- Database name: toolora-community-db
- Worker binding: DB
- Initial schema: migrations/0001_community.sql
- Verify the live binding through GET /api/health; it should return community: ready.

Do not create a second production database or replace the configured database ID unless intentionally migrating the data. Keep Cloudflare credentials and API tokens out of Git and chat.

## New-environment setup

For a separate development or replacement environment:

1. Create a D1 database in your own Cloudflare account.
2. Configure the DB binding in wrangler.toml with that database's ID.
3. Apply the community schema using the exact database name configured in Wrangler:

```sh
npx wrangler d1 migrations apply toolora-community-db --remote
```

4. Deploy only after CI passes, then verify /api/health.

## Safeguards

- Reviews and tool requests are stored as pending and are never published automatically.
- Public review reads return approved entries only.
- Request bodies are JSON-only and limited to 8 KB.
- Same-origin checks reject cross-site submissions.
- Input lengths, ratings and tool slugs are validated on the server and constrained again by SQL.
- A per-client, per-action submission limit uses a one-way SHA-256 digest; raw visitor IPs are not written to D1.
- No email address, account password or uploaded file is collected by these endpoints.
- Public endpoints never accept moderation status changes.

## Owner moderation

There is intentionally no website admin login or admin dashboard. Manage submissions from Cloudflare Dashboard → Workers & Pages → D1 → toolora-community-db → Console. Keep database access restricted to the owner's Cloudflare account.

Read-only queries to inspect pending submissions:

```sql
SELECT id, tool_slug, name, rating, review, created_at
FROM reviews
WHERE status = 'pending'
ORDER BY created_at ASC;

SELECT id, tool_name, description, created_at
FROM tool_requests
WHERE status = 'pending'
ORDER BY created_at ASC;
```

Approve or reject one item by its ID after reviewing its content:

```sql
UPDATE reviews SET status = 'approved' WHERE id = 1 AND status = 'pending';
UPDATE reviews SET status = 'rejected' WHERE id = 1 AND status = 'pending';

UPDATE tool_requests SET status = 'approved' WHERE id = 1 AND status = 'pending';
UPDATE tool_requests SET status = 'rejected' WHERE id = 1 AND status = 'pending';
```

Replace 1 with the actual row ID. Run only the single action you intend for each record. Never approve untrusted or abusive content.
