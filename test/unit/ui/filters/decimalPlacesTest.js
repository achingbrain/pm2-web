var decimalPlaces = require(__dirname + "/../../../../ui/filters/decimalPlaces"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	"Should format to two decimal places": function( test ) {
		decimalPlaces()(1.123, 2).length.should.equal(4);

		test.done();
	},

	"Should pad to two decimal places": function( test ) {
		decimalPlaces()(1, 2).length.should.equal(4);

		test.done();
	},

	"Should survive bad input": function( test ) {
		decimalPlaces()().should.equal(0);
		decimalPlaces()(undefined).should.equal(0);

		test.done();
	}
};
