var Autowire = require("wantsit").Autowire,
	defaults = require("defaults"),
	cjson = require("cjson"),
	fs = require("fs"),
	argv = require("yargs").argv;

var DEFAULT_CONFIG_FILE = __dirname + "/../../config.json";
var GLOBAL_CONFIG_FILE = "/etc/pm2-web/config.json";
var USER_CONFIG_FILE = process.env["HOME"] + "/.config/pm2-web/config.json";

var Configuration = function(options) {
	this._logger = Autowire;

	// let options override anything passed
	this._config = options || {};

	// remove extra bits from command line arguments
	delete argv._;
	delete argv.$0;

	// respect arguments passed on the command line
	var commandLine = {};

	Object.keys(argv).forEach(function(key) {
		this._apply(key, argv[key], commandLine);
	}.bind(this));

	this._config = defaults(this._config, commandLine);

	// load config file
	this._config = defaults(this._config, this._loadConfigFile());

	// load defaults from bundled config file
	this._config = defaults(this._config, cjson.load(DEFAULT_CONFIG_FILE));

	this._normaliseHosts();
}

Configuration.prototype.afterPropertiesSet = function() {
	// need to rethink this
	if(this.get("config")) {
		this._logger.info("Configuration", "Loading config file from", this.get("config"));
	} else if (fs.existsSync(USER_CONFIG_FILE)) {
		this._logger.info("Configuration", "Loading config file from", USER_CONFIG_FILE);
	} else if (fs.existsSync(GLOBAL_CONFIG_FILE)) {
		this._logger.info("Configuration", "Loading config file from", GLOBAL_CONFIG_FILE);
	}

	this._logger.info("Configuration", "Loaded default configuration from", DEFAULT_CONFIG_FILE);
	this._logger.info("Configuration", "Final configuration:", JSON.stringify(this._config, null, 2));
}

Configuration.prototype._loadConfigFile = function() {
	// try to find a config file
	if(this.get("config")) {
		// if a config file has been specified make it override all settings
		//this._logger.info("Loading config file from", this.get("config"));
		return cjson.load(this.get("config"));
	} else if (fs.existsSync(USER_CONFIG_FILE)) {
		// otherwise if a user specific config file is present, make that override all settings
		//this._logger.info("Loading config file from", USER_CONFIG_FILE);
		return cjson.load(USER_CONFIG_FILE);
	} else if (fs.existsSync(GLOBAL_CONFIG_FILE)) {
		// otherwise if a global config file is present, make that override all settings
		//this._logger.info("Loading config file from", GLOBAL_CONFIG_FILE);
		return cjson.load(GLOBAL_CONFIG_FILE);
	}

	return {};
}

Configuration.prototype._normaliseHosts = function() {
	var args = this.get("pm2");

	if(!args) {
		args = [];
	}

	// command line arguments arrive like:
	// --pm2:host=foo --pm2:rpc=6666 --pm2:host=bar
	// {host: ["foo", "bar"], rpc: 6666}
	if(!Array.isArray(args)) {
		if(Array.isArray(args.host)) {
			var hosts = [];

			args.rpc = this._arrayify(args.rpc);
			args.events = this._arrayify(args.events);

			args.host.forEach(function(host, index) {
				hosts.push(defaults({
					"host": host,
					"rpc": args.rpc[index] ? args.rpc[index] : undefined,
					"events": args.events[index] ? args.events[index] : undefined
				}, {
					"host": "localhost",
					"rpc": 6666,
					"events": 6667
				}));
			});

			args = hosts;
		} else {
			args = [args];
		}
	}

	// ensure data is correct for each host
	args.forEach(function(host) {
		host.host = host.host || "localhost";
		host.rpc = host.rpc || 6666;
		host.events = host.events || 6667;
	});

	this.set("pm2", args);
}

Configuration.prototype._arrayify = function(arg) {
	if(!arg) {
		return [];
	}

	if(Array.isArray(arg)) {
		return arg;
	}

	return [arg];
}

Configuration.prototype.get = function(key) {
	if(!this._config || !key) {
		return null;
	}

	var value = this._config;

	key.split(":").forEach(function(property) {
		if(value && typeof(value[property]) != "undefined") {
			value = value[property];
		} else {
			value = null;
		}
	});

	return value;
}

Configuration.prototype.set = function(key, value) {
	if(!this._config || !key) {
		return;
	}

	this._apply(key, value, this._config);
}

Configuration.prototype._apply = function(key, value, target) {
	var parts = key.split(":");

	parts.forEach(function(property, index) {
		if((parts.length - 1) == index) {
			target[property] = value;
		} else {
			if(!target[property]) {
				target[property] = {};
			}

			target = target[property];
		}
	});
}

module.exports = Configuration;