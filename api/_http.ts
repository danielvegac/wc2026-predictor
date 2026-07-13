// Shared HTTP helpers for API routes: CORS handling, method guarding,
// and safe (non-leaking) error responses.

import type { VercelRequest, VercelResponse } from "@vercel/node";

// Optional comma-separated origin allowlist, e.g.
//   ALLOWED_ORIGINS="https://wc2026.example.com,https://staging.example.com"
// When unset, falls back to "*" since these endpoints serve public,
// read-only, non-credentialed data.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function resolveAllowOrigin(req: VercelRequest): string {
  if (ALLOWED_ORIGINS.length === 0) return "*";
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0];
}

// Applies CORS headers and enforces GET-only access. Returns true when the
// request has already been fully handled (preflight or rejected method) and
// the caller should return immediately.
export function handleCorsAndMethod(
  req: VercelRequest,
  res: VercelResponse
): boolean {
  res.setHeader("Access-Control-Allow-Origin", resolveAllowOrigin(req));
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    res.status(405).json({ error: "Method not allowed" });
    return true;
  }

  return false;
}

// Logs the real error server-side and returns a generic message so internal
// details (stack traces, upstream URLs, hostnames) are never leaked to clients.
export function safeErrorMessage(context: string, error: unknown): string {
  console.error(`[${context}]`, error);
  return "upstream data source unavailable";
}
