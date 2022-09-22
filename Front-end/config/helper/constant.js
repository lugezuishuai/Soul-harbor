/* eslint-disable @typescript-eslint/no-var-requires */
const resolve = require('./resolve');
const dotenv = require('dotenv');

const env = process.env;
const isEnvProduction = env.NODE_ENV === 'production';
const isEnvDevelopment = env.NODE_ENV === 'development';

dotenv.config({ path: isEnvProduction ? '.env' : '.env.development' });

const isAnalyse = env.ANALYSE_ENABLED === 'true';
const publicPath = isEnvProduction ? env.PUBLIC_PATH : '/';
const srcPath = resolve('src');
const distPath = resolve('dist');

module.exports = {
  isEnvProduction,
  isEnvDevelopment,
  isAnalyse,
  publicPath,
  srcPath,
  distPath,
};
