export default defineEventHandler(async (event) => {
  const obj = await cfEnv(event).MEDIA.get(getRouterParam(event, "key") ?? "");
  if (!obj) throw createError({ statusCode: 404 });

  setHeaders(event, {
    "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
  });
  return obj.body as unknown as ReadableStream;
});
