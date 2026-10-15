<template>
  <section class="charts content">
    <div class="charts-row row">
      <div class="charts-wrap" data-aos-offset="150" data-aos="fade-up">
        <h2>Coding activity</h2>
        <Line v-if="lineData" :data="lineData" :options="lineOptions" />
      </div>
      <div class="charts-wrap" data-aos-offset="150" data-aos="fade-up">
        <h2>Stats per language</h2>
        <Doughnut v-if="pieData" :data="pieData" :options="pieOptions" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Chart,
  ArcElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Doughnut, Line } from "vue-chartjs";

Chart.register(ArcElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);
Chart.defaults.font.family = "Source Code Pro";

const { data } = await useFetch("/api/wakatime", { key: "wakatime", server: false, lazy: true });

const lineData = computed(() => {
  const activity = data.value?.activity;
  if (!activity) return null;

  const ctx = document.createElement("canvas").getContext("2d")!;
  const bg = ctx.createLinearGradient(0, 10, 0, 250);
  bg.addColorStop(0, "#0070f3");
  bg.addColorStop(1, "#3f51b5");
  const border = ctx.createLinearGradient(0, 20, 0, 200);
  border.addColorStop(1, "#bbb");
  border.addColorStop(0, "#ccc");

  return {
    labels: activity.map((d) => d.date),
    datasets: [
      {
        data: activity.map((d) => d.seconds),
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 2,
        pointRadius: 3,
        fill: true,
      },
    ],
  };
});

const pieData = computed(() => {
  const langs = data.value?.langs;
  if (!langs) return null;
  return {
    labels: langs.map((l) => l.name),
    datasets: [{ data: langs.map((l) => l.percent), backgroundColor: langs.map((l) => l.color) }],
  };
});

const lineOptions: ChartOptions<"line"> = {
  maintainAspectRatio: false,
  responsive: true,
  interaction: { intersect: false, mode: "index" },
  layout: { padding: { bottom: 30, right: 0, left: 0, top: 20 } },
  scales: {
    x: { grid: { display: false } },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: { stepSize: 3600, callback: (v) => `${Number(v) / 3600}h` },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: ([item]) => data.value?.activity[item!.dataIndex]?.text ?? "",
        label: (item) => item.label,
      },
    },
  },
};

const pieOptions: ChartOptions<"doughnut"> = {
  maintainAspectRatio: false,
  responsive: true,
  layout: { padding: { bottom: 40, top: 20 } },
  plugins: {
    legend: { position: "left", onClick: () => {} },
    tooltip: { callbacks: { label: (item) => `${item.label}: ${item.raw}%` } },
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
