var HostData = require(__dirname + "/../../common/HostData"),
	Autowire = require("wantsit").Autowire;

var ServerHostList = function() {
	this._pm2Listener = Autowire;
	this._config = Autowire;
	this._logger = Autowire;

	this._hostData = {};
}

ServerHostList.prototype.afterPropertiesSet = function() {
	this._pm2Listener.on("systemData", this._onSystemData.bind(this));
	this._pm2Listener.on("pm2:kill", function(data) {
		this._logger.info("HostList", data.name, "was killed");
		delete this._hostData[data.name];
	}.bind(this));

	setInterval(this._hostPurge.bind(this), this._config.get("hostPurge:frequency"));
};

ServerHostList.prototype._onSystemData = function(data) {
	if(!this._hostData[data.name]) {
		this._hostData[data.name] = new HostData(data.name, this._config);
	}

	this._hostData[data.name].update(data);
};

ServerHostList.prototype._hostPurge = function() {
	var now = new Date();

	Object.keys(this._hostData).forEach(function(key) {
		if(now.getTime() - this._hostData[key].lastUpdated > this._config.get("hostPurge:cutoff")) {
			this._logger.info("HostList", key, "has gone away");
			delete this._hostData[key];
		}
	}.bind(this));
};

ServerHostList.prototype.getHosts = function() {
	var output = [];

	Object.keys(this._hostData).forEach(function(key) {
		output.push(this._hostData[key]);
	}.bind(this));

	return output;
};

module.exports = ServerHostList;