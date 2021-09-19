const TerserPlugin = require("terser-webpack-plugin");
const isProduction = process.env.NODE_ENV === "production";

const webpackConfig = {
  productionSourceMap: false,
  configureWebpack: {
    devtool: isProduction ? false : "eval-source-map",
    // plugins: [
    // ],
    devServer: {
      disableHostCheck: true,
      https: true,
    },
  },
};

if (isProduction) {
  webpackConfig.configureWebpack.optimization = {
    runtimeChunk: true,
    minimize: true,
    splitChunks: {
      chunks: "all",
      maxSize: 2440000,
    },
    minimizer: [
      new TerserPlugin({
        extractComments: true,
        parallel: false,
        terserOptions: {
          mangle: true,
          output: {
            comments: false,
          },
        },
      }),
    ],
  };
}

module.exports = webpackConfig;
