<template>
  <main>
    <div class="me">
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
        </article>
      </section>
    </div>
  </main>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "Home",
  data: () => ({
    me: null
  }),
  computed: {
    ...mapGetters(["getGitUser"])
  }
};
</script>

<style lang="scss">
@import "./index.scss";
</style>
