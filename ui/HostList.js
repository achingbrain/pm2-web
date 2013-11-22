var $ = require("zepto-browserify").$,
	Mustache = require("Mustache");

HostList = function() {
	this._selectedHost = null;
};

HostList.prototype.add = function(host) {
	$(".hosts ul").append(Mustache.render($("#host-list").text(), host));
}

module.exports = HostList;
