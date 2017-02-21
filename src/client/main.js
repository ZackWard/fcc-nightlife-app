import Vue from 'vue'
import { store } from "./vueStore";
import App from "./components/app.vue";

new Vue({
  el: '#app',
  store: store,
  render: h => h(App)
})