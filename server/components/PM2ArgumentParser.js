var Autowire = require("wantsit").Autowire,
	defaults = require("defaults");

var PM2ArgumentParser = function() {
	this._config = Autowire;
	this._logger = Autowire;
}

PM2ArgumentParser.prototype.findHosts = function() {
	var args = this._config.get("pm2");

	this._logger.info("PM2ArgumentParser", "Incoming arguments", JSON.stringify(args));

	var output = [];

	args.rpc = this._arrayify(args.rpc);
	args.events = this._arrayify(args.events);

	this._findHosts(args.host).forEach(function(host, index) {
		output.push(defaults({
			"host": host,
			"rpc": args.rpc[index] ? args.rpc[index] : undefined,
			"events": args.events[index] ? args.events[index] : undefined
		}, {
			"host": "localhost",
			"rpc": 6666,
			"events": 6667
		}));
	});

	this._logger.info("PM2ArgumentParser", "Outgoing arguments", JSON.stringify(output));

	return output;
}

PM2ArgumentParser.prototype._findHosts = function(hosts) {
	if(!hosts) {
		return ["localhost"];
	}

	if(Array.isArray(hosts)) {
		return hosts;
	}

	return [hosts];
}

PM2ArgumentParser.prototype._arrayify = function(arg) {
	if(!arg) {
		return [];
	}

	if(Array.isArray(arg)) {
		return arg;
	}

	return [arg];
}

module.exports = PM2ArgumentParser;