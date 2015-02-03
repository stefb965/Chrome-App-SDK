module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            src: ['scripts/**/*.js'],
            options: {
                config: 'eslint.json'
            }
        },
        bower_concat: {
            all: {
                mainFiles: {
                    'Rx': 'rx.all.js',
                    'Box-Chrome-SDK': 'dist/Box-Chrome-SDK.js'
                },
                dest: 'build/<%= pkg.name %>.bower_components.js',
                exclude: ['bootstrap-css-only']
            }
        },
        concat: {
            dist: {
                src: ['<%= bower_concat.all.dest %>', 'bower_components/Box-Chrome-SDK/dist/Box-Chrome-SDK.js'],
                dest: 'build/<%= pkg.name %>.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-bower-concat');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['eslint', 'bower_concat', 'concat']);
};
