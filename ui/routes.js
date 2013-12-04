
module.exports = ["$routeProvider",
	function($routeProvider) {
		$routeProvider.
			when("/hosts/:host", {
				templateUrl: "/js/partials/host.html"/*,
				 controller: "SystemController"*/
			}).
			otherwise({
				templateUrl: "/js/partials/connecting.html",
				controller: "ConnectionController"
			});
	}
];
