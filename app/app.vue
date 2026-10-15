<template>
  <div id="app">
    <NuxtPage />
    <AppFooter v-if="$route.name !== 'cv' && !$route.path.startsWith('/admin')" />
  </div>
</template>
