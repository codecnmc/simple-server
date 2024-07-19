/*
 * @Author: 羊驼
 * @Date: 2024-05-27 09:25:09
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-07-11 16:28:14
 * @Description: file content
 */
const { ipcMain, app, BrowserWindow } = require("electron");
const Server = require("../utils/handle");
const database = require("../utils/database");
const moment = require("moment");
/**
 * @description:服务事件处理
 * @param {BrowserWindow} window
 * @return {*}
 */
module.exports = async (window, message) => {
  let connect = null;
  // 测试用的简化logger 实际上应该是缓存N条写入本地 有需要的时候才读本地 防止过多数据
  let logger = (message) => {
    let time = moment().format("yyyy-MM-DD HH:mm");
    window.webContents.send("logger", `${time}：${message}`);
  };
  let { Interfacace } = await database.createBaseConnection();
  const events = {
    startServer: async (event, port) => {
      let routes = await Interfacace.findAll({
        where: {
          enable: true,
        },
      });
      let db = await database.createConnection(() => {});
      connect = new Server(port, routes, logger, window, db, message);
    },
    closeServer: () => {
      connect && connect.closeServer();
      connect = null;
    },
  };
  for (let kv in events) {
    ipcMain.handle(kv, events[kv]);
  }
};
