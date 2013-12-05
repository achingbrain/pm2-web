var PM2ArgumentParser = require(__dirname + "/../../../server/components/PM2ArgumentParser"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	setUp: function(done) {
		this._argumentParser = new PM2ArgumentParser();
		this._argumentParser._config = {
			get: sinon.stub()
		};
		this._argumentParser._logger = {
			info: sinon.stub(),
			warn: sinon.stub(),
			error: sinon.stub(),
			debug: sinon.stub()
		};

		done();
	},

	"Should include localhost by default": function(test) {
		var pm2 = null;

		this._argumentParser._config.get.withArgs("pm2").returns(pm2);

		var hosts = this._argumentParser.findHosts();

		hosts.length.should.equal(1);
		hosts[0].host.should.equal("localhost");

		test.done();
	},

	"Should not include localhost when host specified": function(test) {
		var pm2 = {host: "foo"};

		this._argumentParser._config.get.withArgs("pm2").returns(pm2);

		var hosts = this._argumentParser.findHosts();

		hosts.length.should.equal(1);
		hosts[0].host.should.not.equal("localhost");

		test.done();
	},

	"Should not parse array of hosts": function(test) {
		var pm2 = {host: ["foo", "bar"]};

		this._argumentParser._config.get.withArgs("pm2").returns(pm2);

		var hosts = this._argumentParser.findHosts();

		hosts.length.should.equal(2);
		hosts[0].host.should.equal("foo");
		hosts[1].host.should.equal("bar");

		test.done();
	},

	"Should override ports": function(test) {
		var pm2 = {host: "foo", rpc: 10, events: 11};

		this._argumentParser._config.get.withArgs("pm2").returns(pm2);

		var hosts = this._argumentParser.findHosts();

		hosts.length.should.equal(1);
		hosts[0].host.should.equal("foo");
		hosts[0].rpc.should.equal(10);
		hosts[0].events.should.equal(11);

		test.done();
	},

	"Should override ports with arrays": function(test) {
		var pm2 = {host: ["foo", "bar"], rpc: [10, 11], events: [12, 13]};

		this._argumentParser._config.get.withArgs("pm2").returns(pm2);

		var hosts = this._argumentParser.findHosts();

		hosts.length.should.equal(2);
		hosts[0].host.should.equal("foo");
		hosts[0].rpc.should.equal(10);
		hosts[0].events.should.equal(12);
		hosts[1].host.should.equal("bar");
		hosts[1].rpc.should.equal(11);
		hosts[1].events.should.equal(13);

		test.done();
	}
};
