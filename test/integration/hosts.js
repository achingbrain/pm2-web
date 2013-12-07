var Protractor = require("protractor"),
	Harness = require(__dirname + "/lib/Harness"),
	should = require("should");

var harness = new Harness();

module.exports = {

	"Should tell the user we are connecting": function(test) {
		harness.on("ready", function(ptor, pm2web) {
			ptor.get(pm2web.getAddress()).then(function() {
				ptor.findElement(Protractor.By.tagName("h1")).getText().then(function(text) {
					text.should.contain("PM2");

					test.done();
				});
/*
				ptor.findElement(Protractor.By.repeater("alert in alerts").row(0).column("{{alert.message}}")).getText().then(function(text) {
					text.should.contain("onnecting");

					test.done();
				});*/
			});
		});
	}
};
