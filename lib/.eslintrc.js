module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true,
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  parser: "babel-eslint",
  rules: {
    "prettier/prettier": "warn",
  },
  globals: {
    RequestInfo: "readonly",
    RequestInit: "readonly",
  },
};
