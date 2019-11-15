<template>
  <div id="root">
    <h2>useFetch with ref param</h2>
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

<script lang="ts">
import { useFetch } from "vue-async-function";
import { createComponent, ref, computed } from "@vue/composition-api";

export default createComponent({
  setup() {
    const id = ref(2);
    const computedUrl = computed(
      () => `https://swapi.co/api/starships/${id.value}/`
    );
    const headers = { Accept: "application/json" };
    return {
      id,
      ...useFetch<object>(computedUrl, { headers })
    };
  }
});
</script>

<style scoped>
#root {
  background-color: #eee;
}
</style>
