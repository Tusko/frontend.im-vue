import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import { orderBy, has, map, flatMap } from "lodash";

const SAVE_GIT_USER = "SAVE_GIT_USER";
const SAVE_GIT_REPOS = "SAVE_GIT_REPOS";
const SET_EXPERIENCE = "SET_EXPERIENCE";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== "production",
  state: {
    gitUser: null,
    gitRepos: null,
    experience: null
  },
  mutations: {
    [SAVE_GIT_USER](state, payload) {
      state.gitUser = { ...payload };
    },
    [SAVE_GIT_REPOS](state, payload) {
      state.gitRepos = { ...payload };
    },
    [SET_EXPERIENCE](state, payload) {
      state.experience = { ...payload };
    }
  },
  getters: {
    getGitUser: state => state.gitUser,
    getGitRepos: state => state.gitRepos,
    getExperience: state => state.experience
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
    fetchGitRepos: async ({ commit, state }, user) => {
      await axios
        .get(
          `https://api.github.com/users/${user}/repos?per_page=99&access_token=${process.env.VUE_APP_GIT_TOKEN}`,
          {
            headers: {
              Authorization: `token ${process.env.VUE_APP_GIT_TOKEN}`
            }
          }
        )
        .then(r => {
          const data = r.data.map(e => {
            e.unix = new Date(e.updated_at).getTime();
            if (
              e.owner.id === state.gitUser.id &&
              !e.name.includes("frontend.im")
            )
              return e;
          });

          const sortedData = orderBy(
            data,
            ["stargazers_count", "forks_count", "unix"],
            ["desc", "desc", "desc"]
          );

          commit(SAVE_GIT_REPOS, sortedData.splice(1, 8));
        });
    },
    fetchWakatime: async (context, type) => {
      return await axios.get(
        process.env[`VUE_APP_WAKATIME_${type.toUpperCase()}`]
      );
    },
    fetchFrontPage({ commit }) {
      axios
        .get(
          `${process.env.VUE_APP_API}/singletons/get/homepage?token=${process.env.VUE_APP_API_TOKEN}`
        )
        .then(res => {
          if (has(res.data, "Experience"))
            commit(
              "SET_EXPERIENCE",
              flatMap(map(res.data.Experience, a => a.value))
            );
        });
    }
  }
});
