
module.exports = {
	"server": {
		"components": {
			"PM2ArgumentParser": require(__dirname + "/server/components/PM2ArgumentParserTest.js"),
			"WebSocketResponder": require(__dirname + "/server/components/WebSocketResponderTest.js")
		}
	},
	"ui": {
		"components": {
			"HostList": require(__dirname + "/ui/components/HostListTest.js"),
			"WebSocketResponder": require(__dirname + "/ui/components/WebSocketResponderTest.js")
		},
		"controllers": {
			"connection": require(__dirname + "/ui/controllers/connectionTest.js"),
			"hostList": require(__dirname + "/ui/controllers/hostListTest.js"),
			"processList": require(__dirname + "/ui/controllers/processListTest.js"),
			"system": require(__dirname + "/ui/controllers/systemTest.js")
		},
		"filters": {
			"decimalPlaces": require(__dirname + "/ui/filters/decimalPlacesTest.js"),
			"humanise": require(__dirname + "/ui/filters/humaniseTest.js"),
			"memory": require(__dirname + "/ui/filters/memoryTest.js")
		}
	}
};
