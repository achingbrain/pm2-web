
module.exports = ["xChart", "d3", "$window", "$document", function(xChart, d3, $window, $document) {
	return {
		restrict: "A",
		scope: {
			data: "="
		},
		link: function(scope, element, attrs) {
			var data = {
				"xScale": "time",
				"yScale": "linear",
				"type": "line",
				"main": [{
						"className": ".cpu",
						"data": scope.data.cpu
					}, {
						"className": ".memory",
						"data": scope.data.memory
					}
				]
			};

			var opts = {
				"tickFormatX": function (x) {
					return d3.time.format("%X")(x);
				},
				yMin: 0,
				yMax: 100,
				axisPaddingTop: 20,
				interpolation: "linear"
			};

			var chart = new xChart("line-dotted", data, element[0], opts);

			scope.$watchCollection("data.memory", function() {
				chart.setData(data);
			});
		}
	};
}];
