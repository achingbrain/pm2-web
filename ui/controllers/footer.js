
module.exports = ["$window", "$scope", function($window, $scope) {
	$scope.version = $window.settings.version;
}];
