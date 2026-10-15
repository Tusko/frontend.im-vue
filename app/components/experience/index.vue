<template>
  <section v-if="experience.length" class="experience row content">
    <h2 data-aos="fade-up">Experience</h2>
    <div data-aos="fade-up" data-aos-offset="100">
      <nav class="experience-tabs">
        <span
          v-for="(item, i) in experience"
          :key="`ex-tab-${i}`"
          :class="['experience-tabs-item', { 'is-active': tab === i }]"
          @click="tab = i"
        >
          {{ item.company }}
        </span>
        <i :style="{ transform: `translateY(${tab * 45}px)` }"></i>
      </nav>
      <article>
        <template v-for="(v, i) in experience" :key="`ex-content-${i}`">
          <div
            v-if="tab === i"
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
              <small v-if="v.company_desc"> / {{ v.company_desc }}</small>
            </h4>
            <h6>{{ v.years }}</h6>
            <h5>Responsibilities:</h5>
            <div v-html="v.list"></div>
          </div>
        </template>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data } = await useContent();
const experience = computed(() => data.value?.experience ?? []);
const tab = ref(0);
</script>

<style lang="scss" src="./index.scss" scoped></style>
