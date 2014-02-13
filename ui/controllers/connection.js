
module.exports = ["$window", "$scope", "$location", "webSocketResponder", "hostList", function($window, $scope, $location, webSocketResponder, hostList) {
	if(!$window["WebSocket"]) {
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
				message: "Connecting to " + webSocketResponder.url
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
	webSocketResponder.on("error", function(event) {
		var message = "";

		if(0 == event.target.readyState) {
			message = " - socket closed, attempting to reconnect";
		} else if(2 == event.target.readyState) {
			message = " - socket closing";
		} else if(3 == event.target.readyState) {
			message = " - socket closed";
		}

		$scope.$apply(function() {
			$scope.alerts = [{
				type: "error",
				message: "Socket error" + message
			}];
		});
	});

	hostList.once("update", function(host) {
		$location.path("/hosts/" + host);
	});
}];
