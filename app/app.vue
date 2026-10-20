<template>
  <div id="app">
    <NuxtPage />
    <AppFooter v-if="$route.name !== 'cv' && !$route.path.startsWith('/admin')" />
  </div>
</template>

<script setup lang="ts">
// Per-page SEO from /admin → SEO; nuxt.config's app.head holds the fallbacks
const route = useRoute();
const { siteUrl } = useRuntimeConfig().public;
const [{ data: content }, { data: github }] = await Promise.all([useContent(), useGithub()]);
const seo = computed(() => content.value?.seo);
const path = computed(() => route.path.replace(/\/+$/, "") || "/"); // "/cv/" → "/cv"
const page = computed(() => seo.value?.pages[path.value]);
// Always the production host, so workers.dev and /cv/ point search engines at the real URL
const url = computed(() => siteUrl + path.value);

// Profiles from the admin become the Person's sameAs, so the JSON-LD text doesn't have to repeat them
const jsonld = computed(() => {
  const ld = seo.value?.jsonld as Record<string, any> | null | undefined;
  const profiles = seo.value?.profiles;
  if (!ld || !profiles?.length) return ld;
  const withSameAs = (n: any) => (n?.["@type"] === "Person" ? { ...n, sameAs: profiles } : n);
  return Array.isArray(ld["@graph"]) ? { ...ld, "@graph": ld["@graph"].map(withSameAs) } : withSameAs(ld);
});

useSeoMeta({
  title: () => page.value?.title || undefined,
  description: () => page.value?.description || undefined,
  ogTitle: () => page.value?.title || undefined,
  ogDescription: () => page.value?.description || undefined,
  // Uploaded images are site-relative (/media/…); og:image must be absolute
  ogImage: () => (page.value?.image ? new URL(page.value.image, siteUrl).href : github.value?.user.avatar_url),
  ogUrl: url,
});

useHead({
  link: [{ rel: "canonical", href: url }],
  meta: () => seo.value?.meta ?? [],
  script: () =>
    jsonld.value
      ? // "<" escaped so a closing script tag inside a string value can't end the block
        [{ type: "application/ld+json", innerHTML: JSON.stringify(jsonld.value).replace(/</g, "\\u003c") }]
      : [],
});
</script>
