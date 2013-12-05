var WebSocketResponder = require(__dirname + "/../../../../ui/components/WebSocketResponder"),
	sinon = require("sinon"),
	should = require("should");

var socketUrl = "ws://fake.socket:1234";

module.exports = {
	setUp: function(done) {
		ReconnectingWebSocket = function() {

		};

		this._hostList = {
			addOrUpdate: sinon.spy()
		};

		this._webSocketResponder = new WebSocketResponder(socketUrl, this._hostList);

		done();
	},

	"Should emit connecting": function(test) {
		this._webSocketResponder.on("connecting", function() {
			test.done();
		});

		this._webSocketResponder._ws.onconnecting();
	},

	"Should emit open": function(test) {
		this._webSocketResponder.on("open", function() {
			test.done();
		});

		this._webSocketResponder._ws.onopen();
	},

	"Should emit closed": function(test) {
		this._webSocketResponder.on("closed", function() {
			test.done();
		});

		this._webSocketResponder._ws.onclose();
	},

	"Should emit error": function(test) {
		this._webSocketResponder.on("error", function() {
			test.done();
		});

		this._webSocketResponder._ws.onerror();
	},

	"Should report socket closed": function(test) {
		this._webSocketResponder._ws.readyState = 3;

		this._webSocketResponder.isClosed().should.equal.true;

		test.done();
	},

	"Should report socket connecting": function(test) {
		this._webSocketResponder._ws.readyState = 0;

		this._webSocketResponder.isConnecting().should.equal.true;

		test.done();
	},

	"Should report socket open": function(test) {
		this._webSocketResponder._ws.readyState = 1;

		this._webSocketResponder.isOpen().should.equal.true;

		test.done();
	},

	"Should update system data": function(test) {
		this._hostList.addOrUpdate.callCount.should.equal(0);

		this._webSocketResponder.systemData({});

		this._hostList.addOrUpdate.callCount.should.equal(1);

		test.done();
	},

	"Should parse message": function(test) {
		var message = {
			method: "test",
			data: {}
		};

		this._webSocketResponder.test = function() {
			test.done();
		};

		this._webSocketResponder._ws.onmessage({data: JSON.stringify(message)});
	},

	"Should send message": function(test) {
		var message = {
			method: "test",
			data: {}
		};

		this._webSocketResponder._ws.send = function(sent) {
			JSON.stringify(message).should.equal(sent);

			test.done();
		};

		this._webSocketResponder._send(message);
	},

	"Should send start process": function(test) {
		this._webSocketResponder._ws.send = function(sent) {
			JSON.parse(sent).method.should.equal("startProcess");

			test.done();
		};

		this._webSocketResponder.startProcess();
	},

	"Should send stop process": function(test) {
		this._webSocketResponder._ws.send = function(sent) {
			JSON.parse(sent).method.should.equal("stopProcess");

			test.done();
		};

		this._webSocketResponder.stopProcess();
	},

	"Should send restart process": function(test) {
		this._webSocketResponder._ws.send = function(sent) {
			JSON.parse(sent).method.should.equal("restartProcess");

			test.done();
		};

		this._webSocketResponder.restartProcess();
	}
};
