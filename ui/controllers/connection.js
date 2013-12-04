
module.exports = ["$window", "$scope", "$location", "webSocketResponder", "hostList", function($window, $scope, $location, webSocketResponder, hostList) {
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
}];
