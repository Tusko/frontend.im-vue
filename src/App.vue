<template>
  <div id="app">
    <router-view />
    <app-footer />
    <transition name="fade">
      <preloader v-if="loading" />
    </transition>
  </div>
</template>

<script>
import AOS from "aos";
import "aos/dist/aos.css";
import "./assets/main.scss";
import setColorScheme from "./components/colorSchema";
import { mapActions } from "vuex";

export default {
  components: {
    "app-footer": () => import("./components/footer"),
    preloader: () => import("./components/preloader")
  },
  data: () => ({
    loading: true
  }),
  created() {
    setColorScheme();
    AOS.init();
  },
  async beforeMount() {
    await this.fetchGitUser("tusko");
    await this.fetchGitRepos("tusko").then(async () => {
      await this.fetchFrontPage();
      await this.fetchProjects();
      this.loading = false;
    });
  },
  methods: {
    ...mapActions([
      "fetchGitUser",
      "fetchGitRepos",
      "fetchFrontPage",
      "fetchProjects"
    ])
  }
};
</script>
