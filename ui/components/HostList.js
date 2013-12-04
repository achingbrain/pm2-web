var EventEmitter = require("wildemitter"),
	util = require("util");

HostList = function() {
	EventEmitter.call(this);

	this._hosts = {};
};
util.inherits(HostList, EventEmitter);

HostList.prototype.empty = function() {
	this._hosts = {};
};

HostList.prototype.addOrUpdate = function(data) {
	var newHost = false;

	if(!this._hosts[data.name]) {
		newHost = true;

		this._hosts[data.name] = {
			name: data.name,
			system: {},
			processes: []
		};
	}

	var systemData = this._mapSystem(data);

	for(var key in systemData) {
		this._hosts[data.name].system[key] = systemData[key];
	}

	this._hosts[data.name].processes.length = 0;

	data.processes.forEach(function(process) {
		this._hosts[data.name].processes.push(this._mapProcess(process));
	}.bind(this));

	this.emit(newHost ? "newHost" : "update", data.name);
};

HostList.prototype._mapSystem = function(hostData) {
	var freeMemory = (hostData.system.memory.free / hostData.system.memory.total) * 100;

	return {
		hostname: hostData.system.hostname,
		process_count: hostData.processes.length,
		cpu_count: hostData.system.cpus.length,
		load_avg: hostData.system.load,
		uptime: hostData.system.uptime,
		memory_free: hostData.system.memory.free,
		memory_used: hostData.system.memory.total - hostData.system.memory.free,
		memory_total: hostData.system.memory.total,
		memory_free_percent: freeMemory,
		memory_used_percent: 100 - freeMemory
	}
};

HostList.prototype._mapProcess = function(process) {
	return {
		id: process.pm_id,
		pid: process.pid,
		name: process.pm2_env.name,
		script: process.pm2_env.pm_exec_path,
		uptime: (process.pm2_env.pm_uptime - (new Date()).getTime())/1000,
		restarts: process.pm2_env.restart_time,
		status: process.pm2_env.status,
		memory: process.monit.memory,
		cpu: process.monit.cpu
	};
};

HostList.prototype.find = function(host) {
	return this._hosts[host];
};

HostList.prototype.hosts = function() {
	return Object.keys(this._hosts);
};

module.exports = HostList;
