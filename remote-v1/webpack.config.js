const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  entry: './src/index.js',
  output: { publicPath: 'auto' },
  devServer: { port: 3002 },
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
      name: 'remoteButton',
      filename: 'remoteEntry.js',
      exposes: { './Button': './src/Button' },
      shared: {
      }
    }),
    new HtmlWebpackPlugin({ template: './index.html' })
  ],
  mode: 'development'
};
