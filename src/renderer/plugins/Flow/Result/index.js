/*
 * @Author: 羊驼
 * @Date: 2024-06-03 09:57:35
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-07-11 14:43:56
 * @Description: file content
 */
import view from "./index.vue";
let type = {
  null: "无",
  input: "自定义输入",
  params: "返回定义",
};
export default {
  nodeName: "结果返回",
  viewComponent: view,
  nodeComponent: null,
  // 允许覆盖同名
  type: {
    name: "结果返回",
    value: 12,
    color: null,
    icon: null,
    btnClass: "",
  },
  setting: {
    tradtion: true,
    status: 200,
    custom: "null",
    value: "",
  },
  textHandle: (config) => {
    let text = [];
    text.push(`传统返回：${config.tradtion ? "是" : "否"}`);
    text.push(`返回值：${config.status}`);
    text.push(`返回类型：${type[config.custom]}`);
    switch (config.custom) {
      case "params":
        text.push(`返回参数：(${config.value.source == "define" ? "定义" : "表单"})${config.value.name}`);
        break;
      case "input":
        text.push(`返回内容：${config.value}`);
        break;
    }
    return (text.length && text) || ["暂无配置"];
  },
  saveHandle: (config) => {
    if (config.status === "") return false;
    switch (config.custom) {
      case "params":
      case "input":
        if (config.value === "" || config.value === undefined) {
          return false;
        }
        break;
    }
    return true;
  },
};
