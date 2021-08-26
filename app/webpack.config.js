const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const SentryWebpackPlugin = require("@sentry/webpack-plugin");

//
module.exports = () => {
  const mode = "production";
  const plugins = [
    new CopyWebpackPlugin({
      patterns: [{ from: "./public/robots.txt", to: "./robots.txt" }],
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
      inject: "body",
      favicon: path.join("public/favicon.ico"),
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        html5: true,
        minifyCSS: true,
        removeComments: true,
        removeEmptyAttributes: true,
      },
    }),
    new SentryWebpackPlugin({
      // sentry-cli configuration - can also be done directly through sentry-cli
      // see https://docs.sentry.io/product/cli/configuration/ for details
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "selego",
      project: "snu",
      // release: process.env.SENTRY_RELEASE,
      environment: "app",

      // other SentryWebpackPlugin configuration
      include: ".",
      ignore: ["node_modules", "webpack.config.js"],
    }),
    new webpack.DefinePlugin({ "process.env": JSON.stringify(mode) }),
  ];

  return {
    mode,
    entry: ["./src/index.js"],
    devtool: "source-map",
    output: {
      path: path.resolve("build"),
      filename: "[contenthash].index.js",
      sourceMapFilename: "[contenthash].index.js.map",
      publicPath: "/",
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
          options: { babelrc: true },
        },
        {
          test: /\.(gif|png|jpe?g|svg|woff|woff2)$/i,
          exclude: /node_modules/,
          type: "asset/resource",
        },
      ],
    },
    plugins: plugins,
  };
};
