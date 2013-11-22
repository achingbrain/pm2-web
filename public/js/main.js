var $ = require("zepto-browserify").$,
	Mustache = require("Mustache"),
	Moment = require("moment"),
	xChart = require("browserify-xcharts"),
	d3 = require("d3");

if (!window["WebSocket"]) {
	alert("Well, this isn't going to work out.");
}

var socketResponder = {
	"systemData": function(systemData) {
		Monitor.view.dashboard.displayStats(systemData);
		Monitor.view.dashboard.displayProcesses(systemData);
	}
}

// Let us open a web socket
var webSocket = new WebSocket(settings.ws);
webSocket.onopen = function() {
	webSocket.send("Message to send");
	console.info("WebSocket", settings.ws, "open");
};
webSocket.onmessage = function(message) {
	var event = JSON.parse(message.data);

	if(!event.event || !event.data) {
		console.warn("Invalid event", event);

		return;
	}

	if(socketResponder[event.event]) {
		console.info("Received", event.event);
		socketResponder[event.event](event.data);
	} else {
		console.warn("Unknown event", event.event);
	}
};
webSocket.onclose = function() {
	console.info("Connection is closed...");
};

var Monitor = {
	view: {
		dashboard: {
			displayStats: function(data) {
				//Display the system information
				var $system = $(".system");
				var args = {
					hostname: data.system.hostname,
					process_count: (data.processes) ? data.processes.length : 0,
					cpu_count: data.system.cpus.length,
					load_avg: (function() {
						//convert the load averages to strings and cap at two decimal places
						return data.system.load.map(function(v) { return v.toString().replace(/(\.\d\d).+/, "$1"); });
					})(),
					uptime: Moment.duration(data.system.uptime, "seconds").humanize(),
					memory_free_percent: (data.system.memory.free/data.system.memory.total) * 100,
					memory_used_percent: 100 - ((data.system.memory.free/data.system.memory.total) * 100)
				};
				$system.html(Mustache.render($system.html(), args));
			},

			displayProcesses: function(data) {
				//Since we dont need to keep
				$(".list").html(Mustache.render(Monitor.view.template("process-list"), {
					processes: data.processes,
					uptime: function() {
						return Moment.duration(this.pm2_env.pm_uptime - Date.now()).humanize()
					},
					className: function() {
						if(!this.pm2_env) {
							debugger;
						}

						if(this.pm2_env.name.match(/Pm2Http/)) return "self";
						else return false;
					}
				}));

				data.processes.forEach(function(process) {
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
				});

				//Bind the events
				setTimeout(function() {
					$(".process").each(function() {
						$(this).on("click", function() {
							console.log("Going to show process log! Soon!");
						})
					})
				}, 50);
			},

			//This whole thing isn't ideal
			interval: 4000,
			timeout: false,
			refresh: function(callback) {
				var dash = Monitor.view.dashboard;
				if(dash.timeout) clearTimeout(dash.timeout);

				var bar = $(".refresh-bar div div");
				bar.css("-webkit-animation", "none")
				setTimeout(function() {
					bar.css("-webkit-animation", "progress " + dash.interval + "ms");
				}, 30);

				callback();

				dash.timeout = setTimeout(function() { dash.refresh(callback) }, dash.interval)
			}
		},

		loading: {
			show: function() {

			},

			hide: function() {

			}
		},

		template: function(name) {
			return $("#" + name).text();
		}
	},

	model: {
		info: {
			get: function(callback) {
				//Phew, it's been a while since I've used a library
				//The simplicity here is refreshing.
				/*$.getJSON("/api", function(data) {
					callback(data);
				});*/
			}
		},

		log: {
			get: function(type, pid) {

			}
		}
	},

	controller: {
		dashboard: function() {

			function refresh() {
				Monitor.model.info.get(function(data) {
					Monitor.view.dashboard.displayStats(data);
					Monitor.view.dashboard.displayProcesses(data);
				});
			}

			$("#refresh").on("click", function(event) {
				Monitor.view.dashboard.refresh(refresh);
			});

			$("#refresh-interval").on("keydown", function(event) {
				var $this = $(this),	
					val = parseInt($this.val());

				if(val) Monitor.view.dashboard.interval = val * 1000;
				else {
					if($(this).val() !== "") $(this).val(Monitor.view.dashboard.interval/1000);
				}				
			})

			Monitor.view.dashboard.refresh(refresh);
		}
	},

	init: function() {
		//MVC style for future expansions
		Monitor.controller.dashboard();
	}
};

Monitor.init();