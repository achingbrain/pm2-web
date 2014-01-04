
module.exports = ["xChart", "d3", function(xChart, d3) {
	return {
		restrict: "A",
		scope: {
			data: "="
		},
		link: function(scope, element) {
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
				tickFormatX: function (x) {
					var now = new Date();

					if(now.getDate() == x.getDate()) {

					}

					return d3.time.format("%X")(x);
				},
				tickFormatY: function (y) {
					return y + "%";
				},
				yMin: 0,
				yMax: 100,
				axisPaddingTop: 20,
				interpolation: "linear",
				timing: 100
			};

			var chart = new xChart("line-dotted", data, element[0], opts);

			scope.$watchCollection("data.memory", function() {
				chart.setData(data);
			});
		}
	};
}];
