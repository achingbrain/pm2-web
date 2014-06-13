var util = require("util");

setInterval(function() {
	console.log("This is a console.log");
	console.info("This is a console.info");
	console.error("This is an console.error");
	console.warn("This is an console.warn");
	console.time("This is a console.time");
	console.dir("This is a console.dir");
	console.timeEnd("This is a console.time");
	console.trace();

	util.debug("This is a util.debug");
	util.log("This is a util.log <b>with html</b>");
}, 2000);