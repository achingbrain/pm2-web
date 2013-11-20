module.exports = function(grunt) {
	grunt.initConfig({

		browserify: {
			dist: {
				src: "./public/js/main.js",
				dest: "./public/js/monitor.js"
			}
		},

		watch: {
			scripts: {
				files: ["./public/js/*.js"],
				tasks: ['browserify'],
				options: {
					spawn: false
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-watch");

	// default task
	grunt.registerTask("default", ["browserify", "watch"]);
};