interface D1Result<T = unknown> { results?: T[]; success: boolean; }
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}
interface D1Database { prepare(query: string): D1PreparedStatement; }
interface AssetFetcher { fetch(request: Request): Promise<Response>; }
interface Env {
  ASSETS: AssetFetcher;
  DB?: D1Database;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
}

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "cache-control": "no-store"
};
const COOKIE_NAME = "__Host-toolora_admin";
const SESSION_SECONDS = 4 * 60 * 60;
const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...SECURITY_HEADERS, ...extra } });
const fail = (message: string, status: number) => json({ error: message }, status);
const cleanText = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validSlug = (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
const encoder = new TextEncoder();

async function clientKey(request: Request): Promise<string> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode("toolora-community-v1:" + ip));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function allowSubmission(db: D1Database, request: Request, action: string, limit = 5): Promise<boolean> {
  const key = await clientKey(request);
  const windowStart = Math.floor(Date.now() / 600000) * 600;
  const row = await db.prepare(`
    INSERT INTO rate_limits (client_hash, action, window_start, request_count)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(client_hash, action, window_start) DO UPDATE SET
      request_count = rate_limits.request_count + 1
    RETURNING request_count
  `).bind(key, action, windowStart).first<{ request_count: number }>();
  return Boolean(row && row.request_count <= limit);
}

async function readBody(request: Request, maxBytes = 8192): Promise<Record<string, unknown> | null> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBytes) return null;
  const raw = await request.text();
  if (encoder.encode(raw).byteLength > maxBytes) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
  } catch { return null; }
}

function sameOrigin(request: Request, url: URL): boolean {
  return request.headers.get("origin") === url.origin &&
    request.headers.get("sec-fetch-site") !== "cross-site";
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function fromBase64Url(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
    return Uint8Array.from(binary, char => char.charCodeAt(0));
  } catch { return null; }
}

async function hmac(secret: string, value: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

async function secureEqual(a: string, b: string): Promise<boolean> {
  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b))
  ]);
  const x = new Uint8Array(left), y = new Uint8Array(right);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

async function makeSession(secret: string, nonce: string): Promise<string> {
  const expiry = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  const payload = expiry + "." + nonce;
  return payload + "." + toBase64Url(await hmac(secret, "toolora-admin-v1:" + payload));
}

function sessionCookie(token: string, maxAge: number): string {
  return COOKIE_NAME + "=" + token + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" + maxAge;
}

async function tokenDigest(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

function readSessionToken(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.split(";").map(part => part.trim()).find(part => part.startsWith(COOKIE_NAME + "="));
  return match ? match.slice(COOKIE_NAME.length + 1) : null;
}

async function validSession(request: Request, env: Env): Promise<boolean> {
  if (!env.ADMIN_SESSION_SECRET || !env.DB) return false;
  const token = readSessionToken(request);
  if (!token) return false;
  const [expiry, nonce, signature, extra] = token.split(".");
  if (!expiry || !nonce || !signature || extra || !/^\d{10}$/.test(expiry) || Number(expiry) <= Math.floor(Date.now() / 1000)) return false;
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(nonce)) return false;
  const payload = expiry + "." + nonce;
  const supplied = fromBase64Url(signature);
  if (!supplied || supplied.length !== 32) return false;
  const expected = await hmac(env.ADMIN_SESSION_SECRET, "toolora-admin-v1:" + payload);
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ supplied[i];
  if (diff !== 0) return false;
  const active = await env.DB.prepare("SELECT token_hash, expires_at FROM admin_sessions WHERE id = 1").first<{ token_hash: string; expires_at: number }>();
  if (!active || active.expires_at <= Math.floor(Date.now() / 1000)) return false;
  return await secureEqual(active.token_hash, await tokenDigest(token));
}


