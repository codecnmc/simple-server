"use strict";

process.env.BABEL_ENV = "main";

const path = require("path");
const webpack = require("webpack");
const { dependencies } = require("../../package.json");

let mainConfig = {
  target: "electron-main",
  entry: {
    main: path.join(__dirname, "../../src/main/index.js"),
  },
  externals: [...Object.keys(dependencies || {})],
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
    __dirname: false,
    __filename: false,
  },
  output: {
    filename: "[name].js",
    libraryTarget: "commonjs2",
    path: path.join(__dirname, "../../dist/electron"),
  },
  plugins: [
    new webpack.DefinePlugin({
      __static: `"${path.join(__dirname, "../../static").replace(/\\/g, "\\\\")}"`,
    }),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: '"production"',
      },
    }),
  ],
  resolve: {
    extensions: [".js", ".json", ".node"],
  },
  performance: {
    maxEntrypointSize: 1024 * 1024 * 10,
    maxAssetSize: 1024 * 1024 * 20,
  },
  optimization: {
    minimize: true,
  },
};

module.exports = mainConfig;
