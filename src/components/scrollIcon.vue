<template>
  <div class="scroll-ani" :class="{ 'aos-hidden': windowTop >= 65 }">
    <i class="scroll-ani-icon"></i>
  </div>
</template>

<script>
export default {
  name: "scrollAnimation",
  data: () => ({
    windowTop: 0,
  }),
  mounted() {
    window.addEventListener("scroll", this.onScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.onScroll);
  },
  methods: {
    onScroll() {
      this.windowTop = Math.max(
        document.documentElement.scrollTop,
        document.body.scrollTop
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@keyframes scroll {
  0% {
    opacity: 1;
  }
  100% {
    transform: translateY(24px);
    opacity: 0;
  }
}

.scroll-ani {
  transform: translate(-50%, 0);
  transition: all 0.5s ease;
  position: absolute;
  bottom: 40px;
  left: 50%;
  &.aos-hidden {
    visibility: hidden;
    bottom: 20px;
    opacity: 0;
  }
  &-icon {
    box-shadow: inset 0 0 0 1px var(--bluelight);
    border-radius: 25px;
    display: block;
    opacity: 0.8;
    height: 38px;
    width: 24px;
    &:before {
      animation: scroll 1.5s infinite;
      background: var(--bluelight);
      position: absolute;
      border-radius: 4px;
      margin-left: -3px;
      content: "";
      height: 6px;
      width: 6px;
      left: 50%;
      top: 4px;
    }
  }
}
</style>
