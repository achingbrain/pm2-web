
module.exports = function() {
	return function(number, decimalPlaces) {
		if(!number) {
			return 0;
		}

		return number.toFixed(decimalPlaces);
	}
};
