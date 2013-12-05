var phantom = require("node-phantom"),
	angular = require("angular"),
	sinon = require("sinon"),
	should = require("should"),
	PM2Web = require(__dirname + "/../../server/app");

var pm2web;
var browser;

var withBrowser = function(callback) {
	if(!pm2web) {
		pm2web = new PM2Web({www: {port: 0}});
		pm2web.on("start", function() {
			phantom.create(function(error, instance) {
				if(error) {
					throw new Error("Could not create phantomjs instance " + error);
				}

				browser = instance;

				callback(browser);
			});
		});
		pm2web.start();
	} else {
		callback(browser);
	}
};

module.exports = {

	"Should load the page": function(test) {
		withBrowser(function(browser) {
			browser.createPage(function(error, page) {
				page.open(pm2web.getAddress(), function(error, status) {
					status.should.equal("success");

					test.done();
				});
			});
		});
	}
};

require("nodeunit").on("done", function() {
	pm2web.stop();
	process.exit();
});