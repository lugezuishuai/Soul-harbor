/* eslint-disable */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  plugins: [
    new CleanWebpackPlugin()
  ],
  optimization: {
    splitChunks: {
      minSize: 20000,
      cacheGroups: {
        common: {
          test: /[\\/]src[\\/]/,
          name: 'common',
          chunks: 'initial',
          priority: 1, // 优先级，当模块符合多个规则时，采取优先级高的规则
          minChunks: 2, // 模块被引用2次及以上的才抽离
          reuseExistingChunk: true, // 已经被分离，被重用而不是生成新的模块
        },
        vendors: { // 拆分第三方库（通过npm|yarn安装的库）
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'initial',
          priority: 2,
          minChunks: 1, // 模块被引用1次及以上的才抽离
        },
        reactBase: {
          test: module => {
            return /react|redux/.test(module.context);
          },
          name: 'reactBase',
          chunks: 'initial',
          priority: 10,
          minChunks: 1, // 模块被引用1次及以上的才抽离
        },
      }
    }
  }
}
