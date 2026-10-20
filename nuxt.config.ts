export default defineNuxtConfig({
  compatibilityDate: "2026-10-01",
  css: ["aos/dist/aos.css", "~/assets/main.scss"],

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      // Fallbacks; per-page title/description are edited at /admin → SEO
      title: "Tusko Trush – Vue.js & Nuxt Team Lead, Lviv, Ukraine",
      meta: [
        {
          name: "description",
          content:
            "Front-end team lead and full-stack JS developer in Lviv, Ukraine. 15+ years with Vue.js, Nuxt, TypeScript and Cloudflare Workers. Projects, repos and CV.",
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
          href: "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&family=Source+Sans+Pro:wght@400;600&display=swap",
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
    public: {
      // Canonical host for canonical/og:url, whichever hostname served the page
      siteUrl: "https://frontend.im",
    },
  },

  // Admin is a client-only SPA shell; data comes from /api/admin/** behind Access
  routeRules: {
    // HTML responses only: static assets are served by Workers Assets without running the Worker
    "/**": {
      headers: {
        "Strict-Transport-Security": "max-age=31536000",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
    },
    // Discovery for crawlers and agents; Vary because "/" also answers Accept: text/markdown
    "/": {
      headers: {
        Link: '</sitemap.xml>; rel="sitemap", </llms.txt>; rel="alternate"; type="text/markdown"',
        Vary: "Accept",
      },
    },
    "/admin": { ssr: false, headers: { "X-Robots-Tag": "noindex" } },
    "/admin/**": { ssr: false, headers: { "X-Robots-Tag": "noindex" } },
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
