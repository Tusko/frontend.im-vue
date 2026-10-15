<template>
  <div class="projects content">
    <h2 class="row">Featured projects</h2>
    <div class="projects-grid">
      <article v-for="project in data?.projects" :key="project.id" class="projects-grid-item">
        <img
          :src="resized(project.cover || project.thumbnail, 512)"
          :srcset="srcset(project.cover || project.thumbnail)"
          :sizes="sizes"
          :alt="plain(project.title)"
          width="512"
          height="512"
          loading="lazy"
          decoding="async"
        />
        <div class="projects-grid-content">
          <h4>
            <a :href="project.url" v-html="project.title" target="_blank"></a>
          </h4>
          <h5>{{ project.cats.join(" / ") }}</h5>
          <time v-if="postedAt(project.postedAt)">Posted on {{ postedAt(project.postedAt) }}</time>
        </div>
      </article>
    </div>

    <div v-if="data?.otherProjects" class="projects-content">
      <article class="row" v-html="data.otherProjects"></article>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data } = await useContent();

// Cloudflare Image Transformations resize on the fly; only the production zone has /cdn-cgi/image
const transform = useRequestURL().hostname.endsWith("frontend.im");
const widths = [256, 384, 512, 768, 1024];
const resized = (src: string, w: number) =>
  transform ? `/cdn-cgi/image/width=${w},quality=80,format=auto/${src.replace(/^\//, "")}` : src;
const srcset = (src: string) => (transform ? widths.map((w) => `${resized(src, w)} ${w}w`).join(", ") : undefined);
// Matches the grid columns in index.scss: 4 → 3 → 2 → 1
const sizes = "(max-width: 640px) 100vw, (max-width: 1023px) 50vw, (max-width: 1200px) 33vw, 25vw";
const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const month = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" });
// posted_at is YYYYMMDD
const postedAt = (d: string) =>
  /^\d{8}$/.test(d)
    ? month.format(Date.UTC(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8)))
    : "";
</script>

<style lang="scss" scoped src="./index.scss"></style>
