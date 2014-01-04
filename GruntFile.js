module.exports = function(grunt) {
	grunt.initConfig({

		browserify: {
			dist: {
				src: "ui/index.js",
				dest: "./server/public/js/monitor.js"
			}
		},

		less: {
			development: {
				files: {
					"./server/public/css/style.css": "./server/public/css/style.less"
				}
			}
		},

		watch: {
			scripts: {
				files: [
					"./ui/**/*.js",
					"./common/**/*.js",
					"./server/public/css/*.less"
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