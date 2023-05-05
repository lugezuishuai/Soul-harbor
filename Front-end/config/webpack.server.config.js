/* eslint-disable */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const WebpackBar = require('webpackbar');
const resolve = require('./helper/resolve');
const webpack = require('webpack');
const dotenv = require('dotenv');
const { isEnvProduction, publicPath, srcPath, serverDistPath, resolveExtensionsSSR } = require('./helper/constant');
dotenv.config({ path: isEnvProduction ? '.env' : '.env.development' });

const miniCssLoader = MiniCssExtractPlugin.loader;

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
  [
    'postcss-preset-env',
    {
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
    },
  ],
  // 移动端适配
  [
    'postcss-pxtorem',
    {
      rootValue: 53.99, // 1rem = 53.99px
      include: srcPath,
    },
  ],
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
  target: 'node', // webpack 将在类 Node.js 环境编译代码
  mode: isEnvProduction ? 'production' : 'development',
  externalsPresets: { node: true },
  // externals: [nodeExternals()], // 不把node_modules里面的modules打包进产物
  entry: {
    app: './src/server.tsx',
  },
  output: {
    path: serverDistPath,
    filename: 'js/[name].js',
    libraryTarget: 'commonjs2',
    chunkLoading: 'async-node',
    publicPath,
    clean: true,
  },
  optimization: {
    mangleExports: false, // 导出保留原名，利于阅读和调试
    minimize: false, // 不需要压缩
  },
  resolve: {
    extensions: resolveExtensionsSSR,
    alias: {
      '@': srcPath,
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
        use: [miniCssLoader, cssLoader, postcssLoader],
      },
      {
        test: /\.(sa|sc)ss$/i,
        use: [miniCssLoader, cssLoader, postcssLoader, 'sass-loader'],
      },
      {
        test: /\.less$/i,
        include: /node_modules/,
        use: [miniCssLoader, cssLoader, postcssLoader, lessLoader],
      },
      {
        test: /\.less$/i,
        include: srcPath,
        use: [miniCssLoader, cssLoader, postcssLoader, lessLoader, styleResourceLoader],
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        type: 'asset', // url-loader
        generator: {
          filename: 'image/[name].[hash:8][ext][query]',
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
          filename: 'font/[name].[hash:8][ext][query]',
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset/resource', // file-loader
        generator: {
          filename: 'media/[name].[hash:8][ext][query]',
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
    ],
  },
  plugins: [
    // 如果需要web环境也能访问，必须用这个插件注入
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[id].css',
    }),
    new AntdDayjsWebpackPlugin({
      preset: 'antdv3',
    }),
    new WebpackBar(),
  ],
};
