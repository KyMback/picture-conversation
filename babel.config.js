const presets = [
  "@babel/preset-env",
  [
    "@babel/preset-react",
    {
      runtime: "automatic",
    },
  ],
  "@babel/preset-typescript",
];
const plugins = [
  [
    "module-resolver",
    {
      root: ["./src"],
      alias: {
        stores: "./src/stores",
        utils: "./src/utils",
      },
    },
  ],
];

module.exports = {
  presets,
  plugins,
};
