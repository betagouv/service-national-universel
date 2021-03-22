const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");

module.exports = (env) => {
  const plugins = [
    //  for th time
    // new ManifestPlugin({
    //   seed: require('./public/manifest.json')
    // }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
      inject: "body",
      favicon: path.join("public/favicon.ico"),
    }),
  ];

  return {
    mode: "development",
    entry: ["./src/index.js"],
    devtool: "source-map",
    output: {
      path: path.resolve("build"),
      filename: "[hash].index.js",
      publicPath: "/",
    },
    devServer: {
      contentBase: "build",
      historyApiFallback: true,
      inline: true,
      hot: true,
    },
    node: {
      fs: "empty",
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.js$/,
          loader: "babel-loader",
          include: path.resolve("src"),
          exclude: /node_modules/,
          query: {
            babelrc: true,
          },
        },
        {
          test: /\.(gif|png|jpe?g|svg|woff|woff2)$/i,
          exclude: /node_modules/,
          use: [
            {
              loader: "file-loader",
              options: {
                esModule: false,
              },
            },
          ],
        },
      ],
    },
    plugins,
  };
};
