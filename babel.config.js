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
      },
    },
  ],
];

module.exports = {
  presets,
  plugins,
};
