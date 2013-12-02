var Autowire = require("wantsit").Autowire,
	EventEmitter = require("wildemitter"),
	util = require("util"),
	defaults = require("defaults"),
	PM2Interface = require("pm2-interface");

var PM2Listener = function() {
	EventEmitter.call(this);

	this._config = Autowire;
	this._logger = Autowire;

	this._pm2List = {};
}
util.inherits(PM2Listener, EventEmitter);

PM2Listener.prototype.afterPropertiesSet = function() {
	this._config.get("pm2").forEach(function(pm2Details) {
		this._connect(pm2Details);
	}.bind(this));
}

PM2Listener.prototype._connect = function(pm2Details) {
	pm2Details = defaults(pm2Details, {
		"host": "localhost",
		"rpc": 6666,
		"events": 6667
	});

	this._logger.info("PM2Listener", "Connecting to", pm2Details.host, "RPC port", pm2Details.rpc, "Event port", pm2Details.events);

	var remote = new PM2Interface({
		sub_port: pm2Details.events,
		rpc_port: pm2Details.rpc,
		bind_host: pm2Details.host
	});

	remote.on("ready", this._pm2RPCSocketReady.bind(this, pm2Details, remote));
	remote.on("closed", this._pm2RPCSocketClosed.bind(this, pm2Details, remote));
	remote.on("close", this._pm2EventSocketClosed.bind(this, pm2Details, remote));
	remote.on("reconnecting", this._pm2EventSocketReconnecting.bind(this, pm2Details, remote));
}

PM2Listener.prototype._pm2RPCSocketReady = function(pm2Details, pm2Interface) {
	if(this._pm2List[pm2Details.host]) {
		return;
	}

	this._logger.info("PM2Listener", pm2Details.host, "RPC socket ready");

	// listen for all events
	pm2Interface.bus.on("*", function(event, data){
		if(event == "process:exception") {
			this._logger.warn("PM2Listener", pm2Details.host, event, data.name);

			this.emit(event, data.name);
		} else {
			this._logger.info("PM2Listener", pm2Details.host, event, data.pm2_env.name);

			this.emit(event, data.pm2_env.name);
		}
	}.bind(this));

	var interval = setInterval(function() {
		pm2Interface.rpc.getSystemData({}, function(error, data) {
			if(error) {
				return this._logger.warn("PM2Listener", "Error retrieving system data", error.message);
			}

			this._logger.info("PM2Listener", pm2Details.host, "has", data.processes.length, "processes");

			data.name = pm2Details.host;

			this.emit("systemData", data);
		}.bind(this));
	}.bind(this), 5000);

	this._pm2List[pm2Details.host] = {
		remote: pm2Interface,
		interval: interval
	};
};

PM2Listener.prototype._pm2RPCSocketClosed = function(pm2Details, pm2Interface) {
	this._logger.info("PM2Listener", pm2Details.host, "RPC socket closed");

	if(this._pm2List[pm2Details.host].interval) {
		clearInterval(this._pm2List[pm2Details.host].interval);
	}

	delete this._pm2List[pm2Details.host];
};

PM2Listener.prototype._pm2EventSocketClosed = function(pm2Details, pm2Interface) {
	this._logger.info("PM2Listener", pm2Details.host, "event socket close");
};

PM2Listener.prototype._pm2EventSocketReconnecting = function(pm2Details, pm2Interface) {
	this._logger.info("PM2Listener", pm2Details.host, "event socket reconnecting");
};

PM2Listener.prototype.stopProcess = function(host, pm_id) {
	this._doByProcessId(host, pm_id, "stopProcessId");
};

PM2Listener.prototype.startProcess = function(host, pm_id) {
	this._doByProcessId(host, pm_id, "startProcessId");
};

PM2Listener.prototype.restartProcess = function(host, pm_id) {
	this._doByProcessId(host, pm_id, "restartProcessId");
};

PM2Listener.prototype._doByProcessId = function(host, pm_id, action) {
	if(!this._pm2List[host]) {
		return this._logger.info("PM2Listener", "Invalid host", host, "not in", Object.keys(this._pm2List));
	}

	this._logger.info("PM2Listener", host, pm_id, action);
	this._pm2List[host].remote.rpc[action](pm_id, function(error) {

	});
}

module.exports = PM2Listener;