var Moment = require("moment");

var ProcessData = function(config) {
	this._config = config;

	this._process = {};
	this._memoryUsage = [];
	this._cpuUsage = [];

	Object.defineProperty(this, "usage", {
		get: function() {
			return {
				cpu: this._cpuUsage,
				memory: this._memoryUsage
			}
		}.bind(this)
	});
}

ProcessData.prototype.getData = function() {
	var output = {};

	["id", "pid", "name", "script", "uptime", "restarts", "status", "memory", "cpu", "usage"].forEach(function(key) {
		output[key] = this[key];
	}.bind(this));

	return output;
}

ProcessData.prototype.update = function(data, system) {
	["id", "pid", "name", "script", "uptime", "restarts", "status", "memory", "cpu"].forEach(function(key) {
		this[key] = data[key];
	}.bind(this));

	this._append((data.memory / system.memory.free) * 100, data.cpu);
}

ProcessData.prototype._append = function(memory, cpu) {
	this._memoryUsage = this._compressResourceUsage(this._memoryUsage);
	this._cpuUsage = this._compressResourceUsage(this._cpuUsage);

	var now = new Date();

	this._memoryUsage.push({
		x: now,
		y: memory
	});

	this._cpuUsage.push({
		x: now,
		y: cpu
	});
}

ProcessData.prototype._compressResourceUsage = function(data) {
	var datapoints = this._config.get("graph:datapoints");
	datapoints -= 1;

	var distribution = this._config.get("graph:distribution");
	var maxAgeInDays = distribution.length;

	if(data.length < datapoints) {
		return data;
	}

	var now = new Date();
	var cutoff = new Date(now);
	cutoff.setDate(cutoff.getDate() - maxAgeInDays);
	var usage = [];

	var days = [];
	var day = [];

	data.forEach(function(datum) {
		if(datum.date.getTime() < cutoff.getTime()) {
			// ignore anything older than graph:maxAgeInDays
			return;
		}

		if(day[day.length - 1] && day[day.length - 1].date.getDate() != datum.date.getDate()) {
			days.push(day);
			day = [];
		} else {
			day.push(datum);
		}
	});

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

	var dayDifference = Math.floor((now.getTime() - day[day.length - 1].date.getTime()) / 86400000);

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
			date += dataSet[offset + i].x.getTime();

			data += dataSet[offset + i].y;

			processed++;
		}

		offset += processed;

		output.push({
			x: new Date(date / processed),
			y: data / processed
		});

		data = 0;
		date = 0;
	}

	return output;
}

module.exports = ProcessData;