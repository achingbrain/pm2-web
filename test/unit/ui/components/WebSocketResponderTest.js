var WebSocketResponder = require(__dirname + "/../../../../ui/components/WebSocketResponder"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	setUp: function(done) {
		ReconnectingWebSocket = function() {

		};

		this._rootScope = {
			$apply: sinon.spy()
		};

		this._webSocketResponder = new WebSocketResponder({protocol: "http", hostname: "localhost", port: 1234}, this._rootScope);

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

	"Should emit hosts": function(test) {
		this._webSocketResponder.on("hosts", function() {
			test.done();
		});

		this._webSocketResponder.onHosts();
	},

	"Should emit config": function(test) {
		this._webSocketResponder.on("config", function() {
			test.done();
		});

		this._webSocketResponder.onConfig();
	},

	"Should emit log:info": function(test) {
		this._webSocketResponder.on("log:info", function() {
			test.done();
		});

		this._webSocketResponder.onInfoLog();
	},

	"Should emit log:error": function(test) {
		this._webSocketResponder.on("log:error", function() {
			test.done();
		});

		this._webSocketResponder.onErrorLog();
	},

	"Should emit process:exception": function(test) {
		this._webSocketResponder.on("process:exception", function() {
			test.done();
		});

		this._webSocketResponder.onProcessException();
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
		this._webSocketResponder.on("systemData", function() {
			test.done();
		});

		this._webSocketResponder.onSystemData({});
	},

	"Should parse message": function(test) {
		var message = {
			method: "test",
			args: []
		};

		this._webSocketResponder.test = function() {
			test.done();
		};

		this._webSocketResponder._ws.onmessage({data: JSON.stringify([message])});
		this._rootScope.$apply.callCount.should.equal(1);

		var callback = this._rootScope.$apply.getCall(0).args[0];
		callback();
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
	},

	"Should send reload process": function(test) {
		this._webSocketResponder._ws.send = function(sent) {
			JSON.parse(sent).method.should.equal("reloadProcess");

			test.done();
		};

		this._webSocketResponder.reloadProcess();
	},

	"Should send debug process": function(test) {
		this._webSocketResponder._ws.send = function(sent) {
			JSON.parse(sent).method.should.equal("debugProcess");

			test.done();
		};

		this._webSocketResponder.debugProcess();
	},

	"Should detect https port": function(test) {
		var webSocketResponder = new WebSocketResponder({protocol: "https", hostname: "localhost", port: 1234}, this._rootScope);

		webSocketResponder.url.should.equal("wss://localhost:1234/ws");

		test.done();
	}
};
