var HostList = require(__dirname + "/../../../../ui/components/UIHostList"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	setUp: function(done) {
		this._config = {
			get: sinon.stub()
		};
		this._webSocketResponder = {
			on: sinon.stub(),
			once: sinon.stub()
		};

		this._hostList = new HostList(this._config, this._webSocketResponder);

		this._clock = sinon.useFakeTimers();

		done();
	},

	tearDown: function (done) {
		this._clock.restore();

		done();
	},

	"Should empty list": function(test) {
		this._hostList.hosts().length.should.equal(0);

		this._hostList.add({
			name: "foo",
			system: {
				memory: {

				},
				load: [],
				cpus: []
			},
			processes: []
		});

		this._hostList.hosts().length.should.equal(1);

		this._hostList.empty();

		this._hostList.hosts().length.should.equal(0);

		test.done();
	},

	"Should find host by name": function(test) {
		should(this._hostList.find("foo")).be.null;

		this._hostList.add({
			name: "foo",
			system: {
				memory: {

				},
				load: [],
				cpus: []
			},
			processes: []
		});

		this._hostList.find("foo").should.not.be.null;

		test.done();
	},

	"Should map properties": function(test) {
		var data = {
			name: "foo",
			system: {
				hostname: "foo.local",
				memory: {
					free: 10,
					total: 20
				},
				uptime: 30,
				load: [1, 2, 1],
				cpu_count: 5
			},
			processes: [{
				pm_id: 1,
				pid: 2,
				pm2_env: {
					name: "process_name",
					pm_exec_path: "/foo/bar.js",
					pm_uptime: 40,
					restart_time: 2,
					status: "online"
				},
				monit: {
					memory: 5,
					cpu: 10
				}
			}]
		};

		this._config.get.withArgs("graph:datapoints").returns(1000);
		this._config.get.withArgs("graph:distribution").returns([45, 25, 15, 10, 5]);

		this._hostList.add(data);

		this._hostList.find("foo").system.hostname.should.equal(data.system.hostname);
		this._hostList.find("foo").processes.length.should.equal(data.processes.length);
		this._hostList.find("foo").system.cpu_count.should.equal(data.system.cpu_count);
		this._hostList.find("foo").system.load[0].should.equal(data.system.load[0]);
		this._hostList.find("foo").system.load[1].should.equal(data.system.load[1]);
		this._hostList.find("foo").system.load[2].should.equal(data.system.load[2]);
		this._hostList.find("foo").system.uptime.should.equal(data.system.uptime);
		this._hostList.find("foo").system.memory.free.should.equal(data.system.memory.free);
		this._hostList.find("foo").system.memory.used.should.equal(data.system.memory.total - data.system.memory.free);
		this._hostList.find("foo").system.memory.total.should.equal(data.system.memory.total);

		test.done();
	},

	"Should emit newHost": function(test) {
		this._hostList.hosts().length.should.equal(0);

		this._hostList.once("newHost", function() {
			test.done();
		});

		this._hostList.add({
			name: "foo",
			system: {
				memory: {

				},
				load: [],
				cpus: []
			},
			processes: []
		});
	},

	"Should emit update": function(test) {
		this._hostList.hosts().length.should.equal(0);

		this._hostList.once("newHost", function() {

			// update the host data
			this._hostList.update({
				name: "foo",
				system: {
					memory: {

					},
					load: [],
					cpus: []
				},
				processes: []
			});
		}.bind(this));

		this._hostList.once("update", function() {
			test.done();
		});

		this._hostList.add({
			name: "foo",
			system: {
				memory: {

				},
				load: [],
				cpus: []
			},
			processes: []
		});
	},

	"Should populate host data": function(test) {
		Object.keys(this._hostList._hosts).length.should.equal(0);

		this._webSocketResponder.once.getCall(0).args[0].should.equal("hosts");

		var callback = this._webSocketResponder.once.getCall(0).args[1];

		callback([{
			"name":"localhost",
			"system": {
				"hostname":"Alexs-MacBook-Pro.local",
				"cpu_count":4,
				"uptime":289806,
				"load": [
					2.47412109375,
					2.4853515625,
					2.4150390625
				],
				"memory": {
					"free": 10717712384,
					"total": 17179869184,
					"used":6462156800
				}
			},"processes":[],
			"lastUpdated":1391154303000
		}]);

		Object.keys(this._hostList._hosts).length.should.equal(1);

		test.done();
	},

	"Should update host data": function(test) {
		var hostData = {
			"name":"localhost",
			"system": {
				"hostname":"Alexs-MacBook-Pro.local",
				"cpu_count":4,
				"uptime":289806,
				"load": [
					2.47412109375,
					2.4853515625,
					2.4150390625
				],
				"memory": {
					"free": 10717712384,
					"total": 17179869184,
					"used":6462156800
				}
			},"processes":[],
			"lastUpdated":1391154303000
		};

		this._webSocketResponder.once.getCall(0).args[0].should.equal("hosts");

		var onHostsCallback = this._webSocketResponder.once.getCall(0).args[1];

		// populate host data
		onHostsCallback([hostData]);

		this._webSocketResponder.on.getCall(0).args[0].should.equal("systemData");

		// should emit "update" event
		this._hostList.on("update", function() {
			test.done();
		});

		var updateHostCallback = this._webSocketResponder.on.getCall(0).args[1];

		// upate host data
		updateHostCallback(hostData);
	},

	"Should log info message": function(test) {
		var message = "message";
		var hostName = "foo";
		var processId = 5;

		var host = {
			findProcessById: sinon.stub()
		};

		var process = {
			log: sinon.stub()
		};

		host.findProcessById.withArgs(processId).returns(process);

		this._hostList._hosts[hostName] = host;

		this._webSocketResponder.on.getCall(1).args[0].should.equal("log:info");
		var callback = this._webSocketResponder.on.getCall(1).args[1];

		callback(hostName, processId, message);

		process.log.getCall(0).args[0].should.equal("info");
		process.log.getCall(0).args[1].should.equal(message);

		test.done();
	},

	"Should log error message": function(test) {
		var message = "message";
		var hostName = "foo";
		var processId = 5;

		var host = {
			findProcessById: sinon.stub()
		};

		var process = {
			log: sinon.stub()
		};

		host.findProcessById.withArgs(processId).returns(process);

		this._hostList._hosts[hostName] = host;

		this._webSocketResponder.on.getCall(2).args[0].should.equal("log:error");
		var callback = this._webSocketResponder.on.getCall(2).args[1];

		callback(hostName, processId, message);

		process.log.getCall(0).args[0].should.equal("error");
		process.log.getCall(0).args[1].should.equal(message);

		test.done();
	},

	"Should process exception": function(test) {
		var message = "message";
		var hostName = "foo";
		var processId = 5;

		var host = {
			findProcessById: sinon.stub()
		};

		var process = {
			log: sinon.stub()
		};

		host.findProcessById.withArgs(processId).returns(process);

		this._hostList._hosts[hostName] = host;

		this._webSocketResponder.on.getCall(3).args[0].should.equal("process:exception");
		var callback = this._webSocketResponder.on.getCall(3).args[1];

		callback(hostName, processId, message);

		process.throwing.should.equal(true);

		this._clock.tick(2000);

		should(undefined).equal(process.throwing);

		test.done();
	}
};
