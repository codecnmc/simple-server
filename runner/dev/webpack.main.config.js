/*
 * @Author: 羊驼
 * @Date: 2024-05-14 10:37:12
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-07-11 14:55:12
 * @Description: file content
 */
"use strict";

process.env.BABEL_ENV = "main";

const path = require("path");
const { dependencies } = require("../../package.json");
const webpack = require("webpack");
let whiteList = ["mysql2", "sequelize", "sqlite3", "moment", "@koa/cors", "koa", "koa-bodyparser", "koa-router"];
let mainConfig = {
  entry: {
    main: path.join(__dirname, "../../src/main/index.js"),
  },
  externals: [...Object.keys(dependencies || {}).filter((x) => !x.includes(whiteList))],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        use: "node-loader",
      },
    ],
  },
  node: {
    __dirname: process.env.NODE_ENV !== "production",
    __filename: process.env.NODE_ENV !== "production",
  },
  output: {
    filename: "[name].js",
    libraryTarget: "commonjs2",
    path: path.join(__dirname, "../../dist/electron"),
  },
  plugins: [
    new webpack.DefinePlugin({
      __static: `"${path.join(__dirname, "../static").replace(/\\/g, "\\\\")}"`,
    }),
  ],
  resolve: {
    extensions: [".js", ".json", ".node"],
  },
  target: "electron-main",
};
module.exports = mainConfig;
