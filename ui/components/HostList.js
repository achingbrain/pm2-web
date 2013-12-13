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

	this._mapSystem(data, this._hosts[data.name].system);

	// remove any deleted processes
	for(var i = 0; i < this._hosts[data.name].processes.length; i++) {
		var existingProcess = this._hosts[data.name].processes[i];
		var foundProcess = false;

		data.processes.forEach(function(incomingProcess) {
			if(existingProcess.id == incomingProcess.pm_id) {
				foundProcess = true;
			}
		});

		if(!foundProcess) {
			this._hosts[data.name].processes.splice(i, 1);
			i--;
		}
	}

	// update surviving processes
	data.processes.forEach(function(process) {
		var foundProcess = false;

		this._hosts[data.name].processes.forEach(function(existingProcess) {
			if(existingProcess.id == process.pm_id) {
				foundProcess = existingProcess;
			}
		});

		if(!foundProcess) {
			foundProcess = {
				usage: {
					cpu: [],
					memory: []
				}
			};

			this._hosts[data.name].processes.push(foundProcess);
		}

		this._mapProcess(process, foundProcess, this._hosts[data.name].system);
	}.bind(this));

	this.emit(newHost ? "newHost" : "update", data.name);
};

HostList.prototype._mapSystem = function(source, target) {
	var freeMemory = (source.system.memory.free / source.system.memory.total) * 100;

	target.hostname = source.system.hostname;
	target.process_count = source.processes.length;
	target.cpu_count = source.system.cpus.length;
	target.load_avg = source.system.load;
	target.uptime = source.system.uptime;
	target.memory_free = source.system.memory.free;
	target.memory_used = source.system.memory.total - source.system.memory.free;
	target.memory_total = source.system.memory.total;
	target.memory_free_percent = freeMemory;
	target.memory_used_percent = 100 - freeMemory;
};

HostList.prototype._mapProcess = function(source, target, system) {
	target.id = source.pm_id;
	target.pid = source.pid;
	target.name = source.pm2_env.name;
	target.script = source.pm2_env.pm_exec_path;
	target.uptime = (source.pm2_env.pm_uptime - (new Date()).getTime())/1000;
	target.restarts = source.pm2_env.restart_time;
	target.status = source.pm2_env.status;
	target.memory = source.monit.memory;
	target.cpu = source.monit.cpu;

	var now = new Date();

	target.usage.memory.push({
		x: now,
		y: (source.monit.memory / system.memory_total) * 100
	});
	target.usage.cpu.push({
		x: now,
		y: source.monit.cpu
	});
};

HostList.prototype.find = function(host) {
	return this._hosts[host];
};

HostList.prototype.hosts = function() {
	return Object.keys(this._hosts);
};

module.exports = HostList;
