const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
    globalObject: "this",
    library: "skcore",
    libraryTarget: "umd",
    umdNamedDefine: true,
  },
  mode: "production",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "package.json"),
          to: path.resolve(__dirname, "dist"),
        },
      ],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: true,
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
};
