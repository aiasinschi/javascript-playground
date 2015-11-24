var ApplicationConstants = ApplicationConstants || {
	APP_WIDTH : 800,
	APP_HEIGHT : 800,
	STROKE_WIDTH : 3,
	EPSILON : 0.000001,
	SMALL_FACTOR : 1.1,
	LARGE_FACTOR : 1.3,
	LABELS_ON : false,
	TRIANGLES_ON : false,
	CIRCLE_RADIUS : 60,
	SIDE_TO_RADIUS_RATIO : Math.sqrt(3),
	HOFFSET : 10,
	VOFFSET : 10
}

var Point = Point
		|| {
			x : 0,
			y : 0,
			sizeX : ApplicationConstants.APP_WIDTH,
			sizeY : ApplicationConstants.APP_HEIGHT,

			getViewX : function() {
				return this.x;
			},
			getViewY : function() {
				return this.y;
			},
			computeKInnerPoint : function(A, B, k) {
				return Point(A.x * (1 - k) + B.x * k, A.y * (1 - k) + B.y * k);
			},

			drawLine : function(A, B, g) {
				g.moveTo(A.getViewX(), A.getViewY());
				g.lineTo(B.getViewX(), B.getViewY());
				g.stroke();
			},

			distance : function(A, B) {
				return Math.sqrt((A.x - B.x) * (A.x - B.x) + (A.y - B.y)
						* (A.y - B.y));
			}
		}

var drawModifiedLine = function(A, B, context) {
	context.moveTo(A.x, A.y);
	var dx = B.x - A.x;
	var dy = B.y - A.y;
	var slope = dy / dx;
	var sign = dx == 0 ? (dy > 0 ? 1 : -1) : (dx < 0 ? -1 : 1);
	dx = Math.abs(dx);
	dy = Math.abs(dy);
	var dt = (dx != 0 ? dx : dy) / Math.max(dx, dy);
	var t = 0;
	var x, y;
	var t_stop = dx != 0 ? dx : dy;
	var amplitude = t_stop / 10;
	var osc_interval = 4 * Math.PI;
	while (t <= t_stop) {
		if (dx != 0) {
			x = A.x + sign * t + amplitude
					* Math.sin(osc_interval * t * t / t_stop);
			y = A.y + slope * sign * t + amplitude
					* Math.sin(t * 2 * Math.PI / t_stop);
		} else {
			x = A.x + amplitude * Math.sin(t * 2 * Math.PI / t_stop);
			y = A.y + sign * t + amplitude
					* Math.sin(osc_interval * t * t / t_stop);
		}
		t += dt;
		context.lineTo(x, y);
	}
	context.stroke();
}

var createPoint = function(x, y) {
	var ret = (Object.create(Point));
	ret.x = x;
	ret.y = y;
	return ret;
}

var Arc = Arc
		|| {
			center : null,
			startAngle : 0,
			endAngle : 0,
			radius : 0,
			INCREMENT : 0.1,

			draw : function(g) {
				var angle = this.startAngle;
				var start = this.pointOnArc(this.startAngle);
				g.moveTo(start.getViewX(), start.getViewY());
				// g.strokeStyle = "#FFFFFF";
				while (angle <= this.endAngle) {
					var p = this.pointOnArc(angle);
					g.lineTo(p.getViewX(), p.getViewY());
					angle += this.INCREMENT;
				}
				g.stroke();
			},

			pointOnArc : function(angle) {
				var _this = this;
				return createPoint(_this.center.x + _this.radius
						* Math.cos(angle * Math.PI / 180), _this.center.y
						+ _this.radius * Math.sin(angle * Math.PI / 180));
			},

			intersectAngle : function(arc) {
				var alpha = this.startAngle;
				var beta = this.endAngle;
				var angle = (alpha + beta) / 2;
				while (Math.abs(alpha - beta) > ApplicationConstants.EPSILON) {
					angle = (alpha + beta) / 2;
					var da = Math.abs(Point.distance(arc.center, this
							.pointOnArc(alpha))
							- arc.radius);
					var db = Math.abs(Point.distance(arc.center, this
							.pointOnArc(beta))
							- arc.radius);
					if (da > db) {
						alpha = angle;
					} else {
						beta = angle;
					}
				}
				return angle;
			}
		}

var createArc = function(center, radius, startAngle, endAngle) {
	var arc = Object.create(Arc);
	arc.center = center;
	arc.startAngle = startAngle;
	arc.endAngle = endAngle;
	arc.radius = radius;
	arc.INCREMENT = ApplicationConstants.STROKE_WIDTH * 180
			/ (Math.PI * radius);
	return arc;
}

