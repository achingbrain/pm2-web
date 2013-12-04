var EventEmitter = require("wildemitter"),
	util = require("util");

var READYSTATE = {
	CONNECTING: 0,
	OPEN: 1,
	CLOSING: 2,
	CLOSED: 3
};

WebSocketResponder = function(socketUrl, hostList) {
	EventEmitter.apply(this);

	this._hostList = hostList;

	console.info("WebSocketResponder", "Connecting to", socketUrl);

	this._ws = new ReconnectingWebSocket(socketUrl);
	this._ws.onconnecting = function() {
		this.emit("connecting");
	}.bind(this);
	this._ws.onopen = function() {
		this.emit("open");
	}.bind(this);
	this._ws.onmessage = function(message) {
		var event = JSON.parse(message.data);

		if(event && event.method && this[event.method]) {
			this[event.method](event.data);
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

WebSocketResponder.prototype.isClosed = function() {
	return this._ws.readyState == READYSTATE.CLOSED;
};

WebSocketResponder.prototype.isConnecting = function() {
	return this._ws.readyState == READYSTATE.CONNECTING;
};

WebSocketResponder.prototype.isOpen = function() {
	return this._ws.readyState == READYSTATE.OPEN;
};

WebSocketResponder.prototype.systemData = function(data) {
	this._hostList.addOrUpdate(data);
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

module.exports = WebSocketResponder;