<template>
  <main>
    <div v-if="getGitUser" class="me">
      <section class="row inrow">
        <figure class="me-avatar row" data-aos="zoom-in-up">
          <img :src="getGitUser.avatar_url" :alt="getGitUser.name" />
        </figure>
        <article class="content" data-aos="zoom-in-up" data-aos-delay="300">
          <h1>{{ getGitUser.name }}</h1>
          <p class="me-bio" v-html="getBio"></p>

          <div class="me-cv">
            <UiButton label="Get the CV" href="/cv" />
          </div>

          <div class="me-data">
            <!-- <a href="https://mylab.report" target="_blank" class="me-url">
              <octicon name="briefcase"></octicon>
              MyLab
            </a> -->
            <a
              :href="`https://maps.google.com?saddr=Current+Location&daddr=${getGitUser.location}`"
              target="_blank"
              class="me-location"
            >
              <octicon name="location"></octicon>
              {{ getGitUser.location }}
            </a>
            <a
              :href="`mailto:${getGitUser.email}`"
              target="_blank"
              class="me-location"
            >
              <octicon name="mail"></octicon>
              {{ getGitUser.email }}
            </a>
          </div>
        </article>
      </section>
      <scroll-icon />
      <scene />
    </div>
    <slot v-if="lazyComponent">
      <charts />
      <git-grid />
      <experience />
      <featured-projects />
    </slot>
  </main>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "Home",
  components: {
    "featured-projects": () => import("@/components/featuredProjects"),
    Octicon: () => import("vue-octicon/components/Octicon"),
    "scroll-icon": () => import("@/components/scrollIcon"),
    "git-grid": () => import("@/components/gitCards/grid"),
    experience: () => import("@/components/experience"),
    scene: () => import("@/components/scene"),
    charts: () => import("./charts"),
    UiButton: () => import("@/components/UiButton"),
  },
  computed: {
    ...mapGetters(["getGitUser"]),
    getBio() {
      let { bio } = this.getGitUser;
      bio = bio.replace(
        "MyLab",
        '<a href="https://intro.mylab.report" target="_blank">MyLab</a>'
      );
      bio = bio.replace(
        "MSTrade",
        '<a href="https://mstrade.org" target="_blank">MSTrade</a>'
      );
      bio = bio.replace(
        "Lab24",
        '<a href="https://lab24.com.ua" target="_blank">Lab24</a>'
      );
      return bio;
    },
  },
  data: () => ({
    lazyComponent: false,
  }),
  mounted() {
    if (this.getGitUser) {
      this.lazyComponent = true;
    }
  },
  watch: {
    getGitUser() {
      this.lazyComponent = true;
    },
  },
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
