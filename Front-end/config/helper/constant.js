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
const clientDistPath = resolve('dist/client'); // 客户端打包产物
const serverDistPath = resolve('dist/server'); // SSR打包产物
const resolveExtensions = ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json']; // 客户端resolve.extensions
const resolveExtensionsSSR = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json']; // SSR resolve.extensions

module.exports = {
  isEnvProduction,
  isEnvDevelopment,
  isAnalyse,
  publicPath,
  srcPath,
  clientDistPath,
  serverDistPath,
  resolveExtensions,
  resolveExtensionsSSR
};
