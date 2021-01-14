<template>
  <div class="page-404">
    <h1>Error 404</h1>
    <h2>Oh dear. Are you lost?</h2>

    <div class="page-404-btns">
      <UiButton label="Take me home" href="/?ref=404" />
      <UiButton
        label="Get in touch"
        target="_blank"
        href="mailto:tusko@trush.email?subject=frontend.im%20404"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "Page404",
  components: {
    UiButton: () => import("@/components/UiButton"),
  },
};
</script>

<style lang="scss" scoped>
.page-404 {
  justify-content: center;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  display: flex;
  h1 {
    text-transform: uppercase;
  }
  > * {
    margin-top: 40px;
  }
  &-btns {
    display: flex;
    > a + a {
      margin-left: 40px;
    }
  }
}
</style>
