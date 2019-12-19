import Vue from "vue";
import App from "./App";
import router from "./router";
import store from "./store";
import "vue-octicon/icons";
import { Vue2Storage } from "vue2-storage";

Vue.use(Vue2Storage, {
  prefix: "app_",
  driver: "local",
  ttl: 86400000 // 24 hours
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
