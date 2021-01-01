const HtmlWebpackPlugin = require('html-webpack-plugin');
const miniCssExtractPlugin = require("mini-css-extract-plugin");          // 单独抽离css文件
const isEnvProduction = process.env.NODE_ENV === 'production';            // 是否是生产环境
const styleUse = isEnvProduction ? [ 
    { 
        loader: miniCssExtractPlugin.loader, 
        options: { 
            publickPath: '/', 
            esModule: true, 
            modules: { namedExport: true } 
        }
    },
    'css-loader',
] : ['style-loader', 'css-loader'];

module.exports = {
    entry: {
        'app': './src/index.tsx'
    },
    output: {
        filename: isEnvProduction ? '[name].[chunkhash:8].js' : '[name].[hash:8].js'
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,             //要想babel-import-plugin生效，babel-loader要加上ts|tsx
                use: [
                    { 
                        loader: 'babel-loader',
                        options: {
                            presets: [
                              '@babel/preset-env',
                              '@babel/preset-react',
                            ],
                            plugins: [
                              ["@babel/plugin-syntax-dynamic-import"], // 支持import懒加载
                            ],
                        }
                    }
                ],
                exclude: /node_module/
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
                use: styleUse
            },
            {
                test: /\.(sa|sc)ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    { loader: 'less-loader', options: { lessOptions: { javascriptEnabled: true } } }          //javascriptEnabled: true  ------  在less里面可以使用JavaScript表达式
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
                test: /\.(woff|svg|eot|woff2|tff)$/,
                use: 'url-loader',
                exclude: /node_modules/
                // exclude忽略/node_modules/的文件夹
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
        })
    ],
}
