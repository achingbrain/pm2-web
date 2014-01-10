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
		this._listener._pm2ArgumentParser = {
			findHosts: sinon.stub()
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

		this._listener._pm2ArgumentParser.findHosts.returns(hosts);
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
				getSystemData: sinon.stub()
			}
		};

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
				getSystemData: sinon.stub()
			}
		};

		this._listener._pm2RPCSocketReady(remote);

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
				getSystemData: sinon.stub()
			}
		};

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
				getSystemData: sinon.stub()
			}
		};

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
	}
};
