<template>
  <div class="content row">
    <h2 class="row">Featured projects</h2>
    <div class="projects-grid">
      <div v-for="project in getProjects" :key="project.id">
        <h4 v-html="project.title.rendered"></h4>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "featuredProjects",
  computed: {
    ...mapGetters(["getProjects"])
  },
  beforeMount() {
    console.log(this.getProjects);
  }
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
