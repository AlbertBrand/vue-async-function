module.exports = {
  presets: [
    [
      "@babel/env",
      {
        modules: false,
        corejs: 3,
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
