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

var clearDrawing = function() {
	var canvas = document.getElementById("canvas");
	canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
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
	var O = createPoint(300, 300);
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
			drawParametricCurve(circleFunction, O, 100, "#FF1111", context, true);
			break;
		case 2:
			drawParametricCurve(cardioidFunction, O, 100, "#FF1111", context, true);
			break;
		case 3:
			drawParametricCurve(reverseCardioidFunction, O, 100, "#FF1111", context, true);
			break;
		case 4:
			drawParametricCurve(astroidFunction, O, 100, "#1122FF", context, true);
			break;
		case 5:
			drawParametricCurve(bernoulliLemniscateFunction, O, 100, "#119922", context, true);
			break;

	}
}
