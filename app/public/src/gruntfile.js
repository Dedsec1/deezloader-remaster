// Not needed in local project
var cssCopy = "dist/css";
var jsCopy = "dist/js";

// Vars Config
var FoldersConfig = {
	dist: '..',
	src: 'src'
};

var FilesConfig = {
	css: 'materialize',
	js: 'core'
};
 
module.exports = function (grunt) {

	require('jit-grunt')(grunt);

	grunt.initConfig({
		FoldersConfig: FoldersConfig,
		FilesConfig: FilesConfig,

		jshint: {
			options: {
				reporter: require('jshint-stylish')
			},

			build: ['Gruntfile.js', '<%= FoldersConfig.src %>/**/*.js']
		},

		sass: {
			options: {
				sourceMap: true,
				sourceComments: false
			},
			dist: {
				files: {
					'<%= FoldersConfig.dist %>/css/<%= FilesConfig.css %>.css': '<%= FoldersConfig.src %>/scss/<%= FilesConfig.css %>.scss'
				}
			}
		},

		autoprefixer: {
			options: {
				browsers: [
					"Android 2.3",
					"Android >= 1",
					"Chrome >= 20",
					"Firefox >= 24",
					"Explorer >= 11",
					"iOS >= 1",
					"Opera >= 12",
					"Safari >= 1"
				]
			},
			core: {
				options: {
					map: true
				},
				src: '<%= FoldersConfig.dist %>/css/<%= FilesConfig.css %>.css'
			}
		},

		uglify: {
			options: {
				compress: {
					warnings: false
				},
				mangle: true,
				preserveComments: false
			},
			build: {
				files: {
					'<%= FoldersConfig.dist %>/js/<%= FilesConfig.js %>.min.js': '<%= FoldersConfig.src %>/js/*.js'
				}
			}
		},

		cssmin: {
			build: {
				files: {
					'<%= FoldersConfig.dist %>/css/<%= FilesConfig.css %>.min.css': '<%= FoldersConfig.dist %>/css/<%= FilesConfig.css %>.css'
				}
			}
		},

		/*copy: {
		 main: {
		 files: [{
		 cwd: '<%= FoldersConfig.dist %>/css',  // set working folder / root to copy
		 src: '**!/!*',		   // copy all files
		 dest: cssCopy,	// destination folder
		 expand: true		   // required when using cwd
		 },
		 {
		 cwd: '<%= FoldersConfig.dist %>/js',  // set working folder / root to copy
		 src: '**!/!*',		   // copy all files
		 dest: jsCopy,	// destination folder
		 expand: true		   // required when using cwd
		 }]
		 }
		 },*/

		watch: {
			stylesheets: {
				files: '<%= FoldersConfig.src %>/scss/**/*.scss',
				tasks: ['sass', 'autoprefixer', 'cssmin'],
				options: {
					livereload: false
				}
			},

			scripts: {
				files: '<%= FoldersConfig.src %>/js/*.js',
				tasks: ['jshint', 'uglify'],
				options: {
					livereload: false
				}
			}
		}

	});

	grunt.registerTask('default', ['watch']);
};