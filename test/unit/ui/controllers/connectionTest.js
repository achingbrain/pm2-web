var connection = require(__dirname + "/../../../../ui/controllers/connection"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	setUp: function(done) {
		this._window = {
			WebSocket: function() {}
		};
		this._scope = {
			$apply: sinon.stub()
		};
		this._location = {
			path: sinon.stub()
		};
		this._webSocketResponder = {
			on: sinon.stub()
		};
		this._hostList = {
			empty: sinon.stub(),
			once: sinon.stub()
		}

		this._controller = connection[connection.length - 1];

		done();
	},

	"Should show error when no websockets are present": function(test) {
		this._controller({}, this._scope, this._location, this._webSocketResponder, this._hostList);

		this._scope.alerts.length.should.equal(1);
		this._scope.alerts[0].type.should.equal("error");
		this._scope.alerts[0].message.should.containEql("sockets");

		test.done();
	},

	"Should show connecting message": function(test) {
		this._window.settings = {
			ws: 10
		}
		this._webSocketResponder.url = "ws://location:" + this._window.settings.ws;

		this._controller(this._window, this._scope, this._location, this._webSocketResponder, this._hostList);

		var onCall = this._webSocketResponder.on.getCall(0);
		onCall.args[0].should.equal("connecting");

		// invoke connecting callback
		onCall.args[1]();

		var applyCall = this._scope.$apply.getCall(0);

		// invoke apply callback
		applyCall.args[0]();

		this._scope.alerts.length.should.equal(1);
		this._scope.alerts[0].type.should.equal("info");
		this._scope.alerts[0].message.should.containEql(this._window.settings.ws);

		test.done();
	},

	"Should show open message": function(test) {
		this._window.settings = {
			ws: "foo"
		}

		this._controller(this._window, this._scope, this._location, this._webSocketResponder, this._hostList);

		var onCall = this._webSocketResponder.on.getCall(1);
		onCall.args[0].should.equal("open");

		// invoke open callback
		onCall.args[1]();

		var applyCall = this._scope.$apply.getCall(0);

		// invoke apply callback
		applyCall.args[0]();

		this._scope.alerts.length.should.equal(1);
		this._scope.alerts[0].type.should.equal("success");
		this._scope.alerts[0].message.should.containEql("Waiting");

		test.done();
	},

	"Should show error message": function(test) {
		this._window.settings = {
			ws: "foo"
		}

		this._controller(this._window, this._scope, this._location, this._webSocketResponder, this._hostList);

		var onCall = this._webSocketResponder.on.getCall(3);
		onCall.args[0].should.equal("error");

		var event = {
			target: {
				readyState: 2
			}
		}

		// invoke error callback
		onCall.args[1](event);

		var applyCall = this._scope.$apply.getCall(0);

		// invoke apply callback
		applyCall.args[0]();

		this._scope.alerts.length.should.equal(1);
		this._scope.alerts[0].type.should.equal("error");
		this._scope.alerts[0].message.should.containEql("error");

		test.done();
	},

	"Should redirect to host page when new host encountered": function(test) {
		this._window.settings = {
			ws: "foo"
		}

		this._controller(this._window, this._scope, this._location, this._webSocketResponder, this._hostList);

		var onceCall = this._hostList.once.getCall(0);
		onceCall.args[0].should.equal("update");

		var host = "bar";

		// invoke newHost callback
		onceCall.args[1](host);

		this._location.path.callCount.should.equal(1);

		this._location.path.getCall(0).args[0].should.equal("/hosts/" + host);

		test.done();
	}
};
