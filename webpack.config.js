//@ts-check
const webpack = require('webpack');
const path = require('path');
const production = process.env.NODE_ENV === 'production';

const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const clientBaseUrl = "./";
const clientOutputUrl = "./dist/";


const pathsToClean = [
  'dist/*.*',
  
]
//Jose: I have removed index.html since it overwrites it anyways.
//'build/client/index.html'
const cleanOptions = {
  watch : true
}

var plugins = [
   new webpack.optimize.CommonsChunkPlugin({
          name : 'vendor',
          children : true,
          minChunks : 2
        }),
];

const CleanWebpackPluginConfig = new CleanWebpackPlugin(pathsToClean, cleanOptions);


const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: clientBaseUrl+'/index.html',
  filename: 'index.html',
  inject: 'head'
});



module.exports = {
  entry: ["babel-polyfill", path.resolve(clientBaseUrl+'/index.ts')],
  output: {
    filename: production ? '[name]-[hash].js' : 'bundle_[hash].js',
    path: __dirname + '/'+clientOutputUrl,
    publicPath : clientOutputUrl+'/' //Important!!! : https://github.com/webpack/webpack/issues/1426
  },

  plugins :[
    HtmlWebpackPluginConfig,
    CleanWebpackPluginConfig
  ],

  resolve: {
      extensions: ['.Webpack.js', '.web.js', '.js', '.tsx', '.ts', '.html', '.njk']
  },
  module: {
    loaders: [
      {
        //Webpack doesn't give a thing about the exclude array when it comes
        //to typescript.
        test: /\.ts?$/,
          exclude: [/(node_modules)/],
          loaders: ['babel-loader','ts-loader']
      },
      { test: /\.js$/, loader: 'babel-loader', exclude: [/node_modules/] },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
      {
        // HTML LOADER
        test: /\.html$/,
        loader: 'html-loader'
      },
      { test: /\.(jpg|png|svg)$/,
          loader: 'url-loader',
          options: {
            name: '[name][hash].[ext]',
            limit: 25000,
          },
        }
    ],
  },
  devtool : "source-map",
  watch: true
};
