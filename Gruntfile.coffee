module.exports = (grunt) ->
  grunt.initConfig
    coffee:
      build:
        expand: true,
        cwd: 'src',
        src: [ '**/*.coffee' ],
        dest: 'lib',
        ext:  '.js'
      compileMain:
        options:
          bare: true,
        files:
          'main.js': 'main.coffee', 

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.registerTask 'default', ['coffee']
