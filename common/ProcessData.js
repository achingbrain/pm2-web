var Moment = require("moment");

var MILLISECONDS_IN_A_DAY = 86400000;

var ProcessData = function(config, data) {
	Object.defineProperty(this, "_config", {
		enumerable: false,
		value: config
	});

	this.usage = {
		cpu: data.usage ? data.usage.cpu : [],
		memory: data.usage ? data.usage.memory : []
	};

	this.logs = [];

	if(Array.isArray(data.logs)) {
		data.logs.forEach(function(log) {
			this.log(log.type, log.data);
		}.bind(this));
	}

	this._map(data);
}

ProcessData.prototype.update = function(data, system) {
	this._map(data);

	this._append((data.memory / system.memory.free) * 100, data.cpu);
}

ProcessData.prototype.log = function(type, data) {
	// rotate logs if necessary
	if(this.logs.length > this._config.get("logs:max")) {
		this.logs.splice(0, this.logs.length - this._config.get("logs:max"));
	}

	this.logs.push({
		type: type,
		data: data
	});
}

ProcessData.prototype._map = function(data) {
	["id", "pid", "name", "script", "uptime", "restarts", "status", "memory", "cpu"].forEach(function(key) {
		this[key] = data[key];
	}.bind(this));
}

ProcessData.prototype._append = function(memory, cpu) {
	this.usage.memory = this._compressResourceUsage(this.usage.memory);
	this.usage.cpu = this._compressResourceUsage(this.usage.cpu);

	this.usage.memory.push({
		x: Date.now(),
		y: memory
	});

	this.usage.cpu.push({
		x: Date.now(),
		y: cpu
	});
}

ProcessData.prototype._compressResourceUsage = function(data) {
	var datapoints = this._config.get("graph:datapoints");
	datapoints -= 1;

	var distribution = this._config.get("graph:distribution");
	var maxAgeInDays = distribution.length * MILLISECONDS_IN_A_DAY;

	if(data.length < datapoints) {
		return data;
	}

	var now = Date.now();
	var cutoff = Date.now() - maxAgeInDays;
	var usage = [];

	var days = [];
	var day = [];

	// group all data by day
	data.forEach(function(datum) {
		if(datum.x < cutoff) {
			// ignore anything older than graph:maxAgeInDays
			return;
		}

		// record date so we can easily compare days
		datum.date = new Date(datum.x);

		if(day[day.length - 1] && day[day.length - 1].date.getDate() != datum.date.getDate()) {
			days.push(day);
			day = [];
		} else {
			day.push(datum);
		}
	});

	// compress each days worth of data
	days.forEach(function(day) {
		var compressed = this._compressDay(day, now, datapoints, distribution);

		usage = usage.concat(compressed);
	}.bind(this));

	return usage;
}

ProcessData.prototype._compressDay = function(day, now, datapoints, distribution) {
	if(day.length == 0) {
		return day;
	}

	var dayDifference = Math.floor((now - day[day.length - 1].x) / MILLISECONDS_IN_A_DAY);

	if(dayDifference > distribution.length) {
		return [];
	}

	var percent = distribution[dayDifference];

	return this._compress(day, (datapoints/100) * percent);
}

ProcessData.prototype._compress = function(dataSet, maxSamples) {
	var sampleSize = Math.ceil(dataSet.length/maxSamples);

	var output = [];
	var offset = 0;
	var data = 0;
	var date = 0;

	while(offset < dataSet.length) {
		var processed = 0;

		for(var i = 0; i < sampleSize; i++) {
			if(offset + i == dataSet.length) {
				break;
			}

			// might at some point overflow MAX_INT here. won't that be fun.
			date += dataSet[offset + i].x;

			data += dataSet[offset + i].y;

			processed++;
		}

		offset += processed;

		output.push({
			x: date / processed,
			y: data / processed
		});

		data = 0;
		date = 0;
	}

	return output;
}

module.exports = ProcessData;