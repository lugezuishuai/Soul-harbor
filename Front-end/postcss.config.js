const path = require('path');

module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-url'),
    require('postcss-flexbugs-fixes'),
    require('postcss-preset-env')({
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
    }),
    // 移动端适配
    require('postcss-pxtorem')({
      rootValue: 53.99,
      include: path.resolve('src'),
    }),
    require('cssnano'),
  ],
};
