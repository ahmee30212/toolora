interface D1Result<T = unknown> { results?: T[]; success: boolean; }
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}
interface D1Database { prepare(query: string): D1PreparedStatement; }
interface AssetFetcher { fetch(request: Request): Promise<Response>; }
interface Env { ASSETS?: AssetFetcher; DB?: D1Database; }

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const SECURITY_HEADERS = {
  "content-security-policy": "default-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-permitted-cross-domain-policies": "none",
  "x-download-options": "noopen",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-embedder-policy": "require-corp",
  "cross-origin-resource-policy": "same-origin",
  "origin-agent-cluster": "?1",
  "cache-control": "no-store"
};
const encoder = new TextEncoder();
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...SECURITY_HEADERS } });
const fail = (message: string, status: number) => json({ error: message }, status);
const cleanText = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validSlug = (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;

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
  await db.prepare("DELETE FROM rate_limits WHERE window_start < ?").bind(windowStart - 86400).run();
  return Boolean(row && row.request_count <= limit);
}

async function readBody(request: Request, maxBytes = 8192): Promise<Record<string, unknown> | null> {
  const contentType = request.headers.get("content-type") ?? "";
  const mediaType = contentType.split(";")[0].trim().toLowerCase();
  if (mediaType !== "application/json") return null;
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

async function api(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/admin") || url.pathname === "/api/admin/login") return fail("Not found.", 404);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: {
    ...SECURITY_HEADERS, "allow": "GET, POST, OPTIONS", "access-control-allow-origin": "null"
  }});
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
    const [reviews, totals, distribution] = await Promise.all([
      env.DB.prepare(
        "SELECT id, tool_slug, name AS display_name, rating, review AS review_text, created_at FROM reviews WHERE status = 'approved' AND tool_slug = ? ORDER BY created_at DESC LIMIT 30"
      ).bind(slug).all(),
      env.DB.prepare(
        "SELECT COUNT(*) AS count, COALESCE(AVG(rating), 0) AS average FROM reviews WHERE status = 'approved' AND tool_slug = ?"
      ).bind(slug).first<{ count: number; average: number }>(),
      env.DB.prepare(
        "SELECT rating, COUNT(*) AS count FROM reviews WHERE status = 'approved' AND tool_slug = ? GROUP BY rating"
      ).bind(slug).all<{ rating: number; count: number }>()
    ]);
    const counts = [0, 0, 0, 0, 0];
    for (const row of distribution.results ?? []) {
      if (Number.isInteger(row.rating) && row.rating >= 1 && row.rating <= 5) counts[row.rating - 1] = row.count;
    }
    return json({
      reviews: reviews.results ?? [],
      summary: { count: totals?.count ?? 0, average: Number(totals?.average ?? 0), distribution: counts }
    });
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try { return await api(request, env); }
      catch { return fail("The request could not be completed. Please try again later.", 500); }
    }
    if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
      return new Response("Toolora static assets are not available in this Worker environment. Check the Cloudflare Static Assets binding.", {
        status: 503,
        headers: { ...SECURITY_HEADERS, "content-type": "text/plain; charset=utf-8", "retry-after": "60" }
      });
    }
    try { return await env.ASSETS.fetch(request); }
    catch {
      return new Response("The requested page is temporarily unavailable.", {
        status: 502,
        headers: { ...SECURITY_HEADERS, "content-type": "text/plain; charset=utf-8" }
      });
    }
  }
};
