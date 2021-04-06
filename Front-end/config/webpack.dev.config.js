/* eslint-disable */
const devServerConfig = require('./setupProxy');
const { developServer: { proxy } } = devServerConfig;
const webpack = require('webpack');

module.exports = {
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    // mode: 'development',
    devtool: 'source-map',
    devServer: {
        port: 5000,
        open: true,
        progress: true,
        proxy: proxy,
        hot: true,
    }
}