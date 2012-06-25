/**
 * @author Jirka Vebr
 * @since 10.6.2012
 */
(function (window, undefined) {
	var Simulation = function (canvas, config) {
		var defaults = {
			canvasWidth:			null,
			canvasHeight:			null,
			center:					null,
			
			axesPointsSeparation:	150,
			axesLabelsDistance:		8,
			
			
			number:					null,
			radius:					null,
			power:					5,
			polygonMove:			0,
			
			axesOptions: {
				font: '14px Calibri'
			},
			axesLabelsOptions: {
				lineWidth: 1
			},
			circleOptions: {
				lineWidth: 1,
				fillStyle: 'rgba(0,0,0,0)'
			},
			polygonOptions: {
				lineWidth: 1,
				strokeStyle: 'rgb(255,100,0)'
			},
			globalOptions: {
				
			}
		};
		this.canvas = (canvas instanceof jQuery) ? canvas : $(canvas);
		this.canvasTools = new CanvasTools(this.canvas);
		this.config = $.extend({}, defaults, config);
		this.canvasTools.adjustCanvasSize(this.config.canvasWidth, this.config.canvasHeight);
	};
	Simulation.prototype = {
		run: function () {
			this.draw();
		},
		
		draw: function () {
			this.canvasTools.clear();
			this.canvasTools.setupCanvas(this.config.globalOptions);
			this.processNumber();
			if (this.getRadius() === 0) {
				this.drawAxes();
				return;
			}
			this.drawPolygon();			
			this.drawAxes();
			this.drawCircle();
		},
		
		configure: function (key, value) {
			if (typeof key == 'object') {
				for (var i in key) {
					this.config[i] = key[i];
				}
			} else {
				this.config[key] = value;
			}
			return this;
		},
		
		getOrigin: function () {
			if (this.config.center) {
				return this.config.center;
			}
			var width = this.canvas.width(),
				height = this.canvas.height();
			return [Math.round(width/2), Math.round(height/2)];
		},
		
		getRadius: function () {
			if (typeof this.config.radius !== undefined) {
				return this.config.radius;
			}
			if (this.config.center) {
				return this.config.center;
			}
			var center = this.getOrigin(),
				x = center[0],
				y = center[1],
				smaller = Math.min(x, y);
			return Math.round(smaller-20);
		},
		
		drawAxes: function () {
			var width = this.canvas.width(),
				height = this.canvas.height(),
				origin = this.getOrigin(),
				xStart = [0, origin[1]],
				xEnd = [width, origin[1]],
				yStart = [origin[0], 0],
				yEnd = [origin[0], height];
			this.canvasTools.drawSegment(xStart, xEnd, this.config.axesOptions);
			this.canvasTools.drawSegment(yStart, yEnd, this.config.axesOptions);
			var labelHalfLine = function (vector) {
				var x = vector[0],
					y = vector[1],
					interval,
					coord,
					xIncrement,
					yIncrement;
				if (x === 0) {
					coord = Math.max(height-origin[1], origin[1]);
					interval = y;
				} else {
					coord = Math.max(width-origin[0], origin[0]);
					interval = x;
				}
				var increment = this.config.axesPointsSeparation > 100 ? 1/Math.pow(2, Math.round(this.config.axesPointsSeparation/200)) : 1;
				for (var i = 0, c = 0; Math.abs(i)<coord/increment; i+=interval, c+=increment) {
					var major;
					if (increment > 1) {
						major = c%10 === 0;
					} else if (increment === 1) {
						major = c%5 === 0;
					} else if (increment > 0){
						major = increment%1 === 0;
					}
					var	pointRadius = major ? 3 : 2;
					if (x === 0) {
						xIncrement = 0;
						yIncrement = i;
					} else if (y === 0) {
						xIncrement = i;
						yIncrement = 0;
					}
					var coords = [origin[0]-xIncrement*increment, origin[1]-yIncrement*increment];
					this.canvasTools.drawCircle(coords, pointRadius);
					if ((major || this.config.axesPointsSeparation > 50) && i !== 0) {
						if (x === 0) {
							coords[0] += this.config.axesLabelsDistance;
							coords[1] += 4;
						} else if (y === 0) {
							coords[0] -= 4;
							coords[1] -= this.config.axesLabelsDistance;
						}
						this.canvasTools.fillText(c, coords, this.config.axesOptions);
					}
				}
			};
			var vectors = [
				[0, this.config.axesPointsSeparation], // up
				[-this.config.axesPointsSeparation, 0], // left
				[0, -this.config.axesPointsSeparation], // down
				[this.config.axesPointsSeparation, 0] // right
			];
			for (var i=0; i<vectors.length; i++) {
				labelHalfLine.call(this, vectors[i]);
			}
		},
		
		drawCircle: function () {
			this.canvasTools.drawCircle(this.getOrigin(), this.getRadius(), this.config.circleOptions);
		},
		
		drawPolygon: function () {
			var iterator = this.canvasTools.drawPolygon(this.getOrigin(), this.getRadius(), this.config.power, this.config.polygonMove, this.config.polygonOptions),
				that = this;
			iterator.call(this.canvasTools, function (x, y) {
				var distanceFromPoint = 15,
					alpha = Helpers.getArgument(x, y),
					tX = Math.round(x + Math.cos(alpha)*distanceFromPoint),
					tY = Math.round(y - Math.cos(alpha)*distanceFromPoint),
					simCs = that.getSimulationCoords(x, y),
					specialCaseHelper = function (number) {
						var rounded = Helpers.round(number, 10);
						if (rounded === 0.8660254038) return '√3/2';
						if (rounded === -0.8660254038) return '-√3/2';
						if (rounded === 0.7071067812) return '√2/2';
						if (rounded === -0.7071067812) return '-√2/2';
						return Helpers.round(number, 2);
					},
					fillX = specialCaseHelper(simCs[0]),
					fillY = specialCaseHelper(simCs[1]);
				if (simCs[0] < 0) {
					tX = Math.round(x + Math.sin(alpha)*distanceFromPoint)-85;
				}
				if (simCs[1] < 0) {
					tY += 20;
				}
				
				this.fillText('['+fillX+', '+fillY+']', [tX, tY]);
			});
		},
		
		processNumber: function () {
			var num = this.config.number;
			if (num && num instanceof Array) {
				var a = num[0],
					b = num[1];
				if (Helpers.isNumber(a) && Helpers.isNumber(b)) {
					this.config.polygonMove = -(Math.atan(b/a)/this.config.power);
					this.config.radius = this.config.axesPointsSeparation * Math.pow(
											Math.sqrt(
												Math.pow(a, 2)+
												Math.pow(b, 2)
											),
										1/this.config.power);
				} else {
					Helpers.triggerError('The number\'s coordinates have to be numeric!');
				}
			} else {
				Helpers.triggerError('A number has to be in the [a,b] format');
			}
		},
		
		getSimulationCoords: function (x, y) {
			return [
				(x - this.getOrigin()[0])/this.config.axesPointsSeparation,
				(this.getOrigin()[1] - y)/this.config.axesPointsSeparation
			]
		}
	};	
	window.Simulation = Simulation;
})(window);