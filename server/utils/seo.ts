import type { D1Database } from "@cloudflare/workers-types";

export interface SeoPage {
  title: string;
  description: string;
  image: string;
}
export interface Seo {
  pages: Record<string, SeoPage>;
  meta: { name: string; content: string }[]; // e.g. site verification tags
  profiles: string[]; // social profile URLs, rendered as the Person's sameAs
  jsonld: Record<string, unknown> | null;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const obj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const httpUrl = (s: string) => {
  try {
    return ["http:", "https:"].includes(new URL(s).protocol) ? s : "";
  } catch {
    return "";
  }
};
// Site-relative (/media/…) or absolute http(s); anything else would break og:image or throw in new URL()
const image = (v: unknown) => {
  const s = str(v, 2000);
  return /^\/(?!\/)/.test(s) ? s : httpUrl(s);
};
const JSONLD_MAX = 32 * 1024; // it ships inline on every page

// Normalizes whatever the admin sends (or D1 holds) into a Seo; anything malformed is dropped, not stored
export function parseSeo(raw: unknown): Seo {
  const v = obj(raw) ? raw : {};
  const pages: Record<string, SeoPage> = {};
  if (obj(v.pages))
    for (const [path, p] of Object.entries(v.pages))
      if (path.startsWith("/") && obj(p))
        pages[path] = { title: str(p.title, 200), description: str(p.description, 500), image: image(p.image) };
  const meta = Array.isArray(v.meta)
    ? v.meta
        .filter(obj)
        .map((m) => ({ name: str(m.name, 100), content: str(m.content, 1000) }))
        .filter((m) => m.name && m.content)
    : [];
  const profiles = Array.isArray(v.profiles)
    ? [...new Set(v.profiles.map((p) => httpUrl(str(p, 500))).filter(Boolean))].slice(0, 30)
    : [];
  const jsonld = obj(v.jsonld) && JSON.stringify(v.jsonld).length <= JSONLD_MAX ? v.jsonld : null;
  return { pages, meta, profiles, jsonld };
}

export async function readSeo(db: D1Database) {
  const value = await db.prepare("SELECT value FROM settings WHERE key = 'seo'").first<string>("value");
  try {
    return parseSeo(value ? JSON.parse(value) : null);
  } catch {
    return parseSeo(null);
  }
}
