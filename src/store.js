import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

const SAVE_GIT_USER = "SAVE_GIT_USER";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    gitUser: null
  },
  mutations: {
    [SAVE_GIT_USER](state, payload) {
      state.gitUser = payload;
    }
  },
  getters: {
    getGitUser: state => state.gitUser
  },
  actions: {
    fetchGitUser: async ({ commit }, user) => {
      await axios
        .get(`https://api.github.com/users/${user}`, {
          headers: {
            Authorization: `token ${process.env.VUE_APP_GIT_TOKEN}`
          }
        })
        .then(r => {
          commit(SAVE_GIT_USER, r.data);
        });
    },
    fetchWakatime: async ({}, type) => {
      return await axios.get(
        process.env[`VUE_APP_WAKATIME_${type.toUpperCase()}`]
      );
    }
  }
});
