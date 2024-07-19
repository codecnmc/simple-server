/*
 * @Author: 羊驼
 * @Date: 2024-05-31 16:32:17
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-06-03 09:37:45
 * @Description: file content
 */
const { ipcMain, app, BrowserWindow } = require("electron");
const database = require("../utils/database");
const Op = require("sequelize").Op;
/**
 * @description:系统事件处理
 * @param {BrowserWindow} window
 * @return {*}
 */
module.exports = async (window, message) => {
  let { Interfacace } = await database.createBaseConnection();
  const events = {
    queryInterface: async () => {
      let interfaces = await Interfacace.findAll();
      return JSON.parse(JSON.stringify(interfaces));
    },
    createInterface: async (event, form) => {
      let exist = await Interfacace.findOne({
        where: {
          method: form.method,
          url: form.url,
        },
      });
      if (exist) {
        message("error", "已存在同名方法的路径");
        return false;
      }
      return await Interfacace.create(form)
        .then(() => {
          message("success", "接口创建成功");
          return true;
        })
        .catch((err) => {
          message("error", `接口创建失败 ${err}`);
          return false;
        });
    },
    editInterface: async (event, { id, data }) => {
      let item = await Interfacace.findByPk(id);
      if (!item) {
        message("error", "未找到该接口");
        return false;
      }
      let exist = await Interfacace.findOne({
        where: {
          id: {
            [Op.ne]: id,
          },
          method: data.method,
          url: data.url,
        },
      });
      if (exist) {
        message("error", "已存在同名方法的路径");
        return false;
      }
      return await Interfacace.update(data, {
        where: {
          id,
        },
      })
        .then(() => {
          message("success", "接口修改成功");
          return true;
        })
        .catch((err) => {
          message("error", `接口修改失败 ${err}`);
          return false;
        });
    },
    deleteInterface: async (event, id) => {
      let item = await Interfacace.findByPk(id);
      if (!item) {
        message("error", "未找到该接口");
        return false;
      }
      return await item
        .destroy()
        .then(() => {
          message("success", "接口删除成功");
          return true;
        })
        .catch((err) => {
          message("error", `接口删除失败 ${err}`);
          return false;
        });
    },
    switchStatus: async (event, id) => {
      let item = await Interfacace.findByPk(id);
      if (!item) {
        message("error", "未找到该接口");
        return false;
      }
      item.enable = !item.enable;
      return await item
        .save()
        .then(() => {
          message("success", "接口状态修改成功");
          return true;
        })
        .catch((err) => {
          message("error", `接口状态修改失败 ${err}`);
          return false;
        });
    },
  };
  for (let kv in events) {
    ipcMain.handle(kv, events[kv]);
  }
};
