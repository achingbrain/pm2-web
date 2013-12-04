var Autowire = require("wantsit").Autowire,
	LOG = require("winston"),
	PM2 = require("pm2-interface"),
	os = require("os");

var API = function() {
	this._config = Autowire;

	this._pm2 = null;
};

API.prototype.afterPropertiesSet = function() {
	/*var pm2 = new PM2();
	pm2.on("ready", function() {
		this._pm2 = pm2;
	}.bind(this));
	pm2.on("error", function(error) {
		LOG.error("API", error.message);
		this._pm2 = null;
	}.bind(this));*/
};

API.prototype.get = function(request, response){
	//if(!this._pm2) {
		return response.json({error: "Not connected to pm2"});
	//}

	/*this._pm2.rpc.getSystemData({}, function(error, data) {
		if(error) {
			return response.json({
				error: error.message
			});
		}

		response.json(data);
	});*/
};

module.exports = API;