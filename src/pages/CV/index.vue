<template>
  <div v-if="getGitUser && getExperience">
    <vue-html2pdf
      :show-layout="true"
      :float-layout="true"
      :enable-download="true"
      :preview-modal="false"
      filename="Vitalii-Trush-CV"
      :pdf-quality="2"
      pdf-format="a4"
      pdf-orientation="portrait"
      ref="html2Pdf"
      :enable-links="true"
      :manual-pagination="true"
    >
      <!-- @progress="onProgress($event)"
      @hasStartedGeneration="hasStartedGeneration()"
      @hasGenerated="hasGenerated($event)" -->
      <div id="cv" class="row content" slot="pdf-content">
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
            <tr>
              <td>
                <a :href="`mailto:${getGitUser.email}?subject=CV`">{{
                  getGitUser.email
                }}</a>
              </td>
              <td>
                <a :href="`tel:${pn}`">{{ pn }}</a>
              </td>
              <td>
                <a :href="domain" target="_blank">{{ domain }}</a>
              </td>
            </tr>
          </table>
        </section>

        <h3>Experience</h3>
        <section
          class="experience"
          v-for="exp in getExperience"
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
            <tr>
              <td>Ukrainian <small>Native</small></td>
              <td>English <small>Intermediate</small></td>
            </tr>
            <tr>
              <td>Polish <small>Pre-Intermediate</small></td>
              <td></td>
            </tr>
          </table>
        </section>
      </div>
    </vue-html2pdf>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import VueHtml2pdf from "vue-html2pdf";

export default {
  name: "CV",
  components: {
    VueHtml2pdf,
  },
  data: () => ({
    birthDate: "July 17, 1991",
    pn: "+38 063 50 60 700",
  }),
  computed: {
    ...mapGetters(["getExperience", "getGitUser"]),
    domain() {
      return window.location.origin;
    },
    getAge() {
      const ageDifMs = Date.now() - Date.parse(this.birthDate);
      const ageDate = new Date(ageDifMs); // miliseconds from epoch
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    },
  },
  updated() {
    if (!this.$route.query?.preview) {
      this.getPDF();
    }
  },
  methods: {
    getPDF() {
      if (this.$refs?.html2Pdf) {
        this.$nextTick(async () => {
          await this.$refs.html2Pdf.generatePdf();
          setTimeout(() => {
            this.$router.push("/");
          }, 100);
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#cv {
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
