const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  entry: './src/index.js',
  output: { publicPath: 'auto' },
  devServer: {
    port: 3003,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
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
      name: 'remoteCitas_v2',
      filename: 'remoteEntry.js',
      exposes: { './Button_v2': './src/Button' },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    }),
    new HtmlWebpackPlugin({ template: './index.html' })
  ],
  mode: 'development'
};
