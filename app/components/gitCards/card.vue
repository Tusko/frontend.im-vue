<template>
  <a
    :id="`gitRepo-${repo.id}`"
    rel="noopener noreferrer"
    :href="repo.url"
    target="_blank"
    class="git-card"
  >
    <h3 class="git-card-title">
      <i><Octicon name="repo" /></i>
      <span>{{ repo.name }}</span>
    </h3>

    <p class="git-card-desc">{{ repo.description }}</p>

    <div class="git-card-stats">
      <div v-if="repo.language" class="git-card-stats-color">
        <i :style="{ backgroundColor: repo.color }" />
        {{ repo.language }}
      </div>

      <div class="git-card-stats-stars">
        <i><Octicon name="star" /></i>
        {{ repo.stars }}
      </div>

      <div class="git-card-stats-forks">
        <i><Octicon name="repo-forked" /></i>
        {{ repo.forks }}
      </div>
      <div class="git-card-stats-watchers">
        <i><Octicon name="eye" /></i>
        {{ repo.watchers }}
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import type { InternalApi } from "nitropack/types";

defineProps<{ repo: InternalApi["/api/github"]["get"]["repos"][number] }>();
</script>

<style lang="scss" scoped src="./card.scss"></style>
