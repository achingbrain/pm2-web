var Moment = require("moment");

module.exports = function() {
	return function(date) {
		return Moment(date).toISOString();
	}
};
