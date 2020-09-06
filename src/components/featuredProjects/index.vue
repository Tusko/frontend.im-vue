<template>
  <div class="projects content">
    <h2 class="row">Featured projects</h2>
    <div class="projects-grid">
      <div
        v-for="project in getProjects"
        :key="project.id"
        class="projects-grid-item"
      >
        <figure
          class="cover lazyload"
          :style="{
            'background-image': 'url(' + webpUrl(project.thumbnail[0]) + ')',
          }"
          :data-bg="webpUrl(project.cover[0])"
        ></figure>
        <div class="projects-grid-content">
          <h4>
            <a
              :href="project.acf.site_url"
              v-html="project.title.rendered"
              target="_blank"
            ></a>
          </h4>
          <h5>{{ project.cats.join(" / ") }}</h5>
          <time>Posted on {{ postedAt(project.acf.posted_at) }}</time>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { webp } from "@/utils";
import moment from "moment";

export default {
  name: "featuredProjects",
  mixins: [webp],
  computed: {
    ...mapGetters(["getProjects"]),
  },
  methods: {
    postedAt(date) {
      const mm = moment(date, "YYYYMMDD");
      return mm.format("MMMM YYYY");
    },
  },
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