var Triangle = Triangle
		|| {
			center : null,
			radius : 0,
			startingAngle : 0,
			topDown : false,
			A : null,
			B : null,
			C : null,
			innerA : null,
			outerA : null,
			innerB : null,
			outerB : null,
			innerC : null,
			outerC : null,

			closed : 0,

			getPointAtAngle : function(angle) {
				var _this = this;
				return createPoint(_this.center.x + _this.radius
						* Math.cos(_this.startingAngle + angle), _this.center.y
						+ _this.radius * Math.sin(_this.startingAngle + angle));
			},

			draw : function(g) {
				if (ApplicationConstants.LABELS_ON) {
					g.strokeText("A", this.A.getViewX(), this.A.getViewY());
					g.drawString("B", this.B.getViewX(), this.B.getViewY());
					g.drawString("C", this.C.getViewX(), this.C.getViewY());
				}

				if (ApplicationConstants.TRIANGLES_ON) {
					Point.drawLine(this.A, this.B, g);
					Point.drawLine(this.A, this.C, g);
					Point.drawLine(this.C, this.B, g);
				}

				switch (this.closed) {
				case 0: {
					this.doIntersections(this.innerA, this.innerB, this.outerB,
							this.innerC, this.outerC, g);
					this.doIntersections(this.outerA, this.innerB, this.outerB,
							this.innerC, this.outerC, g);

					this.doIntersections(this.innerC, this.innerA, this.outerA,
							this.innerB, this.outerB, g);
					this.doIntersections(this.outerC, this.innerA, this.outerA,
							this.innerB, this.outerB, g);

					this.doIntersections(this.innerB, this.innerA, this.outerA,
							this.innerC, this.outerC, g);
					this.doIntersections(this.outerB, this.innerA, this.outerA,
							this.innerC, this.outerC, g);
				}
					break;
				case 1: // A is closed
					this.doLoop(this.innerB, this.innerC, g);
					this.doLoop(this.outerB, this.outerC, g);
					break;
				case 2: // B is closed
					this.doLoop(this.innerC, this.innerA, g);
					this.doLoop(this.outerC, this.outerA, g);
					break;
				case 3: // C is closed
					this.doLoop(this.innerA, this.innerB, g);
					this.doLoop(this.outerA, this.outerB, g);
					break;
				}
			},

			doIntersections : function(toDraw, intersOne, intersTwo,
					intersThree, intersFour, g) {
				var ret = [];
				ret.push(toDraw.intersectAngle(intersOne));
				ret.push(toDraw.intersectAngle(intersTwo));
				ret.push(toDraw.intersectAngle(intersThree));
				ret.push(toDraw.intersectAngle(intersFour));
				ret.sort();
				var firstPart = createArc(toDraw.center, toDraw.radius,
						toDraw.startAngle, ret[2]);
				var secondPart = createArc(toDraw.center, toDraw.radius,
						ret[3], toDraw.endAngle);
				firstPart.draw(g);
				secondPart.draw(g);
			},

			doLoop : function(firstArc, secondArc, g) {
				var angle = firstArc.intersectAngle(secondArc);
				var firstPart = createArc(firstArc.center, firstArc.radius,
						firstArc.startAngle, angle);
				angle = secondArc.intersectAngle(firstArc);
				var secondPart = createArc(secondArc.center, secondArc.radius,
						angle, secondArc.endAngle);
				firstPart.draw(g);
				secondPart.draw(g);
			},

			close : function(closed) {
				this.closed = closed;
			}

		}

var createTriangle = function(center, radius, topDown) {
	var t = Object.create(Triangle);
	t.center = center;
	t.radius = radius;
	t.startingAngle = topDown ? Math.PI / 6 : Math.PI / 2;
	t.topDown = topDown;
	t.A = t.getPointAtAngle(0);
	t.B = t.getPointAtAngle(Math.PI * 2 / 3);
	t.C = t.getPointAtAngle(Math.PI * 4 / 3);

	var startAt = topDown ? 180 : 240;

	t.innerA = createArc(t.A, radius * ApplicationConstants.SMALL_FACTOR,
			startAt, (startAt + 60));
	t.outerA = createArc(t.A, radius * ApplicationConstants.LARGE_FACTOR,
			startAt, (startAt + 60));

	startAt = (startAt + 120);
	t.innerB = createArc(t.B, radius * ApplicationConstants.SMALL_FACTOR,
			startAt, (startAt + 60));
	t.outerB = createArc(t.B, radius * ApplicationConstants.LARGE_FACTOR,
			startAt, (startAt + 60));

	startAt = (startAt + 120);
	t.innerC = createArc(t.C, radius * ApplicationConstants.SMALL_FACTOR,
			startAt, (startAt + 60));
	t.outerC = createArc(t.C, radius * ApplicationConstants.LARGE_FACTOR,
			startAt, (startAt + 60));

	return t;
}

