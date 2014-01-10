var hostList = require(__dirname + "/../../../../ui/controllers/hostList"),
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
			hosts: sinon.stub(),
			once: sinon.stub(),
			on: sinon.stub()
		}

		this._controller = hostList[hostList.length - 1];

		done();
	},

	"Should add all hosts as tabs": function(test) {
		this._routeParams.host = "foo";
		this._hostList.hosts.returns(["foo", "bar"]);

		this._controller(this._scope, this._routeParams, this._location, this._hostList);

		this._scope.tabs.length.should.equal(2);
		this._scope.tabs[0].title.should.equal("foo");
		this._scope.tabs[0].selected.should.equal(true);
		this._scope.tabs[1].title.should.equal("bar");
		this._scope.tabs[1].selected.should.equal(false);

		test.done();
	},

	"Should change host": function(test) {
		this._routeParams.host = "foo";
		this._hostList.hosts.returns(["foo", "bar"]);

		this._controller(this._scope, this._routeParams, this._location, this._hostList);

		this._scope.changeHost("bar");

		this._location.path.calledWith("/hosts/bar");

		test.done();
	},

	"Should not change host when host is already selected": function(test) {
		this._routeParams.host = "foo";
		this._hostList.hosts.returns(["foo", "bar"]);

		this._controller(this._scope, this._routeParams, this._location, this._hostList);

		this._scope.changeHost("foo");

		this._location.path.callCount.should.equal(0);

		test.done();
	},

	"Should update host list when new host is discovered": function(test) {
		this._hostList.hosts.returns([]);

		this._hostList.hosts.callCount.should.equal(0);

		this._controller(this._scope, this._routeParams, this._location, this._hostList);

		this._hostList.hosts.callCount.should.equal(1);

		this._hostList.on.getCall(0).args[0].should.equal("newHost");

		this._hostList.on.getCall(0).args[1]();

		// should have retrieved host list again
		this._hostList.hosts.callCount.should.equal(2);

		test.done();
	}
};
