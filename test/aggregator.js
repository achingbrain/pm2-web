
module.exports = {
	"server": {
		"components": {
			"PM2ArgumentParser": require(__dirname + "/server/components/PM2ArgumentParserTest.js")
		}
	},
	"ui": {
		"components": {
			"HostList": require(__dirname + "/ui/components/HostListTest.js"),
			"WebSocketResponder": require(__dirname + "/ui/components/WebSocketResponderTest.js")
		},
		"filters": {
			"decimalPlaces": require(__dirname + "/ui/filters/decimalPlacesTest.js"),
			"humanise": require(__dirname + "/ui/filters/humaniseTest.js"),
			"memory": require(__dirname + "/ui/filters/memoryTest.js")
		}
	}
};
