export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Content-Type", "text/markdown; charset=utf-8");
  return siteMarkdown(event);
});
