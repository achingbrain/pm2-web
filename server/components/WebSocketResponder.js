var Autowire = require("wantsit").Autowire,
	_s = require("underscore.string");

var WebSocketResponder = function() {
	this._config = Autowire;

	this._logger = Autowire;
	this._pm2Listener = Autowire;
	this._webSocketServer = Autowire;
	this._hostList = Autowire;
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

		// send config
		client.send(JSON.stringify({
			method: "onConfig",
			args: [{
				graph: this._config.get("graph"),
				logs: this._config.get("logs"),
				updateFrequency: this._config.get("updateFrequency")
			}]
		}));

		// send all host data
		client.send(JSON.stringify({
			method: "onHosts",
			args: [
				this._hostList.getHosts()
			]
		}));
	}.bind(this));

	// broadcast error logging
	this._pm2Listener.on("log:err", function(event) {
		this._hostList.addLog(event.name, event.process.pm2_env.pm_id, "error", event.data);

		this._webSocketServer.broadcast({
			method: "onErrorLog",
			args: [
				event.name, event.process.pm2_env.pm_id, event.data
			]
		});
	}.bind(this));

	// broadcast info logging
	this._pm2Listener.on("log:out", function(event) {
		this._hostList.addLog(event.name, event.process.pm2_env.pm_id, "info", event.data);

		this._webSocketServer.broadcast({
			method: "onInfoLog",
			args: [
				event.name, event.process.pm2_env.pm_id, event.data
			]
		});
	}.bind(this));

	// broadcast exceptions
	this._pm2Listener.on("process:exception", function(event) {
		this._hostList.addLog(event.name, event.process.pm2_env.pm_id, "error", event.data);

		this._webSocketServer.broadcast({
			method: "onProcessException",
			args: [
				event.name, event.process.pm2_env.pm_id, event.err.message, event.err.stack
			]
		});
	}.bind(this));

	// broadcast system data updates
	this._pm2Listener.on("systemData", function(data) {
		this._webSocketServer.broadcast({
			method: "onSystemData",
			args: [
				data
			]
		});
	}.bind(this));
};

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

module.exports = WebSocketResponder;
