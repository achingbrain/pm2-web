var EventEmitter = require("wildemitter"),
	util = require("util");

WebSocketResponder = function(socketUrl, hostList) {
	EventEmitter.apply(this);

	this._hostList = hostList;

	// Let us open a web socket
	this._ws = new WebSocket(socketUrl);
	this._ws.onopen = function() {
		console.info("WebSocket", socketUrl, "open");

		this.emit("open");
	}.bind(this);
	this._ws.onmessage = function(message) {
		var event = JSON.parse(message.data);

		if(!event.event || !event.data) {
			console.warn("Invalid event", event);

			return;
		}

		if(this[event.event]) {
			//console.info("Received", event.event);
			this[event.event](event.data);
		} else {
			console.warn("Unknown event", event.event);
		}
	}.bind(this);
	this._ws.onclose = function() {
		console.info("WebSocket", socketUrl, "closed");

		this.emit("closed");
	}.bind(this);
};
util.inherits(WebSocketResponder, EventEmitter);

WebSocketResponder.prototype.systemData = function(data) {
	//console.info("Got data for", data.system.hostname);
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