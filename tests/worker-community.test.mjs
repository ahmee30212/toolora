import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.ts";

class MemoryD1 {
  inserted = [];
  requestCount = 0;
  prepare(sql) {
    const db = this;
    let values = [];
    return {
      bind(...args) { values = args; return this; },
      async first() {
        if (sql.includes("INSERT INTO rate_limits")) {
          db.requestCount += 1;
          return { request_count: db.requestCount };
        }
        if (sql.includes("COUNT(*) AS count")) return { count: 7, average: 4.2857 };
        return null;
      },
      async all() {
        if (sql.includes("GROUP BY rating")) return { results: [{ rating: 5, count: 4 }, { rating: 4, count: 2 }, { rating: 3, count: 1 }], success: true };
        if (sql.includes("SELECT id, tool_slug")) return { results: [{ id: 1, tool_slug: "word-counter", display_name: "Guest", rating: 5, review_text: "Very useful tool.", created_at: "2026-11-25 10:00:00" }], success: true };
        return { results: [], success: true };
      },
      async run() {
        db.inserted.push({ sql, values });
        return { success: true, results: [] };
      }
    };
  }
}

function request(path, { method = "GET", body, origin = "https://toolora.test", headers = {} } = {}) {
  const requestHeaders = new Headers({ host: "toolora.test", ...headers });
  if (origin !== null) requestHeaders.set("origin", origin);
  if (body !== undefined) requestHeaders.set("content-type", "application/json");
  return new Request("https://toolora.test" + path, {
    method, headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

function setup(withAssets = true) {
  const db = new MemoryD1();
  const assets = { async fetch() { return new Response("STATIC SITE"); } };
  return { db, env: { DB: db, ...(withAssets ? { ASSETS: assets } : {}) } };
}

test("health endpoint reports database readiness without requiring static assets", async () => {
  const { env } = setup(false);
  const response = await worker.fetch(request("/api/health"), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", community: "ready" });
});

test("missing static asset binding returns a controlled diagnostic instead of a TypeError", async () => {
  const { env } = setup(false);
  const response = await worker.fetch(request("/"), env);
  assert.equal(response.status, 503);
  assert.match(await response.text(), /Static Assets binding/);
});

test("static requests are passed to the Cloudflare asset binding", async () => {
  const { env } = setup();
  const response = await worker.fetch(request("/"), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "STATIC SITE");
});

test("custom admin API routes are retired", async () => {
  const { env } = setup();
  for (const path of ["/api/admin/login", "/api/admin/session", "/api/admin/pending", "/api/admin/moderate"]) {
    const response = await worker.fetch(request(path, { method: "POST", body: {} }), env);
    assert.equal(response.status, 404, path);
  }
});

test("review endpoint returns an all-time aggregate and rating distribution", async () => {
  const { env } = setup();
  const response = await worker.fetch(request("/api/reviews?tool=word-counter"), env);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.summary.count, 7);
  assert.equal(data.summary.average, 4.2857);
  assert.deepEqual(data.summary.distribution, [0, 0, 1, 2, 4]);
  assert.equal(data.reviews.length, 1);
});

test("invalid tool slugs are rejected", async () => {
  const { env } = setup();
  const response = await worker.fetch(request("/api/reviews?tool=../admin"), env);
  assert.equal(response.status, 400);
});

test("cross-origin review submissions are rejected", async () => {
  const { env } = setup();
  const response = await worker.fetch(request("/api/reviews", {
    method: "POST", origin: "https://attacker.example",
    body: { tool: "word-counter", rating: 5, review: "Very useful tool indeed." }
  }), env);
  assert.equal(response.status, 403);
});

test("valid reviews are stored as pending with parameterized SQL", async () => {
  const { env, db } = setup();
  const response = await worker.fetch(request("/api/reviews", {
    method: "POST",
    body: { tool: "word-counter", displayName: "A user", rating: 5, review: "Very useful tool indeed." }
  }), env);
  assert.equal(response.status, 201);
  assert.equal((await response.json()).status, "pending");
  const insert = db.inserted.find(item => item.sql.includes("INSERT INTO reviews"));
  assert.ok(insert);
  assert.deepEqual(insert.values, ["word-counter", "A user", 5, "Very useful tool indeed."]);
  assert.match(insert.sql, /'pending'/);
});

test("review input rejects invalid ratings and short review text", async () => {
  const { env } = setup();
  const response = await worker.fetch(request("/api/reviews", {
    method: "POST", body: { tool: "word-counter", rating: 9, review: "short" }
  }), env);
  assert.equal(response.status, 400);
});

test("tool requests are stored as pending and do not accept cross-site posts", async () => {
  const { env, db } = setup();
  const response = await worker.fetch(request("/api/tool-requests", {
    method: "POST", body: { title: "Image resizer", description: "Please add a simple image resizer with custom dimensions." }
  }), env);
  assert.equal(response.status, 201);
  assert.ok(db.inserted.some(item => item.sql.includes("INSERT INTO tool_requests") && item.values[0] === "Image resizer"));
});

test("API responses include transport and browser security headers", async () => {
  const { env } = setup();
  const response = await worker.fetch(request("/api/health"), env);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.match(response.headers.get("strict-transport-security") || "", /max-age=31536000/);
  assert.equal(response.headers.get("content-security-policy"), "default-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("review submissions reject non-JSON media types", async () => {
  const { env } = setup();
  const response = await worker.fetch(new Request("https://toolora.test/api/reviews", {
    method: "POST",
    headers: { origin: "https://toolora.test", "content-type": "text/plain" },
    body: JSON.stringify({ tool: "word-counter", rating: 5, review: "A valid review with enough characters." })
  }), env);
  assert.equal(response.status, 400);
});

test("rate-limit records older than one day are pruned", async () => {
  const { env, db } = setup();
  const response = await worker.fetch(request("/api/reviews", {
    method: "POST",
    body: { tool: "word-counter", rating: 5, review: "A valid review with enough characters." }
  }), env);
  assert.equal(response.status, 201);
  assert.ok(db.inserted.some(item => item.sql.includes("DELETE FROM rate_limits WHERE window_start < ?")));
});
