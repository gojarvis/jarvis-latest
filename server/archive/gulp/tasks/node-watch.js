var gulp = require('gulp')
	, nodemon = require('gulp-nodemon')
	, jshint = require('gulp-jshint')
	, babel = require("gulp-babel")
	, livereload = require('gulp-livereload');



 var path = require('path');



var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');

gulp.task('compile', function () {
  return gulp.src("src/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat("all.js"))
    .pipe(sourcemaps.write(".", { sourceRoot: "../../src" }))
    .pipe(gulp.dest("dist"));
});



gulp.task('node-watch', function () {
	livereload.listen();
	nodemon({ script: './dist/all.js', ext: '*.js *.jsx *.html', ignore: ['node_modules/**', 'gulp/**', 'public/**', 'dist/**', 'server/dist/**'] })
		.on('change', function(){})
		.on('restart', ['compile'])
})
