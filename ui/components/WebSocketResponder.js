var EventEmitter = require("wildemitter"),
	util = require("util");

var READYSTATE = {
	CONNECTING: 0,
	OPEN: 1,
	CLOSING: 2,
	CLOSED: 3
};

WebSocketResponder = function(location, port, $rootScope) {
	EventEmitter.apply(this);

	this.url = this._detectLocation(location, port);

	console.info("WebSocketResponder", "Connecting to", this.url);

	this._ws = new ReconnectingWebSocket(this.url);
	this._ws.onconnecting = function() {
		this.emit("connecting");
	}.bind(this);
	this._ws.onopen = function() {
		this.emit("open");
	}.bind(this);
	this._ws.onmessage = function(message) {
		var event = JSON.parse(message.data);

		if(event && event.method && this[event.method]) {
			$rootScope.$apply(function() {
				this[event.method].apply(this, event.args);
			}.bind(this));
		}
	}.bind(this);
	this._ws.onclose = function() {
		this.emit("closed");
	}.bind(this);
	this._ws.onerror = function(event) {
		this.emit("error", event);
	}.bind(this);
};
util.inherits(WebSocketResponder, EventEmitter);

WebSocketResponder.prototype._detectLocation = function(location, port ) {
	var protocol = "ws";

	if(location.protocol == "https") {
		protocol += "s";
	}

	return protocol + "://" + location.hostname + ":" + port;
}

WebSocketResponder.prototype.isClosed = function() {
	return this._ws.readyState == READYSTATE.CLOSED;
};

WebSocketResponder.prototype.isConnecting = function() {
	return this._ws.readyState == READYSTATE.CONNECTING;
};

WebSocketResponder.prototype.isOpen = function() {
	return this._ws.readyState == READYSTATE.OPEN;
};

WebSocketResponder.prototype.onSystemData = function(data) {
	this.emit("systemData", data);
};

WebSocketResponder.prototype.onHosts = function(hosts) {
	this.emit("hosts", hosts);
}

WebSocketResponder.prototype.onConfig = function(config) {
	this.emit("config", config);
};

WebSocketResponder.prototype.onInfoLog = function(host, pm_id, log) {
	this.emit("log:info", host, pm_id, log);
};

WebSocketResponder.prototype.onErrorLog = function(host, pm_id, log) {
	this.emit("log:error", host, pm_id, log);
};

WebSocketResponder.prototype.onProcessException = function(host, pm_id, message, stack) {
	this.emit("log:error", host, pm_id, stack);
	this.emit("process:exception", host, pm_id, message, stack);
};

WebSocketResponder.prototype._send = function(message) {
	this._ws.send(JSON.stringify(message));
};

WebSocketResponder.prototype.startProcess = function(host, pm_id) {
	this._send({
		method: "startProcess",
		args: [host, pm_id]
	});
};

WebSocketResponder.prototype.stopProcess = function(host, pm_id) {
	this._send({
		method: "stopProcess",
		args: [host, pm_id]
	});
};

WebSocketResponder.prototype.restartProcess = function(host, pm_id) {
	this._send({
		method: "restartProcess",
		args: [host, pm_id]
	});
};

WebSocketResponder.prototype.reloadProcess = function(host, pm_id) {
	this._send({
		method: "reloadProcess",
		args: [host, pm_id]
	});
};

WebSocketResponder.prototype.debugProcess = function(host, pm_id) {
	this._send({
		method: "debugProcess",
		args: [host, pm_id]
	});
};

WebSocketResponder.READYSTATE = READYSTATE;

module.exports = WebSocketResponder;