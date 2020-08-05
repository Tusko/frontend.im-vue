<template>
  <section v-if="getExperience" class="experience row content">
    <h2 data-aos="fade-up">Experience</h2>
    <div data-aos="fade-up" data-aos-offet="100">
      <nav class="experience-tabs">
        <span
          v-for="(item, inx) in getExperience"
          :key="`ex-tab-${inx}`"
          :class="[
            'experience-tabs-item',
            { 'is-active': currentTab === Number(inx) }
          ]"
          @click="tab = Number(inx)"
        >
          {{ item.company }}
        </span>
        <i :style="pointPosition"></i>
      </nav>
      <article>
        <slot v-for="(v, i) in getExperience">
          <div
            v-if="currentTab === Number(i)"
            :key="`ex-content-${i}`"
            class="experience-details"
            data-aos-easing="ease-out"
            data-aos-duration="200"
            data-aos="zoom-in-left"
            data-aos-delay="0"
          >
            <h3>{{ v.position }}</h3>
            <h4>
              <a :href="v.company_url" rel="nofollow" target="_blank">
                @ {{ v.company }}</a
              >
              <small> / {{ v.company_desc }}</small>
            </h4>
            <h6>{{ v.years }}</h6>
            <h5>Responsibilities:</h5>
            <div v-html="v.list"></div>
          </div>
        </slot>
      </article>
    </div>
  </section>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "Experience",
  data: () => ({
    tab: 0
  }),
  computed: {
    ...mapGetters(["getExperience"]),
    currentTab() {
      return this.tab;
    },
    pointPosition() {
      const fromTop = this.currentTab * 45;
      return { transform: `translateY(${fromTop}px)` };
    }
  }
};
</script>

<style lang="scss" src="./index.scss" scoped></style>
