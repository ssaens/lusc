const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'lusc.js',
    library: 'lusc'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-proposal-class-properties'
          ]
        }
      }
    }, {
      test: /\.lsc$/,
      use: 'raw-loader'
    }]
  },
  devtool: 'inline-source-map',
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, '../src')
    ]
  }
};
