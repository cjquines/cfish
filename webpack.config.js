const path = require("path");
const reactRefresh = require("@pmmmwh/react-refresh-webpack-plugin");
const reactRefreshTs = require("react-refresh-typescript").default;
const webpack = require("webpack");

const isDev = process.env.NODE_ENV !== "production";

const tsLoader = {
  loader: "ts-loader",
  options: {
    transpileOnly: true,
    getCustomTransformers: () => ({
      before: isDev ? [reactRefreshTs()] : [],
    }),
  },
};

const sassLoader = {
  loader: "sass-loader",
};

module.exports = {
  entry: [
    isDev && "webpack-hot-middleware/client",
    isDev && "react-hot-loader/patch",
    "./src/client.tsx",
  ].filter(Boolean),
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/",
  },
  mode: isDev ? "development" : "production",
  devtool: isDev ? "eval-source-map" : "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [tsLoader],
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
      },
      {
        test: /\.(js|jsx)$/,
        use: "react-hot-loader/webpack",
        include: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/,
        use: ["style-loader", "css-loader", sassLoader],
      },
    ],
  },
  plugins: [
    isDev && new webpack.HotModuleReplacementPlugin(),
    isDev &&
      new reactRefresh({
        overlay: {
          sockIntegration: "whm",
        },
      }),
  ].filter(Boolean),
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    modules: ["node_modules", path.join(__dirname, "src")]
  },
};
