const { isEnvDevelopment } = require("./config/helper/constant");

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        corejs: 3,
        useBuiltIns: 'usage',
        exclude: ['transform-typeof-symbol'],
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true, // 默认使用less，若使用css则改为'css'
      },
    ],
    '@babel/plugin-transform-runtime', // helpers函数统一管理
    '@babel/plugin-syntax-dynamic-import', // 支持import懒加载
    '@babel/plugin-transform-arrow-functions', // 箭头函数处理
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ], // 装饰器处理
    '@babel/plugin-proposal-class-properties', // 支持class的转译（loose为true时类属性将被编译为赋值表达式而不是 Object.defineProperty）
    '@babel/plugin-proposal-object-rest-spread', // 支持拓展运算符
    isEnvDevelopment && require.resolve('react-refresh/babel'), // 支持React HMR
  ].filter(Boolean),
};
