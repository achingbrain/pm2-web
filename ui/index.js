"use strict";

var WebSocketResponder = require("./WebSocketResponder"),
	HostList = require("./HostList"),
	Moment = require("moment");

var pm2Web = angular.module("pm2-web", [
	"ngRoute",
	"ui.bootstrap"
]);

pm2Web.config(["$routeProvider",
	function($routeProvider) {
		$routeProvider.
			when("/hosts/:host", {
				templateUrl: "/js/partials/host.html",
				controller: "HostController"
			}).
			otherwise({
				templateUrl: "/js/partials/connecting.html",
				controller: "ConnectionController"
			});
	}
]);
pm2Web.factory("hostList", function() {
	return new HostList();
});
pm2Web.factory("webSocketResponder", ["$window", "hostList", function($window, hostList) {
	return new WebSocketResponder($window.settings.ws, hostList);
}]);
pm2Web.filter("decimalPlaces", function() {
	return function(number, decimalPlaces) {
		return number.toFixed(decimalPlaces);
	}
});
pm2Web.filter("humanise", function() {
	return function(date) {
		return Moment.duration(date, "seconds").humanize();
	}
});
pm2Web.filter("memory", function() {
	var sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];

	return function(bytes) {
		for(var i = sizes.length; i > 0; i--) {
			var step = Math.pow(1024, i);

			if (bytes > step) {
				return (bytes / step).toFixed(2) + " " + sizes[i];
			}
		}

		return bytes;
	}
});

// sets up the websocket and waits for data
pm2Web.controller("ConnectionController", ["$window", "$scope", "$location", "webSocketResponder", "hostList", function($window, $scope, $location, webSocketResponder, hostList) {
	if(!window["WebSocket"]) {
		$scope.alerts = [{
			type: "error",
			message: "Your browser does not support web sockets, please consider upgrading."
		}];

		return;
	}

	webSocketResponder.on("connecting", function() {
		$scope.$apply(function() {
			$scope.alerts = [{
				type: "info",
				message: "Connecting to " + $window.settings.ws
			}];
		});
	});
	webSocketResponder.on("open", function() {
		$scope.$apply(function() {
			$scope.alerts = [{
				type: "success",
				message: "Waiting for hosts..."
			}];
		});
	});
	webSocketResponder.on("closed", function() {
		hostList.empty();

		$scope.$apply(function() {
			/*$scope.alerts = [{
				type: "error",
				message: "Socket dropped connection"
			}];*/

			$location.path("/");
		});
	});
	webSocketResponder.on("error", function() {
		$scope.$apply(function() {
			$scope.alerts = [{
				type: "error",
				message: "Socket error"
			}];
		});
	});
	hostList.once("newHost", function(host) {
		console.info("Redirecting to /hosts/" + host);
		$scope.$apply(function() {
			$location.path("/hosts/" + host);
		});
	});
}]);

// shows the status of a host
pm2Web.controller("HostController", ["$scope", "$routeParams", "$location", "hostList", function($scope, $routeParams, $location, hostList) {
	var updateScope = function() {
		var hostData = hostList.find($routeParams.host);

		if(!hostData) {
			return $location.path("/");
		}

		$scope.system = hostData.system;
	};
	updateScope();

	hostList.on("update", function(hostName) {
		// only update scope if the update was for our host
		if(hostName == $routeParams.host) {
			$scope.$apply(updateScope);
		}
	});
}]);

// shows a list of processes
pm2Web.controller("ProcessListController", ["$scope", "$routeParams", "$location", "hostList", "webSocketResponder", function($scope, $routeParams, $location, hostList, webSocketResponder) {
	var updateScope = function() {
		var hostData = hostList.find($routeParams.host);

		if(!hostData) {
			console.warn("Could not load host data for", $routeParams.host);

			return $location.path("/");
		}

		$scope.processes = hostData.processes;

		$scope.start = function(pm_id) {
			webSocketResponder.startProcess(hostData.name, pm_id);
		};
		$scope.stop = function(pm_id) {
			webSocketResponder.stopProcess(hostData.name, pm_id);
		};
		$scope.restart = function(pm_id) {
			webSocketResponder.restartProcess(hostData.name, pm_id);
		};
	};
	updateScope();

	hostList.on("update", function(hostName) {
		// only update scope if the update was for our host
		if(hostName == $routeParams.host) {
			$scope.$apply(updateScope);
		}
	});
}]);

pm2Web.controller("HostListController", ["$scope", "$routeParams", "$location", "hostList", function($scope, $routeParams, $location, hostList) {
	$scope.tabs = [];

	var updateScope = function() {
		$scope.tabs.length = 0;

		hostList.hosts().forEach(function(hostName) {
			$scope.tabs.push({
				title: hostName,
				selected: $routeParams.host == hostName
			})
		});

		$scope.changeHost = function(hostName) {
			if(hostName == $routeParams.host) {
				return;
			}

			$scope.tabs.forEach(function(tab) {
				tab.selected = $routeParams.host == tab.hostName;
			});

			$location.path("/hosts/" + hostName);
		}
	};
	updateScope();

	// redraw tabs when new host is found
	hostList.once("newHost", function() {
		$scope.$apply(updateScope);
	});
}]);
