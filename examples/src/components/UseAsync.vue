<template>
  <div id="root">
    <h2>useAsync</h2>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error!</div>
    <pre v-else>{{ data }}</pre>
  </div>
</template>

<script>
import { useAsync } from "vue-async-function";

async function wait({ millis }) {
  return new Promise(resolve => {
    setTimeout(() => resolve(`Done waiting ${millis} milliseconds!`), millis);
  });
}

export default {
  setup() {
    const { data, error, isLoading } = useAsync(wait, { millis: 2000 });
    return { data, error, isLoading };
  }
};
</script>

<style scoped>
#root {
  background-color: #eee;
}
</style>
