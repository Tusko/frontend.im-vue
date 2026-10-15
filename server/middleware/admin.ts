import { createRemoteJWKSet, jwtVerify } from "jose";

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

// Cloudflare Access sits in front of /admin + /api/admin; this re-checks its JWT so the API
// stays closed on any hostname Access doesn't cover (e.g. workers.dev)
export default defineEventHandler(async (event) => {
  let path: string;
  try {
    path = decodeURIComponent(getRequestURL(event).pathname).replace(/\/+/g, "/").toLowerCase();
  } catch {
    throw createError({ statusCode: 400 });
  }
  if (!path.startsWith("/api/admin")) return;

  // CSRF: Access attaches the JWT to cookie-authenticated cross-site requests too.
  // Compare hosts, not full origins: h3 may see http:// behind the Workers runtime
  if (!["GET", "HEAD"].includes(event.method)) {
    let host = "";
    try {
      host = new URL(getHeader(event, "origin") ?? "").host;
    } catch {}
    if (!host || host !== getRequestHost(event)) throw createError({ statusCode: 403 });
  }
  if (import.meta.dev) return;

  const { accessTeamDomain, accessAud } = useRuntimeConfig(event);
  const token = getHeader(event, "cf-access-jwt-assertion") || getCookie(event, "CF_Authorization");
  if (!accessTeamDomain || !accessAud || !token) throw createError({ statusCode: 401 });

  jwks ??= createRemoteJWKSet(new URL(`https://${accessTeamDomain}/cdn-cgi/access/certs`));
  try {
    await jwtVerify(token, jwks, {
      issuer: `https://${accessTeamDomain}`,
      audience: accessAud,
      algorithms: ["RS256"],
    });
  } catch {
    throw createError({ statusCode: 401 });
  }
});
