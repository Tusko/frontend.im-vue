<template>
  <footer>
    <div class="row">
      <p>&copy; 2014–{{ year }} Tusko Trush</p>
      <p>
        Made with
        <span class="heart" aria-label="love">&hearts;</span> and
        <a :href="links.nuxt" rel="noopener nofollow" target="_blank">Nuxt</a>, served from
        <a :href="links.workers" rel="noopener nofollow" target="_blank">Cloudflare Workers</a>
      </p>
      <p>
        <a
          href="https://wakatime.com/@36bf7ce8-0e11-4e63-bea7-06612a86747f"
          rel="nofollow noopener"
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
  .heart {
    font-size: 14px;
  }
  a {
    color: var(--light);
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
      nuxt: "https://nuxt.com/",
      workers: "https://workers.cloudflare.com/",
    },
  }),
};
</script>
