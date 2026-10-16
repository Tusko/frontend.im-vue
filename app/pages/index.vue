<template>
  <main>
    <div v-if="github" class="me">
      <section class="row inrow">
        <figure class="me-avatar row" data-aos="zoom-in-up">
          <img :src="github.user.avatar_url" :alt="github.user.name" />
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
