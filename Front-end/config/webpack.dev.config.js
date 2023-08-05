/* eslint-disable */
const devServerConfig = require('./setupProxy');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const {
  developServer: { proxy },
} = devServerConfig;

module.exports = {
  mode: 'development',
  plugins: [new ReactRefreshWebpackPlugin()],
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
    open: true,
    port: process.env.PORT || 5000,
    proxy,
    watchFiles: {
      options: {
        ignored: process.env.WATCH_FILES_REG ? !new RegExp(process.env.WATCH_FILES_REG) : undefined,
      },
    },
    webSocketServer: 'ws',
  },
};
