<template>
  <div class="projects content">
    <h2 class="row">Featured projects</h2>
    <div class="projects-grid">
      <div
        v-for="project in data?.projects"
        :key="project.id"
        class="projects-grid-item"
      >
        <figure
          class="cover"
          :style="{ backgroundImage: `url(${project.thumbnail})` }"
        >
          <img :src="project.cover" alt="" loading="lazy" />
        </figure>
        <div class="projects-grid-content">
          <h4>
            <a :href="project.url" v-html="project.title" target="_blank"></a>
          </h4>
          <h5>{{ project.cats.join(" / ") }}</h5>
          <time v-if="postedAt(project.postedAt)">Posted on {{ postedAt(project.postedAt) }}</time>
        </div>
      </div>
    </div>

    <div v-if="data?.otherProjects" class="projects-content">
      <article class="row" v-html="data.otherProjects"></article>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data } = await useContent();

const month = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" });
// posted_at is YYYYMMDD
const postedAt = (d: string) =>
  /^\d{8}$/.test(d)
    ? month.format(Date.UTC(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8)))
    : "";
</script>

<style lang="scss" scoped src="./index.scss"></style>
