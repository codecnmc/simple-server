/*
 * @Author: 羊驼
 * @Date: 2024-05-22 16:08:21
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-07-10 16:15:45
 * @Description: file content
 */
import view from "./index.vue";
import store from "@/store/index";
export default {
  nodeName: "开始",
  viewComponent: view,
  nodeComponent: null,
  // 允许覆盖同名
  type: {
    name: "开始",
    value: 0,
    color: null,
    icon: null,
    btnClass: "",
  },
  setting: {
    define: [],
    // { key:"" type:"string",default:""}
  },
  textHandle: (config) => {
    let define = config.define;
    if (!define.length) return ["暂无配置"];
    let text = [];
    for (let item of define) {
      text.push(`名称:${item.key} 类型:${item.type} ${item.default ? "默认值:" + item.default : ""}`);
    }
    return text;
  },
  saveHandle: (config) => {
    let define = config.define;
    for (let item of define) {
      if (!item.key) {
        return false;
      }
    }
    submitOptions(config);
    return true;
  },
  mounted(config) {
    submitOptions(config);
  },
};

/**
 * @description: 提交条件可以比较的数据给仓库
 * @param {*} config
 * @return {*}
 */
function submitOptions(config) {
  let i = 0;
  let defines = config.define.map((define) => {
    return {
      id: i++,
      name: define.key,
      type: define.type,
      source: "define",
    };
  });
  let params = store.state.form.body.map((x) => {
    return {
      id: i++,
      name: x.name,
      type: x.type,
      source: "form",
    };
  });
  store.commit("setDefines", defines.concat(params));
}
