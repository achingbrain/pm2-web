var ProcessData = require(__dirname + "/../../../common/ProcessData"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	setUp: function(done) {
		this._config = {
			get: sinon.stub()
		};

		this._data = new ProcessData(this._config, {
			"id": 0, "pid": 0, "name": "", "script": "", "uptime": 0, "restarts": 0, "status": "", "memory": 0, "cpu": 0
		});

		done();
	},

	"Should compress lots of data": function(test) {
		this._config.get.withArgs("graph:datapoints").returns(1000);
		this._config.get.withArgs("graph:distribution").returns([45, 25, 15, 10, 5]);

		// create a week's worth of data
		var secondsInAWeek = 604800;
		var samples = secondsInAWeek/5;
		var now = Date.now();

		for(var i = 0; i < samples; i++) {
			now -= 5000;

			this._data.usage.memory.push({
				x: now,
				y: 5
			});
		}

		this._data.usage.memory.length.should.equal(samples);

		this._data._append(5, 5);

		this._data.usage.memory.length.should.not.be.above(1000);

		test.done();
	},

	"Should compress": function(test) {
		var expectedLength = 2;

		var data = [{
			x: new Date("2010-11-10 12:00:00"),
			y: 1
		},{
			x: new Date("2010-11-10 12:00:05"),
			y: 1.1
		},{
			x: new Date("2010-11-10 12:00:10"),
			y: 1.2
		}];

		var result = this._data._compress(data, 2);

		result.length.should.equal(expectedLength);

		test.done();
	}
};
