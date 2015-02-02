var ansiHTML = require("ansi-html"),
	Entities = require("html-entities").XmlEntities;

var entities = new Entities();

module.exports = ["$sce", function($sce) {

	// don't force background color
	ansiHTML.tags.open[0] = ansiHTML.tags.open[0].replace("color:#000;", "");

	return function(text) {
		var encoded = entities.encode(text);

		return $sce.trustAsHtml(ansiHTML(encoded));
	}
}];
