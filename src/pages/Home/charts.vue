<template>
  <section class="charts row content">
    <div class="charts-wrap">
      <h2>Coding activity</h2>
      <line-chart
        v-if="lineChart.collection"
        :chart-data="lineChart.collection"
        :options="lineChart.options"
        :styles="lineChart.styles"
      />
    </div>
  </section>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "Charts",
  components: {
    "line-chart": () => import("@/components/charts/line"),
    "pie-chart": () => import("@/components/charts/pie")
  },
  data: () => ({
    lines: null,
    lineChart: {
      styles: {
        position: "relative",
        height: "100%",
        width: "100%"
      },
      collection: null,
      options: {
        maintainAspectRatio: false,
        intersect: false,
        responsive: true,
        legend: false,
        title: false,
        layout: {
          padding: {
            bottom: 10,
            top: 20
          }
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false
              },
              ticks: {
                callback: label => {
                  return label[0];
                }
              }
            }
          ],
          yAxes: [
            {
              stacked: true,
              ticks: {
                beginAtZero: true,
                stepSize: 3600,
                callback: label => `${label / 60 / 60}h`
              }
            }
          ]
        },
        tooltips: {
          intersect: false,
          mode: "index",
          callbacks: {
            label: (tooltip, data) => data.labels[tooltip.index][0],
            title: (tooltip, data) => data.labels[tooltip[0].index][1]
          }
        }
      }
    }
  }),
  methods: {
    ...mapActions(["fetchWakatime"])
  },
  computed: {
    colorfulGradient() {
      const context = document.createElement("canvas").getContext("2d");

      const bg = context.createLinearGradient(0, 30, 0, 0);
      bg.addColorStop(1, "#ff5050");
      bg.addColorStop(0, "#6F5CFF");

      const border = context.createLinearGradient(0, 0, 500, 0);
      border.addColorStop(1, "#ff5050");
      border.addColorStop(0, "rgba(122, 89, 255, 0.9)");
      return [bg, border];
    }
  },
  async mounted() {
    await this.fetchWakatime("activity").then(res => {
      const lineLabels = [];
      const lineData = [];

      this.lines = res.data.data;

      this.lines.forEach(el => {
        lineLabels.push([
          el.range.date.replace(/-/g, "."),
          el.grand_total.text
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
            borderWidth: 3,
            pointRadius: 3,
            fill: true
          }
        ]
      });
    });
  }
};
</script>

<style lang="scss">
.charts {
  margin-top: -44px;
  display: flex;
  &-wrap {
    box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 30px -15px;
    background: var(--white);
    border-radius: 10px;
    border-radius: 5px;
    padding: 20px;
    height: 320px;
    flex: 1;
    & + & {
      margin-left: 40px;
    }
  }
}
</style>
