const path = require("path");

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BabelPlugin = require("babel-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

//
module.exports = (env) => {
  const mode = env["production"] ? "production" : "development";
  console.log("mode", mode);
  const plugins = [
    // for the time
    // new ManifestPlugin({
    //   seed: require("./public/manifest.json")
    // }),
    new CopyWebpackPlugin([
      { from: "./public/robots.txt", to: "./robots.txt" },
      { from: "./public/logo.png", to: "./logo.png" },
    ]),
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
    new webpack.DefinePlugin({ "process.env": JSON.stringify(mode) }),
    new BabelPlugin({
      test: /\.js$/,
      presets: [
        [
          "env",
          {
            loose: true,
            modules: false,
            targets: { browsers: [">1%"] },
            useBuiltIns: true,
          },
        ],
      ],
      sourceMaps: false,
      compact: false,
    }),
    // new BundleAnalyzerPlugin()
  ];

  return {
    mode,
    entry: ["babel-polyfill", "./src/index.js"],
    devtool: "source-map",
    output: {
      path: path.resolve("build"),
      filename: "[hash].index.js",
      publicPath: "/",
      // sourceMapFilename: "[hash].index.map.js",
    },
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    node: { fs: "empty" },
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
          query: { babelrc: true },
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
            {
              loader: "image-webpack-loader",
              options: {
                disable: true,
              },
            },
          ],
        },
      ],
    },
    plugins: plugins,
  };
};
