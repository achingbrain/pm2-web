
module.exports = ["config", function(config) {
	return {
		restrict: "A",
		scope: {
			data: "="
		},
		link: function($scope, $element, $attributes) {
			var data = {
				"xScale": "time",
				"yScale": "linear",
				"type": "line",
				"main": [{
						"className": ".cpu",
						"data": $scope.data.cpu
					}, {
						"className": ".memory",
						"data": $scope.data.memory
					}
				]
			};

			var chart = new Highcharts.Chart({
				chart: {
					type: "areaspline",
					renderTo: $element[0]
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
				xAxis: {
					type: "datetime",
					labels: {
						overflow: "justify",
						y: 25
					},
					gridLineColor: "#EEEEEE",
					gridLineWidth: 1
				},
				yAxis: {
					title: {
						text: null
					},
					labels: {
						format: "{value}%"
					},
					min: 0,
					max: 100,
					gridLineColor: "#EEEEEE"
				},
				tooltip: {
					valueSuffix: " %",
					// disabled until data interpolation is added
					enabled: false
				},
				plotOptions: {
					areaspline: {
						lineWidth: 4,
						states: {
							hover: {
								lineWidth: 5
							}
						},
						// disabled markers until data interpolation is supported
						marker: {
							enabled: false,
							states: {
								hover: {
									enabled: false
								}
							}
						},
						fillOpacity: 0.1
					}
				},
				series: [{
					name: "CPU",
					color: "#347FAC",
					data: $scope.data.cpu
				}, {
					name: "Memory",
					color: "#49AA3C",
					data: $scope.data.memory
				}]
			});

			// much simpler than $scope.$watchCollection
			setInterval(function() {
				chart.series[1].setData($scope.data.memory, true);
				chart.series[0].setData($scope.data.cpu, true);
			}, config.get("updateFrequency"));
		}
	};
}];
