/* eslint-disable */
const devServerConfig = require('./setupProxy');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { developServer: { proxy } } = devServerConfig;

module.exports = {
  mode: 'development',
  plugins: [
    new ReactRefreshWebpackPlugin(),
  ],
  devtool: 'source-map',
  devServer: {
    client: {
      logging: 'error',
      overlay: false,
      webSocketTransport: 'ws',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    historyApiFallback: true,
    hot: true,
    open: true,
    port: 5000,
    proxy,
    watchFiles: ['src/**/*', 'node_modules/**/*', 'public/**/*'],
    webSocketServer: 'ws',
  },
}
