var winston = require("winston"),
	config = require("nconf"),
	Container = require("wantsit").Container
	Express = require("express"),
	http = require("http"),
	path = require("path"),
	WebSocketServer = require("ws").Server,
	EventEmitter = require("wildemitter"),
	util = require("util");

PM2Web = function(options) {
	EventEmitter.call(this);

	// set up arguments
	config.overrides(options).argv().env().file(__dirname + "/../config.json");

	this._container = new Container();
	this._container.register("config", config);

	// set up logging
	this._container.createAndRegister("logger", winston.Logger, {
		transports: [
			new (winston.transports.Console)({
				timestamp: true,
				colorize: true
			})
		]
	});

	// web controllers
	this._container.createAndRegister("homeController", require(__dirname + "/routes/Home"));

	// listens for events
	this._container.register("pm2InterfaceFactory", require("pm2-interface"));
	this._container.createAndRegister("pm2Listener", require(__dirname + "/components/PM2Listener"));
	this._container.createAndRegister("pm2ArgumentParser", require(__dirname + "/components/PM2ArgumentParser"));

	// client interactions
	this._container.createAndRegister("webSocketResponder", require(__dirname + "/components/WebSocketResponder"));
 	this._container.createAndRegister("webSocketServer", WebSocketServer, {
		port: config.get("ws:port")
	});

	// holds host data
	this._container.createAndRegister("hostList", require(__dirname + "/components/ServerHostList"));

	this._express = Express();

	// all environments
	this._express.set("port", config.get("www:port"));
	this._express.set("view engine", "jade");
	this._express.set("views", __dirname + "/views");
	this._express.use(Express.logger("dev"));
	this._express.use(Express.urlencoded())
	this._express.use(Express.json())
	this._express.use(Express.methodOverride());
	this._express.use(this._express.router);
	this._express.use(Express.static(__dirname + "/public"));

	// development only
	this._express.use(Express.errorHandler());

	this._route("homeController", "/", "get");
	this._route("homeController", "/hosts/:host", "get");

	// make errors a little more descriptive
	process.on("uncaughtException", function (exception) {
		this._container.find("logger").error("PM2", "Uncaught exception", exception && exception.stack ? exception.stack : "No stack trace available");

		throw exception;
	}.bind(this));
};
util.inherits(PM2Web, EventEmitter);

PM2Web.prototype._route = function(controller, url, method) {
	var component = this._container.find(controller);

	this._express[method](url, component[method].bind(component));
};

PM2Web.prototype.setAddress = function(address) {
	this._address = address;
};

PM2Web.prototype.getAddress = function() {
	return this._address;
};

PM2Web.prototype.start = function() {
	process.nextTick(function() {
		this._server = http.createServer(this._express);
		this._server.listen(this._express.get("port"), function() {
			this._container.find("logger").info("Express server listening on port " + this._server.address().port);

			this.setAddress("http://127.0.0.1:" + this._server.address().port);
			this.emit("start");
		}.bind(this));

		if(config.get("mdns:name")) {
			try {
				var mdns = require("mdns2");

				// publish via Bonjour
				var advert = mdns.createAdvertisement(mdns.tcp("http"), this._express.get("port"), {
					name: config.get("mdns:name")
				});
				advert.start();
			} catch(e) {
				this._container.find("logger").warn("Could not start mdns argument - did mdns2 install correctly?", e.message);
			}
		}
	}.bind(this));
};

PM2Web.prototype.stop = function() {
	this._server.close();
	this._container.find("webSocketServer").close();
	this._container.find("pm2Listener").close();
};

module.exports = PM2Web;
