var $ = require("zepto-browserify").$,
	Mustache = require("Mustache"),
	Moment = require("moment"),
	xChart = require("browserify-xcharts"),
	d3 = require("d3");

Dashboard = function(hostname) {
	this._hostname = hostname;
};

Dashboard.prototype.update = function(data) {
	this.displayStats(data);
	this.displayProcesses(data);
}

Dashboard.prototype._formatMemory = function(bytes) {
	var sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];

	for(var i = sizes.length; i > 0; i--) {
		var step = Math.pow(1024, i);

		if (bytes > step) {
			return (bytes / step).toFixed(2) + sizes[i];
		}
	}

	return bytes;
}

Dashboard.prototype.displayStats = function(data) {
	//Display the system information
	var $system = $(".system");
	var args = {
		hostname: this._hostname,
		process_count: (data.processes) ? data.processes.length : 0,
		cpu_count: data.system.cpus.length,
		load_avg: (function() {
			//convert the load averages to strings and cap at two decimal places
			return data.system.load.map(function(v) { return v.toString().replace(/(\.\d\d).+/, "$1"); });
		})(),
		uptime: Moment.duration(data.system.uptime, "seconds").humanize(),
		memory_free_percent: (data.system.memory.free/data.system.memory.total) * 100,
		memory_used_percent: 100 - ((data.system.memory.free/data.system.memory.total) * 100),
		free_amount: this._formatMemory(data.system.memory.free),
		used_amount: this._formatMemory(data.system.memory.total - data.system.memory.free)
	};
	$system.html(Mustache.render($system.html(), args));
};

Dashboard.prototype.displayProcesses = function(data) {
	$(".list").html(Mustache.render($("#process-list").text(), {
		processes: data.processes,
		uptime: function() {
			return Moment.duration(this.pm2_env.pm_uptime - Date.now()).humanize()
		},
		className: function() {
			if(this.pm2_env.name.match(/Pm2Http/)) return "self";
			else return false;
		}
	}));

	/*data.processes.forEach(function(process) {
		var data = {
			"xScale": "time",
			"yScale": "linear",
			"main": [
				{
					"className": ".pizza",
					"data": [
						{
							"x": "2012-11-05",
							"y": 6
						},
						{
							"x": "2012-11-06",
							"y": 6
						},
						{
							"x": "2012-11-07",
							"y": 8
						},
						{
							"x": "2012-11-08",
							"y": 3
						},
						{
							"x": "2012-11-09",
							"y": 4
						},
						{
							"x": "2012-11-10",
							"y": 9
						},
						{
							"x": "2012-11-11",
							"y": 6
						}
					]
				}
			]
		};
		var opts = {
			"dataFormatX": function (x) { return d3.time.format('%Y-%m-%d').parse(x); },
			"tickFormatX": function (x) { return d3.time.format('%A')(x); },
			"mouseover": function (d, i) {
				var pos = $(this).offset();
				$(tt).text(d3.time.format('%A')(d.x) + ': ' + d.y)
					.css({top: topOffset + pos.top, left: pos.left + leftOffset})
					.show();
			},
			"mouseout": function (x) {
				$(tt).hide();
			}
		};
		new xChart('line-dotted', data, "#resources-" +  process.pid, opts);
	});*/
},

module.exports = Dashboard;