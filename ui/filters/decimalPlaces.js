
module.exports = function() {
	return function(number, decimalPlaces) {
		if(!number && number !== 0) {
			return 0;
		}

		return number.toFixed(decimalPlaces);
	}
};
