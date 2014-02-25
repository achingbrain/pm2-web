
module.exports = {
	"common": {
		"ProcessData": require(__dirname + "/common/ProcessDataTest.js"),
		"HostData": require(__dirname + "/common/HostDataTest.js")
	},
	"server": {
		"components": {
			"Configuration": require(__dirname + "/server/components/ConfigurationTest.js"),
			"PM2Listener": require(__dirname + "/server/components/PM2ListenerTest.js"),
			"ServerHostList": require(__dirname + "/server/components/ServerHostListTest.js"),
			"WebSocketResponder": require(__dirname + "/server/components/WebSocketResponderTest.js")
		}
	},
	"ui": {
		"components": {
			"Config": require(__dirname + "/ui/components/ConfigTest.js"),
			"HostList": require(__dirname + "/ui/components/HostListTest.js"),
			"WebSocketResponder": require(__dirname + "/ui/components/WebSocketResponderTest.js")
		},
		"controllers": {
			"connection": require(__dirname + "/ui/controllers/connectionTest.js"),
			"footer": require(__dirname + "/ui/controllers/footerTest.js"),
			"hostList": require(__dirname + "/ui/controllers/hostListTest.js"),
			"processList": require(__dirname + "/ui/controllers/processListTest.js"),
			"system": require(__dirname + "/ui/controllers/systemTest.js")
		},
		"filters": {
			"ansiToHtml": require(__dirname + "/ui/filters/ansiToHtmlTest.js"),
			"decimalPlaces": require(__dirname + "/ui/filters/decimalPlacesTest.js"),
			"humanise": require(__dirname + "/ui/filters/humaniseTest.js"),
			"memory": require(__dirname + "/ui/filters/memoryTest.js")
		}
	}
};
