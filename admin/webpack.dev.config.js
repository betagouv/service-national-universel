const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

module.exports = (env) => {
  const plugins = [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
      inject: "body",
      favicon: path.join("public/favicon_dev.ico"),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin(),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ].filter(Boolean);

  return {
    mode: "development",
    target: "web",
    entry: ["./src/index.jsx"],
    devtool: "source-map",
    output: {
      path: path.resolve("build"),
      filename: "[contenthash].index.js",
      publicPath: "/",
    },
    devServer: {
      contentBase: "build",
      historyApiFallback: true,
      inline: true,
      hot: true,
    },
    resolve: { extensions: [".js", ".jsx"] },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
        {
          test: /\.(js|jsx)$/,
          loader: "babel-loader",
          include: path.resolve("src"),
          options: {
            babelrc: true,
            plugins: [require.resolve("react-refresh/babel")].filter(Boolean),
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
