<template>
  <div id="app">
    <router-view />
    <app-footer />
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
    "app-footer": () => import("./components/footer")
  },
  created() {
    setColorScheme();
    AOS.init();
  },
  beforeMount() {
    this.fetchGitUser("tusko");
  },
  methods: {
    ...mapActions(["fetchGitUser"])
  }
};
</script>
