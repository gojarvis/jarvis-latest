var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  entry: './src/main.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'backend.js'
  },
  module: {
    loaders: [{
      //React-hot loader and
      test: /\.js$/,  //All .js and .jsx files
      loader: 'babel-loader',
      query: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
      },
      exclude: /node_modules/
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }]
  },
  externals: nodeModules
}
