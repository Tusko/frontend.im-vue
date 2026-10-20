export default defineEventHandler(async (event) => {
  // A method-less route file answers every method; only reads make sense here
  if (!["GET", "HEAD"].includes(event.method)) throw createError({ statusCode: 405 });
  setResponseHeader(event, "Content-Type", "text/markdown; charset=utf-8");
  return siteMarkdown(event);
});
