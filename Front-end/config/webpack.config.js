/* eslint-disable */
const merge = require('webpack-merge')
const baseConfig = require('./webpack.base.config')
const devConfig = require('./webpack.dev.config')
const proConfig = require('./webpack.prod.config')
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

module.exports = (env, argv) => {
  const config = argv.mode === 'development' ? devConfig : proConfig;
  return argv.mode === 'development' ? merge(baseConfig, config) : smp.wrap(merge(baseConfig, config));
};