/**
 * @author Jirka Vebr
 * @since 10.6.2012
 */
(function (window, undefined) {
	var CanvasTools = function (canvas) {
		this.canvas = canvas;
		this.context = this.canvas[0].getContext('2d');
	};
	CanvasTools.prototype = {
		adjustCanvasSize: function (width, height) {
			var doc = $(window.document);
			this.canvas.attr({
				width: width === null ? doc.width() - 10 : width,
				height: height === null ? doc.height() - 20 : height
			});
		},
		
		setupCanvas: function (config) {
			for (var i in config) {
				this.context[i] = config[i];
			}
		},
		
		clear: function () {
			this.context.clearRect(0, 0, this.canvas.width(), this.canvas.height());
		},
		
		/**
		 * center [int x, int y]
		 * radius int
		 */
		drawCircle: function (center, radius, options) {
			if (radius === 0) {
				return;
			} else if (Helpers.isNumber(radius)) {
				var x = center[0],
					y = center[1];
				if (Helpers.isNumber(x) && Helpers.isNumber(y)) {
					this.context.save();
					if (options) {
						this.setupCanvas(options);
					}
					this.context.beginPath();
					this.context.arc(x, y, radius, 0, 2*Math.PI, true);
					this.context.stroke();
					this.context.fill();
					this.context.restore();
				} else {
					Helpers.triggerError('The coordinates must be numeric!');
				}
			} else {
				Helpers.triggerError('A radius must be a number!')
			}
		},
		
		/**
		 * start [int x, int y]
		 * end [int x, int y]
		 */
		drawSegment: function (start, end, options) {
			var x1 = start[0],
				x2 = end[0],
				y1 = start[1],
				y2 = end[1];
			if (Helpers.isNumber(x1) && Helpers.isNumber(y1)
					&&
				Helpers.isNumber(x2) && Helpers.isNumber(y2)) {
				
				this.context.save();
				if (options) {
					this.setupCanvas(options);
				}
				this.context.beginPath();
				this.context.moveTo(x1, y1);
				this.context.lineTo(x2, y2);
				this.context.stroke();
				this.context.restore();
			} else {
				Helpers.triggerError('The coordinates must be numeric!');
			}
		},
		
		drawPolygon: function (center, radius, sides, move, options) {
			var x = center[0],
				y = center[1];
			if (!Helpers.isNumber(sides)) {
				Helpers.triggerError('The number of sides must be a number!');
			}
			if (!Helpers.isNumber(x) || !Helpers.isNumber(y)) {
				Helpers.triggerError('The coordinates must be numeric!');
			}
			if (!Helpers.isNumber(radius)) {
				Helpers.triggerError('The radius must be a number!');
			}
			this.context.save();
			if (options) {
				this.setupCanvas(options);
			}
			if (radius === 0) {
				return function () {};
			}
			this.context.beginPath();
			this.context.moveTo(x + radius*Math.cos(move), y + radius*Math.sin(move));
			
			var iterateOverPoints = function (callback) {
					for (var i = 1; i<=sides; i++) {
						var pointX = x + radius*Math.cos(move + ((2*Math.PI)/sides)*i),
							pointY = y + radius*Math.sin(move + ((2*Math.PI)/sides)*i);
						callback.call(this, pointX, pointY);
					}
				};
			iterateOverPoints.call(this, function (x, y) {
				this.context.lineTo(x, y);
			});
			
			this.context.stroke();
			this.context.fill();
			this.context.restore();
			
			iterateOverPoints.call(this, function (x, y) {
				this.drawCircle([x, y], 4, {
					fillStyle: '#AAAAAA'
				});
				this.drawCircle([x, y], 1, {
					fillStyle: '#000000'
				});
			});
			return iterateOverPoints;
		},
		
		fillText: function (string, coords, options) {
			this.context.save();
			if (options) {
				this.setupCanvas(options);
			}
			this.context.fillText(string, coords[0], coords[1]);
			this.context.restore();
		}
	};
	window.CanvasTools = CanvasTools;
})(window);