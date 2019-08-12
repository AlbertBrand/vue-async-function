<template>
  <div id="root">
    <h2>useFetch with value</h2>
    <label>
      Ship ID:
      <input v-model="id" type="number" />
    </label>
    <button @click="retry">Retry</button>
    <button @click="abort">Abort</button>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error!</div>
    <pre v-else>{{ data }}</pre>
  </div>
</template>

<script>
import { useFetch } from "vue-async-function";
import { value, computed } from "vue-function-api";

export default {
  setup() {
    const id = value(2);
    const computedUrl = computed(
      () => `https://swapi.co/api/starships/${id.value}/`
    );
    const headers = { Accept: "application/json" };
    return {
      id,
      ...useFetch(computedUrl, { headers })
    };
  }
};
</script>

<style scoped>
#root {
  background-color: #eee;
}
</style>
