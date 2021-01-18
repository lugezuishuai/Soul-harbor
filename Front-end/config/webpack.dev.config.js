const devServerConfig = require('./setupProxy');
const { developServer: { proxy } } = devServerConfig;
const webpack = require('webpack');

module.exports = {
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    // mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        port: 5000,
        open: true,
        progress: true,
        proxy: proxy,
        hot: true,
    }
}