
module.exports = function() {
	return function(number, decimalPlaces) {
		return number.toFixed(decimalPlaces);
	}
};
