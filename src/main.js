import Vue from "vue";
import App from "./App";
import router from "./router";
import store from "./store";
import "vue-octicon/icons";
import { Vue2Storage } from "vue2-storage";
import "es6-promise/auto";
import BabelPolyfill from "babel-polyfill";

Vue.use(Vue2Storage, {
  prefix: "app_",
  driver: "local",
  ttl: 86400000 // 24 hours
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  BabelPolyfill,
  render: h => h(App)
}).$mount("#app");
