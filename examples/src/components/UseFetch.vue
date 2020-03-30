<template>
  <div id="root">
    <h2>useFetch</h2>
    <button @click="retry" :disabled="isLoading">Retry</button>
    <button @click="abort" :disabled="!isLoading">Abort</button>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error!</div>
    <pre v-else>{{ data }}</pre>
  </div>
</template>

<script>
import { useFetch } from "vue-async-function";

export default {
  setup() {
    const id = 9;
    const url = `https://swapi.co/api/starships/${id}/`;
    const headers = { Accept: "application/json" };
    const { data, error, isLoading, retry, abort } = useFetch(url, { headers });
    return { data, error, isLoading, retry, abort };
  },
};
</script>

<style scoped>
#root {
  background-color: #eee;
}
</style>