async function adminApi(request: Request, env: Env, url: URL): Promise<Response> {
  if (!env.DB) return fail("Admin services are temporarily unavailable.", 503);
  if (url.pathname === "/api/admin/login" && request.method === "POST") {
    if (!sameOrigin(request, url)) return fail("Request rejected.", 403);
    if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 20 || !env.ADMIN_SESSION_SECRET || env.ADMIN_SESSION_SECRET.length < 32) {
      return fail("Admin security is not configured yet.", 503);
    }
    if (!await allowSubmission(env.DB, request, "admin-login", 5)) return fail("Too many login attempts. Try again in 10 minutes.", 429);
    const body = await readBody(request, 2048);
    const password = typeof body?.password === "string" ? body.password : "";
    if (password.length > 256 || !await secureEqual(password, env.ADMIN_PASSWORD)) return fail("Invalid credentials.", 401);
    const nonceBytes = crypto.getRandomValues(new Uint8Array(32));
    const nonce = toBase64Url(nonceBytes);
    const token = await makeSession(env.ADMIN_SESSION_SECRET, nonce);
    const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
    await env.DB.prepare(
      "INSERT INTO admin_sessions (id, token_hash, expires_at, updated_at) VALUES (1, ?, ?, datetime('now')) ON CONFLICT(id) DO UPDATE SET token_hash = excluded.token_hash, expires_at = excluded.expires_at, updated_at = datetime('now')"
    ).bind(await tokenDigest(token), expiresAt).run();
    return json({ authenticated: true }, 200, { "set-cookie": sessionCookie(token, SESSION_SECONDS) });
  }

  if (url.pathname === "/api/admin/logout" && request.method === "POST") {
    if (!sameOrigin(request, url)) return fail("Request rejected.", 403);
    const token = readSessionToken(request);
    if (token && await validSession(request, env)) {
      await env.DB.prepare("DELETE FROM admin_sessions WHERE id = 1 AND token_hash = ?").bind(await tokenDigest(token)).run();
    }
    return json({ authenticated: false }, 200, { "set-cookie": sessionCookie("", 0) });
  }

  if (!await validSession(request, env)) return fail("Authentication required.", 401);

  if (url.pathname === "/api/admin/session" && request.method === "GET") return json({ authenticated: true });

  if (url.pathname === "/api/admin/pending" && request.method === "GET") {
    const [reviews, requests] = await Promise.all([
      env.DB.prepare("SELECT id, tool_slug, name, rating, review, created_at FROM reviews WHERE status = 'pending' ORDER BY created_at ASC LIMIT 100").all(),
      env.DB.prepare("SELECT id, tool_name, description, created_at FROM tool_requests WHERE status = 'pending' ORDER BY created_at ASC LIMIT 100").all()
    ]);
    return json({ reviews: reviews.results ?? [], requests: requests.results ?? [] });
  }

  if (url.pathname === "/api/admin/moderate" && request.method === "POST") {
    if (!sameOrigin(request, url)) return fail("Request rejected.", 403);
    const body = await readBody(request, 2048);
    const kind = cleanText(body?.kind, 20);
    const status = cleanText(body?.status, 20);
    const id = Number(body?.id);
    if (!Number.isSafeInteger(id) || id < 1 || !["review", "tool-request"].includes(kind) || !["approved", "rejected"].includes(status)) {
      return fail("Invalid moderation action.", 400);
    }
    const table = kind === "review" ? "reviews" : "tool_requests";
    const result = await env.DB.prepare("UPDATE " + table + " SET status = ? WHERE id = ? AND status = 'pending'").bind(status, id).run();
    if (!result.success) return fail("Moderation update failed.", 500);
    return json({ updated: true });
  }

  return fail("Not found.", 404);
}

