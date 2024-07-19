/*
 * @Author: 羊驼
 * @Date: 2023-10-27 16:15:23
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-05-30 16:37:52
 * @Description: file content
 */
import Vue from "vue";
import App from "./App.vue";
import Confirm from "@/plugins/Confirm/index.js";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.use(ElementUI);
import store from "@/store/index";
import vuetify from "./plugins/vuetify";
import "./plugins/Flow/flow";
Vue.prototype.$ipcRenderer = window.require("electron").ipcRenderer;
Vue.use(Confirm);
Vue.config.productionTip = false;
let v = new Vue({
  render: (h) => h(App),
  store,
  vuetify,
}).$mount("#app");
