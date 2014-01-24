var Convert = require('ansi-to-html'),
	Entities = require('html-entities').XmlEntities;

var convert = new Convert();
var entities = new Entities();

module.exports = ["$sce", function($sce) {
	return function(text) {
		var encoded = entities.encode(text);

		return $sce.trustAsHtml(convert.toHtml(encoded));
	}
}];
