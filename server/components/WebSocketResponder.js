var Autowire = require("wantsit").Autowire,
	_s = require("underscore.string");

var WebSocketResponder = function() {
	this._config = Autowire;

	this._logger = Autowire;
	this._pm2Listener = Autowire;
	this._webSocketServer = Autowire;
	this._hostList = Autowire;
	this._events = [];
}

WebSocketResponder.prototype.afterPropertiesSet = function() {
	var logger = this._logger;

	this._webSocketServer.broadcast = function(data) {
		var message = JSON.stringify(data);

		this.clients.forEach(function(client) {
			try {
				client.send(message);
			} catch(e) {
				logger.warn("WebSocketResponder", "Error broadcasing to client", e.message);
			}
		}.bind(this));
	};
	this._webSocketServer.on("connection", function(client) {
		client.on("message", function(message) {
			var request = JSON.parse(message);

			if(request.method && request.args && this[request.method]) {
				request.args.unshift(client);

				this[request.method].apply(this, request.args);
			}
		}.bind(this));

		// send config and all host data
		client.send(JSON.stringify([{
				method: "onConfig",
				args: [{
					graph: this._config.get("graph"),
					logs: this._config.get("logs"),
					updateFrequency: this._config.get("updateFrequency"),
					requiredPm2Version: this._config.get("requiredPm2Version")
				}]
			}, {
				method: "onHosts",
				args: [
					this._hostList.getHosts()
				]
			}
		]));
	}.bind(this));

	// broadcast error logging
	this._pm2Listener.on("log:err", this._broadcastLog.bind(this, "error"));

	// broadcast info logging
	this._pm2Listener.on("log:out", this._broadcastLog.bind(this, "info"));

	// broadcast exceptions
	this._pm2Listener.on("process:exception", function(event) {
		this._hostList.addLog(event.name, event.process.pm2_env.pm_id, "error", event.data);

		this._events.push({
			method: "onProcessException",
			args: [
				event.name, event.process.pm2_env.pm_id, event.err.message, event.err.stack
			]
		});
	}.bind(this));

	// broadcast system data updates
	this._pm2Listener.on("systemData", function(data) {
		this._events.push({
			method: "onSystemData",
			args: [
				data
			]
		});
	}.bind(this));

	setInterval(this._processEvents.bind(this), this._config.get("ws:frequency"));
};

WebSocketResponder.prototype._processEvents = function() {
	if(this._events.length == 0) {
		return;
	}

	this._webSocketServer.broadcast(this._events);

	this._events.length = 0;
}

WebSocketResponder.prototype._broadcastLog = function(type, event) {
	if(!event.data.trim) {
		return;
	}

	var log = event.data.trim();

	this._hostList.addLog(event.name, event.process.pm2_env.pm_id, type, log);

	this._events.push({
		method: "on" + _s.capitalize(type) + "Log",
		args: [
			event.name, event.process.pm2_env.pm_id, log
		]
	});
}

WebSocketResponder.prototype.startProcess = function(client, host, pm_id) {
	this._pm2Listener.startProcess(host, pm_id);
};

WebSocketResponder.prototype.stopProcess = function(client, host, pm_id) {
	this._pm2Listener.stopProcess(host, pm_id);
};

WebSocketResponder.prototype.restartProcess = function(client, host, pm_id) {
	this._pm2Listener.restartProcess(host, pm_id);
};

WebSocketResponder.prototype.reloadProcess = function(client, host, pm_id) {
	this._pm2Listener.reloadProcess(host, pm_id);
};

WebSocketResponder.prototype.debugProcess = function(client, host, pm_id) {
	this._pm2Listener.debugProcess(host, pm_id);
};

module.exports = WebSocketResponder;
