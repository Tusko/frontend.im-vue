<template>
  <main>
    <div v-if="github" class="me">
      <section class="row inrow">
        <figure class="me-avatar row" data-aos="zoom-in-up">
          <img
            :src="avatar(180)"
            :srcset="transform ? `${avatar(360)} 2x` : undefined"
            :alt="github.user.name"
            width="180"
            height="180"
            fetchpriority="high"
          />
        </figure>
        <article class="content" data-aos="zoom-in-up" data-aos-delay="300">
          <h1>{{ github.user.name }}</h1>
          <p class="me-bio" v-html="bio"></p>

          <div class="me-cv">
            <UiButton label="Get the CV" href="/cv" />
          </div>

          <div class="me-data">
            <a
              :href="`https://maps.google.com?saddr=Current+Location&daddr=${github.user.location}`"
              target="_blank"
              class="me-location"
            >
              <Octicon name="location" />
              {{ github.user.location }}
            </a>
            <a
              :href="`mailto:${github.user.email}`"
              target="_blank"
              class="me-location"
            >
              <Octicon name="mail" />
              {{ github.user.email }}
            </a>
          </div>
        </article>
      </section>
      <ScrollIcon />
      <Scene />
    </div>
    <template v-if="github">
      <LazyHomeCharts />
      <GitCardsGrid :repos="github.repos" />
      <Experience />
      <FeaturedProjects />
    </template>
  </main>
</template>

<script setup lang="ts">
const { data: github } = await useGithub();

useSeoMeta({
  ogImage: () => github.value?.user.avatar_url,
  ogImageAlt: () => github.value?.user.name,
});

// Cloudflare resizes the ~300 KB GitHub PNG to a few KB of AVIF/WebP; only the production zone has /cdn-cgi/image
const transform = useRequestURL().hostname.endsWith("frontend.im");
const avatar = (w: number) => {
  const src = github.value?.user.avatar_url ?? "";
  return transform ? `/cdn-cgi/image/width=${w},height=${w},fit=cover,quality=80,format=auto/${src}` : src;
};

const links: Record<string, string> = {
  MyLab: "https://intro.mylab.report",
  MSTrade: "https://mstrade.org",
  Lab24: "https://lab24.com.ua",
};

const bio = computed(() =>
  Object.entries(links).reduce(
    (bio, [name, url]) =>
      bio.replace(name, `<a href="${url}" target="_blank">${name}</a>`),
    github.value?.user.bio ?? ""
  )
);
</script>

<style lang="scss" scoped src="./index.scss"></style>
