module.exports = {
  extends: "stylelint-config-standard",
  plugins: "stylelint-less",
  customSyntax: "postcss-less",
  rules: {
    // 不要使用已被 autoprefixer 支持的浏览器前缀
    "media-feature-name-no-vendor-prefix": true,
    "at-rule-no-vendor-prefix": true,
    "selector-no-vendor-prefix": true,
    "property-no-vendor-prefix": true,
    // "value-no-vendor-prefix": true, // 禁止给值添加浏览器引擎前缀。
    "selector-pseudo-class-no-unknown": [true, {
      "ignorePseudoClasses": ["global", "local"]
    }],
    "at-rule-no-unknown": [true, {
      "ignoreAtRules": ["/^my-/", "custom", "extends", "ignores"]
    }],
    "indentation": null,
    "rule-empty-line-before": "never",
    "at-rule-empty-line-before": "never",
    "selector-list-comma-newline-after": "always-multi-line",
    "declaration-colon-newline-after": "always-multi-line",
    "string-quotes": "single",
    "selector-class-pattern": "^([a-z][a-z0-9]*)((?:-|--|_|__)[a-z0-9]+)*$",
    "color-function-notation": "legacy",
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
