
module.exports = ["$routeProvider",
	function($routeProvider) {
		$routeProvider.
			when("/hosts/:host", {
				templateUrl: "/js/partials/host.html"
			}).
			otherwise({
				templateUrl: "/js/partials/connecting.html",
				controller: "ConnectionController"
			});
	}
];
