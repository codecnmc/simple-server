/*
 * @Author: 羊驼
 * @Date: 2024-05-27 09:25:09
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-05-31 15:13:45
 * @Description: file content
 */
const { ipcMain, app, BrowserWindow } = require("electron");
/**
 * @description:系统事件处理
 * @param {BrowserWindow} window
 * @return {*}
 */
module.exports = async (window, message) => {
  const events = {
    close: () => {
      app.quit();
    },
    fullscreen: () => {
      window.setFullScreen(!window.isFullScreen());
    },
    minimize: () => {
      window.minimize();
    },
  };
  for (let kv in events) {
    ipcMain.handle(kv, events[kv]);
  }
};
