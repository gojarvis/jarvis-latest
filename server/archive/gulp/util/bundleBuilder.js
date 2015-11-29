var gulp         = require('gulp');
var bundleLogger = require('./bundleLogger');
var browserify   = require('browserify');
var handleErrors = require('./handleErrors');
var source       = require('vinyl-source-stream');
var exposify     = require('exposify');
var reactify     = require('reactify');
var remapify     = require('remapify');
exposify.config = { react: 'React'};

function buildBundle(bundleConfig, outFile, outFldr, watch, options) {
  var bundleMethod = watch && global.isWatching ? watchify : browserify;
  var bundler = bundleMethod(bundleConfig);


  bundler.plugin(remapify, [
    {
      src: './application/components/*.jsx' // glob for the files to remap
      , expose: 'components'
      , cwd: __dirname // defaults to process.cwd()
    }
  ])
  bundler.transform(reactify);

  var bundle = function() {
    // Log when bundling starts
    bundleLogger.start();

    if(options){
      if(Array.isArray(options.excludes)){
        options.excludes.forEach(function(toExclude){
            bundler.exclude(toExclude);
        })
      }
    }

    return bundler
      .bundle()
      // Report compile errors
      .on('error', handleErrors)
      // Use vinyl-source-stream to make the
      // stream gulp compatible. Specifiy the
      // desired output filename here.
      .pipe(source(outFile))
      // Specify the output destination
      .pipe(gulp.dest(outFldr))
      // Log when bundling completes!
      .on('end', bundleLogger.end);
  };

  if(global.isWatching) {
    // Rebundle with watchify on changes.
    bundler.on('update', bundle);
  }

  return bundle();
}

module.exports = buildBundle;
