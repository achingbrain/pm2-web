
var Config = function(webSocketResponder) {
	webSocketResponder.once("config", function(data) {
		this._config = data
	}.bind(this));
};

Config.prototype.get = function(key) {
	if(!this._config || !key) {
		return null;
	}

	var value = this._config;

	key.split(":").forEach(function(property) {
		if(typeof(value[property]) != "undefined") {
			value = value[property];
		} else {
			value = null;
		}
	});

	return value;
}

module.exports = Config;
