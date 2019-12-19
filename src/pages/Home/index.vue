<template>
  <main>
    <div v-if="getGitUser" class="me">
      <section class="row inrow">
        <figure class="me-avatar row" data-aos="zoom-in-up">
          <img :src="getGitUser.avatar_url" alt="getGitUser.name" />
        </figure>
        <article class="content" data-aos="zoom-in-up" data-aos-delay="300">
          <h1>{{ getGitUser.name }}</h1>
          <a href="mailto:" class="mailto"></a>
          <p>
            {{ getGitUser.bio }}
          </p>
          <div class="me-data">
            <a :href="getGitUser.blog" target="_blank" class="me-url">
              <octicon name="briefcase"></octicon>
              {{ getGitUser.company }}
            </a>
            <a
              :href="
                `https://maps.google.com?saddr=Current+Location&daddr=${getGitUser.location}`
              "
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
    </div>
    <charts />
    <git-grid />
    <experience />
    <!-- <featured-projects /> -->
  </main>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "Home",
  components: {
    Octicon: () => import("vue-octicon/components/Octicon"),
    "scroll-icon": () => import("@/components/scrollIcon"),
    "git-grid": () => import("@/components/gitCards/grid"),
    experience: () => import("@/components/experience"),
    // "featured-projects": () => import("@/components/featuredProjects"),
    charts: () => import("./charts")
  },
  computed: {
    ...mapGetters(["getGitUser"])
  }
};
</script>

<style lang="scss" scoped src="./index.scss"></style>
