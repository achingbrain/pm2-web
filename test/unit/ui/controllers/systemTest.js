var system = require(__dirname + "/../../../../ui/controllers/system"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	setUp: function(done) {
		this._scope = {
			$apply: sinon.stub()
		};
		this._routeParams = {};
		this._location = {
			path: sinon.stub()
		};
		this._hostList = {
			find: sinon.stub(),
			on: sinon.stub()
		};
		this._window = {
			settings: {
				version: ""
			}
		};
		this._config = {
			get: sinon.stub()
		}

		this._controller = system[system.length - 1];

		done();
	},

	"Should add system data to scope": function(test) {
		var hostData = {
			system: {}
		};
		this._routeParams.host = "foo";
		this._hostList.find.withArgs(this._routeParams.host).returns(hostData);

		this._controller(this._scope, this._routeParams, this._location, this._window, this._config, this._hostList);

		this._scope.hostData.system.should.equal(hostData.system);

		test.done();
	},

	"Should redirect to root path if host data not found": function(test) {
		this._controller(this._scope, this._routeParams, this._location, this._window, this._config, this._hostList);

		this._location.path.callCount.should.equal(1);
		this._location.path.getCall(0).args[0].should.equal("/");

		test.done();
	},

	"Should update system data": function(test) {
		var hostData = {
			name: "foo",
			system: {}
		};
		this._routeParams.host = "foo";
		this._hostList.find.withArgs(this._routeParams.host).returns(hostData);

		this._hostList.find.callCount.should.equal(0);

		this._controller(this._scope, this._routeParams, this._location, this._window, this._config, this._hostList);

		this._hostList.find.callCount.should.equal(1);

		this._hostList.on.callCount.should.equal(1);
		this._hostList.on.getCall(0).args[0].should.equal("update");
		this._hostList.on.getCall(0).args[1](hostData.name);

		this._hostList.find.callCount.should.equal(2);

		test.done();
	},

	"Should not update system data when updated host name is different": function(test) {
		var hostData = {
			name: "foo",
			system: {}
		};
		this._routeParams.host = "foo";
		this._hostList.find.withArgs(this._routeParams.host).returns(hostData);

		this._hostList.find.callCount.should.equal(0);

		this._controller(this._scope, this._routeParams, this._location, this._window, this._config, this._hostList);

		this._hostList.find.callCount.should.equal(1);

		this._hostList.on.callCount.should.equal(1);
		this._hostList.on.getCall(0).args[0].should.equal("update");
		this._hostList.on.getCall(0).args[1]("bar");

		this._hostList.find.callCount.should.equal(1);

		test.done();
	}
};
