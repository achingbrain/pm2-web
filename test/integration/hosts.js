var angular = require("angular"),
	sinon = require("sinon"),
	should = require("should");

module.exports = {
	setUp: function(done) {
		this._app = angular.module("pm2-web");

		angular.inject(function($controller) {
			this._scope = {};
			this._connectionController = $controller("ConnectionController", {$scope:scope});
			this._systemController = $controller("SystemController", {$scope:scope});
			this._processListController = $controller("ProcessListController", {$scope:scope});
			this._hostListController = $controller("HostListController", {$scope:scope});
		}.bind(this));

		done();
	},

	"Something or other": function(test) {

		test.done();
	}
};
