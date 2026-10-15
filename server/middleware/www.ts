// Canonical host is the apex; www.frontend.im 301s to it
export default defineEventHandler((event) => {
  if (getRequestHost(event) !== "www.frontend.im") return;
  const { pathname, search } = getRequestURL(event);
  return sendRedirect(event, `https://frontend.im${pathname}${search}`, 301);
});
