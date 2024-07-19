/*
 * @Author: 羊驼
 * @Date: 2024-01-02 11:46:26
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-07-19 11:53:13
 * @Description: file content
 */

if (process.env.NODE_ENV !== "development") {
  global.__static = require("path").join(__dirname, "/static").replace(/\\/g, "\\\\");
}
const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const createWindow = () => {
  Menu.setApplicationMenu(null); // null值取消顶部菜单栏
  const win = new BrowserWindow({
    transparent: false,
    width: 1200,
    height: 800,
    // resizable: false,
    title: "简易服务器",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false, // 去掉顶部操作栏
    // icon: path.join(__dirname, "favicon256.ico"),
  });
  const winURL = process.env.NODE_ENV === "development" ? `http://localhost:9080` : `file://${__dirname}/index.html`;

  // 后续可打包放在本地也可以 使用在线的地址
  win.loadURL(winURL);

  return win;
};
app.on("ready", () => {
  const window = createWindow();

  let message = (type, message) => {
    window.webContents.send("message", { type, message });
  };
  require("./listeners/system")(window, message);
  require("./listeners/database")(window, message);
  require("./listeners/interface")(window, message);
  require("./listeners/server")(window, message);

  !app.isPackaged &&
    setTimeout(() => {
      window.webContents.openDevTools({ mode: "detach" });
    }, 1000);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
