var ProcessData = require("./ProcessData");

var HostData = function(data, config) {
	Object.defineProperty(this, "_config", {
		enumerable: false,
		value: config
	});

	this.name = data.name;
	this.inspector = data.inspector;
	this.pm2 = data.pm2,
	this.system = {};
	this.processes = [];
};

HostData.prototype.update = function(data) {
	this.lastUpdated = Date.now();

	["hostname", "cpu_count", "uptime", "time"].forEach(function(key) {
		this.system[key] = data.system[key]
	}.bind(this));

	this.system.load = [
		data.system.load[0],
		data.system.load[1],
		data.system.load[2]
	];
	this.system.memory = {
		free: data.system.memory.free,
		total: data.system.memory.total,
		used: data.system.memory.total - data.system.memory.free
	};

	this._removeMissingProcesses(data.processes);

	data.processes.forEach(function(reportedProcess) {
		var existingProcess = this.findProcessById(reportedProcess.id);

		if(!existingProcess) {
			existingProcess = new ProcessData(this._config, reportedProcess);
			this.processes.push(existingProcess);
		}

		existingProcess.update(reportedProcess, data.system);
	}.bind(this));
};

HostData.prototype._removeMissingProcesses = function(reportedProcesses) {
	this.processes = this.processes.filter(function(existingProcess) {
		for(var i = 0; i < reportedProcesses.length; i++) {
			if(reportedProcesses[i].name == existingProcess.name) {
				return true;
			}
		}

		return false;
	});
};

HostData.prototype.findProcessById = function(id) {
	for(var i = 0; i < this.processes.length; i++) {
		if(this.processes[i].id == id) {
			return this.processes[i];
		}
	}

	return null;
}

module.exports = HostData;