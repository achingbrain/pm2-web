
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
			console.info("Toggling details for", pm_id, !$scope.showDetails[pm_id]);
			$scope.showDetails[pm_id] = !$scope.showDetails[pm_id];
		};

		$scope.start = function(pm_id, $event) {
			webSocketResponder.startProcess(hostData.name, pm_id);

			$event.stopPropagation();
		};
		$scope.stop = function(pm_id, $event) {
			webSocketResponder.stopProcess(hostData.name, pm_id);

			$event.stopPropagation();
		};
		$scope.restart = function(pm_id, $event) {
			webSocketResponder.restartProcess(hostData.name, pm_id);

			$event.stopPropagation();
		};
		$scope.reload = function(pm_id, $event) {
			webSocketResponder.reloadProcess(hostData.name, pm_id);

			$event.stopPropagation();
		};
	};
	updateScope();

	hostList.on("update", function(hostName) {
		// only update scope if the update was for our host
		if(hostName == $routeParams.host) {
			updateScope();
		}
	});
}];
