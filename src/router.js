import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

function load(component) {
  // '@' is aliased to src/pages
  return () =>
    import(/* webpackChunkName: "[request]" */ `@/pages/${component}`);
}

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: load("Home"),
    },
  ],
});
