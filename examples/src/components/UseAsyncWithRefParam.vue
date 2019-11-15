<template>
  <div id="root">
    <h2>useAsync with ref param</h2>
    <button @click="retry">Retry</button>
    <button @click="abort">Abort</button>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error!</div>
    <pre v-else>{{ data }}</pre>
  </div>
</template>

<script>
import { useAsync } from "vue-async-function";
import { ref, watch } from "@vue/composition-api";

async function wait({ millis }, signal) {
  return new Promise(resolve => {
    const timeout = setTimeout(
      () => resolve(`Done waiting ${millis} milliseconds!`),
      millis
    );
    signal.addEventListener("abort", () => clearTimeout(timeout));
  });
}

export default {
  setup(props) {
    const wrapParams = ref();
    watch(
      () => props.ms,
      millis => {
        wrapParams.value = { millis };
      }
    );
    const { data, error, isLoading, retry, abort } = useAsync(wait, wrapParams);
    return { data, error, isLoading, retry, abort };
  },
  props: {
    ms: { type: Number, required: true }
  }
};
</script>

<style scoped>
#root {
  background-color: #eee;
}
</style>
