<template>
  <div id="app">
    <router-view></router-view> <!-- This renders the current route's component -->
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style scoped>
nav {
  margin-bottom: 20px;
}
</style>
