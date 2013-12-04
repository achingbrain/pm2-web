var winston = require("winston"),
	config = require("nconf"),
	Container = require("wantsit").Container
	express = require("express"),
	http = require("http"),
	path = require("path"),
	WebSocketServer = require("ws").Server;

// set up arguments
config.argv().env().file(__dirname + "/config.json");

var container = new Container();
container.register("config", config);

// set up logging
container.createAndRegister("logger", winston.Logger, {
	transports: [
		new (winston.transports.Console)({
			timestamp: true,
			colorize: true
		})
	]
});

// web controllers
container.createAndRegister("homeController", require(__dirname + "/routes/Home"));
container.createAndRegister("apiController", require(__dirname + "/routes/API"));

// listens for events
container.createAndRegister("pm2Listener", require(__dirname + "/components/PM2Listener"));
container.createAndRegister("pm2ArgumentParser", require(__dirname + "/components/PM2ArgumentParser"));

// client interactions
container.createAndRegister("webSocketResponder", require(__dirname + "/components/WebSocketResponder"));
container.createAndRegister("webSocketServer", WebSocketServer, {
	port: config.get("ws:port")
});

// inject a dummy seaport - we'll overwrite this when the real one becomes available
container.register("seaport", {
	query: function() {
		return [];
	}
});

var app = express();

var route = function(controller, url, method) {
	var component = container.find(controller);

	app[method](url, component[method].bind(component));
}

// all environments
app.set("port", config.get("www:port"));
app.set("view engine", "jade");
app.set("views", __dirname + "/views");
app.use(express.logger("dev"));
app.use(express.urlencoded())
app.use(express.json())
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + "/public"));

// development only
app.use(express.errorHandler());

route("homeController", "/", "get");
route("homeController", "/hosts/:host", "get");
//route("apiController", "/api", "get");

http.createServer(app).listen(app.get("port"), function(){
	container.find("logger").info("Express server listening on port " + app.get("port"));
});

if(config.get("mdns:name")) {
	try {
		var mdns = require("mdns2");

		// publish via Bonjour
		var advert = mdns.createAdvertisement(mdns.tcp("http"), config.get("www:port"), {
			name: config.get("mdns:name")
		});
		advert.start();
	} catch(e) {
		container.find("logger").warn("Could not start mdns argument - did mdns2 install correctly?", e.message);
	}
}
