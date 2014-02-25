var Autowire = require("wantsit").Autowire;
	pkg = require(__dirname + "/../../package.json");

var HomeController = function() {
	this._config = Autowire;
};

HomeController.prototype.get = function(request, response){
	response.render("index", {
		version: pkg.version
	});
};

module.exports = HomeController;
