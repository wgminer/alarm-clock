'use-strict';

var gulp = require('gulp'); 
var gutil = require('gulp-util');

var sass = require('gulp-sass');
var jade = require('gulp-jade');
var concat = require('gulp-concat');
var postcss = require('gulp-postcss');
var browserSync = require('browser-sync').create();

var ftp = require('vinyl-ftp');
var secrets = require('./secrets.json');

gulp.task('sass', function () {

    var plugins = [
        require('autoprefixer'),
        require('cssnano')
    ];

    return gulp.src('./src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(gulp.dest('./build/css'));
});

gulp.task('js', function() {

    var vendor = [
        './libs/jquery/dist/jquery.js',
        './libs/lodash/lodash.js',
        './libs/moment/moment.js'
    ];

    var alarm = [
        './src/js/alarm.js'
    ];

    var app = [
        './src/js/soundcloud.js',
        './src/js/youtube.js',
        './src/js/app.js'
    ]

    gulp.src(vendor)
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('./build/js'));

    gulp.src(alarm)
        .pipe(concat('alarm.js'))
        .pipe(gulp.dest('./build/js'));

    gulp.src(app)
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./build/js'));
});

gulp.task('jade', function() {
    return gulp.src('./src/**/*.jade')
        .pipe(jade())
        .on('error', function (err) {
            gutil.log(gutil.colors.red(err));
            gutil.beep();
            this.emit('end');
        })
        .pipe(gulp.dest('./build'));
});

gulp.task('copy', function() {
    return gulp.src(['./src/*.php', './src/*.json'])
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

gulp.task('serve', ['copy', 'sass', 'jade', 'js', 'browser-sync'], function () {
    gulp.watch('scss/**/*.scss', {cwd: './src'}, ['sass']);
    gulp.watch('**/*.jade', {cwd: './src'}, ['jade']);
    gulp.watch('**/*.php', {cwd: './src'}, ['copy']);
    gulp.watch('js/**/*.js', {cwd: './src'}, ['js']);
});

gulp.task('deploy', ['copy', 'sass', 'jade', 'js'], function () {

    var conn = ftp.create({
        host: secrets.production.host,
        user: secrets.production.user,
        password: secrets.production.password,
        parallel: 3,
        maxConnections: 5,
        log: gutil.log
    }); 

    return gulp.src('./build/**', {base: './build', buffer: false})
        .pipe(conn.dest(secrets.production.path));

});