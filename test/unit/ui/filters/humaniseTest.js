var humanise = require(__dirname + "/../../../../ui/filters/humanise"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	"Should humanise date": function( test ) {
		humanise()(new Date()).should.be.a.string;

		test.done();
	}
};
