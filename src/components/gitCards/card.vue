<template>
  <a
    :id="`gitRepo-${repo.id}`"
    rel="noopener noreferrer"
    :href="repo.html_url"
    target="_blank"
    class="git-card"
  >
    <h3 class="git-card-title">
      <i>
        <octicon name="repo"></octicon>
      </i>
      <span>{{ repo.name }}</span>
    </h3>

    <p class="git-card-desc">{{ repo.description }}</p>

    <div class="git-card-stats">
      <div v-if="repo.language" class="git-card-stats-color">
        <i :style="{ backgroundColor: getGitColor(repo.language) }" />
        {{ repo.language }}
      </div>

      <div class="git-card-stats-stars">
        <i><octicon name="star"></octicon></i>
        {{ repo.stargazers_count }}
      </div>

      <div class="git-card-stats-forks">
        <i><octicon name="repo-forked"></octicon></i>
        {{ repo.forks }}
      </div>
      <div class="git-card-stats-watchers">
        <i><octicon name="eye"></octicon></i>
        {{ repo.watchers }}
      </div>
    </div>
  </a>
</template>

<script>
const GitHubColors = require("github-colors");

export default {
  name: "gitCard",
  props: {
    repo: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    Octicon: () => import("vue-octicon/components/Octicon.vue")
  },
  methods: {
    getGitColor(lang) {
      const langExt = lang.split(".");
      const langData = GitHubColors.get(langExt[0]);
      return langData ? langData.color : "#1a1e22";
    }
  }
};
</script>

<style lang="scss" scoped src="./card.scss"></style>
