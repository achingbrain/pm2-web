var Autowire = require("wantsit").Autowire,
	cjson = require("cjson"),
	fs = require("fs"),
  argv = require("minimist")(process.argv.slice(2)),
	pwuid = require('pwuid');

var DEFAULT_CONFIG_FILE = __dirname + "/../../config.json";
var GLOBAL_CONFIG_FILE = "/etc/pm2-web/config.json";
var USER_CONFIG_FILE = process.env["HOME"] + "/.config/pm2-web/config.json";

var Configuration = function(options) {
	this._logger = Autowire;

	// load defaults from bundled config file
	this._config = cjson.load(DEFAULT_CONFIG_FILE);

	// override defaults with config file
	this._override(this._loadConfigFile(), this._config);

	// remove extra bits from command line arguments
	if(argv) {
		delete argv._;
		delete argv.$0;

		// respect arguments passed on the command line
		var commandLine = {};

		Object.keys(argv).forEach(function(key) {
			this._apply(key, argv[key], commandLine);
		}.bind(this));

		// override config file with command line
		this._override(commandLine, this._config);
	}

	// override everything with passed arguments
	this._override(options || {}, this._config);

	this._normaliseHosts();
}

Configuration.prototype.afterPropertiesSet = function() {
	// need to rethink this
	if(argv["config"]) {
		this._logger.info("Configuration", "Loading config file from", argv["config"]);
	} else if (fs.existsSync(USER_CONFIG_FILE)) {
		this._logger.info("Configuration", "Loading config file from", USER_CONFIG_FILE);
	} else if (fs.existsSync(GLOBAL_CONFIG_FILE)) {
		this._logger.info("Configuration", "Loading config file from", GLOBAL_CONFIG_FILE);
	}

	// do not print passwords in the logs...
	var config = JSON.parse(JSON.stringify(this._config));
	config.www.authentication.password = "**** LA LA LA, NOTHING TO SEE HERE ****";
	config.www.ssl.passphrase = "**** LA LA LA, NOTHING TO SEE HERE ****";

	this._logger.info("Configuration", "Loaded default configuration from", DEFAULT_CONFIG_FILE);
	this._logger.info("Configuration", "Final configuration:", JSON.stringify(config, null, 2));
}

Configuration.prototype._loadConfigFile = function() {
	// try to find a config file
	if(argv["config"]) {
		// if a config file has been specified make it override all settings
		//this._logger.info("Loading config file from", this.get("config"));
		return cjson.load(argv["config"]);
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
	if(Array.isArray(args.host)) {
		var hosts = [];

		args.rpc = this._arrayify(args.rpc);
		args.events = this._arrayify(args.events);
		args.inspector = this._arrayify(args.inspector);

		args.host.forEach(function(host, index) {
			hosts.push(this._defaults({
				"host": host,
				"rpc": args.rpc[index] ? args.rpc[index] : undefined,
				"events": args.events[index] ? args.events[index] : undefined,
				"inspector": args.inspector[index] ? args.inspector[index] : undefined
			}, {
				"host": "localhost",
				"rpc": "~/.pm2/rpc.sock",
				"events": "~/.pm2/pub.sock"
			}));
		}.bind(this));

		args = hosts;
	}

	if(!Array.isArray(args) && typeof args == "object") {
		args = [args];
	}

	var userDetails = pwuid()

	// ensure data is correct for each host
	args.forEach(function(host) {
		host.host = host.host || "localhost";
		host.rpc = host.rpc || "~/.pm2/rpc.sock";
		host.events = host.events || "~/.pm2/pub.sock";

		if(host.rpc.substring(0, 1) == "~") {
			host.rpc = userDetails.dir + host.rpc.substring(1)
		}

		if(host.events.substring(0, 1) == "~") {
			host.events = userDetails.dir + host.events.substring(1)
		}

		if(host.inspector === undefined) {
			delete host.inspector;
		}
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
	var parts;

	if(key.indexOf(":") != -1) {
		parts = key.split(":");
	} else {
		parts = key.split(".");
	}

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

Configuration.prototype._defaults = function(object, defaults) {
	if(typeof object == "undefined" || object == null) {
		return defaults;
	}

	if(typeof defaults == "string" || defaults instanceof String) {
		return object ? object : defaults;
	}

	if(typeof defaults == "boolean") {
		return object ? true : false;
	}

	if(!isNaN(parseFloat(defaults)) && isFinite(defaults)) {
		return typeof object == "undefined" ? defaults : object;
	}

	if(Array.isArray(defaults)) {
		var output = [];

		object.forEach(function(entry, index) {
			output.push(this._defaults(entry, defaults[index] ? defaults[index] : defaults[0]));
		}.bind(this));

		return output;
	}

	if(typeof defaults == "object") {
		var output = {};

		Object.keys(defaults).forEach(function(key) {
			output[key] = this._defaults(object[key], defaults[key]);
		}.bind(this));

		return output;
	}

	this._logger.error("Configuration", "Don't know what to do with", object, "expected", defaults);
}

Configuration.prototype._override = function(source, target) {
	Object.keys(source).forEach(function(key) {
		if(typeof source[key] == "string" || source[key] instanceof String ||
			typeof source[key] == "boolean" ||
			(!isNaN(parseFloat(source[key])) && isFinite(source[key]))) {
			target[key] = source[key];
		}

		if(Array.isArray(source[key])) {
			target[key] = source[key];
		} else if(Array.isArray(target[key])) {
			target[key] = [source[key]];
		}

		if(typeof source[key] == "object") {
			this._override(source[key], target[key]);
		}
	}.bind(this));
}

module.exports = Configuration;
