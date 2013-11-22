var Dashboard = require("./Dashboard"),
	HostList = require("./HostList");

var Monitor = function(options) {
	this._dashboards = [];
	this._hostList = new HostList();

	// Let us open a web socket
	this._ws = new WebSocket(options.ws);
	this._ws.onopen = function() {
		console.info("WebSocket", options.ws, "open");
	};
	this._ws.onmessage = function(message) {
		var event = JSON.parse(message.data);

		if(!event.event || !event.data) {
			console.warn("Invalid event", event);

			return;
		}

		if(this[event.event]) {
			console.info("Received", event.event);
			this[event.event](event.data);
		} else {
			console.warn("Unknown event", event.event);
		}
	}.bind(this);
	this._ws.onclose = function() {
		console.info("WebSocket", options.ws, "closed");
	};
};

Monitor.prototype.systemData = function(data) {
	if(!this._dashboards[data.system.hostname]) {
		console.info("New host encountered", data.system.hostname);

		this._dashboards[data.system.hostname] = new Dashboard(data.system.hostname);
		this._hostList.add(data.system);
	}

	this._dashboards[data.system.hostname].update(data);
}

module.exports = Monitor;