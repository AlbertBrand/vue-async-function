<template>
  <div id="app">
    <button @click="show = !show">Show / hide components</button>
    <div v-if="show">
      <UseAsync v-if="show" />
      <UseAsyncWithAbort v-if="show" />
      <UseFetch v-if="show" />
      <label>
        Timeout in ms:
        <input v-model.number="ms" type="number" step="100" />
      </label>
      <UseAsyncWithRefParam :ms="ms" />
      <UseFetchWithRefParam />
    </div>
  </div>
</template>

<script>
import UseAsync from "./components/UseAsync.vue";
import UseAsyncWithAbort from "./components/UseAsyncWithAbort.vue";
import UseFetch from "./components/UseFetch.vue";
import UseAsyncWithRefParam from "./components/UseAsyncWithRefParam.vue";
import UseFetchWithRefParam from "./components/UseFetchWithRefParam.vue";

export default {
  name: "app",
  data() {
    return {
      show: true,
      ms: 2000
    };
  },
  components: {
    UseAsync,
    UseAsyncWithAbort,
    UseFetch,
    UseAsyncWithRefParam,
    UseFetchWithRefParam
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  color: #2c3e50;
}
</style>
