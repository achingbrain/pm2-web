var winston = require("winston"),
	Container = require("wantsit").Container
	Express = require("express"),
	http = require("http"),
	path = require("path"),
	WebSocketServer = require("ws").Server,
	EventEmitter = require("wildemitter"),
	util = require("util");

PM2Web = function(options) {
	EventEmitter.call(this);

	// create container
	this._container = new Container();

	// set up logging
	this._container.createAndRegister("logger", winston.Logger, {
		transports: [
			new (winston.transports.Console)({
				timestamp: true,
				colorize: true
			})
		]
	});

	// parse configuration
	this._container.createAndRegister("config", require(__dirname + "/components/Configuration"), options);

	// web controllers
	this._container.createAndRegister("homeController", require(__dirname + "/routes/Home"));

	// listens for events
	this._container.register("pm2InterfaceFactory", require("pm2-interface"));
	this._container.createAndRegister("pm2Listener", require(__dirname + "/components/PM2Listener"));

	// create express
	this._express = this._createExpress();

	// create routes
	this._route("homeController", "/", "get");
	this._route("homeController", "/hosts/:host", "get");

	// http server
	this._server = http.createServer(this._express);

	// client interactions
	this._container.createAndRegister("webSocketResponder", require(__dirname + "/components/WebSocketResponder"));
 	this._container.createAndRegister("webSocketServer", WebSocketServer, {
		server: this._server,
		path: "/ws"
	});

	// holds host data
	this._container.createAndRegister("hostList", require(__dirname + "/components/ServerHostList"));

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

PM2Web.prototype._createExpress = function() {
	// create express
	var express = Express();

	// all environments
	express.set("port", this._container.find("config").get("www:port"));
	express.set("view engine", "jade");
	express.set("views", __dirname + "/views");
	express.use(Express.logger("dev"));
	express.use(Express.urlencoded())
	express.use(Express.json())
	express.use(Express.methodOverride());
	express.use(express.router);
	express.use(Express.static(__dirname + "/public"));

	// development only
	express.use(Express.errorHandler());

	return express;
}

PM2Web.prototype.setAddress = function(address) {
	this._address = address;
};

PM2Web.prototype.getAddress = function() {
	return this._address;
};

PM2Web.prototype.start = function() {
	process.nextTick(function() {
		this._server.listen(this._express.get("port"), function() {
			this._container.find("logger").info("Express server listening on port " + this._server.address().port);

			this.setAddress("http://127.0.0.1:" + this._server.address().port);
			this.emit("start");
		}.bind(this));

		if(this._container.find("config").get("mdns:name")) {
			try {
				var mdns = require("mdns2");

				this._container.find("logger").info("Starting MDNS adverisment with name", this._container.find("config").get("mdns:name"));

				// publish via Bonjour
				var advert = mdns.createAdvertisement(mdns.tcp("http"), this._express.get("port"), {
					name: this._container.find("config").get("mdns:name")
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
