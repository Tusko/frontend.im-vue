import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import {orderBy, filter} from "lodash";

const SAVE_GIT_USER = "SAVE_GIT_USER";
const SAVE_GIT_REPOS = "SAVE_GIT_REPOS";
const SET_EXPERIENCE = "SET_EXPERIENCE";
const SET_OTHER_PROJECTS = "SET_OTHER_PROJECTS";
const SET_PROJECTS = "SET_PROJECTS";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== "production",
  state: {
    gitUser: null,
    gitRepos: null,
    experience: null,
    otherProjects: null,
    projects: null,
  },
  mutations: {
    [SAVE_GIT_USER](state, payload) {
      state.gitUser = {...payload};
    },
    [SAVE_GIT_REPOS](state, payload) {
      state.gitRepos = {...payload};
    },
    [SET_EXPERIENCE](state, payload) {
      state.experience = {...payload};
      Vue.$storage.set("experience", payload);
    },
    [SET_OTHER_PROJECTS](state, txt) {
      state.otherProjects = txt;
      Vue.$storage.set("otherProjects", txt);
    },
    [SET_PROJECTS](state, payload) {
      state.projects = {...payload};
    },
  },
  getters: {
    getGitUser: (state) => state.gitUser,
    getGitRepos: (state) => state.gitRepos,
    getExperience: (state) => state.experience,
    getProjects: (state) => state.projects,
  },
  actions: {
    fetchGitUser: async ({commit}, user) => {
      await axios
        .get(`https://api.github.com/users/${user}`, {
          headers: {
            Authorization: `token ${process.env.VUE_APP_GIT_TOKEN}`,
          },
        })
        .then((r) => {
          commit(SAVE_GIT_USER, r.data);
        });
    },
    fetchGitRepos: async ({commit, state}, user) => {
      const repos = Vue.$storage.get("repos");
      if (repos) return commit(SAVE_GIT_REPOS, repos);

      await axios
        .get(
          `https://api.github.com/users/${user}/repos?per_page=99&access_token=${process.env.VUE_APP_GIT_TOKEN}`,
          {
            headers: {
              Authorization: `token ${process.env.VUE_APP_GIT_TOKEN}`,
            },
          }
        )
        .then((r) => {
          const data = filter(r.data, (e) => {
            e.unix = new Date(e.updated_at).getTime();
            if (
              !e.private &&
              !e.fork &&
              !e.archived &&
              !e.name.includes("frontend.im") &&
              e.name !== "Tusko"
            ) {
              return e;
            }
          });

          const sortedData = orderBy(
            data,
            ["stargazers_count", "forks_count", "unix"],
            ["desc", "desc", "desc"]
          );

          const splicedRepost = sortedData.splice(0, 8);

          Vue.$storage.set("repos", splicedRepost);
          commit(SAVE_GIT_REPOS, splicedRepost);
        });
    },
    fetchWakatime: (_, type) => {
      const EP = {
        langs:
          "https://wakatime.com/share/@tuskotrush/aa6a2ff7-94f5-434c-8aba-d06c33b5f472.json",
        activity:
          "https://wakatime.com/share/@tuskotrush/8a6e81a1-5f7b-4ad6-a924-f3c620acdc6d.json",
      };
      return axios.get(process.env.VUE_APP_PROXY, {
        params: {
          csurl: EP[type],
        },
      });
    },
    fetchFrontPage({commit}) {
      axios
        .get(`${process.env.VUE_APP_API}/wp-json/acf/v3/options/options`)
        .then(({data}) => {
          data?.acf?.experience && commit(SET_EXPERIENCE, data.acf.experience);
          data?.acf?.other_projects &&
            commit(SET_OTHER_PROJECTS, data.acf.other_projects);
        });
    },
    fetchProjects({commit}) {
      const projects = Vue.$storage.get("projects");
      if (projects) return commit(SET_PROJECTS, projects);

      axios
        .get(
          `${process.env.VUE_APP_API}/wp-json/wp/v2/posts?_minimal&per_page=100`
        )
        .then((res) => {
          commit(SET_PROJECTS, res.data);
          Vue.$storage.set("projects", res.data);
        });
    },
  },
});
