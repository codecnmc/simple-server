/*
 * @Author: 羊驼
 * @Date: 2024-05-16 10:55:46
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-07-19 11:50:40
 * @Description: file content
 */
const Koa = require("koa");
const app = new Koa();
const cors = require("@koa/cors");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const { BrowserWindow } = require("electron");
const { Sequelize, Op } = require("sequelize");
const router = new Router();
const attributes = Symbol("attributes");
const methods = {
  get: "get",
  post: "post",
  put: "put",
  delete: "delete",
};
const type = {
  开始: 0,
  数据库: 11,
  条件: 2,
  条件分支: 3,
  结束: 4,
  结果返回: 12,
};
const OpDic = {};
class Server {
  // 服务
  server = null;
  // 路由
  routes = [];
  // 前端的logger事件
  logger = null;
  // 窗口数据
  window = null;
  /**
   * @description:构造函数
   * @param {number} port 端口
   * @param {Array<object>} routes 路由数据
   * @param {function} logger 日志
   * @param {BrowserWindow} window 窗口
   * @param {Sequelize} db 数据库
   * @param {function} message 显示在前端的信息框
   * @return {*}
   */
  constructor(port, routes, logger, window, db, message) {
    this.logger = logger;
    this.window = window;
    this.server = app.listen(port, () => {
      logger("服务器创建成功");
      message("success", "服务器创建成功");
      window.webContents.send("connect");
      for (let item of routes) {
        if (!item.enable) continue;
        let method = methods[item.method.toLowerCase()];
        let path = `${method} ${item.url} ${item.name}`;
        if (!method) {
          logger(`${path} 无效方法：${method}`);
          return this.closeServer();
        }
        let unExist = item.middleware.find((x) => !this.middlewares[x]);
        if (unExist) {
          logger(`${path} 无效中间件：${unExist}`);
          return this.closeServer();
        }
        //TODO config
        router[method](item.url, ...item.middleware.map((x) => this.middlewares[x]), async (ctx) => {
          // TODO 处理headers的问题
          let args = [methods.get, methods.delete].includes(method) ? ctx.query : ctx.request.body;
          let rules = this.flatBody(item.body);
          // 转换结构
          for (let field in rules) {
            try {
              this.validateField(rules[field], args[field], [field]);
            } catch (err) {
              ctx.body = {
                status: 400,
                message: err.message,
              };
              ctx.status = 400;
              return;
            }
          }
          let current_flow = item.logic;
          let define = {};
          const transaction = await db.transaction();
          try {
            while (current_flow.childNode) {
              let setting = current_flow.setting;
              switch (current_flow.type) {
                case type.开始:
                  setting.define.forEach((item) => {
                    switch (item.type) {
                      case "string":
                      case "number":
                        define[item.key] = item.default || "";
                        break;
                      case "object":
                        define[item.key] = {};
                        break;
                    }
                  });
                  break;
                case type.数据库:
                  for (let command of setting.commands) {
                    switch (command.type) {
                      case "select":
                        let { where: conditions, method, offset, limit, flat, target, attributes } = command;
                        let model = db.models[command.table.name];
                        let condition = {
                          where: {},
                          transaction,
                        };
                        if (attributes.length) {
                          condition["attributes"] = attributes.map((x) => x.name);
                        }
                        if (method == "findAll") {
                          offset > 0 && Reflect.set(condition, "offset", offset);
                          limit > 0 && Reflect.set(condition, "limit", limit);
                        }

                        conditions.forEach((item) => {
                          let logic = item.logic == "与" ? Op.and : Op.or;
                          if (!condition.where[logic]) {
                            condition.where[logic] = [];
                          }
                          let config = {};
                          let name = item.name.name;
                          if (item.useRef) {
                            let refTarget = item.compare.source == "form" ? args : define;
                            refTarget = refTarget[item.compare.name];
                            config[name] = refTarget;
                          } else {
                            config[name] = item.compare;
                          }
                          condition.where[logic].push(config);
                        });
                        define[target.name] = await model[method](condition);
                        if (flat && define[target.name]) {
                          let attr = attributes[0].name;
                          switch (method) {
                            case "findOne":
                              define[target.name] = define[target.name][attr];
                              break;
                            case "findAll":
                              define[target.name] = define[target.name].map((x) => x[attr]);
                              break;
                          }
                        }
                        break;
                    }
                  }
                  break;
                case type.结果返回:
                  let { tradtion, status, custom, value } = setting;
                  let data = null;
                  switch (custom) {
                    case "input":
                      data = value;
                      break;
                    case "params":
                      data = value.source == "define" ? define[value.name] : args[value.name];
                      break;
                  }
                  await transaction.commit();
                  if (tradtion) {
                    return (ctx.body = {
                      status,
                      data,
                    });
                  } else {
                    ctx.status = status;
                    ctx.body = data;
                  }
                  break;
              }
              current_flow = current_flow.childNode;
            }
          } catch (err) {
            await transaction.rollback();
            console.log(err.message);
            logger(`接口出错:` + err.message);
            return (ctx.body = "接口出错");
          }
          // logic
          return (ctx.body = "ok");
        });
        logger(`${path} 初始化成功`);
      }
    });

    // 服务器基础配置
    app.use(cors());
    app.use(bodyParser());
    app.use(router.routes()).use(router.allowedMethods());
    app.on("error", (err, ctx) => {
      logger("server error:" + err.message);
      message("error", "服务器异常");
      this.closeServer();
    });
  }

