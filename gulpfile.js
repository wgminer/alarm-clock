var gulp = require('gulp'); 
var sass = require('gulp-sass');
var jshint = require('gulp-jshint');
var jade = require('gulp-jade');
var browserSync = require('browser-sync').create();
var gulpCopy = require('gulp-copy');

gulp.task('styles', function () {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('build/css'));
});

gulp.task('markup', function() {
    return gulp.src(['src/**/*.jade'])
        .pipe(jade())
        .pipe(gulp.dest('build'));
});

gulp.task('scripts', function() {
    return gulp.src('src/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('build/js'));
});

gulp.task('browser-sync', function() {
    browserSync.init(['build/css/**/*.css', 'build/js/**/*.js', 'build/**/*.html'], {
        server: {
            baseDir: './build',
            routes: {
                '/libs': 'libs'
            }
        }
    });
});

gulp.task('default', ['styles', 'scripts', 'markup', 'browser-sync'], function () {
    gulp.watch('src/scss/**/*.scss', ['styles']);
    gulp.watch('src/**/*.jade', ['markup']);
    gulp.watch('src/js/**/*.js', ['scripts']);
});