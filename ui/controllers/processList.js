
module.exports = ["$scope", "$routeParams", "$location", "$window", "hostList", "webSocketResponder", function($scope, $routeParams, $location, $window, hostList, webSocketResponder) {
	$scope.showDetails = {};

	var updateScope = function() {
		var hostData = hostList.find($routeParams.host);

		if(!hostData) {
			console.warn("Could not load host data for", $routeParams.host);

			return $location.path("/");
		}

		$scope.hostData = hostData;
		$scope.processes = hostData.processes;
		$scope.debugEnabled = hostData.inspector ? true : false;

		$scope.toggleDetails = function(pm_id) {
			$scope.showDetails[pm_id] = !$scope.showDetails[pm_id];
		};

		$scope.start = function(pm_id, $event) {
			$event.stopPropagation();

			webSocketResponder.startProcess(hostData.name, pm_id);
		};
		$scope.stop = function(pm_id, $event) {
			$event.stopPropagation();

			webSocketResponder.stopProcess(hostData.name, pm_id);
		};
		$scope.restart = function(pm_id, $event) {
			$event.stopPropagation();

			webSocketResponder.restartProcess(hostData.name, pm_id);
		};
		$scope.reload = function(process, $event) {
			$event.stopPropagation();

			process.reloading = true;

			webSocketResponder.reloadProcess(hostData.name, process.id);
		};
		$scope.debug = function(process, $event) {
			$event.stopPropagation();

			webSocketResponder.debugProcess(hostData.name, process.id);

			$window.open("http://" + hostData.name + ":" + hostData.inspector + "/debug?port=" + process.debugPort, hostData.name + "-" + process.id, "location=no,menubar=no,status=no,toolbar=no");
		};
		$scope.clearLogs = function(process) {
			process.logs.length = 0;
		}
	};
	updateScope();

	hostList.on("update", function(hostName) {
		// only update scope if the update was for our host
		if(hostName == $routeParams.host) {
			updateScope();
		}
	});
}];
