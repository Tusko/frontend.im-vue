import Vue from "vue";
import App from "./App";
import router from "./router";
import store from "./store";
import "vue-octicon/icons";
import { Vue2Storage } from "vue2-storage";
import "es6-promise/auto";
import BabelPolyfill from "babel-polyfill";
import "lazysizes";

window.lazySizesConfig = window.lazySizesConfig || {};
lazySizesConfig.loadMode = 1;
lazySizesConfig.init = false;
lazySizesConfig.ricTimeout = 500;
lazySizesConfig.expand = 100;

//add simple support for background images:
document.addEventListener("lazybeforeunveil", function (e) {
  const el = e.target;
  const bg = el.getAttribute("data-bg");
  if (bg) {
    el.style.backgroundImage = "url(" + bg + ")";
    el.removeAttribute("data-bg");
  }
});

Vue.use(Vue2Storage, {
  prefix: "app_",
  driver: "local",
  ttl: 86400000, // 24 hours
});

Vue.prototype.$$ = (obj, ...rest) => {
  let tmp = obj;
  for (let key in rest) {
    let name = rest[key];
    tmp = tmp?.[name];
  }
  return tmp || undefined;
};

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  BabelPolyfill,
  render: (h) => h(App),
}).$mount("#app");
