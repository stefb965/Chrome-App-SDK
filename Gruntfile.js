module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: '\n//----------------------------\n'
            },
            dist: {
                src: ['build/**/*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <% pkg.name %> <% grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>'],
                    'dist/<%= pkg.name %>.bower_components.min.js': 'dist/<%= pkg.name %>.bower_components.js'
                }
            }
        },
        eslint: {
            test: {
                src: ['test/**/*.js'],
                options: {
                    config: 'test/eslint.json'
                }
            },
            src: {
                src: ['lib/**/*.js', 'src/**/*.js'],
                options: {
                    config: 'eslint.json'
                }
            }
        },
        bower_concat: {
            all: {
                mainFiles: {
                    'Rx': 'rx.all.js'
                },
                dest: 'dist/<%= pkg.name %>.bower_components.js',
                exclude: ['angular-mocks']
            },
            test: {
                mainFiles: {
                    'Rx': 'rx.all.js'
                },
                dest: 'build/dist/<%= pkg.name %>.bower_components.js'
            }
        },
        wrap: {
            basic: {
                src: ['src/**/*.js', 'lib/*.js'],
                dest: 'build/',
                options: {
                    wrapper: ['(function() {', '})();'],
                    indent: '    '
                }
            }
        },
        clean: ['dist/*', 'build/*', 'doc/*'],
        jsdox: {
            generate: {
                options: {
                    contentsTitle: 'Box Chrome App SDK Documentation',
                    pathFilter: /^(src)|(lib)/
                },
                src: ['src/**/*.js', 'lib/**/*.js'],
                dest: 'doc'
            }
        },
        karma: {
            unit: {
                options: {
                    frameworks: ['mocha', 'sinon-chai'],
                    files: ['build/dist/<%= pkg.name %>.bower_components.js', 'lib/**/*.js', 'src/**/*.js', 'test/*.js', 'test/unit/**/*.js'],
                    reporters: ['progress', 'coverage'],
                    preprocessors: {'lib/**/*.js': ['coverage'], 'src/**/*.js': ['coverage']},
                    coverageReporter: {type: 'text'}
                },
                singleRun: true,
                browsers: ['Chrome']
            },
            integration: {
                options: {
                    frameworks: ['mocha', 'sinon-chai'],
                    files: ['dist/<%= pkg.name %>.bower_components.js', 'lib/**/*.js', 'src/**/*.js', 'test/*.js', 'test/integration/**/*.js']
                },
                singleRun: true,
                browsers: ['Chrome'],
                reporters: ['progress', 'coverage'],
                preprocessors: {'lib/**/*.js': ['coverage'], 'src/**/*.js': ['coverage']},
                coverageReporter: {type: 'text-summary'}
            }
        }
    });

    [
        'grunt-contrib-uglify',
        'grunt-contrib-watch',
        'grunt-contrib-concat',
        'grunt-bower-concat',
        'grunt-eslint',
        'grunt-wrap',
        'grunt-contrib-clean',
        'grunt-jsdox',
        'grunt-karma'
    ].forEach(function(gruntPackage) {
            grunt.loadNpmTasks(gruntPackage);
        });

    grunt.registerTask('default', ['clean', 'eslint', 'wrap', 'concat', 'bower_concat:all', 'uglify', 'jsdox']);
    grunt.registerTask('test', ['bower_concat:test', 'karma']);
};
