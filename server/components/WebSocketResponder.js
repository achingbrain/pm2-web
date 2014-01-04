var Autowire = require("wantsit").Autowire;

var WebSocketResponder = function() {
	this._config = Autowire;

	this._logger = Autowire;
	this._pm2Listener = Autowire;
	this._webSocketServer = Autowire;
	this._hostList = Autowire;
}

WebSocketResponder.prototype.afterPropertiesSet = function() {
	this._webSocketServer.broadcast = function(data) {
		var message = JSON.stringify(data);

		this.clients.forEach(function(client) {
			try {
				client.send(message);
			} catch(e) {
				this._logger.warn("WebSocketResponder", "Error broadcasing to client", e.message);
			}
		}.bind(this));
	};
	this._webSocketServer.on("connection", function(client) {
		client.on("message", function(message) {
			this._logger.info("WebSocketResponder", "Incoming message", message);

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
					graph: this._config.get("graph")
				}
			]
		}));

		// send all host data
		client.send(JSON.stringify({
			method: "onHosts",
			args: [
				this._hostList.getData()
			]
		}));
	}.bind(this));

	// broadcast all pm2 events
	this._pm2Listener.on("*", function(event, data) {
		this._webSocketServer.broadcast({
			method: "on" + event.substring(0, 1).toUpperCase() + event.substring(1),
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

module.exports = WebSocketResponder;
