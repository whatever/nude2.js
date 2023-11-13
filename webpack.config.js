const path = require("path")
const webpack = require("webpack")
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "nude2.bundled.js",
    libraryTarget: "var",
    library: "nude2",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.txt$/,
        type: "asset/source",
      },
    ],
  },
  mode: "development",
  plugins: [
    new NodePolyfillPlugin({
      excludeAliases: ["console"]
    }),
  ],
  devServer: {
  },
}
