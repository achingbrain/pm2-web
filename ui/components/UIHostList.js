var EventEmitter = require("wildemitter"),
	util = require("util"),
	HostData = require("./../../common/HostData");

UIHostList = function(config, webSocketResponder) {
	EventEmitter.call(this);

	// populate host data when it's available
	webSocketResponder.once("hosts", function(list) {
		list.forEach(function(data) {
			this.add(data);
		}.bind(this));
	}.bind(this));

	// update host data occasionally
	webSocketResponder.on("systemData", function(data) {
		this.update(data);
	}.bind(this));

	this._config = config;
	this._hosts = {};
};
util.inherits(UIHostList, EventEmitter);

UIHostList.prototype.empty = function() {
	this._hosts = {};
};

UIHostList.prototype.add = function(data) {
	this._hosts[data.name] = new HostData(data.name, this._config);

	this.update(data);

	this.emit("newHost", data.name);
};

UIHostList.prototype.update = function(data) {
	this._hosts[data.name].update(data);

	this.emit("update", data.name);
};

UIHostList.prototype.find = function(host) {
	return this._hosts[host];
};

UIHostList.prototype.hosts = function() {
	return Object.keys(this._hosts);
};

module.exports = UIHostList;
