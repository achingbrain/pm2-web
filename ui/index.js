"use strict";

var xChart = require("browserify-xcharts"),
	d3 = require("d3");

var WebSocketResponder = require("./components/WebSocketResponder"),
	HostList = require("./components/UIHostList"),
	Config = require("./components/Config");

var pm2Web = angular.module("pm2-web", [
	"ngRoute",
	"ui.bootstrap"
]);

pm2Web.config(require("./routes"));
pm2Web.factory("hostList", ["config", "webSocketResponder", function(config, webSocketResponder) {
	return new HostList(config, webSocketResponder);
}]);
pm2Web.factory("webSocketResponder", ["$window", function($window) {
	return new WebSocketResponder($window.settings.ws);
}]);
pm2Web.factory("xChart", [function() {
	return xChart;
}]);
pm2Web.factory("d3", [function() {
	return d3;
}]);
pm2Web.factory("config", ["webSocketResponder", function(webSocketResponder) {
	return new Config(webSocketResponder);
}]);

// directives
pm2Web.directive("resourceusage", require("./directives/resourceUsage"));

// filters
pm2Web.filter("decimalPlaces", require("./filters/decimalPlaces"));
pm2Web.filter("humanise", require("./filters/humanise"));
pm2Web.filter("memory", require("./filters/memory"));

// controllers
pm2Web.controller("ConnectionController", require("./controllers/connection"));
pm2Web.controller("SystemController", require("./controllers/system"));
pm2Web.controller("ProcessListController", require("./controllers/processList"));
pm2Web.controller("HostListController", require("./controllers/hostList"));
