const WebpackDevServer = require('webpack-dev-server');
const devServerConfig = require('../build/setupProxy');
const { developServer: { proxy } } = devServerConfig;
const webpack = require('webpack');
const webpackConfig = require('../build/webpack.config');
//这里为什么不能传入函数？
const complie = webpack(webpackConfig);

//运行代理
// const express = require('express');
// const app = express();
// const { createProxyMiddleware } = require('http-proxy-middleware');
// proxy.forEach(({ path, ...config }) => {
//     app.use(path, createProxyMiddleware(config));
// });

//启动webpack-dev-server
const server = new WebpackDevServer(complie, {
    proxy,
    open: true,
});

server.listen(8080);