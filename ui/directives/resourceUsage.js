
module.exports = [function() {
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
					valueSuffix: " %"
				},
				plotOptions: {
					areaspline: {
						lineWidth: 4,
						states: {
							hover: {
								lineWidth: 5
							}
						},
						marker: {
							enabled: false
						},
						//pointInterval: 3600000, // one hour
						//pointStart: Date.UTC(2009, 9, 6, 0, 0, 0),
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

			$scope.$watchCollection("data.memory", function() {
				chart.series[0].setData($scope.data.cpu);
				chart.series[1].setData($scope.data.memory, true);
			});
		}
	};
}];
