const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    publicPath: 'auto'
  },
  devServer: {
    port: 3001,
    historyApiFallback: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react']
        }
      }
    ]
  },
  resolve: { extensions: ['.js', '.jsx'] },
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {},
      shared: {
      }
    }),
    new HtmlWebpackPlugin({ template: './index.html' })
  ],
  mode: 'development'
};
