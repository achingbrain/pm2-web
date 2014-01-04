var ProcessData = require(__dirname + "/../../../../server/components/ProcessData"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	setUp: function(done) {
		this._data = new ProcessData();
		this._data._config = {
			get: sinon.stub()
		};
		this._data._logger = {
			info: sinon.stub(),
			debug: sinon.stub(),
			warn: sinon.stub(),
			error: sinon.stub()
		};

		done();
	},

	"Should compress lots of data": function(test) {
		this._data._config.get.withArgs("graph:datapoints").returns(1000);
		this._data._config.get.withArgs("graph:distribution").returns([45, 25, 15, 10, 5]);

		// create a week's worth of data
		var secondsInAWeek = 604800;
		var samples = secondsInAWeek/5;
		var now = new Date().getTime();

		for(var i = 0; i < samples; i++) {
			now -= 5000;

			this._data._memoryUsage.push({
				date: new Date(now),
				data: 5
			});
		}

		this._data._memoryUsage.length.should.equal(samples);

		this._data.append(5, 5);

		this._data._memoryUsage.length.should.not.be.above(1000);

		test.done();
	},

	"Should compress": function(test) {
		var expectedLength = 2;

		var data = [{
			date: new Date("2010-11-10 12:00:00"),
			data: 1
		},{
			date: new Date("2010-11-10 12:00:05"),
			data: 1.1
		},{
			date: new Date("2010-11-10 12:00:10"),
			data: 1.2
		}];

		var result = this._data._compress(data, 2);

		result.length.should.equal(expectedLength);

		test.done();
	}
};
