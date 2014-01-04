var ProcessData = require("./ProcessData");

var HostData = function(name, config) {
	this._config = config;
	this.name = name;
	this._processes = {};

	Object.defineProperty(this, "processes", {
		get: function() {
			return this._processes
		}.bind(this)
	});
	Object.defineProperty(this, "process_count", {
		get: function() {
			return Object.keys(this._processes).length;
		}.bind(this)
	});
};

HostData.prototype.getData = function() {
	var output = {
		name: this.name,
		system: {},
		processes: []
	};

	["name", "hostname", "cpu_count", "uptime", "load", "memory"].forEach(function(key) {
		output.system[key] = this[key]
	}.bind(this));

	Object.keys(this._processes).forEach(function(key) {
		output.processes.push(this._processes[key].getData());
	}.bind(this));

	return output;
};

HostData.prototype.update = function(data) {
	["hostname", "cpu_count", "uptime"].forEach(function(key) {
		this[key] = data.system[key]
	}.bind(this));

	this.load = [
		data.system.load[0],
		data.system.load[1],
		data.system.load[2]
	];
	this.memory = {
		free: data.system.memory.free,
		total: data.system.memory.total,
		used: data.system.memory.total - data.system.memory.free
	};

	this._removeMissingProcesses(data);

	data.processes.forEach(function(process) {
		if(!this._processes[process.name]) {
			this._processes[process.name] = new ProcessData(this._config);
		}

		this._processes[process.name].update(process, data.system);
	}.bind(this));
};

HostData.prototype._removeMissingProcesses = function(data) {
	for(var i = 0; i < this._processes.length; i++) {
		var found = false;

		for(var k = 0; k < data.processes.length; k++) {
			if(data.processes[k].pm2_env.name == this._processes[i].name) {
				found = true;
			}
		}

		if(!found) {
			this._processes.splice(i, 1);
			i--;
		}
	}
};

module.exports = HostData;