var PM2Listener = require(__dirname + "/../../../../server/components/PM2Listener"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	setUp: function(done) {
		this._listener = new PM2Listener();
		this._listener._config = {
			get: sinon.stub()
		};
		this._listener._logger = {
			info: sinon.stub(),
			warn: sinon.stub(),
			error: sinon.stub(),
			debug: sinon.stub()
		};
		this._listener._pm2InterfaceFactory = sinon.stub();

		this._clock = sinon.useFakeTimers();

		done();
	},

	tearDown: function (done) {
		this._clock.restore();

		done();
	},

	"Should connect to remote pm2": function(test) {
		var hosts = [{
			host: "foo",
			rpc: 1,
			events: 2
		}];

		var remote = {
			on: sinon.stub()
		};

		this._listener._config.get.withArgs("pm2").returns(hosts);
		this._listener._pm2InterfaceFactory.returns(remote);

		this._listener.afterPropertiesSet();

		this._listener._pm2InterfaceFactory.callCount.should.equal(1);

		// should have set up listeners
		remote.on.callCount.should.equal(4);
		remote.on.calledWith("ready", sinon.match.fn);
		remote.on.calledWith("closed", sinon.match.fn);
		remote.on.calledWith("close", sinon.match.fn);
		remote.on.calledWith("reconnecting", sinon.match.fn);

		test.done();
	},

	"Should not to rpc port opening twice": function(test) {
		var remote = {
			bind_host: "foo",
			bus: {
				on: sinon.stub()
			}
		};

		this._listener._pm2List["foo"] = {};

		this._listener._pm2RPCSocketReady(remote);

		remote.bus.on.callCount.should.equal(0);

		test.done();
	},

	"Should respond to rpc port opening": function(test) {
		var remote = {
			bind_host: "foo",
			bus: {
				on: sinon.stub()
			},
			rpc: {
				getSystemData: sinon.stub(),
				getVersion: sinon.stub()
			}
		};

		this._listener._config.get.withArgs("requiredPm2Version").returns("0.0.0")
		remote.rpc.getVersion.callsArgWith(1, null, "1.0.0");

		this._listener._pm2RPCSocketReady(remote);

		remote.bus.on.callCount.should.equal(1);
		remote.rpc.getSystemData.callCount.should.equal(1);

		test.done();
	},

	"Should emit systemData event when receiving system data": function(test) {
		var remote = {
			bind_host: "foo",
			bus: {
				on: sinon.stub()
			},
			rpc: {
				getSystemData: sinon.stub(),
				getVersion: sinon.stub()
			}
		};

		this._listener._config.get.withArgs("requiredPm2Version").returns("0.0.0")
		remote.rpc.getVersion.callsArgWith(1, null, "1.0.0");

		this._listener._pm2RPCSocketReady(remote, {});

		var systemData = {
			system: {
				hostname: "foo",
				cpus: [0],
				load: [0, 0, 0],
				memory: {
					free: 0,
					total: 0
				}
			},
			processes: []
		};

		this._listener.once("systemData", function(data) {
			remote.bind_host.should.equal(data.name);
			systemData.system.hostname.should.equal(data.system.hostname);

			test.done();
		});

		remote.rpc.getSystemData.getCall(0).args[1](null, systemData);
	},

	"Should emit process events": function(test) {
		var remote = {
			bind_host: "foo",
			bus: {
				on: sinon.stub()
			},
			rpc: {
				getSystemData: sinon.stub(),
				getVersion: sinon.stub()
			}
		};

		this._listener._config.get.withArgs("requiredPm2Version").returns("0.0.0")
		remote.rpc.getVersion.callsArgWith(1, null, "1.0.0");

		this._listener._pm2RPCSocketReady(remote);

		var event = "foo:bar";
		var data = {
			pm2_env: {
				name: "baz"
			}
		};

		this._listener.once(event, function(host) {
			data.pm2_env.name.should.equal(host.pm2_env.name);

			test.done();
		});

		remote.bus.on.getCall(0).args[1](event, data);
	},

	"Should emit process exceptions": function(test) {
		var remote = {
			bind_host: "foo",
			bus: {
				on: sinon.stub()
			},
			rpc: {
				getSystemData: sinon.stub(),
				getVersion: sinon.stub()
			}
		};

		this._listener._config.get.withArgs("requiredPm2Version").returns("0.0.0")
		remote.rpc.getVersion.callsArgWith(1, null, "1.0.0");

		this._listener._pm2RPCSocketReady(remote);

		var event = "process:exception";
		var data = {
			name: "baz"
		};

		this._listener.once(event, function(host) {
			data.name.should.equal(host.name);

			test.done();
		});

		remote.bus.on.getCall(0).args[1](event, data);
	},

	"Should respond to rpc port closing": function(test) {
		var remote = {
			bind_host: "foo"
		};

		this._listener._pm2List[remote.bind_host] = {};

		this._listener._pm2RPCSocketClosed(remote);

		should(this._listener._pm2List[remote.bind_host]).not.be.ok;

		test.done();
	},

	"Should stop process": function(test) {
		var host = "foo";
		var pm_id = 10;

		this._listener._pm2List[host] = {
			rpc: {
				stopProcessId: sinon.stub()
			}
		};

		this._listener.stopProcess(host, pm_id);

		this._listener._pm2List[host].rpc.stopProcessId.callCount.should.equal(1);
		this._listener._pm2List[host].rpc.stopProcessId.getCall(0).args[0].should.equal(pm_id);

		test.done();
	},

	"Should start process": function(test) {
		var host = "foo";
		var pm_id = 10;

		this._listener._pm2List[host] = {
			rpc: {
				startProcessId: sinon.stub()
			}
		};

		this._listener.startProcess(host, pm_id);

		this._listener._pm2List[host].rpc.startProcessId.callCount.should.equal(1);
		this._listener._pm2List[host].rpc.startProcessId.getCall(0).args[0].should.equal(pm_id);

		test.done();
	},

	"Should restart process": function(test) {
		var host = "foo";
		var pm_id = 10;

		this._listener._pm2List[host] = {
			rpc: {
				restartProcessId: sinon.stub()
			}
		};

		this._listener.restartProcess(host, pm_id);

		this._listener._pm2List[host].rpc.restartProcessId.callCount.should.equal(1);
		this._listener._pm2List[host].rpc.restartProcessId.getCall(0).args[0].should.equal(pm_id);

		test.done();
	},

	"Should not invoke rpc on unknown host": function(test) {
		var host = "foo";
		var pm_id = 10;

		this._listener.restartProcess(host, pm_id);

		Object.keys(this._listener._pm2List).forEach(function(host) {
			this._listener._pm2List[host].rpc.startProcessId.callCount.should.equal(0);
		});

		test.done();
	},

	"Should disconnect on close": function(test) {
		var host = "foo";
		this._listener._pm2List[host] = {
			disconnect: sinon.stub()
		};

		this._listener._pm2List[host].disconnect.callCount.should.equal(0);

		this._listener.close();

		this._listener._pm2List[host].disconnect.callCount.should.equal(1);

		test.done();
	},

	"Should mark process as reloading": function(test) {
		var remote = {
			bind_host: "foo",
			bus: {
				on: sinon.stub()
			},
			rpc: {
				getSystemData: sinon.stub(),
				getVersion: sinon.stub()
			}
		};

		this._listener._config.get.withArgs("requiredPm2Version").returns("0.0.0")
		remote.rpc.getVersion.callsArgWith(1, null, "1.0.0");

		this._listener._pm2RPCSocketReady(remote, {});

		var systemData = {
			system: {
				hostname: "foo",
				cpus: [0],
				load: [0, 0, 0],
				memory: {
					free: 0,
					total: 0
				}
			},
			processes: [{
				pm_id: 0,
				pm2_env: {
					status: "launching",
					exec_mode: "cluster_mode"
				},
				monit: {
					memory: 0,
					cpu: 5
				}
			}, {
				pm_id: "todelete0",
				pm2_env: {
					status: "online",
					exec_mode: "cluster_mode"
				},
				monit: {
					memory: 0,
					cpu: 0
				}
			}]
		};

		this._listener.once("systemData", function(data) {
			remote.bind_host.should.equal(data.name);
			data.processes.length.should.equal(1);
			data.processes[0].reloading.should.equal(true);

			test.done();
		});

		remote.rpc.getSystemData.getCall(0).args[1](null, systemData);
	},

	"Should send hard reload to process": function(test) {
		var host = "foo";
		var pm_id = 10;

		this._listener._pm2List[host] = {
			rpc: {
				reloadProcessId: sinon.stub()
			}
		};
		this._listener._config.get.withArgs("forceHardReload").returns(true);

		this._listener.reloadProcess(host, pm_id);

		this._listener._pm2List[host].rpc.reloadProcessId.callCount.should.equal(1);
		this._listener._pm2List[host].rpc.reloadProcessId.getCall(0).args[0].should.equal(pm_id);

		test.done();
	},

	"Should send soft reload to process": function(test) {
		var host = "foo";
		var pm_id = 10;

		this._listener._pm2List[host] = {
			rpc: {
				softReloadProcessId: sinon.stub()
			}
		};
		this._listener._config.get.withArgs("forceHardReload").returns(false);

		this._listener.reloadProcess(host, pm_id);

		this._listener._pm2List[host].rpc.softReloadProcessId.callCount.should.equal(1);
		this._listener._pm2List[host].rpc.softReloadProcessId.getCall(0).args[0].should.equal(pm_id);

		test.done();
	},

	"Should send debug message to process": function(test) {
		var host = "foo";
		var pm_id = 10;

		this._listener._pm2List[host] = {
			rpc: {
				sendSignalToProcessId: sinon.stub()
			}
		};

		this._listener.debugProcess(host, pm_id);

		this._listener._pm2List[host].rpc.sendSignalToProcessId.callCount.should.equal(1);
		this._listener._pm2List[host].rpc.sendSignalToProcessId.getCall(0).args[0].process_id.should.equal(pm_id);
		this._listener._pm2List[host].rpc.sendSignalToProcessId.getCall(0).args[0].signal.should.equal("SIGUSR1");

		test.done();
	},

	"Should parse debug port from configuration": function(test) {
		this._listener._findDebugPort().should.equal(5858);
		this._listener._findDebugPort("").should.equal(5858);
		this._listener._findDebugPort([]).should.equal(5858);
		this._listener._findDebugPort([""]).should.equal(5858);
		this._listener._findDebugPort(["--debug=1000"]).should.equal(1000);
		this._listener._findDebugPort(["bar", "--debug=1000"]).should.equal(1000);
		this._listener._findDebugPort(["bar", "--debug-brk=2000"]).should.equal(2000);
		this._listener._findDebugPort(["bar", "--debug-brk 2000"]).should.equal(2000);
		this._listener._findDebugPort(["bar", "--debug-brk   =  2000"]).should.equal(2000);

		test.done();
	}
};