var getTile = function(i, j, side, radius, closed) {
	var orig;
	if (i % 2 == 0) {
		orig = createPoint(ApplicationConstants.HOFFSET
				+ (j % 2 == 0 ? side / 2 : side) + side * Math.floor(j / 2),
				ApplicationConstants.VOFFSET
						+ (j % 2 == 0 ? radius : radius / 2) + 3 * radius
						* Math.floor(i / 2));
	} else {
		orig = createPoint(ApplicationConstants.HOFFSET
				+ (j % 2 == 0 ? side / 2 : side) + side * Math.floor(j / 2),
				ApplicationConstants.VOFFSET
						+ (j % 2 == 0 ? 2 * radius : 2.5 * radius) + 3 * radius
						* Math.floor(i / 2));
	}
	var ret = createTriangle(orig, radius, (i + j) % 2 == 0);
	ret.close(closed);
	return ret;
}

var circleFunction = function(center, radius, t){
	return createPoint(center.x + radius * Math.cos(t), center.y + radius * Math.sin(t));
}

var cardioidFunction = function(center, radius, t){
	return createPoint(
			center.x + radius * ( Math.cos(t) - Math.cos(2 * t) / 2 ),
			center.y + radius * ( Math.sin(t) - Math.sin(2 * t) / 2 )
			);
}

var reverseCardioidFunction = function(center, radius, t){
	var normalCardio = cardioidFunction(center, radius, t);	
	return createPoint(
			normalCardio.y,
			normalCardio.x
			);
}

var astroidFunction = function(center, radius, t){
	return createPoint(
			center.x + radius * Math.pow( Math.cos(t), 3 ),
			center.y + radius * Math.pow( Math.sin(t), 3 )
			);
}

var bernoulliLemniscateFunction = function(center, radius, t){
	return createPoint(
			center.x + radius * Math.sqrt(Math.abs(Math.cos(2 * t))) * Math.cos(t),
			center.y + radius * Math.sqrt(Math.abs(Math.cos(2 * t))) * Math.sin(t)
			);
}

var drawParametricCurve = function(curveCalculator, center, initialRadius, initialColor, context, darken) {
	var max_t = 2 * Math.PI;
	var radius = initialRadius;
	var color = initialColor;
	var dc = 4;
	var colorModifier = darken ? - dc : dc;
	while (radius > 0) {
		var increment = ApplicationConstants.STROKE_WIDTH / radius;
		var t = 0;
		var P = curveCalculator(center, radius, t);
		context.beginPath();
		context.moveTo(P.getViewX(), P.getViewY());
		while (t < max_t) {
			t += increment;		
			P = curveCalculator(center, radius, t);
			context.lineTo(P.getViewX(), P.getViewY());
		}
		context.strokeStyle = color;
		context.stroke();
		context.closePath();
		radius = radius - ApplicationConstants.STROKE_WIDTH / 2;
		color = HexUtils.modifyByPercent(color, colorModifier);
	}
}

var A = createPoint(100, 100);
var B = createPoint(200, 200);
var distance = Point.distance(A, B);

