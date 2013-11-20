var LOG = require("winston"),
	config = require("nconf"),
	Container = require("wantsit").Container
	express = require("express"),
	http = require("http"),
	path = require("path"),
	mdns = require("mdns2"),
	mustacheExpress = require("mustache-express");

// set up arguments
config.argv().env().file(__dirname + "/config.json");

var container = new Container();
container.register("config", config);

// web controllers
container.createAndRegister("homeController", require(__dirname + "/routes/Home"));
container.createAndRegister("apiController", require(__dirname + "/routes/API"));

// inject a dummy seaport - we'll overwrite this when the real one becomes available
container.register("seaport", {
	query: function() {
		return [];
	}
});

var port = config.get("www:port");
var app = express();

var route = function(controller, url, method) {
	var component = container.find(controller);

	app[method](url, component[method].bind(component));
}

app.engine("mustache", mustacheExpress());

// all environments
app.set("port", port);
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");
app.use(express.logger("dev"));
app.use(express.urlencoded())
app.use(express.json())
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static("./public"));

// development only
app.use(express.errorHandler());

//route("homeController", "/", "get");
route("apiController", "/api", "get");

http.createServer(app).listen(app.get("port"), function(){
	LOG.info("Express server listening on port " + app.get("port"));
});

// publish via Bonjour
var advert = mdns.createAdvertisement(mdns.tcp("http"), port, {
	name: config.get("mdns:name")
});
advert.start();