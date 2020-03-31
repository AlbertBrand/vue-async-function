module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        modules: false,
        corejs: 3,
        useBuiltIns: "usage",
      },
    ],
    "@babel/typescript",
  ],
  env: {
    test: {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              node: "current",
            },
          },
        ],
        "@babel/typescript",
      ],
    },
  },
};
