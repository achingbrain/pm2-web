var Autowire = require("wantsit").Autowire,
	LOG = require("winston"),
	PM2 = require("pm2-interface"),
	os = require("os");

var API = function() {
	this._config = Autowire;

	this._pm2 = null;
};

API.prototype.afterPropertiesSet = function() {
	var pm2 = new PM2();
	pm2.on("ready", function() {
		this._pm2 = pm2;
	}.bind(this));
	pm2.on("error", function(error) {
		LOG.error("API", error.message);
		this._pm2 = null;
	}.bind(this));
};

API.prototype.get = function(request, response){
	var output = {
		system_info: {
			hostname: os.hostname(),
			uptime: os.uptime()
		},
		monit: {
			cpu: os.cpus(),
			loadavg: os.loadavg(),
			free_mem: os.freemem(),
			total_mem: os.totalmem()
		},
		processes: []
	};

	if(!this._pm2) {
		response.json(output);
	}

	this._pm2.rpc.getMonitorData({}, function(error, data) {
		output.processes = data;

		response.json(output);
	});
};

module.exports = API;