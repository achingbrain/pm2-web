var ServerHostList = require(__dirname + "/../../../../server/components/ServerHostList"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	setUp: function(done) {
		this._serverHostList = new ServerHostList();
		this._serverHostList._pm2Listener = {
			on: sinon.stub(),
			startProcess: sinon.stub(),
			stopProcess: sinon.stub(),
			restartProcess: sinon.stub()
		};
		this._serverHostList._config = {
			get: sinon.stub()
		};
		this._serverHostList._logger = {
			info: sinon.stub(),
			warn: sinon.stub(),
			error: sinon.stub(),
			debug: sinon.stub()
		};

		done();
	},

	"Should add host data": function(test) {
		var hostName = "foo";

		test.equal(this._serverHostList._hostData[hostName], undefined);

		this._serverHostList._onSystemData({
			name: hostName,
			system: {
				load: [],
				memory: {

				}
			},
			processes: []
		});

		test.ok(this._serverHostList._hostData[hostName]);

		test.done();
	},

	"Should update host data": function(test) {
		var hostName = "foo";
		var data = {
			name: hostName,
			system: {
				load: [],
				memory: {

				}
			},
			processes: []
		};

		test.equal(this._serverHostList._hostData[hostName], undefined);

		// should create new host data
		this._serverHostList._onSystemData(data);

		var hostData = this._serverHostList._hostData[hostName];

		// should not create new host data
		this._serverHostList._onSystemData(data);

		test.ok(hostData === this._serverHostList._hostData[hostName]);

		test.done();
	},

	"Should remove host that's not been heard from for a while": function(test) {
		var hostName = "foo";
		var doomedHostName = "bar";

		// should create new host data
		this._serverHostList._onSystemData({
			name: hostName,
			system: {
				load: [],
				memory: {

				}
			},
			processes: []
		});
		this._serverHostList._onSystemData({
			name: doomedHostName,
			system: {
				load: [],
				memory: {

				}
			},
			processes: []
		});

		this._serverHostList._hostData[doomedHostName].lastUpdated = Date.now() - 100;

		this._serverHostList._config.get.withArgs("hostPurge:cutoff").returns(50);

		// should remove doomed host
		this._serverHostList._hostPurge();

		test.equal(this._serverHostList._hostData[doomedHostName], undefined);
		test.ok(this._serverHostList._hostData[hostName]);

		test.done();
	},

	"Should return host list": function(test) {
		var hostName1 = "foo";
		var hostName2 = "bar";

		// should create new host data
		this._serverHostList._onSystemData({
			name: hostName1,
			system: {
				load: [],
				memory: {

				}
			},
			processes: []
		});
		this._serverHostList._onSystemData({
			name: hostName2,
			system: {
				load: [],
				memory: {

				}
			},
			processes: []
		});

		// should remove doomed host
		var hosts = this._serverHostList.getHosts();

		hosts.length.should.equal(2);
		hosts[0].name.should.equal(hostName1);
		hosts[1].name.should.equal(hostName2);

		test.done();
	},

	"Should add log line to process": function(test) {
		var process = {
			log: sinon.stub()
		};
		var host = {
			findProcessById: sinon.stub()
		};
		host.findProcessById.withArgs("bar").returns(process);

		this._serverHostList._hostData["foo"] = host;

		this._serverHostList.addLog("foo", "bar", "baz", "qux");

		process.log.getCall(0).args[0].should.equal("baz");
		process.log.getCall(0).args[1].should.equal("qux");

		test.done();
	}
};
