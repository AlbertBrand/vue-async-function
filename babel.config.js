module.exports = {
  presets: [
    [
      "@babel/env",
      {
        modules: false,
        corejs: 2,
        useBuiltIns: "usage"
      }
    ]
  ],
  env: {
    test: {
      presets: ["@babel/preset-env"]
    }
  }
};