  // 出现了无法让服务器继续运行的情况 或者手动关闭
  closeServer() {
    console.log(this.logger);
    this.logger("服务器关闭");
    this.window.webContents.send("disconnect");
    this.server.close();
    this.server = null;
  }

  // 中间件
  middlewares = {
    logger: async (ctx, next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      ctx.set("X-Response-Time", `${ms}ms`);
      this.logger(`${ctx.method} ${ctx.url} - ${ms}ms`);
    },
  };

  // 扁平化参数规则
  flatBody(body) {
    let dic = {};
    let handle = (fields, father) => {
      for (let item of fields) {
        father[item.name] = { [attributes]: item };
        switch (item.type) {
          case "array":
          case "object":
            item.children.length && handle(item.children, father[item.name]);
            break;
        }
      }
    };
    handle(body, dic);
    return dic;
  }

  // 处理校验情况
  validateField(source, target, prefixs = []) {
    let attr = source[attributes];
    let { allowNull, empty, regex, test } = attr.validate;
    let prefix = `${prefixs.length ? prefixs.toString().replace(/\,/g, "/") : ""}`;
    if (!allowNull && target === undefined) {
      throw Error(`${prefix}为Null`);
    }
    let target_type = typeof target;
    if (target_type == "undefined") {
      return true;
    }
    let type_message = `${prefix}类型不符合 需要的是${attr.type} 得到的是${target_type}`;
    if (target_type == "object" && !Array.isArray(target) && attr.type == "array") {
      throw Error(type_message);
    } else if (target_type !== attr.type) {
      throw Error(type_message);
    }
    if (!test) return true;
    switch (attr.type) {
      case "object":
        for (let field in source) {
          this.validateField(source[field], target[field], [...prefixs, field]);
        }
        break;
      case "array":
        if (!target.length) {
          throw Error(`${prefix}数组无数据`);
        }
        // for (let i = 0; i < target.length; i++) {
        //   let target_item = target[i];
        //   for (let field in source) {
        //     validateField();
        //   }
        // }
        break;
      default:
        let exp = new RegExp(regex || "");

        if (!empty && target === "") {
          throw Error(`${prefix}为空`);
        }
        if (regex !== "" && !exp.test(target)) {
          throw Error(`${prefix}未通过预设的正则校验`);
        }
        break;
    }
  }
}
module.exports = Server;
