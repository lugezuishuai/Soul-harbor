/* eslint-disable */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const miniCssExtractPlugin = require("mini-css-extract-plugin");          // 单独抽离css文件
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const resolve = require('./helper/resolve')
const isEnvProduction = process.env.NODE_ENV === 'production';            // 是否是生产环境
const miniCss = isEnvProduction ? { 
  loader: miniCssExtractPlugin.loader, 
  options: { 
    publickPath: '/',
    modules: { namedExport: true }
  }
} : 'style-loader';

module.exports = {
  entry: {
    'app': './src/index.tsx'
  },
  output: {
    filename: isEnvProduction ? '[name].[chunkhash:8].js' : '[name].[hash:8].js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: { '@': resolve('src') }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/i,             //要想babel-import-plugin生效，babel-loader要加上ts|tsx
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
            transpileOnly: true,
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: [miniCss, 'css-loader']
      },
      {
        test: /\.(sa|sc)ss$/i,
        use: [
          miniCss,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.less$/i,
        include: /node_modules\/(antd|slick-carousel)/,
        use: [
          miniCss,
          { loader: 'css-loader', options: { modules: false } },
          { loader: 'less-loader', options: { 
            lessOptions: { javascriptEnabled: true }
          }}          //javascriptEnabled: true  ------  在less里面可以使用JavaScript表达式
        ]
      },
      {
        test: /\.less$/i,
        exclude: /node_modules\/(antd|slick-carousel)/,
        use: [
          miniCss,
          { loader: 'css-loader', options: { modules: true, import: true } },
          { loader: 'less-loader', options: { 
            lessOptions: { javascriptEnabled: true },
          }}          //javascriptEnabled: true  ------  在less里面可以使用JavaScript表达式
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            // outputPath:'../',//输出**文件夹
            publicPath: '/',
            name: "images/[name].[ext]",
            limit: 1000  //是把小于1000B的文件打成Base64的格式，写入JS
          }
        }]
      },
      {
        test: /\.(woff|eot|woff2|tff)$/,
        use: 'url-loader',
        exclude: /node_modules/
        // exclude忽略/node_modules/的文件夹
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      env: process.env.NODE_ENV,
    }),
    new miniCssExtractPlugin({
      filename: isEnvProduction ? '[name].[contenthash:8].css' : '[name].[hash:8].css'
    }),
    new AntdDayjsWebpackPlugin({
      preset: 'antdv3'
    })
  ],
}
