module.exports = function(grunt) {

  grunt.initConfig({

    watch: {
      js: {
        files: ['src/*.js'],
        tasks: ['jshint', 'webpack']
      },
      test: {
       files: ['test/*.js', 'src/*.js'],
       tasks: ['simplemocha']
      }
    },

    simplemocha: {
     options: {
       ui: 'bdd',
       reporter: 'spec'
     },
     all: {
       src: [
         'test/setup.js',
         'test/spec.js'
       ]
     }
    },

    jshint: {
      options: {
        jshintrc: true,
        reporter: require('jshint-stylish'),
        verbose: true
      },
      files: ['src/*.js']
    }

  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('dev', ['default', 'simplemocha', 'watch']);
}