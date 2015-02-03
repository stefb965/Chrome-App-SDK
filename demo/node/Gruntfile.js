module.exports = function(grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            src: ['scripts/**/*.js'],
            options: {
                config: 'eslint.json'
            }
        }
    });

    grunt.loadNpmTasks('grunt-eslint');

    grunt.registerTask('default', ['eslint']);
};
