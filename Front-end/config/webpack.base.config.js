/* eslint-disable */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const miniCssExtractPlugin = require("mini-css-extract-plugin");          // 单独抽离css文件
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const resolve = require('./helper/resolve');
const webpack = require('webpack');
const px2rem = require('postcss-px2rem-exclude');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: '.env' });

const isEnvProduction = process.env.NODE_ENV === 'production';            // 是否是生产环境
const sourceMap = !isEnvProduction; // 生产模式不开启sourceMap
const miniCssLoader = isEnvProduction ? { 
  loader: miniCssExtractPlugin.loader, 
  options: {
    publicPath: isEnvProduction ? process.env.SERVICE_URL : '/',
    modules: { namedExport: true }
  }
} : 'style-loader';

const cssLoader = {
  loader: 'css-loader',
  options: {
    sourceMap,
  }
}

const postcssPlugins = [
  require('postcss-import'),
  require('postcss-url'),
  require('postcss-flexbugs-fixes'),
  require('postcss-preset-env')({
    autoprefixer: {
      flexbox: 'no-2009',
    },
    stage: 3,
  }),
  // 移动端适配
  px2rem({
    remUnit: 53.99, // 1rem = 53.99px
    exclude: /node_modules/i,
  }),
]

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    sourceMap,
    ident: 'postcss',
    plugins: () => isEnvProduction ? [...postcssPlugins, require('cssnano')] : postcssPlugins, // 生产环境压缩css代码
  },
};

const lessLoader = {
  loader: 'less-loader', 
  options: {
    sourceMap,
    lessOptions: {
      javascriptEnabled: true, // javascriptEnabled: true  ------  在less里面可以使用JavaScript表达式
      modifyVars: {
        // 以下两个配置使用前提是必须在按需引入那里配置"style": true，否则不起作用，因为这里要是用less变量
        // @primary-color是设置antd的主题色，默认是蓝色的
        // "@primary-color": "red",
        // @ant-prefix是自定义antd组件类名前缀的，需要配合<ConfigProvider prefixCls="ant">使用
        "@ant-prefix": "ant",
      },
    }
  }
}

const sassLoader = {
  loader: 'sass-loader',
  options: {
    sourceMap,
  }
}

module.exports = {
  entry: {
    'app': './src/index.tsx'
  },
  output: {
    filename: isEnvProduction ? 'js/[name].[chunkhash:8].js' : '[name].[hash:8].js',
    path: resolve('dist'),
    publicPath: isEnvProduction ? process.env.SERVICE_URL : '/', // 这里后续还要改为线上服务器的地址，在打包后的index.html中，资源统一会加上的路径
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: { '@': resolve('src') }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/i, // 要想babel-import-plugin生效，babel-loader要加上ts|tsx
        use: [
          { 
            loader: 'babel-loader',
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        options: {
          transpileOnly: true, // 关闭类型检查，只进行转译
        },
        exclude: /node_modules/
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
          sassLoader,
        ]
      },
      {
        test: /\.less$/i,
        include: /node_modules/,
        use: [
          miniCssLoader,
          { loader: 'css-loader', options: { sourceMap, modules: false } },
          postcssLoader,
          lessLoader,
        ]
      },
      {
        test: /\.less$/i,
        exclude: /node_modules/,
        use: [
          miniCssLoader,
          { loader: 'css-loader', options: { sourceMap, modules: true, import: true } },
          postcssLoader,
          lessLoader,
          {
            loader: 'style-resources-loader',
            options: {
              patterns: path.resolve(__dirname, '../src/variable.less'),
              injector: 'append'
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            publicPath: isEnvProduction ? process.env.SERVICE_URL : '/',
            name: "image/[name].[hash:8].[ext]",
            limit: 500000,
          }
        }],
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            publicPath: isEnvProduction ? process.env.SERVICE_URL : '/',
            name: "font/[name].[hash:8].[ext]",
            limit: 10000,
          }
        }],
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            publicPath: isEnvProduction ? process.env.SERVICE_URL : '/',
            name: "media/[name].[hash:8].[ext]",
            limit: 10000,
          }
        }],
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.md$/,
        use: "raw-loader"
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
    new miniCssExtractPlugin({
      filename: isEnvProduction ? 'css/[name].[contenthash:8].css' : '[name].[hash:8].css'
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: isEnvProduction
      ? { safe: true }
      : { safe: true, map: { inline: false } },
    }),
    new AntdDayjsWebpackPlugin({
      preset: 'antdv3'
    })
  ],
}
