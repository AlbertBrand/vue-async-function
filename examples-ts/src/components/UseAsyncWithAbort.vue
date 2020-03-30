<template>
  <div id="root">
    <h2>useAsync with abort controller</h2>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error!</div>
    <pre v-else>{{ data }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import { useAsync } from "vue-async-function";

async function loadStarship(
  { id }: { id: number },
  signal: AbortSignal
): Promise<object> {
  const headers = { Accept: "application/json" };
  const res = await fetch(`https://swapi.co/api/starships/${id}/`, {
    headers,
    signal,
  });
  if (!res.ok) throw res;
  return res.json();
}

export default defineComponent({
  setup() {
    const { data, error, isLoading } = useAsync(loadStarship, { id: 2 });
    return { data, error, isLoading };
  },
});
</script>

<style scoped>
#root {
  background-color: #eee;
}
</style>
