/*
 * @Author: 羊驼
 * @Date: 2024-05-14 10:37:12
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-07-11 16:32:09
 * @Description: file content
 */
import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);
let ipcRenderer = window.require("electron").ipcRenderer;
const store = new Vuex.Store({
  state: {
    connect: false,
    data_tables: [],
    logger: [],
    current_defines: [],
    form: {
      enable: false,
      name: "",
      url: "",
      method: "",
      body: [],
      middleware: [],
      logic: {},
    },
  },
  mutations: {
    setStatus(state, data) {
      state.connect = data;
    },
    setLogger(state, data) {
      state.logger.push(data);
    },
    setTable(state, data) {
      state.data_tables = data;
    },
    setDefines(state, data) {
      state.current_defines = data;
    },
    setForm(state, data) {
      state.form = data;
    },
  },
  actions: {
    async getTableData({ commit }) {
      let data = await ipcRenderer.invoke("queryTable");
      commit("setTable", data);
    },
  },
});
export default store;
