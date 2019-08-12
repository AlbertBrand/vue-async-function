<template>
  <div id="app">
    <button @click="show = !show">Show / hide components</button>
    <div v-if="show">
      <SimpleUseAsyncComponent v-if="show" />
      <UseAsyncComponent v-if="show" />
      <UseFetchComponent v-if="show" />
      <label>
        Timeout in ms:
        <input v-model.number="ms" type="number" step="100" />
      </label>
      <UseAsyncWithValueComponent :ms="ms" />
      <UseFetchWithValueComponent />
    </div>
  </div>
</template>

<script>
import SimpleUseAsyncComponent from "./components/SimpleUseAsyncComponent.vue";
import UseAsyncComponent from "./components/UseAsyncComponent.vue";
import UseFetchComponent from "./components/UseFetchComponent.vue";
import UseAsyncWithValueComponent from "./components/UseAsyncWithValueComponent.vue";
import UseFetchWithValueComponent from "./components/UseFetchWithValueComponent.vue";

export default {
  name: "app",
  data() {
    return {
      show: true,
      ms: 2000
    };
  },
  components: {
    SimpleUseAsyncComponent,
    UseAsyncComponent,
    UseFetchComponent,
    UseAsyncWithValueComponent,
    UseFetchWithValueComponent
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  color: #2c3e50;
}
</style>
