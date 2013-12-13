
module.exports = ["$scope", "$routeParams", "$location", "hostList", "webSocketResponder", function($scope, $routeParams, $location, hostList, webSocketResponder) {
	$scope.showDetails = {};

	var updateScope = function() {
		var hostData = hostList.find($routeParams.host);

		if(!hostData) {
			console.warn("Could not load host data for", $routeParams.host);

			return $location.path("/");
		}

		$scope.processes = hostData.processes;

		$scope.toggleDetails = function(pm_id) {
			$scope.showDetails[pm_id] = !$scope.showDetails[pm_id];
		};

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
}];
