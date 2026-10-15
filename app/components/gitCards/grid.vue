<template>
  <div class="content git-content row">
    <h2 data-aos="fade-up">Featured repos</h2>
    <div class="git-grid">
      <GitCardsCard
        v-for="(repo, i) in repos"
        :key="repo.id"
        :repo="repo"
        data-aos="fade-up"
        data-aos-anchor-placement="center-bottom"
        :data-aos-delay="100 * i"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { InternalApi } from "nitropack/types";

defineProps<{ repos: InternalApi["/api/github"]["get"]["repos"] }>();
</script>
<style lang="scss" scoped>
.git-content {
  margin-top: 4.75vw;
  @media screen and (min-width: 1300px) {
    margin-right: 5vw;
    margin-left: 5vw;
    max-width: none;
    width: auto;
  }
}
.git-grid {
  grid-template-columns: repeat(auto-fit, minmax(calc(25% - 20px), 1fr));
  margin: 0 0 5vw;
  display: grid;
  gap: 20px;
  @media screen and (max-width: 1299px) {
    grid-template-columns: repeat(auto-fit, minmax(calc(50% - 20px), 1fr));
  }
  @media screen and (max-width: 767px) {
    display: block;
    > a {
      margin-top: 20px;
    }
  }
}
</style>
