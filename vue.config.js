const GoogleFontsPlugin = require("google-fonts-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  configureWebpack: {
    plugins: [
      //   new GoogleFontsPlugin({
      //     fonts: [
      //       { family: "Source Sans Pro", variants: ["300", "400", "600"] },
      //       { family: "Source Code Pro", variants: ["400"] }
      //     ]
      //   })
    ],
    optimization: {
      runtimeChunk: true,
      minimize: true,
      splitChunks: {
        chunks: "all"
      },
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            extractComments: false,
            parallel: true,
            output: {
              comments: false
            },
            ecma: 6
          }
        })
      ]
    },
    devServer: {
      proxy: {
        "/wakatime": {
          target: "https://wakatime.com",
          secure: false,
          changeOrigin: true,
          pathRewrite: { "^/wakatime": "" }
        }
      }
    }
  }
};
