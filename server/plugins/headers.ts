// Nuxt hardcodes x-powered-by on rendered pages; it only advertises the stack
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("beforeResponse", (event) => removeResponseHeader(event, "x-powered-by"));
});
