
module.exports = ["$scope", "$routeParams", "$location", "hostList", "webSocketResponder", function($scope, $routeParams, $location, hostList, webSocketResponder) {
	$scope.showDetails = {};

	var updateScope = function() {
		var hostData = hostList.find($routeParams.host);

		if(!hostData) {
			console.warn("Could not load host data for", $routeParams.host);

			return $location.path("/");
		}

		$scope.processes = hostData.processes;

		$scope.chartConfig = [];

		hostData.processes.forEach(function(process) {
			$scope.chartConfig.push({
				options: {
					chart: {
						type: "spline"
					},
					title: {
						text: null
					},
					legend: {
						enabled: false
					},
					credits: {
						enabled: false
					},
					exporting: {
						enabled: false
					},
					plotOptions: {
						spline: {
							lineWidth: 20,
							states: {
								hover: {
									lineWidth: 5
								}
							},
							marker: {
								enabled: false
							},
							pointInterval: 3600000, // one hour
							pointStart: Date.UTC(2009, 9, 6, 0, 0, 0)
						}
					},
					xAxis: {
						type: "datetime",
						labels: {
							overflow: "justify"
						}
					},
					yAxis: {
						min: 0,
						max: 100,
						title: {
							text: null
						}
					}
				},
				series: [{
					data: process.usage.cpu,
					color: "#347FAC",
					name: "CPU",
					tooltip: {
						valueSuffix: " %"
					}
				}, {
					data: process.usage.memory,
					color: "#49AA3C",
					name: "Memory",
					tooltip: {
						valueSuffix: " %"
					}
				}]
			});
		});

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
	};
	updateScope();

	hostList.on("update", function(hostName) {
		// only update scope if the update was for our host
		if(hostName == $routeParams.host) {
			updateScope();
		}
	});
}];
