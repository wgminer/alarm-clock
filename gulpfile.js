'use-strict';

var gulp = require('gulp'); 
var sass = require('gulp-sass');
var jade = require('gulp-jade');
var postcss = require('gulp-postcss');
var browserSync = require('browser-sync').create();

gulp.task('sass', function () {

    var plugins = [
        require('autoprefixer'),
        require('cssnano')
    ];

    return gulp.src('./src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        // .pipe(postcss(plugins))
        .pipe(gulp.dest('./build/css'));
});

gulp.task('js', function() {
    return gulp.src(['./src/js/**/*.js',  './src/js/**/*.json'])
        .pipe(gulp.dest('./build/js'));
});

gulp.task('jade', function() {
    return gulp.src(['./src/**/*.jade'])
        .pipe(jade())
        .on('error', function (err) {
            gutil.log(gutil.colors.red(err));
            gutil.beep();
            this.emit('end');
        })
        .pipe(gulp.dest('./build'));
});

gulp.task('browser-sync', function() {
    browserSync.init(['./build/css/**/*.css', './build/js/**/*.js', './build/**/*.html'], {
        server: {
            baseDir: './build',
            routes: {
                '/libs': 'libs'
            }
        }
    });
});

gulp.task('default', ['sass', 'jade', 'js', 'browser-sync'], function () {
    gulp.watch('scss/**/*.scss', {cwd: './src'}, ['sass']);
    gulp.watch('**/*.jade', {cwd: './src'}, ['jade']);
    gulp.watch('js/**/*.js', {cwd: './src'}, ['js']);
});