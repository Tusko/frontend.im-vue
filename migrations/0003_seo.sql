-- SEO settings edited at /admin → SEO: per-page title/description/image, extra meta tags, social profiles
-- (rendered as the Person's sameAs) and the site-wide JSON-LD
INSERT OR IGNORE INTO settings (key, value) VALUES ('seo', json('{
  "pages": {
    "/": {
      "title": "Tusko Trush – Vue.js & Nuxt Team Lead, Lviv, Ukraine",
      "description": "Front-end team lead and full-stack JS developer in Lviv, Ukraine. 15+ years with Vue.js, Nuxt, TypeScript and Cloudflare Workers. Projects, repos and CV.",
      "image": ""
    },
    "/cv": {
      "title": "Vitalii (Tusko) Trush – CV | Front-End Team Lead, Vue.js & Nuxt",
      "description": "CV of Vitalii (Tusko) Trush: front-end team lead and full-stack JS developer in Lviv, Ukraine, with 15+ years of Vue.js, Nuxt and TypeScript.",
      "image": ""
    }
  },
  "meta": [],
  "profiles": ["https://github.com/Tusko", "https://www.instagram.com/tuskotrush/", "https://www.threads.com/@tuskotrush"],
  "jsonld": {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://frontend.im/#website",
        "url": "https://frontend.im/",
        "name": "Tusko Trush",
        "inLanguage": "en",
        "publisher": { "@id": "https://frontend.im/#person" }
      },
      {
        "@type": "ProfilePage",
        "@id": "https://frontend.im/#profilepage",
        "url": "https://frontend.im/",
        "isPartOf": { "@id": "https://frontend.im/#website" },
        "mainEntity": { "@id": "https://frontend.im/#person" }
      },
      {
        "@type": "Person",
        "@id": "https://frontend.im/#person",
        "name": "Tusko Trush",
        "alternateName": "Vitalii Trush",
        "url": "https://frontend.im/",
        "image": "https://avatars.githubusercontent.com/u/2039259",
        "jobTitle": "Team Lead / Full-Stack JS Developer",
        "worksFor": { "@type": "Organization", "name": "TraffBand" },
        "address": { "@type": "PostalAddress", "addressLocality": "Lviv", "addressCountry": "UA" },
        "knowsAbout": ["Vue.js", "Nuxt", "TypeScript", "JavaScript", "Node.js", "WordPress", "Cloudflare Workers"]
      }
    ]
  }
}'));
