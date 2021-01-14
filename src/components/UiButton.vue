<template>
  <a href="" class="button">
    <span>{{ label }}</span>
    <svg width="13px" height="10px" viewBox="0 0 13 10">
      <path d="M1,5 L11,5"></path>
      <polyline points="8 1 12 5 8 9"></polyline>
    </svg>
  </a>
</template>

<script>
export default {
  name: "UiButton",
  props: {
    label: {
      type: String,
      default: "Button label",
    },
  },
};
</script>

<style lang="sass" scoped>
.button
  font-family: var(--font2)
  transition: all .2s ease
  text-decoration: none
  position: relative
  padding: 19px 22px
  color: var(--dark)
  margin: auto
  &:before
    background: var(--bluelight)
    transition: all .3s ease
    border-radius: 28px
    position: absolute
    height: 56px
    width: 56px
    content: ""
    opacity: .5
    top: 3px
    left: 0
  span
    text-transform: uppercase
    vertical-align: middle
    letter-spacing: .25em
    position: relative
    line-height: 18px
    font-weight: 900
    font-size: 16px
  svg
    transform: translateX(-5px)
    transition: all .3s ease
    stroke-linejoin: round
    stroke-linecap: round
    stroke: var(--dark)
    position: relative
    margin-left: 10px
    stroke-width: 2
    fill: none
    top: 0
  &:hover
    color: var(--white)
    &:before
      width: 100%
      opacity: 1
    svg
      transform: translateX(0)
      stroke: var(--white)
  &:active
    transform: scale(.96)
</style>
