<template>
  <div class="content git-content" v-if="getGitRepos">
    <h2 data-aos="fade-up">Featured repos</h2>
    <div class="git-grid">
      <gitCard
        v-for="(repo, i) in getGitRepos"
        :key="repo.id"
        :repo="repo"
        data-aos="fade-up"
        data-aos-anchor-placement="center-bottom"
        :data-aos-delay="100 * i"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "gitGrid",
  components: {
    gitCard: () => import("./card")
  },
  computed: {
    ...mapGetters(["getGitRepos"])
  }
};
</script>

<style lang="scss" computed>
.git-content {
  margin-top: 4.75vw;
  h2 {
    margin-right: 5vw;
    margin-left: 5vw;
  }
}
.git-grid {
  grid-template-columns: repeat(auto-fit, minmax(calc(25% - 20px), 1fr));
  margin: 0 5vw 5vw;
  display: grid;
  gap: 20px;
}
</style>
