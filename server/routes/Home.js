var Autowire = require("wantsit").Autowire;

var HomeController = function() {
	this._config = Autowire;
};

HomeController.prototype.get = function(request, response){
	response.render("index", {
		title: this._config.get("www:title"),
		ws: this._config.get("ws:port")
	});
};

module.exports = HomeController;
