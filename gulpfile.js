var gulp = require('gulp'); 
var clean = require('gulp-clean');
var sass = require('gulp-sass');
var jshint = require('gulp-jshint');
var jade = require('gulp-jade');
var browserSync = require('browser-sync').create();

var usemin = require('gulp-jade-usemin');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var ftp = require('vinyl-ftp');
var gutil = require('gulp-util');

var secrets = require('./secrets.json');

gulp.task('clean', function () {
    return gulp.src('build', {read: false})
        .pipe(clean());
});

gulp.task('styles', function () {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'})
            .on('error', sass.logError))
        .pipe(gulp.dest('build/css'));
});

gulp.task('markup', function() {
    return gulp.src(['src/**/*.jade'])
        .pipe(jade({pretty: true}))
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


// DEPLOY TASKS

gulp.task('scripts-min', ['clean'], function() {
    return gulp.src('src/**/*.jade')
        .pipe(usemin({
            js: [rev()],
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('markup-min', ['scripts-min'], function() {
    return gulp.src(['build/**/*.jade'])
        .pipe(jade({pretty: true}))
        .pipe(gulp.dest('build'));
});

gulp.task('clean-min', ['markup-min'], function () {
    return gulp.src('build/**/*.jade', {read: false})
        .pipe(clean());
});

gulp.task('deploy', ['clean', 'styles', 'scripts-min', 'markup-min', 'clean-min'], function () {

    var conn = ftp.create( {
        host: secrets.production.host,
        user: secrets.production.user,
        password: secrets.production.password,
        parallel: 10,
        log: gutil.log
    }); 

    var globs = [
        './build/**'
    ]

    return gulp.src(globs, {base: './build/', buffer: false})
        .pipe(conn.newer(secrets.production.path))
        .pipe(conn.dest(secrets.production.path));
});