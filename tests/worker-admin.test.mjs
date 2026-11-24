import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.ts";

class MemoryD1 {
  activeSession = null;
  loginCount = 0;
  prepare(sql) {
    const db = this;
    let values = [];
    return {
      bind(...args) { values = args; return this; },
      async first() {
        if (sql.includes("sqlite_master")) return { name: "admin_sessions" };
        if (sql.includes("INSERT INTO rate_limits")) {
          db.loginCount += 1;
          return { request_count: db.loginCount };
        }
        if (sql.includes("SELECT token_hash, expires_at FROM admin_sessions")) return db.activeSession;
        return null;
      },
      async all() { return { results: [], success: true }; },
      async run() {
        if (sql.includes("INSERT INTO admin_sessions")) {
          db.activeSession = { token_hash: values[0], expires_at: values[1] };
        } else if (sql.includes("DELETE FROM admin_sessions")) {
          if (db.activeSession && db.activeSession.token_hash === values[0]) db.activeSession = null;
        }
        return { success: true, results: [] };
      }
    };
  }
}

function setup() {
  const db = new MemoryD1();
  let assetRequests = 0;
  const env = {
    DB: db,
    ADMIN_PASSWORD: "correct horse battery staple 2026",
    ADMIN_SESSION_SECRET: "independent-random-session-secret-32-bytes-minimum",
    ADMIN_LOGIN_PATH: "/test-only-0000000000000000000000000000000000000000000000000000000000000000/",
    ASSETS: { async fetch(request) { assetRequests += 1; const path = new URL(request.url).pathname; if (path === "/owner-auth/") return new Response("DECOY PAGE"); if (path === "/private-entry/") return new Response("PRIVATE ADMIN HTML"); return new Response("Not Found", { status: 404 }); } }
  };
  return { db, env, assetRequests: () => assetRequests };
}

function req(path, { method = "GET", cookie, body, origin = "https://toolora.test" } = {}) {
  const headers = new Headers({ host: "toolora.test" });
  if (origin !== null) headers.set("origin", origin);
  if (cookie) headers.set("cookie", cookie);
  if (body !== undefined) headers.set("content-type", "application/json");
  return new Request("https://toolora.test" + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

async function login(env, password = env.ADMIN_PASSWORD) {
  const response = await worker.fetch(req(env.ADMIN_LOGIN_PATH + "login", { method: "POST", body: { password } }), env);
  return { response, cookie: (response.headers.get("set-cookie") || "").split(";")[0] };
}

test("unauthenticated admin page is a plain 404 and never reaches static assets", async () => {
  const { env, assetRequests } = setup();
  const response = await worker.fetch(req("/admin/"), env);
  assert.equal(response.status, 404);
  assert.equal(await response.text(), "Not Found");
  assert.equal(assetRequests(), 0);
});

test("the public owner-auth route is only the decoy and never authenticates", async () => {
  const { env, assetRequests } = setup();
  const response = await worker.fetch(req("/owner-auth/"), env);
  assert.equal(response.status, 200);
  assert.equal(assetRequests(), 1);
  const privateAsset = await worker.fetch(req("/private-entry/"), env);
  assert.equal(privateAsset.status, 404);
  assert.equal(assetRequests(), 1);
});

test("only the configured high-entropy path serves the real login page", async () => {
  const { env, assetRequests } = setup();
  const wrong = await worker.fetch(req("/not-the-secret/"), env);
  assert.notEqual(wrong.status, 200);
  const correct = await worker.fetch(req(env.ADMIN_LOGIN_PATH), env);
  assert.equal(correct.status, 200);
  assert.equal(assetRequests(), 1);
  assert.match(correct.headers.get("cache-control") || "", /no-store/);
  assert.equal(correct.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
});

test("repeated percent-encoding cannot bypass the admin page gate", async () => {
  const { env, assetRequests } = setup();
  const response = await worker.fetch(req("/%2561dmin/"), env);
  assert.equal(response.status, 404);
  assert.equal(assetRequests(), 0);
});

test("dot-segment and encoded path traversal cannot resolve to the admin page", async () => {
  const { env, assetRequests } = setup();
  const response = await worker.fetch(req("/public/%252e%252e/%2561dmin/"), env);
  assert.equal(response.status, 404);
  assert.equal(assetRequests(), 0);
});

test("public legacy login API is disabled", async () => {
  const { env } = setup();
  const response = await worker.fetch(req(env.ADMIN_LOGIN_PATH + "login", { method: "POST", body: { password: env.ADMIN_PASSWORD } }), env);
  assert.equal(response.status, 404);
});

test("admin APIs reject unauthenticated callers", async () => {
  const { env } = setup();
  const response = await worker.fetch(req("/api/admin/pending"), env);
  assert.equal(response.status, 401);
});

test("successful login grants access and a second login invalidates the first session", async () => {
  const { env, assetRequests } = setup();
  const first = await login(env);
  assert.equal(first.response.status, 200);
  assert.match(first.cookie, /^__Host-toolora_admin=/);
  const firstCheck = await worker.fetch(req("/api/admin/session", { cookie: first.cookie }), env);
  assert.equal(firstCheck.status, 200);

  const second = await login(env);
  assert.equal(second.response.status, 200);
  assert.notEqual(second.cookie, first.cookie);

  const staleCheck = await worker.fetch(req("/api/admin/session", { cookie: first.cookie }), env);
  assert.equal(staleCheck.status, 401);
  const currentCheck = await worker.fetch(req("/api/admin/session", { cookie: second.cookie }), env);
  assert.equal(currentCheck.status, 200);

  const page = await worker.fetch(req("/admin/", { cookie: second.cookie }), env);
  assert.equal(page.status, 200);
  assert.equal(await page.text(), "PRIVATE ADMIN HTML");
  assert.match(page.headers.get("cache-control") || "", /no-store/);
  assert.equal(page.headers.get("cdn-cache-control"), "no-store");
  assert.equal(assetRequests(), 1);

  const postPage = await worker.fetch(req("/admin/", { method: "POST", cookie: second.cookie, body: {} }), env);
  assert.equal(postPage.status, 404);
  assert.equal(assetRequests(), 1);
});

test("a stale session logout cannot revoke the newer global session", async () => {
  const { env } = setup();
  const first = await login(env);
  const second = await login(env);

  const staleLogout = await worker.fetch(req("/api/admin/logout", {
    method: "POST", cookie: first.cookie, body: {}
  }), env);
  assert.equal(staleLogout.status, 200);
  const currentCheck = await worker.fetch(req("/api/admin/session", { cookie: second.cookie }), env);
  assert.equal(currentCheck.status, 200);

  const currentLogout = await worker.fetch(req("/api/admin/logout", {
    method: "POST", cookie: second.cookie, body: {}
  }), env);
  assert.equal(currentLogout.status, 200);
  const afterLogout = await worker.fetch(req("/api/admin/session", { cookie: second.cookie }), env);
  assert.equal(afterLogout.status, 401);
});

test("cross-origin login attempts are rejected", async () => {
  const { env } = setup();
  const response = await worker.fetch(req("/api/admin/login", {
    method: "POST", origin: "https://attacker.example", body: { password: env.ADMIN_PASSWORD }
  }), env);
  assert.equal(response.status, 403);
});

test("incorrect passwords do not create a session", async () => {
  const { env, db } = setup();
  const result = await login(env, "incorrect password that is long enough");
  assert.equal(result.response.status, 401);
  assert.equal(db.activeSession, null);
});
