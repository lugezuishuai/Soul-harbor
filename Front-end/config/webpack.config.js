/* eslint-disable */
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.config')
const devConfig = require('./webpack.dev.config')
const proConfig = require('./webpack.prod.config')
const { isEnvDevelopment } = require('./helper/constant');
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
// const smp = new SpeedMeasurePlugin();

module.exports = () => {
  const config = isEnvDevelopment ? devConfig : proConfig;
  return merge(baseConfig, config);
};
