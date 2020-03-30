const path = require("path");

// use vue-async-function sourcemap when generating source maps
function addSourceMapLoader(config) {
  config.module
    .rule("source-map-loader")
    .test(/\.js$/)
    .enforce("pre")
    .include.add(path.join(__dirname, "node_modules/vue-async-function"))
    .end()
    .use("source-map-loader")
    .loader("source-map-loader")
    .end();
}

module.exports = {
  configureWebpack: {
    devtool: "source-map",
    // enable symlinked resolving of vue-async-function, make sure to load one Vue and plugin module
    resolve: {
      symlinks: false,
      alias: {
        vue: path.resolve(__dirname, "node_modules/vue"),
        "@vue/composition-api": path.resolve(
          __dirname,
          "node_modules/@vue/composition-api"
        ),
      },
    },
  },
  chainWebpack: (config) => {
    addSourceMapLoader(config);
  },
};
