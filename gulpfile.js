'use strict';
 
var gulp = require('gulp');
var stylus = require('gulp-stylus');
 
gulp.task('one', function () {
  gulp.src('./styl/main.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./css'));
});
 
gulp.task('one:watch', function () {
  gulp.watch('./styl/**/*.styl', ['one']);
});