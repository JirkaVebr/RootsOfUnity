$(function () {
	var screen = $('#screen'),
		app = new Simulation(screen, {

				number:		[150,100],

				polygonOptions: {
					fillStyle: 'rgba(0,0,0,0)',
					strokeStyle: '#0099GG',
					lineWidth: 2
				}
			}),
		common = {
			orientation: 'vertical'
		},
		rotationInfo = $('#rotation'),
		sidesInfo = $('#sides'),
		number = $('#number'),
		real = $('#real'),
		imaginary = $('#imaginary'),
		coords = [],
		origin = app.getOrigin(),
		updateRotation = function () {
			rotationInfo.html(-Helpers.round(app.config.polygonMove*(180/Math.PI), 3));
		},
		updateNumberPosition = function () {
			number.css({
				left: app.getOrigin()[0] + app.config.number[0]*app.config.axesPointsSeparation,
				top: app.getOrigin()[1] - app.config.number[1]*app.config.axesPointsSeparation
			});
		},
		dragEvent = function (e, ui) {
			origin = app.getOrigin();
				coords = [
					((-origin[0] + number.offset().left)/app.config.axesPointsSeparation),
					((origin[1] - number.offset().top)/app.config.axesPointsSeparation),
				];
			app.configure('number', coords);
			updateRotation();
			real.val(Helpers.round(coords[0], 2));
			imaginary.val(Helpers.round(coords[1], 2));
			app.draw();
		};
	real.add(imaginary).focus(function () {
		this.select();
	});
	var changeGen = function (i) {
		return function () {
			var val = parseFloat($(this).val(), 10);
			if (typeof val === NaN) {
				$(this).val(1);
				val = 1;
			}
			var cssCoord;
			coords[i] = val;
			if (i === 1) {
				cssCoord = origin[i] - val*app.config.axesPointsSeparation;
			} else if (i === 0) {
				cssCoord = origin[i] + val*app.config.axesPointsSeparation;
			}

			var obj = {};
			obj[{0:'left',1:'top'}[i]] = cssCoord;
			number.animate(obj, {
				complete: function () {
					app.configure('number', coords);
					app.draw();
				},
				step: dragEvent,
				duration: 1000
			});
		}
	};
	var temp = [real, imaginary];
	for (var i = 0; i<temp.length; i++) {
		temp[i].change(changeGen(i));
	}
	$('#power').slider($.extend(common, {
		min: 0,
		max: 100,
		value: 30,
		slide: function (e, ui) {
			var minPos = 0,
				maxPos = 100,
				minRes = Math.log(2),
				maxRes = Math.log(50),
				val = Math.round(Math.exp(minRes + ((maxRes-minRes)/(maxPos-minPos))*(ui.value-minPos)));

			sidesInfo.html(val);
			app.configure('power', val);
			updateRotation();
			app.draw();
		}
	}));
	$(document.body).bind('mousewheel DOMMouseScroll', (function () {
		var currentZoom = 150;
			app.configure('axesPointsSeparation', currentZoom);
		return function (e) {
			var delta = e.originalEvent.wheelDeltaY ? e.originalEvent.wheelDeltaY : -e.originalEvent.detail;
			if (delta >= 0) {
				currentZoom += currentZoom/18;
			} else {
				currentZoom -= currentZoom/18;
			}
			if (currentZoom <= 10) {
				currentZoom = 10;
			}
			if (currentZoom >= 500) {
				currentZoom = 500;
			}
			app.configure('axesPointsSeparation', currentZoom).draw();
			updateNumberPosition();
			e.preventDefault();
		}
	})());

	number.draggable({
		containment: 'body',
		cursor:	'pointer',
		scroll: false,
		drag: dragEvent
	}).animate({
		top: Math.random()*screen.height(),
		left: Math.random()*screen.width(),
		width: '15px',
		height: '15px',
		fontSize: '12px'
	}, 2000, function () {
		app.run();
		dragEvent();
	});
	$(document.body).dblclick(function (e) {
		number.animate({
			top: e.pageY-number.width(),
			left: e.pageX
		}, {
			step: dragEvent,
			duration: 1100
		});
	});
	screen.mousedown(function (e) {
		screen.data('dragging', true);
		screen.data('originalMousePosition', [e.pageX, e.pageY]);
		return false;
	}).mousemove(function (e) {
		if (screen.data('dragging')) {
			var pos = screen.data('originalMousePosition'),
				oC = app.config.center ? app.config.center : app.getOrigin();
			screen.data('originalMousePosition', [e.pageX, e.pageY]);
			app.configure('center', [oC[0]+(e.pageX-pos[0]), oC[1]+(e.pageY-pos[1])]).draw();
			updateNumberPosition();
			return false;
		}
	}).mouseup(function (e) {
		screen.data('dragging', false);
		return false;
	});
});