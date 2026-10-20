// RFC 9727 API catalog: points agents at the public read API and its OpenAPI description
export default defineEventHandler((event) => {
  // A method-less route file answers every method; only reads make sense here
  if (!["GET", "HEAD"].includes(event.method)) throw createError({ statusCode: 405 });
  setResponseHeader(event, "Content-Type", "application/linkset+json");
  const origin = getRequestURL(event).origin;
  return {
    linkset: [
      {
        anchor: `${origin}/api`,
        "service-desc": [{ href: `${origin}/openapi.json`, type: "application/vnd.oai.openapi+json" }],
        "service-doc": [{ href: `${origin}/llms.txt`, type: "text/markdown" }],
      },
    ],
  };
});
