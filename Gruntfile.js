/*jslint node: true, indent: 2, passfail: true */
"use strict";

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jslint: {
      all: {
        src: ['deferred/*'],
        exclude: ['test/*', 'Gruntfile.js'],
        directives: {
          node: true,
          browser: true,
          indent: 2,
          passfail: true
        },
        options: {
          edition: 'latest'
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'dot'
        },
        src: ['test/*.spec.js']
      },
    },
    mocha: {
      test: {
        src: ['test/runner.html']
      }
    },
    browserify: {
      dist: {
        files: {
          'build/deferred.browser.js': ['deferred/index.js']
        },
        options: {
          bundleOptions: {
            "standalone": "deferredjs"
          }
        },
      },
      tests: {
        files: {
          'build/deferred.tests.browser.js': [
            'test/deferred.spec.js',
            'test/a_plus.spec.js'
          ]
        },
        options: {}
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          'build/deferred.browser.min.js': ['build/deferred.browser.js'],
          'build/deferred.tests.browser.min.js': ['build/deferred.tests.browser.js']
        },
      }
    },
    shell: {
      prepareBrowserTests: {
        command: 'test/install_libs'
      }
    },
    watch: {
      files: [
        'deferred/*.js',
        '!node_modules/*'
      ],
      tasks: ['default'],
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['jslint', 'mochaTest', 'browserify', 'uglify', 'shell', 'mocha']);

};
