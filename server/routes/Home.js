var Autowire = require("wantsit").Autowire,
	os = require("os");

var HomeController = function() {
	this._config = Autowire;
};

HomeController.prototype.get = function(request, response){
	var host = this._config.get("ws:host");

	if(!host) {
		host = os.hostname();
	}

	response.render("index", {
		title: this._config.get("www:title"),
		ws: "ws://" + host + ":" + this._config.get("ws:port")
	});
};

module.exports = HomeController;
