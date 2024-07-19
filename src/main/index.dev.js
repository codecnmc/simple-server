/*
 * @Author: 羊驼
 * @Date: 2024-01-02 11:46:26
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-04-18 10:11:37
 * @Description: file content
 */
/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint-disable */

// Install `electron-debug` with `devtron`
// Install `vue-devtools`
require("electron").app.on("ready", () => {
  // let installExtension = require('electron-devtools-installer')
  // installExtension.default(installExtension.VUEJS_DEVTOOLS)
  //   .then(() => {})
  //   .catch(err => {
  //     console.log('Unable to install `vue-devtools`: \n', err)
  //   })
  // BrowserWindow.addExtension('D:\VueDevTools-master\\chrome')
});

// Require `main` process to boot app
require("./index");
