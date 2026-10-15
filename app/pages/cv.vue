<template>
  <div v-if="github && experience">
    <div id="cv" class="row content">
      <section>
        <h1>Vitalii Trush</h1>
        <p class="position">Vue.js Front-end Developer</p>

        <p class="bday">
          <b>DOB:</b> {{ birthDate }}<small>({{ getAge }} years old)</small>
        </p>
      </section>

      <section class="contact">
        <h3>Contact info:</h3>
        <table>
<tbody>
          <tr>
            <td>
              <a :href="`mailto:${github.user.email}?subject=CV`">{{
                github.user.email
              }}</a>
            </td>
            <td>
              <a :href="`tel:${pn}`">{{ pn }}</a>
            </td>
            <td>
              <a :href="domain" target="_blank">{{ domain }}</a>
            </td>
          </tr>
        </tbody>
</table>
      </section>

      <h3>Experience</h3>
      <section
        class="experience"
        v-for="exp in experience"
        :key="exp.company"
      >
        <h4>
          <div>
            <a :href="exp.company_url">{{ exp.company }}</a>
            <small v-if="exp.company_desc"> - {{ exp.company_desc }}</small>
          </div>

          <span class="years">{{ exp.years }}</span>
        </h4>
        <p><b>Position:</b> {{ exp.position }}</p>
        <p><b>Responsibilities:</b></p>
        <div v-html="exp.list"></div>
      </section>

      <section class="langs">
        <h3>Languages</h3>
        <table>
<tbody>
          <tr>
            <td>Ukrainian <small>Native</small></td>
            <td>English <small>Intermediate</small></td>
          </tr>
          <tr>
            <td>Polish <small>Pre-Intermediate</small></td>
            <td></td>
          </tr>
        </tbody>
</table>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const [{ data: github }, { data: content }] = await Promise.all([useGithub(), useContent()]);
const experience = computed(() => content.value?.experience);

const birthDate = "July 17, 1991";
const pn = "+38 063 50 60 700";
const domain = useRequestURL().origin;
const getAge = Math.abs(new Date(Date.now() - Date.parse(birthDate)).getUTCFullYear() - 1970);

// Browser "Save as PDF" names the file after the title
useHead({ title: "Vitalii-Trush-CV" });

// ponytail: browser print instead of server PDF; Browser Rendering + R2 in the PDF phase
const route = useRoute();
onMounted(() => {
  if (route.query.preview !== undefined) return;
  addEventListener("afterprint", () => navigateTo("/"), { once: true });
  print();
});
</script>

<style lang="scss" scoped>
@page {
  size: A4;
  margin: 0;
}
#cv {
  max-width: 210mm;
  margin: 0 auto;
  background: var(--white);
  padding: 40px;
  > * {
    padding-bottom: 16px;
    margin-bottom: 0;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: var(--font2);
    font-weight: 600;
  }
  h1 {
    padding-bottom: 0;
  }
  h3 {
    margin-bottom: 16px;
  }
  small {
    opacity: 0.65;
    display: block;
  }
  table {
    table-layout: fixed;
    width: 100%;
  }
  .position {
    opacity: 0.75;
  }
  .experience {
    padding-bottom: 0;
    h4 {
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 10px;
      display: flex;
      > div {
        margin-right: 20px;
        flex: 1;
      }
      > span {
        margin-left: auto;
      }
    }
    > div {
      border-bottom: 1px solid var(--dark);
      margin-bottom: 20px;
    }
  }
  .langs {
    tr + tr {
      td {
        padding-top: 16px;
      }
    }
  }
}
</style>
