const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

/**
 * ponytail: in-memory fixed window, per serverless instance. Enough to stop a
 * single script hammering the public forms. Move to Upstash Redis or Vercel
 * Firewall rules the moment this runs on more than one instance and the limit
 * has to be global.
 */
export function allow(key: string, limit = 5): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export const clientKey = (request: Request, scope: string): string => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return `${scope}:${ip}`;
};
