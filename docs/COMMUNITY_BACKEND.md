# Toolora community backend setup

The Worker API is prepared, but public submissions remain disabled until you create and bind your own D1 database. No Cloudflare credentials or API tokens are needed in the repository.

## 1. Create the database in your Cloudflare account

1. Open Cloudflare Dashboard → Workers & Pages → D1 SQL Database.
2. Create a database named `toolora-community`.
3. Copy its database ID. Keep it private; do not post account tokens or passwords.

## 2. Add the D1 binding

In `wrangler.toml`, keep the existing `[[d1_databases]]` binding configured as `DB`; verify its database ID matches your Cloudflare D1 database. Keep the binding name exactly `DB`.

## 3. Apply the migration

From the repository root, run:

```sh
npx wrangler d1 migrations apply toolora-community --remote
```

## 4. Verify

Deploy only after CI passes. Then open `/api/health`; the response should report `community: "ready"`.

## Current safeguards

- Reviews and tool requests are stored as pending and are never published automatically.
- Public review reads return approved entries only.
- Request bodies are JSON-only and limited to 8 KB.
- Same-origin checks reject cross-site submissions.
- Input lengths, ratings and tool slugs are validated on the server and constrained again by SQL.
- A per-client, per-action submission limit is stored using a one-way SHA-256 digest; raw visitor IPs are not written to D1.
- No email address, account password or uploaded file is collected by these endpoints.

## Important

Custom website login and admin routes are intentionally not part of Toolora. The owner manages pending moderation records directly in the Cloudflare D1 dashboard using SQL. Keep database access restricted to the owner’s Cloudflare account. The public API exposes approved records only; there is no public approval or moderation endpoint. File processing continues in the visitor's browser and is not routed through this API.


## Owner moderation in Cloudflare D1

There is no Toolora admin login or admin dashboard. Manage submissions from Cloudflare Dashboard → Workers & Pages → D1 → `toolora-community-db` → Console. Run these read-only queries to inspect pending submissions:

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

Replace `1` with the actual row ID. Run only the single action you intend for each record. Public endpoints never accept moderation status changes; only approved rows are returned.
