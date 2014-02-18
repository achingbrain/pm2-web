
module.exports = ["$scope", "$routeParams", "$location", "$window", "hostList", "webSocketResponder", function($scope, $routeParams, $location, $window, hostList, webSocketResponder) {
	$scope.showDetails = {};

	var updateScope = function() {
		var hostData = hostList.find($routeParams.host);

		if(!hostData) {
			console.warn("Could not load host data for", $routeParams.host);

			return $location.path("/");
		}

		$scope.processes = hostData.processes;
		$scope.debugEnabled = hostData.inspector ? true : false;

		$scope.toggleDetails = function(pm_id) {
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
		$scope.reload = function(process, $event) {
			process.reloading = true;

			webSocketResponder.reloadProcess(hostData.name, process.id);

			$event.stopPropagation();
		};
		$scope.debug = function(process, $event) {
			webSocketResponder.debugProcess(hostData.name, process.id);

			$window.open("http://" + hostData.name + ":" + hostData.inspector + "/debug?port=" + process.debugPort, "_blank", "location=no,menubar=no,status=no,toolbar=no");

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
