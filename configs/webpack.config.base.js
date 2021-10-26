const { join } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ProvidePlugin } = require("webpack");

const rootPath = join(__dirname, "..");
const srcPath = join(rootPath, "src");
const publicPath = join(rootPath, "public");
const distPath = join(rootPath, "dist");

module.exports = {
  entry: join(srcPath, "index.tsx"),
  output: {
    path: distPath,
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    fallback: {
      buffer: "buffer",
    },
    alias: {
      mobx: "mobx/dist/mobx.esm.production.min.js",
    },
  },
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: join(publicPath, "index.html"),
    }),
    new ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
};
