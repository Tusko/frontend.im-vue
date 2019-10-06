import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

const SAVE_GIT_USER = "SAVE_GIT_USER";
const SAVE_WAKATIME_DATA = "SAVE_WAKATIME_DATA";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    gitUser: null,
    wakatime: {}
  },
  mutations: {
    [SAVE_GIT_USER](state, payload) {
      state.gitUser = payload;
    },
    [SAVE_WAKATIME_DATA](state, payload) {
      state.wakatime[payload.key] = payload.data;
    }
  },
  getters: {
    getGitUser: state => state.gitUser,
    getWakatime: state => state.wakatime
  },
  actions: {
    fetchGitUser({ commit }, user) {
      const gitUser = localStorage.getItem("git_user");
      if (gitUser) return commit(SAVE_GIT_USER, JSON.parse(gitUser));

      axios
        .get(`https://api.github.com/users/${user}`, {
          headers: {
            Authorization: `token ${process.env.VUE_APP_GIT_TOKEN}`
          }
        })
        .then(r => {
          commit(SAVE_GIT_USER, r.data);
          localStorage.setItem("git_user", JSON.stringify(r.data));
        });
    },
    fetchWakatime({ commit }, type) {
      axios
        .get(process.env[`VUE_APP_WAKATIME_${type.toUpperCase()}`])
        .then(r => {
          commit(SAVE_WAKATIME_DATA, { key: type, data: r.data.data });
        });
    }
  }
});
