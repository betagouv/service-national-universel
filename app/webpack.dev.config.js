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
      favicon: path.join("public/favicon.ico"),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin(),
  ].filter(Boolean);

  return {
    mode: "development",
    target: "web",
    entry: ["./src/index.js"],
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
    resolve: { fallback: { fs: false } },
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
          exclude: /node_modules(?!\/snu-lib)/,
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
