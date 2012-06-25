var Helpers = {
	isInt: function (arg) {
		return this.isInteger(arg);
	},
	isInteger: function (arg) {
		return typeof arg === 'number' && arg % 1 == 0;
	},
	isNumber: function (arg) {
		return typeof arg === 'number';
	},
	triggerError: function (msg) {
		alert (msg);
	},
	round: function (number, decimals) {
		if (decimals === 0) {
			return Math.round(number);
		}
		var factor = Math.pow(10, Math.round(decimals));
		return Math.round(factor*number)/factor;
	},
	getArgument: function (x, y) {
		if (x >= 0 && y >= 0) {
			return Math.tan(y/x);
		} else if (x <= 0 && y >= 0) {
			return Math.tan(-x/y) + Math.PI / 2;
		} else if (x <= 0 && y <= 0) {
			return Math.tan(y/x) + Math.PI;
		} else if (x >= 0 && y <= 0) {
			return Math.tan(x/-y) + 3*Math.PI/2;
		}
	}
}


function d() {
	console.log(arguments);
}