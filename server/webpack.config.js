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
  entry: ['./index.js'],
  output: {
    path: 'build',
    filename: 'index.js'
  },
  target: 'node',
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ],
  node: {
    __dirname: false
  },
  module: {
    loaders: [{
      //React-hot loader and
      test: /\.js$/,  //All .js and .jsx files
      loader: 'babel',
      query: {
        presets: ['es2015'],
        plugins: [
          'transform-runtime',
          'transform-class-properties',
          'transform-async-to-generator',
          'transform-object-rest-spread'
        ]
      },
      exclude: /node_modules/
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  externals: nodeModules
}
