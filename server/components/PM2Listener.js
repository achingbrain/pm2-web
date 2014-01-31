var Autowire = require("wantsit").Autowire,
	EventEmitter = require("wildemitter"),
	util = require("util"),
	defaults = require("defaults");

var PM2Listener = function() {
	EventEmitter.call(this);

	this._config = Autowire;
	this._logger = Autowire;
	this._pm2ArgumentParser = Autowire;
	this._pm2InterfaceFactory = Autowire;

	this._pm2List = {};
}
util.inherits(PM2Listener, EventEmitter);

PM2Listener.prototype.afterPropertiesSet = function() {
	this._pm2ArgumentParser.findHosts().forEach(function(pm2Details) {
		this._connect(pm2Details);
	}.bind(this));
}

PM2Listener.prototype.close = function() {
	Object.keys(this._pm2List).forEach(function(key) {
		this._pm2List[key].disconnect();
	}.bind(this));
}

PM2Listener.prototype._connect = function(pm2Details) {
	this._logger.debug("PM2Listener", "Connecting to", pm2Details.host, "RPC port", pm2Details.rpc, "Event port", pm2Details.events);

	var remote = this._pm2InterfaceFactory({
		sub_port: pm2Details.events,
		rpc_port: pm2Details.rpc,
		bind_host: pm2Details.host
	});

	remote.on("ready", this._pm2RPCSocketReady.bind(this, remote));
	remote.on("closed", this._pm2RPCSocketClosed.bind(this, remote));
	remote.on("close", this._pm2EventSocketClosed.bind(this, remote));
	remote.on("reconnecting", this._pm2EventSocketReconnecting.bind(this, remote));
}

PM2Listener.prototype._pm2RPCSocketReady = function(pm2Interface) {
	if(this._pm2List[pm2Interface.bind_host]) {
		return;
	}

	this._logger.info("PM2Listener", pm2Interface.bind_host, "RPC socket ready");

	// listen for all events
	pm2Interface.bus.on("*", function(event, data) {
		data.name = pm2Interface.bind_host;
		this.emit(event, data);
	}.bind(this));

	var getSystemData = function() {
		pm2Interface.rpc.getSystemData({}, function(error, data) {
			if(error) {
				this._logger.warn("PM2Listener", "Error retrieving system data", error.message);
			} else {
				// only expose fields we are interested in
				var systemData = this._mapSystemData(pm2Interface, data);

				this.emit("systemData", systemData);
			}

			setTimeout(getSystemData, this._config.get("updateFrequency"));
		}.bind(this));
	}.bind(this);
	getSystemData();

	this._pm2List[pm2Interface.bind_host] = pm2Interface;
}

PM2Listener.prototype._mapSystemData = function(pm2Interface, data) {
	// support for pm2 < 0.7.2
	if(!data.system.time) {
		data.system.time = Date.now();
	}

	var systemData = {
		name: pm2Interface.bind_host,
		system: {
			hostname: data.system.hostname,
			cpu_count: data.system.cpus.length,
			load: [
				data.system.load[0],
				data.system.load[1],
				data.system.load[2]
			],
			uptime: data.system.uptime,
			memory: {
				free: data.system.memory.free,
				total: data.system.memory.total
			},
			time: data.system.time
		},
		processes: []
	};

	data.processes.forEach(function(process) {
		systemData.processes.push({
			id: process.pm_id,
			pid: process.pid,
			name: process.pm2_env.name,
			script: process.pm2_env.pm_exec_path,
			uptime: (data.system.time - process.pm2_env.pm_uptime) / 1000,
			restarts: process.pm2_env.restart_time,
			status: process.pm2_env.status,
			memory: process.monit.memory,
			cpu: process.monit.cpu
		});
	}.bind(this));

	return systemData;
}

PM2Listener.prototype._pm2RPCSocketClosed = function(pm2Interface) {
	this._logger.info("PM2Listener", pm2Interface.bind_host, "RPC socket closed");

	delete this._pm2List[pm2Interface.bind_host];
}

PM2Listener.prototype._pm2EventSocketClosed = function(pm2Interface) {
	this._logger.info("PM2Listener", pm2Interface.bind_host, "event socket close");
}

PM2Listener.prototype._pm2EventSocketReconnecting = function(pm2Interface) {
	this._logger.info("PM2Listener", pm2Interface.bind_host, "event socket reconnecting");
}

PM2Listener.prototype.stopProcess = function(host, pm_id) {
	this._doByProcessId(host, pm_id, "stopProcessId");
}

PM2Listener.prototype.startProcess = function(host, pm_id) {
	this._doByProcessId(host, pm_id, "startProcessId");
}

PM2Listener.prototype.restartProcess = function(host, pm_id) {
	this._doByProcessId(host, pm_id, "restartProcessId");
}

PM2Listener.prototype._doByProcessId = function(host, pm_id, action) {
	if(!this._pm2List[host]) {
		return this._logger.info("PM2Listener", "Invalid host", host, "not in", Object.keys(this._pm2List));
	}

	this._logger.info("PM2Listener", host, pm_id, action);
	this._pm2List[host].rpc[action](pm_id, function(error) {

	});
}

module.exports = PM2Listener;