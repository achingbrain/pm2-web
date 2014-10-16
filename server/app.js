var winston = require("winston"),
	Container = require("wantsit").Container
	Express = require("express"),
	http = require("http"),
	https = require("https"),
	path = require("path"),
	WebSocketServer = require("ws").Server,
	EventEmitter = require("wildemitter"),
	util = require("util"),
	fs = require("fs"),
	methodOverride = require('method-override');

var REQUIRED_PM2_VERSION = "0.11.0";

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

	// non-optional options
	options = options || {};
	options.requiredPm2Version = REQUIRED_PM2_VERSION;

	// parse configuration
	this._container.createAndRegister("config", require(__dirname + "/components/Configuration"), options);

	// web controllers
	this._container.createAndRegister("homeController", require(__dirname + "/routes/Home"));

	// listens for events
	this._container.register("pm2InterfaceFactory", require("pm2-interface"));
	this._container.createAndRegister("pm2Listener", require(__dirname + "/components/PM2Listener"));

	// create express
	this._express = this._createExpress();

	// http(s) server
	this._server = this._createServer(this._express);

	// web sockets
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

	// make sure we shut down cleanly
	process.on("SIGINT", this.stop.bind(this));

	// make sure we shut down cleanly
	process.on("message", function(message) {
		if (message == "shutdown") {
			this.stop();
		}
	});

	// make sure we shut down cleanly
	process.on("exit", this.stop.bind(this));
};
util.inherits(PM2Web, EventEmitter);

PM2Web.prototype._route = function(express, controller, url, method) {
	var component = this._container.find(controller);

	express[method](url, component[method].bind(component));
};

PM2Web.prototype._createServer = function(express) {
	var config = this._container.find("config");

	if(config.get("www:ssl:enabled")) {
		if(config.get("www:ssl:upgrade")) {
			// create an app that will redirect all requests to the https version
			var httpsUrl = "https://" + config.get("www:host");

			if(config.get("www:ssl:port") != 443) {
				httpsUrl += ":" + config.get("www:ssl:port");
			}

			var redirectApp = Express();
			redirectApp.get("*",function(request, response){
				response.redirect(httpsUrl + request.url);
			});
			process.nextTick(function() {
				this._redirectServer = http.createServer(redirectApp);
				this._redirectServer.listen(config.get("www:port"), function() {
					this._container.find("logger").info("PM2Web", "HTTP to HTTPS upgrade server listening on port " + this._redirectServer.address().port);
				}.bind(this));
			}.bind(this));
		}

		return https.createServer({
			passphrase: config.get("www:ssl:passphrase"),
			key: fs.readFileSync(config.get("www:ssl:key")),
			cert: fs.readFileSync(config.get("www:ssl:certificate"))
		}, this._express);
	}

	return http.createServer(express);
}

PM2Web.prototype._createExpress = function() {
	var config = this._container.find("config");
	var port = config.get("www:port");

	if(config.get("www:ssl:enabled")) {
		port = config.get("www:ssl:port");
	}

	var express = Express();
	express.set("port", port);
	express.set("view engine", "jade");
	express.set("views", __dirname + "/views");

	// create routes
	this._route(express, "homeController", "/", "get");
	this._route(express, "homeController", "/hosts/:host", "get");

	if(config.get("www:authentication:enabled")) {
		express.use(Express.basicAuth(config.get("www:authentication:username"), config.get("www:authentication:password")));
	}

	express.use(Express.logger("dev"));
	express.use(Express.urlencoded())
	express.use(Express.json())
	express.use(methodOverride('X-HTTP-Method'));          // Microsoft
	express.use(methodOverride('X-HTTP-Method-Override')); // Google/GData, default option
	express.use(methodOverride('X-Method-Override'));      // IBM
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
	var config = this._container.find("config");

	process.nextTick(function() {
		this._server.listen(this._express.get("port"), config.get("www:address"), function() {
			this._container.find("logger").info("Express server listening on " + this._server.address().address + ":" + this._server.address().port);

			this.setAddress("http" + (config.get("www:ssl:enabled") ? "s": "") + "://" + config.get("www:host") + ":" + this._server.address().port);

			this.emit("start");
		}.bind(this));

		if(config.get("mdns:enabled")) {
			try {
				var mdns = require("mdns2");

				this._container.find("logger").info("Starting MDNS adverisment with name", this._container.find("config").get("mdns:name"));

				// publish via Bonjour
				this._advert = mdns.createAdvertisement(mdns.tcp("http"), this._express.get("port"), {
					name: config.get("mdns:name")
				});
				this._advert.start();
			} catch(e) {
				this._container.find("logger").warn("Could not start mdns argument - did mdns2 install correctly?", e.message);
			}
		}
	}.bind(this));
};

PM2Web.prototype.stop = function() {
	var logger = this._container.find("logger");
	logger = console;

	logger.info("PM2Web", "Shutting down Express");
	this._server.close(function() {
		logger.info("PM2Web", "Express shut down.");
	});

	logger.info("PM2Web", "Shutting WebSocket");
	this._container.find("webSocketServer").close();

	logger.info("PM2Web", "Disconnecting from pm2-interface");
	this._container.find("pm2Listener").close();

	if(this._advert) {
		logger.info("PM2Web", "Shutting down MDNS Advert");
		this._advert.stop();
	}

	if(this._redirectServer) {
		logger.info("PM2Web", "Shutting down HTTP to HTTPS upgrade server");
		this._redirectServer.close(function() {
			logger.info("PM2Web", "HTTP to HTTPS upgrade server shut down.");
		});
	}
};

module.exports = PM2Web;
