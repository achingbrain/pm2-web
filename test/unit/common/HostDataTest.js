var HostData = require(__dirname + "/../../../common/HostData"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	setUp: function(done) {
		this._config = {
			get: sinon.stub()
		};

		this._data = new HostData(this._config);

		done();
	},

	"Should remove missing processes": function(test) {
		this._data.processes.push({
			name: "foo"
		});
		this._data.processes.push({
			name: "bar"
		});

		this._data.processes.length.should.equal(2);

		this._data._removeMissingProcesses([{
			name: "foo"
		}]);

		this._data.processes.length.should.equal(1);
		this._data.processes[0].name.should.equal("foo");

		test.done();
	},

	"Should find process by id": function(test) {
		this._data.processes.push({
			id: "foo"
		});
		this._data.processes.push({
			id: "bar"
		});

		var returned = this._data.findProcessById("bar");

		returned.id.should.equal("bar");

		test.done();
	},

	"Should fail to find process by id": function(test) {
		this._data.processes.push({
			id: "foo"
		});
		this._data.processes.push({
			id: "bar"
		});

		var returned = this._data.findProcessById("baz");

		test.ok(!returned);

		test.done();
	}
};
