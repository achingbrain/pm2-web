var PM2Web = require(__dirname + "/../../../server/app"),
	Protractor = require("protractor"),
	//remote = require("selenium-webdriver/remote"),
	//webdrvr = require("webdrvr"),
	EventEmitter = require("events").EventEmitter,
	util = require("util"),
	nodeunit = require("nodeunit");

// starts selenium server, then pm2-web, then configures Protractor
// to use our selenium server and emits a "ready" event.
var Harness = function() {
	EventEmitter.call(this);

	var pm2web;
	//var server = new remote.SeleniumServer(webdrvr.selenium.path, {
	//	args: webdrvr.args
	//});
	//server.start().then(function(url) {
	//	console.log('Selenium standalone server started at ' + url);
		pm2web = new PM2Web({www: {port: 0}});
		pm2web.on("start", function() {
			var driver = new Protractor.Builder().
				withCapabilities(Protractor.Capabilities.phantomjs()).
				build();

			this.emit("ready", Protractor.wrapDriver(driver), pm2web);
		}.bind(this));
		pm2web.start();
	//}.bind(this));

	nodeunit.on("done", function() {
		console.info("All tests done, shutting down");

		pm2web.stop();
		//server.stop();

		setTimeout(function() {
			// something in pm2-interface does not tear it's connections
			// down properly so be more forceful.
			process.exit();
		}, 2000);
	});
}
util.inherits(Harness, EventEmitter);

module.exports = Harness;