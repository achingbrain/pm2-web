module.exports = function(grunt) {
	grunt.initConfig({

		browserify: {
			dist: {
				src: "ui/index.js",
				dest: "./public/js/monitor.js"
			}
		},

		less: {
			development: {
				files: {
					"./public/css/style.css": "./public/css/style.less"
				}
			}
		},

		watch: {
			scripts: {
				files: [
					"./ui/**/*.js",
					"./public/css/*.less"
				],
				tasks: ["browserify", "less"],
				options: {
					spawn: false
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks('grunt-contrib-less');


	// default task
	grunt.registerTask("default", ["browserify", "less", "watch"]);
};