var clearDrawing = function() {
	var canvas = document.getElementById("canvas");
	canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

var drawCelticKnots = function() {
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.beginPath();
	context.strokeStyle = '#FF9944';
	context.lineWidth = ApplicationConstants.STROKE_WIDTH;
	var side = ApplicationConstants.CIRCLE_RADIUS
			* ApplicationConstants.SIDE_TO_RADIUS_RATIO;
	var radius = ApplicationConstants.CIRCLE_RADIUS;
	var drawingNumber = parseInt(document.getElementById('drawingNumberSelect').value);
	switch (drawingNumber) {
	case 0:
		// TILING
		var tr;
		var rows = 4;
		var cols = 8;
		for (var i = 0; i < rows; i++) {
			for (var j = 0; j < cols; j++) {
				tr = getTile(i, j, side, radius, 0);
				tr.draw(context);
			}
		}
		break;
	case 1:
		// SIMPLE 4 triangles node
		var top = getTile(0, 2, side, radius, 3);
		top.draw(context);
		left = getTile(1, 1, side, radius, 2);
		left.draw(context);
		var right = getTile(1, 3, side, radius, 1);
		right.draw(context);
		var center = getTile(1, 2, side, radius, 0);
		center.draw(context);
		break;
	case 2:
		// Level 2 symmetric celtic node
		var top = getTile(0, 4, side, radius, 3);
		top.draw(context);

		top = getTile(1, 2, side, radius, 2);
		top.draw(context);
		top = getTile(1, 3, side, radius, 0);
		top.draw(context);
		top = getTile(1, 4, side, radius, 0);
		top.draw(context);
		top = getTile(1, 5, side, radius, 0);
		top.draw(context);
		top = getTile(1, 6, side, radius, 3);
		top.draw(context);

		top = getTile(2, 2, side, radius, 2);
		top.draw(context);
		top = getTile(2, 3, side, radius, 0);
		top.draw(context);
		top = getTile(2, 4, side, radius, 0);
		top.draw(context);
		top = getTile(2, 5, side, radius, 0);
		top.draw(context);
		top = getTile(2, 6, side, radius, 1);
		top.draw(context);
		top = getTile(3, 4, side, radius, 1);
		top.draw(context);
		break;
	case 3:
		// Level 3 symmetric

		var tiling = [];

		var top = getTile(1, 3, side, radius, 3);
		tiling.push(top);
		top = getTile(1, 5, side, radius, 3);
		tiling.push(top);

		top = getTile(6, 3, side, radius, 1);
		tiling.push(top);
		top = getTile(6, 5, side, radius, 1);
		tiling.push(top);

		top = getTile(2, 1, side, radius, 2);
		tiling.push(top);
		top = getTile(2, 7, side, radius, 3);
		tiling.push(top);

		top = getTile(5, 1, side, radius, 2);
		tiling.push(top);
		top = getTile(5, 7, side, radius, 1);
		tiling.push(top);

		for (var i = 2; i <= 6; i++) {
			top = getTile(2, i, side, radius, 0);
			tiling.push(top);
			top = getTile(5, i, side, radius, 0);
			tiling.push(top);
		}

		top = getTile(3, 0, side, radius, 2);
		tiling.push(top);
		top = getTile(3, 8, side, radius, 3);
		tiling.push(top);

		top = getTile(4, 0, side, radius, 2);
		tiling.push(top);
		top = getTile(4, 8, side, radius, 1);
		tiling.push(top);
		for (var i = 1; i <= 7; i++) {
			top = getTile(3, i, side, radius, 0);
			if (i == 4) {
				top.close(1);
			} else if (i == 3) {
				top.close(1);
			} else if (i == 5) {
				top.close(2);
			}
			tiling.push(top);
			top = getTile(4, i, side, radius, 0);
			if (i == 4) {
				top.close(3);
			} else if (i == 3) {
				top.close(3);
			} else if (i == 5) {
				top.close(2);
			}
			tiling.push(top);
		}
		for (var k = 0; k < tiling.length; k++) {
			tiling[k].draw(context);
		}
		break;
	}
}


var drawCurves = function() {
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.beginPath();
	context.strokeStyle = '#FF9944';
	context.lineWidth = ApplicationConstants.STROKE_WIDTH;
	var side = ApplicationConstants.CIRCLE_RADIUS
		* ApplicationConstants.SIDE_TO_RADIUS_RATIO;
	var radius = ApplicationConstants.CIRCLE_RADIUS;
	var drawingNumber = parseInt(document.getElementById('drawingCurvesSelect').value);
	switch (drawingNumber) {
		case 0:
			var P1 = createPoint(100, 100);
			var P2 = createPoint(100, 300);
			var P3 = createPoint(300, 300);
			var P4 = createPoint(300, 100);
			context.strokeStyle = "#99EEFF";
			drawModifiedLine(P1, P2, context);
			drawModifiedLine(P2, P3, context);
			drawModifiedLine(P3, P4, context);
			drawModifiedLine(P4, P1, context);
			break;
		case 1:
			var O = createPoint(300, 300);
			drawParametricCurve(circleFunction, O, 100, "#FF1111", context, true);
			break;
		case 2:
			var O = createPoint(300, 300);
			drawParametricCurve(cardioidFunction, O, 100, "#FF1111", context, true);
			break;
		case 3:
			var O = createPoint(300, 300);
			drawParametricCurve(reverseCardioidFunction, O, 100, "#FF1111", context, true);
			break;
		case 4:
			var O = createPoint(300, 300);
			drawParametricCurve(astroidFunction, O, 100, "#1122FF", context, true);
			break;
		case 5:
			var O = createPoint(300, 300);
			drawParametricCurve(bernoulliLemniscateFunction, O, 100, "#119922", context, true);
			break;

	}
}
