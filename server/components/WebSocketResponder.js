var Autowire = require("wantsit").Autowire;

var WebSocketResponder = function() {
	this._config = Autowire;

	this._logger = Autowire;
	this._pm2Listener = Autowire;
	this._webSocketServer = Autowire;
}

WebSocketResponder.prototype.afterPropertiesSet = function() {
	this._webSocketServer.on("open", function() {
		this._logger.info("WebSocketResponder", "Socket open on port", "ws://" + this._config.get("ws:host") + ":" + this._config.get("ws:port"));
	}.bind(this));
	this._webSocketServer.broadcast = function(data) {
		var message = JSON.stringify(data);

		this.clients.forEach(function(client) {
			try {
				client.send(message);
			} catch(e) {
				this._logger.warn("WebSocketResponder", "Error broadcasing to client", e.message);
			}
		});
	};
	this._webSocketServer.on("connection", function(client) {
		client.on("message", function(message) {
			this._logger.info("WebSocketResponder", "Incoming message", message);

			var request = JSON.parse(message);

			if(!request.method || !request.args) {
				this._logger.error("WebSocketResponder", "Request should send method and args");

				return;
			}

			if(!this[request.method]) {
				this._logger.error("WebSocketResponder", "Unknown method", request.method);

				return;
			}

			this[request.method].apply(this, request.args);
		}.bind(this));
	}.bind(this));

	// broadcast all pm2 events
	this._pm2Listener.on("*", function(event, data) {
		this._webSocketServer.broadcast({
			method: event,
			data: data
		});
	}.bind(this));
};

WebSocketResponder.prototype.startProcess = function(host, pm_id) {
	this._pm2Listener.startProcess(host, pm_id);
};

WebSocketResponder.prototype.stopProcess = function(host, pm_id) {
	this._pm2Listener.stopProcess(host, pm_id);
};

WebSocketResponder.prototype.restartProcess = function(host, pm_id) {
	this._pm2Listener.restartProcess(host, pm_id);
};

module.exports = WebSocketResponder;
