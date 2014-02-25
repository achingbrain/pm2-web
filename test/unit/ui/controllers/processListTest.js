var processList = require(__dirname + "/../../../../ui/controllers/processList"),
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
		this._window = {
			open: sinon.stub()
		};
		this._hostList = {
			find: sinon.stub(),
			on: sinon.stub()
		};
		this._webSocketResponder = {
			startProcess: sinon.stub(),
			stopProcess: sinon.stub(),
			restartProcess: sinon.stub(),
			reloadProcess: sinon.stub(),
			debugProcess: sinon.stub()
		};

		this._controller = processList[processList.length - 1];

		done();
	},

	"Should add processes to scope": function(test) {
		var hostData = {
			processes: []
		};
		this._routeParams.host = "foo";
		this._hostList.find.withArgs(this._routeParams.host).returns(hostData);

		this._controller(this._scope, this._routeParams, this._location, this._window, this._hostList, this._webSocketResponder);

		this._scope.processes.should.equal(hostData.processes);

		test.done();
	},

	"Should redirect to root path if host data not found": function(test) {
		this._controller(this._scope, this._routeParams, this._location, this._window, this._hostList, this._webSocketResponder);

		this._location.path.callCount.should.equal(1);
		this._location.path.getCall(0).args[0].should.equal("/");

		test.done();
	},

	"Should start process": function(test) {
		var hostData = {
			name: "bar",
			processes: []
		};
		var event = {
			stopPropagation: sinon.stub()
		};
		this._routeParams.host = "foo";
		this._hostList.find.withArgs(this._routeParams.host).returns(hostData);

		this._controller(this._scope, this._routeParams, this._location, this._window, this._hostList, this._webSocketResponder);

		this._scope.start(10, event);

		this._webSocketResponder.startProcess.getCall(0).args[0].should.equal(hostData.name);
		this._webSocketResponder.startProcess.getCall(0).args[1].should.equal(10);

		event.stopPropagation.callCount.should.equal(1);

		test.done();
	},

	"Should stop process": function(test) {
		var hostData = {
			name: "bar",
			processes: []
		};
		var event = {
			stopPropagation: sinon.stub()
		};
		this._routeParams.host = "foo";
		this._hostList.find.withArgs(this._routeParams.host).returns(hostData);

		this._controller(this._scope, this._routeParams, this._location, this._window, this._hostList, this._webSocketResponder);

		this._scope.stop(10, event);

		this._webSocketResponder.stopProcess.getCall(0).args[0].should.equal(hostData.name);
		this._webSocketResponder.stopProcess.getCall(0).args[1].should.equal(10);

		event.stopPropagation.callCount.should.equal(1);

		test.done();
	},

	"Should restart process": function(test) {
		var hostData = {
			name: "bar",
			processes: []
		};
		var event = {
			stopPropagation: sinon.stub()
		};
		this._routeParams.host = "foo";
		this._hostList.find.withArgs(this._routeParams.host).returns(hostData);

		this._controller(this._scope, this._routeParams, this._location, this._window, this._hostList, this._webSocketResponder);

		this._scope.restart(10, event);

		this._webSocketResponder.restartProcess.getCall(0).args[0].should.equal(hostData.name);
		this._webSocketResponder.restartProcess.getCall(0).args[1].should.equal(10);

		event.stopPropagation.callCount.should.equal(1);

		test.done();
	},

	"Should reload process": function(test) {
		var hostData = {
			name: "bar",
			processes: []
		};
		var event = {
			stopPropagation: sinon.stub()
		};
		var process = {
			id: 10
		}
		this._routeParams.host = "foo";
		this._hostList.find.withArgs(this._routeParams.host).returns(hostData);

		this._controller(this._scope, this._routeParams, this._location, this._window, this._hostList, this._webSocketResponder);

		this._scope.reload(process, event);

		this._webSocketResponder.reloadProcess.getCall(0).args[0].should.equal(hostData.name);
		this._webSocketResponder.reloadProcess.getCall(0).args[1].should.equal(10);

		event.stopPropagation.callCount.should.equal(1);

		test.done();
	},

	"Should update process list": function(test) {
		var hostData = {
			name: "foo",
			processes: []
		};
		this._routeParams.host = "foo";
		this._hostList.find.withArgs(this._routeParams.host).returns(hostData);

		this._hostList.find.callCount.should.equal(0);

		this._controller(this._scope, this._routeParams, this._location, this._window, this._hostList, this._webSocketResponder);

		this._hostList.find.callCount.should.equal(1);

		this._hostList.on.callCount.should.equal(1);
		this._hostList.on.getCall(0).args[0].should.equal("update");
		this._hostList.on.getCall(0).args[1](hostData.name);

		this._hostList.find.callCount.should.equal(2);

		test.done();
	},

	"Should not update process list when updated host name is different": function(test) {
		var hostData = {
			name: "foo",
			processes: []
		};
		this._routeParams.host = "foo";
		this._hostList.find.withArgs(this._routeParams.host).returns(hostData);

		this._controller(this._scope, this._routeParams, this._location, this._window, this._hostList, this._webSocketResponder);

		this._hostList.on.callCount.should.equal(1);
		this._hostList.on.getCall(0).args[0].should.equal("update");
		this._hostList.on.getCall(0).args[1]("bar");

		this._scope.$apply.callCount.should.equal(0);

		test.done();
	},

	"Should open debug window": function(test) {
		var hostData = {
			name: "foo",
			processes: []
		};
		var process = {
			id: 10
		}
		var event = {
			stopPropagation: sinon.stub()
		};
		this._routeParams.host = "foo";
		this._hostList.find.withArgs(this._routeParams.host).returns(hostData);

		this._controller(this._scope, this._routeParams, this._location, this._window, this._hostList, this._webSocketResponder);

		this._window.open.callCount.should.equal(0);

		this._scope.debug(process, event);

		this._webSocketResponder.debugProcess.callCount.should.equal(1);
		this._webSocketResponder.debugProcess.getCall(0).args[0].should.equal(hostData.name);
		this._webSocketResponder.debugProcess.getCall(0).args[1].should.equal(process.id);

		this._window.open.callCount.should.equal(1);

		test.done();
	},

	"Should toggle host list": function(test) {
		var pm_id = 10;

		var hostData = {
			name: "foo",
			processes: []
		};
		this._routeParams.host = "foo";
		this._hostList.find.withArgs(this._routeParams.host).returns(hostData);

		this._controller(this._scope, this._routeParams, this._location, this._window, this._hostList, this._webSocketResponder);

		should(this._scope.showDetails[pm_id]).be.undefined;

		this._scope.toggleDetails(pm_id);

		this._scope.showDetails[pm_id].should.be.true;

		this._scope.toggleDetails(pm_id);

		this._scope.showDetails[pm_id].should.be.false;

		test.done();
	}
};
