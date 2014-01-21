var Config = require(__dirname + "/../../../../ui/components/Config"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	setUp: function(done) {
		this._webSocketResponder = {
			once: sinon.stub()
		};

		this._config = new Config(this._webSocketResponder);

		done();
	},

	"Should return null before config has loaded": function(test) {
		var result = this._config.get("foo");

		test.equal(result, null);

		test.done();
	},

	"Should survive being asked for null": function(test) {
		var callback = this._webSocketResponder.once.getCall(0).args[1];
		callback({});

		var result = this._config.get();

		test.equal(result, null);

		test.done();
	},

	"Should return config key": function(test) {
		var callback = this._webSocketResponder.once.getCall(0).args[1];
		callback({foo: "bar"});

		var result = this._config.get("foo");

		result.should.equal("bar");

		test.done();
	},

	"Should return nested config key": function(test) {
		var callback = this._webSocketResponder.once.getCall(0).args[1];
		callback({foo: {bar: "baz"}});

		var result = this._config.get("foo:bar");

		result.should.equal("baz");

		test.done();
	},

	"Should survive invalid nested config key": function(test) {
		var callback = this._webSocketResponder.once.getCall(0).args[1];
		callback({foo: {bar: "baz"}});

		var result = this._config.get("foo:baz");

		test.equal(result, null);

		test.done();
	}
};
