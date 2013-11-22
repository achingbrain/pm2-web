//var Monitor = require("./Monitor"),
var angular = require("angular");

var pm2Web = angular.module("pm2-web", []);

pm2Web.config(["$routeProvider",
	function($routeProvider) {
		$routeProvider.
			when("/hosts:host", {
				templateUrl: "partials/host.html",
				controller: "PhoneListCtrl"
			}).
			otherwise({
				templateUrl: "partials/host.html",
				controller: "PhoneListCtrl"
			});
	}
]);

pm2Web.controller("ProcessListController", function ($scope) {
	$scope.processes = [{
		pid: "pid",
		script: "script",
		uptime: "uptime",
		restarts: "restarts",
		status: "online"
	}];
});

//new Monitor(settings);
