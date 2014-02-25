"use strict";

var WebSocketResponder = require("./components/WebSocketResponder"),
	HostList = require("./components/UIHostList"),
	Config = require("./components/Config");

var pm2Web = angular.module("pm2-web", [
	"ngRoute",
	"ngSanitize",
	"ui.bootstrap",
	"highcharts-ng"
]);

pm2Web.config(require("./routes"));
pm2Web.factory("hostList", ["config", "webSocketResponder", function(config, webSocketResponder) {
	return new HostList(config, webSocketResponder);
}]);
pm2Web.factory("webSocketResponder", ["$window", "$rootScope", function($window, $rootScope) {
	return new WebSocketResponder($window.location, $rootScope);
}]);
pm2Web.factory("config", ["webSocketResponder", function(webSocketResponder) {
	return new Config(webSocketResponder);
}]);

// directives
pm2Web.directive("resourceusage", require("./directives/resourceUsage"));
pm2Web.directive("scrollglue", require("./directives/scrollGlue"));

// filters
pm2Web.filter("decimalPlaces", require("./filters/decimalPlaces"));
pm2Web.filter("humanise", require("./filters/humanise"));
pm2Web.filter("memory", require("./filters/memory"));
pm2Web.filter("ansiToHtml", require("./filters/ansiToHtml"));

// controllers
pm2Web.controller("ConnectionController", require("./controllers/connection"));
pm2Web.controller("SystemController", require("./controllers/system"));
pm2Web.controller("ProcessListController", require("./controllers/processList"));
pm2Web.controller("HostListController", require("./controllers/hostList"));
pm2Web.controller("FooterController", require("./controllers/footer"));
