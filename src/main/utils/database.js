/*
 * @Author: 羊驼
 * @Date: 2024-05-31 09:37:22
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-07-19 13:45:21
 * @Description: file content
 */
const sequelize = require("sequelize");
const { Sequelize, STRING, INTEGER, DATE, TEXT, NOW, ENUM, BOOLEAN } = sequelize;
const { app } = require("electron");
const fs = require("fs");
const path = require("path");
const configPath = path.join(app.getAppPath(), "config");
const jsonPath = path.join(configPath, "config.json");
const moment = require("moment");
let customDatabase = null;
const db = new Sequelize({
  dialect: "sqlite",
  storage: path.join(app.getAppPath(), "data.db"),
});
const Table = db.define(
  "t_tables",
  {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: STRING, allowNull: false },
    comment: { type: STRING, allowNull: false },
    data: {
      type: TEXT("long"),
      allowNull: false,
      get() {
        return JSON.parse(this.getDataValue("data"));
      },
      set(value) {
        if (typeof value == "string") {
          this.setDataValue("data", value);
        } else {
          this.setDataValue("data", JSON.stringify(value));
        }
      },
    },
    createdAt: {
      type: DATE,
      defaultValue: NOW,
      get() {
        return moment(this.getDataValue("createdAt")).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    updatedAt: {
      type: DATE,
      defaultValue: NOW,
      get() {
        return moment(this.getDataValue("updatedAt")).format("YYYY-MM-DD HH:mm:ss");
      },
    },
  },
  {
    freezeTableName: true, // Model 对应的表名将与model名相同
    timestamps: true,
    paranoid: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
  }
);

const Interfacace = db.define(
  "t_intefaces",
  {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: STRING, allowNull: false },
    url: { type: TEXT, allowNull: false },
    enable: { type: BOOLEAN, allowNull: false },
    method: { type: ENUM, values: ["get", "post", "put", "delete"], allowNull: false },
    middleware: {
      type: TEXT,
      allowNull: false,
      get() {
        return JSON.parse(this.getDataValue("middleware"));
      },
      set(value) {
        if (typeof value == "string") {
          this.setDataValue("middleware", value);
        } else {
          this.setDataValue("middleware", JSON.stringify(value));
        }
      },
    },
    body: {
      type: TEXT,
      allowNull: false,
      get() {
        return JSON.parse(this.getDataValue("body"));
      },
      set(value) {
        if (typeof value == "string") {
          this.setDataValue("body", value);
        } else {
          this.setDataValue("body", JSON.stringify(value));
        }
      },
    },
    logic: {
      type: TEXT("long"),
      allowNull: false,
      get() {
        return JSON.parse(this.getDataValue("logic"));
      },
      set(value) {
        if (typeof value == "string") {
          this.setDataValue("logic", value);
        } else {
          this.setDataValue("logic", JSON.stringify(value));
        }
      },
    },
    createdAt: {
      type: DATE,
      defaultValue: NOW,
      get() {
        return moment(this.getDataValue("createdAt")).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    updatedAt: {
      type: DATE,
      defaultValue: NOW,
      get() {
        return moment(this.getDataValue("updatedAt")).format("YYYY-MM-DD HH:mm:ss");
      },
    },
  },
  {
    freezeTableName: true, // Model 对应的表名将与model名相同
    timestamps: true,
    paranoid: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
  }
);

Table.sync();
Interfacace.sync();
let config = {
  port: 3000,
  type: "sqlite",
  sqlite: {
    storage: "./data.db",
  },
  mysql: {
    database: "",
    username: "",
    password: "",
    host: "127.0.0.1",
    port: "",
  },
};
// db.sync();
// 配置初始化
if (!fs.existsSync(configPath)) {
  fs.mkdirSync(configPath);
  fs.writeFileSync(jsonPath, JSON.stringify(config));
} else {
  config = JSON.parse(fs.readFileSync(jsonPath));
}
module.exports = {
  config,
  setConfig(data) {
    config = data;
    fs.writeFileSync(jsonPath, JSON.stringify(data));
  },
  async createBaseConnection() {
    return { db, Table, Interfacace };
  },
  /**
   * @description:创建客户的连接
   * @return {sequelize.Sequelize}
   */
  async createConnection(message, force) {
    let database = customDatabase;
    if (!database || force) {
      database && database.close();
      switch (config.type) {
        case "sqlite":
          database = new Sequelize({
            dialect: "sqlite",
            storage: path.join(app.getAppPath(), "custom.db"),
          });
          break;
        case "mysql":
          let { database: dtb, username, password, port, host } = config.mysql;
          database = new Sequelize(dtb, username, password, {
            host: `${host}:${port}`,
            dialect: "mysql",
          });
          break;
        default:
          message("error", "连接异常");
          return null;
      }
      try {
        await database.authenticate();
        message("success", "数据库连接正常");
        customDatabase = database;
        this.createDefine();
        return database;
      } catch (error) {
        message("error", `无法连接导数据库 原因：error`);
        customDatabase = null;
        return null;
      }
    }
    return database;
  },
  async createDefine() {
    let { Table } = await this.createBaseConnection();
    let custom = await this.createConnection(() => {});
    if (custom) {
      let tables = await Table.findAll();
      for (let table of tables) {
        let struct = {
          id: { type: INTEGER, primaryKey: true, autoIncrement: true },
          createdAt: {
            type: DATE,
            defaultValue: NOW,
            get() {
              return moment(this.getDataValue("createdAt")).format("YYYY-MM-DD HH:mm:ss");
            },
          },
          updatedAt: {
            type: DATE,
            defaultValue: NOW,
            get() {
              return moment(this.getDataValue("updatedAt")).format("YYYY-MM-DD HH:mm:ss");
            },
          },
        };
        let setting = {
          freezeTableName: true, // Model 对应的表名将与model名相同
          timestamps: true,
          paranoid: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
        };
        table.data.forEach((field) => {
          struct[field.name] = {
            type: sequelize[field.type],
            allowNull: !!field.null,
            defaultValue: field.default,
            comment: field.comment,
          };
        });
        custom.define(table.name, struct, setting);
      }
      return true;
    }
    return false;
  },
};
