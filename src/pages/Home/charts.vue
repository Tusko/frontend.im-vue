<template>
  <section class="charts content">
    <div class="charts-row row">
      <div class="charts-wrap" data-aos-offset="150" data-aos="fade-up">
        <h2>Coding activity</h2>
        <line-chart
          v-if="lineChart.collection"
          :chart-data="lineChart.collection"
          :options="lineChart.options"
          :styles="styles"
        />
      </div>
      <div class="charts-wrap" data-aos-offset="150" data-aos="fade-up">
        <h2>Stats per language</h2>
        <pie-chart
          v-if="pieChart.collection"
          :chart-data="pieChart.collection"
          :options="pieChart.options"
          :styles="styles"
        />
      </div>
    </div>
  </section>
</template>

<script>
const GitHubColors = require("github-colors");
import { mapActions } from "vuex";
import { forEach, filter, cloneDeep } from "lodash";

export default {
  name: "Charts",
  components: {
    "line-chart": () => import("@/components/charts/line"),
    "pie-chart": () => import("@/components/charts/pie"),
  },
  data: () => ({
    lines: null,
    langs: null,
    styles: {
      position: "relative",
      height: "100%",
      width: "100%",
    },
    lineChart: {
      collection: null,
      options: {
        maintainAspectRatio: false,
        intersect: false,
        responsive: true,
        legend: false,
        title: false,
        layout: {
          padding: {
            bottom: 30,
            right: 0,
            left: 0,
            top: 20,
          },
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                callback: (label) => {
                  return label[0];
                },
              },
            },
          ],
          yAxes: [
            {
              stacked: true,
              ticks: {
                beginAtZero: true,
                stepSize: 3600,
                callback: (label) => `${label / 60 / 60}h`,
              },
            },
          ],
        },
        tooltips: {
          intersect: false,
          mode: "index",
          callbacks: {
            label: (tooltip, data) => data.labels[tooltip.index][0],
            title: (tooltip, data) => data.labels[tooltip[0].index][1],
          },
        },
      },
    },
    pieChart: {
      collection: null,
      options: {
        maintainAspectRatio: false,
        intersect: false,
        responsive: true,
        legend: {
          position: "left",
          fullWidth: false,
          onClick: () => false,
        },
        title: false,
        layout: {
          padding: {
            bottom: 40,
            top: 20,
          },
        },
        pieceLabel: {
          mode: "percentage",
          precision: 1,
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              return (
                data["labels"][tooltipItem["index"]] +
                ": " +
                data["datasets"][0]["data"][tooltipItem["index"]] +
                "%"
              );
            },
          },
        },
      },
    },
  }),
  methods: {
    ...mapActions(["fetchWakatime"]),
    generateActivityChart(activityObj) {
      const lineLabels = [];
      const lineData = [];

      this.$storage.set("activity", activityObj);
      this.lines = activityObj;

      this.$nextTick(() => {
        forEach(this.lines, (el) => {
          lineLabels.push([
            el.range.date.replace(/-/g, "."),
            el.grand_total.text,
          ]);
          lineData.push(el.grand_total.total_seconds);
        });

        this.$set(this.lineChart, "collection", {
          labels: lineLabels,
          datasets: [
            {
              data: lineData,
              backgroundColor: this.colorfulGradient[0],
              borderColor: this.colorfulGradient[1],
              borderWidth: 2,
              pointRadius: 3,
              fill: true,
            },
          ],
        });
      });
    },
    generateLangChart(langObj) {
      const pieLabels = [];
      const pieData = [];
      const pieColors = [];

      if (GitHubColors.colors) {
        GitHubColors.colors["SCSS"].color = "#CF649A";
      }

      const filterLangs = filter(langObj, (el) => el.percent > 0.5);

      this.$storage.set("langs", filterLangs);
      this.langs = filterLangs;

      this.$nextTick(() => {
        forEach(this.langs, (el) => {
          pieLabels.push(el.name);
          pieData.push(el.percent);
          const langExt = el.name.split(".");
          const langData = GitHubColors.get(langExt[0]);
          pieColors.push(langData ? langData.color : "#1a1e22");
        });

        this.$set(this.pieChart, "collection", {
          labels: pieLabels,
          datasets: [
            {
              backgroundColor: pieColors,
              data: pieData,
            },
          ],
        });
      });
    },
  },
  computed: {
    colorfulGradient() {
      const context = document.createElement("canvas").getContext("2d");

      const bg = context.createLinearGradient(0, 10, 0, 250);
      bg.addColorStop(0, "#0070f3");
      bg.addColorStop(1, "#3f51b5");

      const border = context.createLinearGradient(0, 20, 0, 200);
      border.addColorStop(1, "#bbb");
      border.addColorStop(0, "#ccc");
      return [bg, border];
    },
  },
  async beforeMount() {
    // fetch and generate lineChart
    const activityData = this.$storage.get("activity");
    if (activityData) {
      await this.generateActivityChart(activityData);
    } else {
      await this.fetchWakatime("activity").then(({ data }) => {
        this.generateActivityChart(cloneDeep(data.data));
      });
    }

    //fetch and generate languages PieChart
    const langsData = this.$storage.get("langs");
    if (langsData) {
      await this.generateLangChart(langsData);
    } else {
      await this.fetchWakatime("langs").then(({ data }) => {
        this.generateLangChart(cloneDeep(data.data));
      });
    }
  },
};
</script>

<style lang="scss" scoped>
.charts {
  position: relative;
  margin-top: -44px;
  z-index: 1;
  &-row {
    grid-template-columns: repeat(auto-fit, minmax(49%, 1fr));
    display: grid;
    gap: 0px 2%;
    @media screen and (max-width: 960px) {
      display: block;
      > div + div {
        margin-top: 40px;
      }
    }
  }
  &-wrap {
    box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 30px -15px;
    background: var(--white);
    border-radius: 10px;
    border-radius: 5px;
    padding: 20px;
    height: 320px;
  }
}
</style>
