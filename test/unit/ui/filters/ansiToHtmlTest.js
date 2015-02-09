var ansiToHtml = require(__dirname + "/../../../../ui/filters/ansiToHtml"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	setUp: function(done) {
		this._ansiToHtml = ansiToHtml[ansiToHtml.length -1]({
			trustAsHtml: function(text) {
				return text;
			}
		});

		done();
	},

	"Should not allow HTML from logs through": function( test ) {
		this._ansiToHtml("<p>hello</p>").should.not.containEql("<p>hello</p>");

		test.done();
	},

	"Should convert colours": function( test ) {
		this._ansiToHtml("[32minfo[39m").should.equal("<span style=\"color:#209805;\">info</span>");

		test.done();
	}
};
