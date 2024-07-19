/*
 * @Author: 羊驼
 * @Date: 2024-05-27 09:25:09
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-05-31 15:49:32
 * @Description: file content
 */
const { ipcMain, app, BrowserWindow } = require("electron");
const database = require("../utils/database");

/**
 * @description:系统事件处理
 * @param {BrowserWindow} window
 * @return {*}
 */
module.exports = async (window, message) => {
  let { Table, db } = await database.createBaseConnection();
  const events = {
    getConfig: () => {
      return database.config;
    },
    setConfig: (event, data) => {
      database.setConfig(data);
    },
    testConnect: async () => {
      await database.createConnection(message, true);
    },
    queryTable: async () => {
      let custom = await database.createConnection((type, text) => {
        type == "error" && message(type, text);
      });
      if (custom) {
        let tables = await Table.findAll();
        tables = JSON.parse(JSON.stringify(tables));
        let query = custom.getQueryInterface();
        let result = [];
        for (let table of tables) {
          let exist = await query.tableExists(table.name);
          let count = 0;
          if (exist) {
            count = await custom.models[table.name].count();
          }
          result.push({
            ...table,
            status: exist ? "存在" : "不存在",
            count,
          });
        }
        return result;
      }
      return [];
    },
    insertTable: async (event, { name, comment, fields }) => {
      return await Table.create({
        name,
        comment,
        data: fields,
      })
        .then(() => {
          message("success", "创建成功");
          return true;
        })
        .catch((err) => {
          message("error", err);
          return false;
        });
    },
    editTable: async (event, { id, data: { comment, fields } }) => {
      let item = await Table.findByPk(id);
      if (!item) {
        message("error", "未找到该数据");
        return false;
      }
      item.data = fields;
      item.comment = comment;
      return await item
        .save()
        .then(() => {
          message("success", "修改成功");
          return true;
        })
        .catch((err) => {
          message("error", err);
          return false;
        });
    },
    deleteTable: async (event, id) => {
      let item = await Table.findByPk(id);
      if (!item) {
        message("error", "未找到该数据");
        return false;
      }
      return await item
        .destroy()
        .then(() => {
          message("success", "删除成功");
          return true;
        })
        .catch((err) => {
          message("error", err);
          return false;
        });
    },
    truncate: async () => {
      let custom = await database.createConnection((type, text) => {
        type == "error" && message(type, text);
      });
      return await custom
        .truncate({ force: true })
        .then(() => {
          message("success", "命令执行完毕");
          return true;
        })
        .catch((err) => {
          message("error", err);
          return false;
        });
    },
    tableSync: async () => {
      let custom = await database.createConnection((type, text) => {
        type == "error" && message(type, text);
      });
      custom && database.createDefine() && (await custom.sync({ alter: true }));
    },
    customQuery: async (event, { table, condition = {} }) => {
      let custom = await database.createConnection(message);
      if (custom) {
        let model = custom.models[table];
        let query = custom.getQueryInterface();
        if (!query.tableExists(table)) {
          message("error", "该表不存在实体 请初始化");
          return {
            count: 0,
            rows: [],
          };
        }
        let data = await model.findAndCountAll(condition);
        return data;
      }
    },
  };
  for (let kv in events) {
    ipcMain.handle(kv, events[kv]);
  }
};
