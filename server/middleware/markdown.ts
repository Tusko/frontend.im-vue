// Content negotiation: agents asking for Markdown get the home page as Markdown
export default defineEventHandler(async (event) => {
  if (getRequestURL(event).pathname !== "/" || !getHeader(event, "accept")?.includes("text/markdown")) return;
  setResponseHeaders(event, { "Content-Type": "text/markdown; charset=utf-8", Vary: "Accept" });
  return siteMarkdown(event);
});
