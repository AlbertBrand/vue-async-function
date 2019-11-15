<template>
  <div id="root">
    <h2>useAsync and promises, with value</h2>
    <button @click="retry">Retry</button>
    <button @click="abort">Abort</button>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error!</div>
    <pre v-else>{{ data }}</pre>
  </div>
</template>

<script lang="ts">
import { useAsync } from "vue-async-function";
import { createComponent, ref, watch } from "@vue/composition-api";

type WaitParam = { millis: number };

async function wait(
  { millis }: WaitParam,
  signal: AbortSignal
): Promise<string> {
  return new Promise(resolve => {
    const timeout = setTimeout(
      () => resolve(`Done waiting ${millis} milliseconds!`),
      millis
    );
    signal.addEventListener("abort", () => clearTimeout(timeout));
  });
}

export default createComponent({
  props: {
    ms: { type: Number, required: true }
  },
  setup(props) {
    const wrapParams = ref<WaitParam>(1000);
    watch(
      () => props.ms,
      millis => {
        wrapParams.value = { millis };
      }
    );
    const { data, error, isLoading, retry, abort } = useAsync(wait, wrapParams);
    return { data, error, isLoading, retry, abort };
  }
});
</script>

<style scoped>
#root {
  background-color: #eee;
}
</style>
