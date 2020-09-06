<script>
import { Doughnut, mixins } from "vue-chartjs";
const { reactiveProp } = mixins;

export default {
  extends: Doughnut,
  mixins: [reactiveProp],
  props: ["options"],
  mounted() {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    Chart.defaults.global.defaultFontFamily = "Source Code Pro";
    this.renderChart(this.chartData, this.options);
  },
};
</script>
