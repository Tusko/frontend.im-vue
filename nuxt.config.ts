export default defineNuxtConfig({
  compatibilityDate: "2026-10-01",
  css: ["aos/dist/aos.css", "~/assets/main.scss"],

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      title: "Tusko Trush - Front-End/Vue.js/Wordpress developer",
      meta: [
        {
          name: "description",
          content:
            "Tusko Trush — front-end developer from Ukraine building fast, accessible sites with Vue.js, Nuxt and WordPress. Portfolio, featured projects and CV.",
        },
        { property: "og:title", content: "Tusko Trush - Front-End/Vue.js/Wordpress developer" },
        {
          property: "og:description",
          content: "Front-end developer building fast, accessible sites with Vue.js, Nuxt and WordPress.",
        },
        { property: "og:type", content: "website" },
        // Square avatar: small "summary" card, not the wide summary_large_image crop
        { name: "twitter:card", content: "summary" },
        { name: "theme-color", content: "#1a1e22" },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", href: "/favicon.ico", sizes: "any" },
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
    // Cloudflare Access: NUXT_ACCESS_TEAM_DOMAIN (<team>.cloudflareaccess.com), NUXT_ACCESS_AUD (app AUD tag),
    // NUXT_ACCESS_EMAIL (comma-separated emails allowed into /api/admin)
    accessTeamDomain: "",
    accessAud: "",
    accessEmail: "",
  },

  // Admin is a client-only SPA shell; data comes from /api/admin/** behind Access
  routeRules: {
    // Discovery for crawlers and agents; Vary because "/" also answers Accept: text/markdown
    "/": {
      headers: {
        Link: '</sitemap.xml>; rel="sitemap", </llms.txt>; rel="alternate"; type="text/markdown"',
        Vary: "Accept",
      },
    },
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
