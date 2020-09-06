const GoogleFontsPlugin = require("@beyonk/google-fonts-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const isProduction = process.env.NODE_ENV === "production";

const webpackConfig = {
  productionSourceMap: false,
  configureWebpack: {
    devtool: isProduction ? false : "eval-source-map",
    plugins: [
      new GoogleFontsPlugin({
        fonts: [
          { family: "Source Sans Pro", variants: ["300", "400", "600"] },
          { family: "Source Code Pro", variants: ["400"] },
        ],
        formats: ["woff", "woff2"],
      }),
    ],
    devServer: {
      https: true,
      proxy: {
        "/wakatime": {
          target: "https://wakatime.com",
          secure: false,
          changeOrigin: true,
          pathRewrite: { "^/wakatime": "" },
        },
      },
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
        parallel: true,
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
