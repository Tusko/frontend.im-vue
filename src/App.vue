<template>
  <div id="app">
    <router-view />

    <app-footer v-if="$route.name !== 'cv'" />
    <!-- <transition name="fade">
      <preloader v-if="loading" />
    </transition> -->
    <!-- <UiCursor /> -->
  </div>
</template>

<script>
import AOS from "aos";
import "aos/dist/aos.css";
import "./assets/main.scss";
import { mapActions } from "vuex";

export default {
  components: {
    "app-footer": () => import("./components/footer"),
    // UiCursor: () => import("@/components/UiCursor"),
    // preloader: () => import("./components/preloader")
  },
  // data: () => ({
  //   loading: true
  // }),
  mounted() {
    lazySizes.init();

    AOS.init();
  },
  async created() {
    await this.fetchGitUser("tusko");
    await this.fetchGitRepos("tusko");
    await this.fetchFrontPage();
    await this.fetchProjects();
    // this.loading = false;
  },
  methods: {
    ...mapActions([
      "fetchGitUser",
      "fetchGitRepos",
      "fetchFrontPage",
      "fetchProjects",
    ]),
  },
};
</script>
