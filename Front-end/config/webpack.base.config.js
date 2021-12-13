/* eslint-disable */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 单独抽离css文件
const PurgecssPlugin = require('purgecss-webpack-plugin'); // 去除无用的css
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const WebpackBar = require('webpackbar');
const resolve = require('./helper/resolve');
const webpack = require('webpack');
const dotenv = require('dotenv');
const glob = require('glob');
const { isEnvProduction, publicPath, srcPath, distPath } = require('./helper/constant');
dotenv.config({ path: '.env' });

const miniCssLoader = isEnvProduction ? MiniCssExtractPlugin.loader : 'style-loader';

const cssLoader = {
  loader: 'css-loader',
  options: {
    modules: false, // 禁用css Modules
  },
};

const postcssPlugins = [
  'postcss-import',
  'postcss-url',
  'postcss-flexbugs-fixes',
  ['postcss-preset-env', {
    autoprefixer: {
      flexbox: 'no-2009',
    },
    stage: 3,
  }],
  // 移动端适配
  ['postcss-pxtorem', {
    rootValue: 53.99, // 1rem = 53.99px
    include: srcPath,
  }],
];

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: () => {
      if (isEnvProduction) {
        postcssPlugins.push('cssnano');
      }

      return {
        plugins: postcssPlugins,
      };
    },
  },
};

const lessLoader = {
  loader: 'less-loader', 
  options: {
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: {
        // 以下两个配置使用前提是必须在按需引入那里配置"style": true，否则不起作用，因为这里要是用less变量
        // @primary-color是设置antd的主题色，默认是蓝色的
        // "@primary-color": "red",
        // @ant-prefix是自定义antd组件类名前缀的，需要配合<ConfigProvider prefixCls="ant">使用
        '@ant-prefix': 'ant',
      },
    },
  },
};

const styleResourceLoader = {
  loader: 'style-resources-loader',
  options: {
    patterns: resolve('src/variable.less'),
    injector: 'append',
  },
};

const babelLoader = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    cacheCompression: false,
    compact: isEnvProduction,
  },
};

module.exports = {
  entry: {
    app: './src/index.tsx'
  },
  output: {
    filename: isEnvProduction ? 'js/[name].[contenthash:8].js' : '[name].[hash:8].js',
    chunkFilename: isEnvProduction ? 'js/[name].[contenthash:8].js' : '[name].[hash:8].js',
    path: distPath,
    publicPath,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': srcPath,
    },
  },
  cache: {
    type: 'filesystem',
    buildDependencies: {
      defaultWebpack: ['webpack/lib/'],
      config: [__filename],
      tsconfig: [resolve('tsconfig.json')],
    },
  },
  module: {
    noParse: /jquery|chartjs/,
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/i,
        use: [babelLoader],
        include: srcPath,
      },
      {
        test: /\.css$/i,
        use: [
          miniCssLoader,
          cssLoader, 
          postcssLoader,
        ]
      },
      {
        test: /\.(sa|sc)ss$/i,
        use: [
          miniCssLoader,
          cssLoader,
          postcssLoader,
          'sass-loader',
        ],
      },
      {
        test: /\.less$/i,
        include: /node_modules/,
        use: [
          miniCssLoader,
          cssLoader,
          postcssLoader,
          lessLoader,
        ],
      },
      {
        test: /\.less$/i,
        include: srcPath,
        use: [
          miniCssLoader,
          cssLoader,
          postcssLoader,
          lessLoader,
          styleResourceLoader,
        ],
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        type: 'asset', // url-loader
        generator: {
          filename: 'image/[name].[hash:8][ext]',
        },
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024,
          },
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset/resource', // file-loader
        generator: {
          filename: 'font/[name].[hash:8][ext]',
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset/resource', // file-loader
        generator: {
          filename: 'media/[name].[hash:8][ext]',
        },
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
        issuer: /\.[jt]sx?$/,
      },
      {
        test: /\.(md|txt)(\?.*)?$/,
        include: srcPath,
        type: 'asset/source', // raw-loader
      },
    ]
  },
  plugins: [
    // 如果需要web环境也能访问，必须用这个插件注入
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
    new HtmlWebpackPlugin({
      title: 'Soul Harbor',
      template: './public/index.html',
      favicon: './public/favicon.ico',
      filename: 'index.html',
      env: process.env.NODE_ENV,
      minify: true,
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].css',
    }),
    new PurgecssPlugin({
      paths: glob.sync('src/**/*',  { nodir: true }),
    }),
    new AntdDayjsWebpackPlugin({
      preset: 'antdv3'
    }),
    new WebpackBar(),
  ],
};
