var footer = require(__dirname + "/../../../../ui/controllers/footer"),
	should = require("should");

module.exports = {
	setUp: function(done) {
		this._controller = footer[footer.length - 1];

		done();
	},

	"Should add version to scope": function(test) {
		var scope = {};
		var window = {
			settings: {
				version: 10
			}
		};

		this._controller(window, scope);

		scope.version.should.equal(window.settings.version);

		test.done();
	}
};
