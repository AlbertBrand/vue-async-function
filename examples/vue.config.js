const path = require("path");

module.exports = {
  configureWebpack: {
    devtool: "source-map",
    // enable symlinked resolving of vue-async-function, make sure to load one Vue and plugin module
    resolve: {
      symlinks: false,
      alias: {
        vue: path.resolve(__dirname, "node_modules/vue"),
        "vue-function-api": path.resolve(
          __dirname,
          "node_modules/vue-function-api"
        )
      }
    }
  }
};
