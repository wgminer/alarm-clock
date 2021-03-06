var gulp = require('gulp'); 
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
 
gulp.task('sass', function () {
    gulp.src('src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('src/css'));
});

gulp.task('browser-sync', function() {
    browserSync.init(['src/css/**/*.css', 'src/js/**/*.js', 'src/**/*.html'], {
        server: {
            baseDir: './src',
            routes: {
                '/bower_components': 'bower_components'
            }
        }
    });
});

gulp.task('default', ['sass', 'browser-sync'], function () {
    gulp.watch('src/scss/**/*.scss', ['sass']);
});