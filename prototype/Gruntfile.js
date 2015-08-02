module.exports = function(grunt) {

    require('jit-grunt')(grunt);

    // Initial config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect:{
            options: {
                port: 9000,
                livereload: 35729,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function (connect) {
                        return [
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
                            connect.static('dev')
                        ];
                    }
                }
            },
        },

        less: {
            dev: {
                options: {
                    paths: [
                        '<%= pkg.devLoc %>/less',
                        'bower_components/*'
                    ]
                },
                files: {
                    '<%= pkg.devLoc %>/css/main.css': '<%= pkg.devLoc %>/less/main.less'
                }
            },
        },

        sass: {
            dev: {
                options: {
                    paths: [
                        "<%= pkg.devLoc %>/scss",
                        "bower_components/*"
                    ]
                },
                files: {
                    "<%= pkg.devLoc %>/css/main.css": "<%= pkg.devLoc %>/scss/main.scss"
                }
            }
        },

        watch: {
            css: {
                files: ['<%= pkg.devLoc %>/less/**/*.less'],
                tasks: ['less:dev'],
                options: {
                    livereload: true,
                    spawn:false
                },
            },

            scripts: {
                files: ['<%= pkg.devLoc %>/js/**/*.js'],
                tasks: [],
                options: {
                    livereload: true,
                    spawn: false,
                }
            },

            images: {
                files: ['<%= pkg.devLoc %>/img/**/*.{png,jpg,gif}', '<%= pkg.devLoc %>/img/*.{png,jpg,gif}'],
                tasks: [],
                options: {
                    livereload: true,
                    spawn: false,
                }
            },

            html:{
                files: ['<%= pkg.devLoc %>/**/*.html'],
                tasks: [],
                options: {
                    livereload: true,
                    spawn: false
                }
            },

            livereload: {
                options: {
                    livereload: true
                },
                files: ['<%= pkg.devLoc %>/css/**/*.css']
            }

        },

        copy: {
            build: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= pkg.devLoc %>',
                    dest: '<%= pkg.buildLoc %>',
                    src: [
                        '*.{ico,png,txt,json}',
                        '.htaccess',
                        '*.html',
                        'css/*',
                        'img/*',
                        'fonts/*',
                        'views/*'
                    ]
                }]
            }
        },

        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/js',
                    src: '*.js',
                    dest: '.tmp/concat/js'
                }]
            }
        },

        useminPrepare: {
            html: '<%= pkg.devLoc %>/*.html',
            options: {
                dest: '<%= pkg.buildLoc %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['concat']
                        },
                        post: {}
                    }
                }
            }
        },

        usemin: {
            html: ['<%= pkg.buildLoc %>/{,*/}*.html'],
            options: {
                assetsDirs: ['<%= pkg.buildLoc %>','<%= pkg.buildLoc %>/images']
            }
        }

    });

    // Default
    grunt.registerTask('default', [
        'less:dev', 
        'connect', 
        'watch'
    ]);

    // Build
    grunt.registerTask('build', [
        'less:dev', 
        'useminPrepare',
        'copy:build',
        'concat',
        'uglify',
        'usemin',
    ]);

    // Deploy
    grunt.registerTask('deploy', function (target) {

        if (target === 'latest') {

            grunt.task.run([
                'build',
                'aws_s3:latest',
                'aws_s3:rev'
            ]);

        } else {

            grunt.task.run([
                'build',
                'aws_s3:rev'
            ]);

        }
        
    });

};