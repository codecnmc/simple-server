/*
 * @Author: 羊驼
 * @Date: 2024-05-23 10:23:23
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-07-11 11:40:34
 * @Description: file content
 */
import view from "./index.vue";
export default {
  nodeName: "数据库操作",
  viewComponent: view,
  nodeComponent: null,
  // 允许覆盖同名
  type: {
    name: "数据库",
    value: 11,
    color: "#000",
    icon: null,
    btnClass: "",
  },
  setting: {
    commands: [],
  },
  textHandle: (config) => {
    let commands = config.commands;
    let text = [];
    for (let item of commands) {
      text.push(`${item.name}数据表:${item.table.comment}(${item.table.name})`);

      switch (item.type) {
        case "select":
          let { where, method, offset, limit, attributes, target, flat } = item;
          text.push(`赋值对象：${target.name}`);
          text.push(`查询方法：${method == "findOne" ? "查找一个" : "查找多个"}`);
          if (method != "findOne") {
            limit != -1 && text.push(`查询数量：${limit}`);
            offset != -1 && text.push(`偏移数量：${offset}`);
          }
          attributes.length && text.push(`查询属性：${attributes.map((x) => x.comment).toString()}`);
          attributes.length == 1 && flat && text.push(`扁平化输出：${flat ? "是" : "否"}`);
          where.length &&
            where.forEach(({ name: attr, operate, useRef, compare, logic }) => {
              let compareText = useRef ? `(${compare.source == "define" ? "定义" : "表单"})${compare.name}` : compare;
              text.push(`${attr.comment}${operate}${compareText}(${logic})`);
            });
          break;
      }
    }
    return text.length ? text : ["暂无配置"];
  },
  saveHandle: (config) => {
    let commands = config.commands;
    for (let command of commands) {
      switch (command.type) {
        case "select":
          return checkEmpty(command);
      }
    }
    return true;
  },
  openHandle: (config) => {},
  mounted(config) {},
};

function checkEmpty(object) {
  for (let key in object) {
    let value = object[key];
    if (value === "" || value === undefined) return false;
    if (value == "object") {
      return checkEmpty(value);
    }
  }
  return true;
}
