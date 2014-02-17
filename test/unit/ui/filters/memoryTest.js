var memory = require(__dirname + "/../../../../ui/filters/memory"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	"Should format bytes": function( test ) {
		memory()(10).should.equal("10 B");

		test.done();
	},

	"Should format kilobytes": function( test ) {
		memory()(Math.pow(2, 10)).should.equal("1.00 KB");

		test.done();
	},

	"Should format megabytes": function( test ) {
		memory()(Math.pow(2, 20)).should.equal("1.00 MB");

		test.done();
	},

	"Should format gigabytes": function( test ) {
		memory()(Math.pow(2, 30)).should.equal("1.00 GB");

		test.done();
	},

	"Should format terabytes": function( test ) {
		memory()(Math.pow(2, 40)).should.equal("1.00 TB");

		test.done();
	},

	"Should format petabytes": function( test ) {
		memory()(Math.pow(2, 50)).should.equal("1.00 PB");

		test.done();
	},

	"Should format exabytes": function( test ) {
		memory()(Math.pow(2, 60)).should.equal("1.00 EB");

		test.done();
	},

	"Should survive bad input": function( test ) {
		memory()().should.equal("0 B");
		memory()(undefined).should.equal("0 B");

		test.done();
	}
};
