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
      },
      benchmark: {
        command: function (path) {
          return 'node ' + path;
        }
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

  // Browser tests fail on TravisCI but pass locally. Use the runner.html
  // to test the browser functionality until this is resolved.
  grunt.registerTask('default', ['jslint', 'mochaTest', 'browserify', 'uglify', 'shell:prepareBrowserTests']);
  grunt.registerTask('build', ['browserify', 'uglify', 'shell:prepareBrowserTests']);
  grunt.registerTask('benchmark', [
    'shell:benchmark:benchmarks/comparisons/instance.js',
    'shell:benchmark:benchmarks/comparisons/resolve.js',
    'shell:benchmark:benchmarks/comparisons/resolveMultiple.js',
    'shell:benchmark:benchmarks/comparisons/resolvePromise.js',
    'shell:benchmark:benchmarks/comparisons/then.js',
    'shell:benchmark:benchmarks/comparisons/thenMultiple.js'
  ]);

};
