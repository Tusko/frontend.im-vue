export default defineNuxtConfig({
  compatibilityDate: "2026-10-01",
  css: ["aos/dist/aos.css", "~/assets/main.scss"],

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      title: "Tusko Trush - Front-End/Vue.js/Wordpress developer",
      link: [
        { rel: "icon", href: "/favicon.ico" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&family=Source+Sans+Pro:wght@300;400;600&display=swap",
        },
      ],
    },
  },

  // Override at runtime with NUXT_GITHUB_TOKEN (wrangler secret)
  runtimeConfig: {
    githubUser: "tusko",
    githubToken: "",
    // Cloudflare Access: NUXT_ACCESS_TEAM_DOMAIN (<team>.cloudflareaccess.com), NUXT_ACCESS_AUD (app AUD tag)
    accessTeamDomain: "",
    accessAud: "",
  },

  // Admin is a client-only SPA shell; data comes from /api/admin/** behind Access
  routeRules: {
    "/admin": { ssr: false },
    "/admin/**": { ssr: false },
  },

  nitro: {
    preset: "cloudflare_module",
    cloudflare: { nodeCompat: true },
    // Cached API responses live in KV in production, memory in dev
    storage: {
      cache: { driver: "cloudflare-kv-binding", binding: "CACHE" },
    },
    devStorage: {
      cache: { driver: "memory" },
    },
  },
});
