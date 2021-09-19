import Vue from "vue";
import App from "./App";
import router from "./router";
import store from "./store";
import "vue-octicon/icons";
import "es6-promise/auto";
import BabelPolyfill from "babel-polyfill";
import "lazysizes";
import { Plugin } from "vue2-storage";

Vue.use(Plugin, {
  prefix: "fm_",
  driver: "local",
  ttl: 60 * 60 * 1000 * 24, // 24 hours
  // replacer: (key, value) => value
});

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
