import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Dayjs from "vue-dayjs";

Vue.config.productionTip = false;

Vue.use(Dayjs, {
  lang: "en"
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
