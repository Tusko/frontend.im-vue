<template>
  <footer>
    <div class="row">
      <p>Copyright &copy; {{ year }}</p>
      <p>
        Made with
        <a :href="links.arsmoon" class="heart" target="_blank">&hearts;</a> and
        <a :href="links.vue" rel="noopener nofollow" target="_blank">Vue.js</a>
      </p>
      <p>
        <a
          href="https://wakatime.com/@36bf7ce8-0e11-4e63-bea7-06612a86747f"
          ref="nofollow noopener"
          target="_blank"
          ><img
            src="https://wakatime.com/badge/user/36bf7ce8-0e11-4e63-bea7-06612a86747f.svg"
            alt="Total time coded since Aug 20 2014"
        /></a>
      </p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
footer {
  background: var(--black);
  padding: 20px 0 10px;
  color: var(--light);
  text-align: center;
  overflow: hidden;
  font-size: 12px;
  a {
    color: var(--light);
    &.heart {
      text-decoration: none;
      font-size: 14px;
    }
    &:hover {
      color: var(--blue);
    }
  }
  p {
    margin-bottom: 10px;
  }
}
</style>

<script>
export default {
  name: "Footer",
  data: () => ({
    year: new Date().getFullYear(),
    links: {
      vue: "https://vuejs.org/",
      arsmoon: "https://arsmoon.com",
    },
  }),
};
</script>
