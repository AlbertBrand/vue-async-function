import Vue from "vue";
import App from "./App.vue";
import { plugin } from "vue-function-api";

Vue.use(plugin);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
