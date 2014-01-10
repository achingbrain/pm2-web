
module.exports = ["$scope", "$routeParams", "$location", "hostList", function($scope, $routeParams, $location, hostList) {
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
	hostList.on("newHost", function() {
		updateScope();
	});
}];
