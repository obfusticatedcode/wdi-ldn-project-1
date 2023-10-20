const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.ts", // Path to your entry point. From this file Webpack will begin its work
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public/js"),
    publicPath: "/js/",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Match TypeScript files
        use: "ts-loader", // Use the ts-loader for TypeScript compilation
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      net: require.resolve("net-browserify"),
      tls: require.resolve("tls-browserify"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      assert: require.resolve("assert/"),
      stream: require.resolve("stream-browserify"),
      path: require.resolve("path-browserify"),
      zlib: require.resolve("browserify-zlib"),
      async_hooks: false,
      fs: false,
    },
  },
  devServer: {
    hot: true,
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
};
