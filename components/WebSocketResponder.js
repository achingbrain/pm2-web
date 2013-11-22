var Autowire = require("wantsit").Autowire;

var WebSocketResponder = function() {
	this._config = Autowire;

	this._logger = Autowire;
	this._pm2Listener = Autowire;
	this._webSocketServer = Autowire;
}

WebSocketResponder.prototype.afterPropertiesSet = function() {
	this._webSocketServer.on("open", function() {
		this._logger.info("WebSocketResponder", "Socket open on port", this._webSocketServer.port);
	}.bind(this));
	this._webSocketServer.broadcast = function(data) {
		this.clients.forEach(function(client) {
			client.send(JSON.stringify(data));
		});
	};
	this._webSocketServer.on("connection", function(client) {
		client.on("message", function(message) {
			this._logger.info("WebSocketResponder", "Incoming message", message);

			//var request = JSON.parse(message);
		}.bind(this));
	}.bind(this));

	// broadcast all pm2 events
	this._pm2Listener.on("*", function(event, data) {
		this._webSocketServer.broadcast({
			event: event,
			data: data
		});
	}.bind(this));
};

module.exports = WebSocketResponder;
