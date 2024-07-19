/*
 * @Author: 羊驼
 * @Date: 2024-01-11 16:43:46
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-04-18 16:10:08
 * @Description: file content
 */
const config = require("../package.json");
let name = `./${config.displayName}-win32-x64`;
const del = require("del");
del.sync([`${name}/**`]);

const spawnObj = require("child_process").exec(`electron-packager ./dist/electron ${config.displayName} --overwrite --asar `, {
  encoding: "utf-8",
  stdio: "pipe",
});

spawnObj.stdout.on("data", function (data) {
  console.log(data);
});

spawnObj.stderr.on("data", (data) => {
  console.log(data);
});

spawnObj.on("exit", (code) => {
  if (code === 0) {
    console.log("打包完成");
  } else {
    console.log("打包失败");
  }
});
