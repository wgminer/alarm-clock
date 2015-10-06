var gulp = require('gulp'); 
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var react = require('gulp-react');

var path = {
    src: 'src',
    html: 'src/index.html',
    watch: ['src/css/**/*.css', 'src/js/**/*.js', 'src/index.html'],
    js: 'src/js',
    jsx: 'src/jsx/*.jsx',
    scss: 'src/scss/**/*.scss',
    css: 'src/css',
    dist: 'dist'
}; 

gulp.task('sass', function () {
    gulp.src(path.scss)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(path.css));
});

gulp.task('browser-sync', function() {
    browserSync.init(path.watch, {
        server: {
            baseDir: path.src,
            routes: {
                '/bower_components': 'bower_components'
            }
        }
    });
});

gulp.task('transform', function(){
    return gulp.src(path.jsx)
        .pipe(react())
        .pipe(gulp.dest(path.js));
});

gulp.task('default', ['sass', 'browser-sync'], function () {
    gulp.watch(path.scss, ['sass']);
    gulp.watch(path.jsx, ['transform']);
});