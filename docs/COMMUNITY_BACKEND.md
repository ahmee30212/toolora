# Toolora community backend setup

The Worker API is prepared, but public submissions remain disabled until you create and bind your own D1 database. No Cloudflare credentials or API tokens are needed in the repository.

## 1. Create the database in your Cloudflare account

1. Open Cloudflare Dashboard → Workers & Pages → D1 SQL Database.
2. Create a database named `toolora-community`.
3. Copy its database ID. Keep it private; do not post account tokens or passwords.

## 2. Add the D1 binding

In `wrangler.toml`, uncomment the `[[d1_databases]]` block and replace the placeholder with your database ID. Keep the binding name exactly `DB`.

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

The owner moderation interface and Cloudflare Access protection are a separate next phase. Do not approve records by changing public API parameters; moderation must remain owner-only. File processing continues in the visitor's browser and is not routed through this API.
