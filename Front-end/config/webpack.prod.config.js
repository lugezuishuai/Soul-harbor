/* eslint-disable */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  plugins: [
    new CleanWebpackPlugin()
  ],
  // devtool: 'source-map', // 生产环境不要用source-map
  optimization: {
    splitChunks: {
      minSize: 20000,
      cacheGroups: {
        default: {
          name: 'common',
          chunks: 'initial',
          minChunks: 2,       // 模块被引用2次以上的才抽离
          priority: 1,      // 优先级，当模块符合多个规则时，采取优先级高的规则
          reuseExistingChunk: true,       // 已经被分离，被重用而不是生成新的模块
        },
        vendors: {              // 拆分第三方库（通过npm|yarn安装的库）
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'initial',
          priority: 2       // 当一个第三方库被引用超过2次的时候，不会打包到业务模块里了
        },
        reactBase: {
          name: 'reactBase',
          test: module => {
            return /react|redux/.test(module.context);
          },
          chunks: 'initial',
          priority: 10,
        },
      }
    }
  }
}
