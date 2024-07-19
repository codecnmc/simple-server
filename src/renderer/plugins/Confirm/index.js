/*
 * @Author: 羊驼
 * @Date: 2024-05-17 09:40:06
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-05-17 09:43:34
 * @Description: file content
 */
import promptDialog from "./Dialog.vue";

export default {
  install(Vue) {
    Vue.prototype.$confirm = function (options = {}) {
      const promptDialogConstructor = Vue.extend(promptDialog);
      const promptDialogInstance = new promptDialogConstructor();
      promptDialogInstance.$mount(document.createElement("div"));
      document.body.appendChild(promptDialogInstance.$el);
      return new Promise((resolve, reject) => {
        promptDialogInstance.options = options;
        promptDialogInstance.resolve = resolve;
        promptDialogInstance.reject = reject;
      });
    };
  },
};
