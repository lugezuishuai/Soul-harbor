module.exports = {
  extends: "stylelint-config-standard",
  plugins: "stylelint-less",
  rules: {
    // 不要使用已被 autoprefixer 支持的浏览器前缀
    "media-feature-name-no-vendor-prefix": true,
    "at-rule-no-vendor-prefix": true,
    "selector-no-vendor-prefix": true,
    "property-no-vendor-prefix": true,
    "value-no-vendor-prefix": true,
    "selector-pseudo-class-no-unknown": [true, {
      "ignorePseudoClasses": ["global"]
    }],
    "at-rule-no-unknown": [true, {
      "ignoreAtRules": ["/^my-/", "custom"]
    }],
  },
  // 忽略其他文件，只校验样式相关的文件
  ignoreFiles: [
    "node_modules/**/*",
    "public/**/*",
    "dist/**/*",
    "test/**/*",
    "**/*.js",
    "**/*.jsx",
    "**/*.tsx",
    "**/*.ts",
    "*.jpg",
    "*.jpeg",
    "*.png",
    "*.woff",
    "*.svg",
    "*.min.css",
  ],
};