async function api(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: {
    ...SECURITY_HEADERS, "allow": "GET, POST, OPTIONS", "access-control-allow-origin": "null"
  }});
  if (url.pathname.startsWith("/api/admin/")) return adminApi(request, env, url);
  if (url.pathname === "/api/health" && request.method === "GET") {
    return json({ status: "ok", community: env.DB ? "ready" : "not-configured" });
  }
  if (!env.DB) return fail("Community features are temporarily unavailable while the database is being configured.", 503);

  if (url.pathname === "/api/community" && request.method === "GET") {
    const result = await env.DB.prepare(
      "SELECT tool_slug, name AS display_name, rating, review AS review_text, created_at FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT 50"
    ).all();
    return json({ reviews: result.results ?? [] });
  }

  if (url.pathname === "/api/reviews" && request.method === "GET") {
    const slug = cleanText(url.searchParams.get("tool"), 80);
    if (!validSlug(slug)) return fail("A valid tool identifier is required.", 400);
    const result = await env.DB.prepare(
      "SELECT id, tool_slug, name AS display_name, rating, review AS review_text, created_at FROM reviews WHERE status = 'approved' AND tool_slug = ? ORDER BY created_at DESC LIMIT 30"
    ).bind(slug).all();
    return json({ reviews: result.results ?? [] });
  }

  if (request.method !== "POST" || !["/api/reviews", "/api/tool-requests"].includes(url.pathname)) {
    return fail("Not found.", 404);
  }

  if (!sameOrigin(request, url)) return fail("Cross-site submissions are not accepted.", 403);
  const body = await readBody(request);
  if (!body) return fail("Send a valid JSON request under 8 KB.", 400);
  const action = url.pathname === "/api/reviews" ? "review" : "tool-request";
  if (!await allowSubmission(env.DB, request, action)) return fail("Submission limit reached. Please try again later.", 429);

  if (action === "review") {
    const tool = cleanText(body.tool, 80);
    const displayName = cleanText(body.displayName, 60) || "Guest";
    const reviewText = cleanText(body.review, 1000);
    const rating = Number(body.rating);
    if (!validSlug(tool) || !Number.isInteger(rating) || rating < 1 || rating > 5 || reviewText.length < 10) {
      return fail("Provide a valid tool, a 1–5 star rating and a review of at least 10 characters.", 400);
    }
    await env.DB.prepare(
      "INSERT INTO reviews (tool_slug, name, rating, review, status) VALUES (?, ?, ?, ?, 'pending')"
    ).bind(tool, displayName, rating, reviewText).run();
    return json({ status: "pending", message: "Thank you. Your review has been submitted for moderation." }, 201);
  }

  const title = cleanText(body.title, 100);
  const description = cleanText(body.description, 1200);
  if (title.length < 4 || description.length < 20) return fail("Provide a tool name (at least 4 characters) and details (at least 20 characters).", 400);
  await env.DB.prepare(
    "INSERT INTO tool_requests (tool_name, description, status) VALUES (?, ?, 'pending')"
  ).bind(title, description).run();
  return json({ status: "pending", message: "Thank you. Your tool request has been submitted for review." }, 201);
}

function isAdminAssetPath(pathname: string): boolean {
  let decoded = pathname;
  for (let i = 0; i < 4; i++) {
    let next: string;
    try { next = decodeURIComponent(decoded); }
    catch { return true; }
    if (next === decoded) break;
    decoded = next;
  }
  const normalized = decoded.replace(/\\\\/g, "/").toLowerCase();
  return normalized === "/admin" || normalized.startsWith("/admin/");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (isAdminAssetPath(url.pathname)) {
      try {
        if (!await validSession(request, env)) {
          return new Response("Not Found", { status: 404, headers: { ...SECURITY_HEADERS, "content-type": "text/plain; charset=utf-8" } });
        }
        return env.ASSETS.fetch(request);
      } catch {
        return new Response("Not Found", { status: 404, headers: { ...SECURITY_HEADERS, "content-type": "text/plain; charset=utf-8" } });
      }
    }
    if (path.startsWith("/api/admin")) {
      try { return await api(request, env); }
      catch { return fail("The request could not be completed. Please try again later.", 500); }
    }
    if (path.startsWith("/api/")) {
      try { return await api(request, env); }
      catch { return fail("The request could not be completed. Please try again later.", 500); }
    }
    return env.ASSETS.fetch(request);
  }
};
