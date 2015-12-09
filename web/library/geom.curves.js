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
	return Point.createPoint(center.x + radius * Math.cos(t), center.y + radius * Math.sin(t));
}

var wavedCircleFunction = function(center, radius, t){
	return Point.createPoint(
		center.x + (radius + radius * 0.15 * Math.sin(2 * 4 * t)) * Math.cos(t),
		center.y + (radius + radius * 0.15 * Math.sin(2 * 4 * t)) * Math.sin(t)
	);
}

var cardioidFunction = function(center, radius, t){
	return Point.createPoint(
		center.x + radius * ( Math.cos(t) - Math.cos(2 * t) / 2 ),
		center.y + radius * ( Math.sin(t) - Math.sin(2 * t) / 2 )
	);
}

var reverseCardioidFunction = function(center, radius, t){
	var normalCardio = cardioidFunction(center, radius, t);
	return Point.createPoint(
		normalCardio.y,
		normalCardio.x
	);
}

var modifiedCardioidFunction = function(center, radius, t){
	return Point.createPoint(
		center.x + radius * ( Math.cos(t) - Math.cos(2 * t) / 2 + Math.sin(40 * t) / 40 ),
		center.y + radius * ( Math.sin(t) - Math.sin(2 * t) / 2 + Math.sin(40 * t) / 40 )
	);
}

var astroidFunction = function(center, radius, t){
	return Point.createPoint(
		center.x + radius * Math.pow( Math.cos(t), 3 ),
		center.y + radius * Math.pow( Math.sin(t), 3 )
	);
}

var bernoulliLemniscateFunction = function(center, radius, t){
	return Point.createPoint(
		center.x + radius * Math.sqrt(Math.abs(Math.cos(2 * t))) * Math.cos(t),
		center.y + radius * Math.sqrt(Math.abs(Math.cos(2 * t))) * Math.sin(t)
	);
}

var zigguratCardioid = function(center, radius, t){
	return Point.createPoint(
		center.x + radius * ( Math.cos(t) - Math.cos(2 * t) / 2 + 0.02 * rectangularSin(18 * t, 0.01) ),
		center.y + radius * ( Math.sin(t) - Math.sin(2 * t) / 2 + 0.02 * rectangularSin(18 * t, 0.01) )
	);
}

var gearedBernoulliLemniscateFunction = function(center, radius, t){
	return Point.createPoint(
		center.x + radius * ( Math.sqrt(Math.abs(Math.cos(4 * t))) * Math.cos(t) + 0.01 * rectangularSin(18 * t, 0.01) ),
		center.y + radius * ( Math.sqrt(Math.abs(Math.cos(4 * t))) * Math.sin(t) + 0.01 * rectangularSin(18 * t, 0.01) )
	);
}

var rectangularSin = function(xx, epsilon){
	var x = xx - 2 * Math.floor(xx / 2);
	if (x < epsilon){
		return x / epsilon;
	} else if (x < 1 - epsilon) {
		return 1;
	} else if (x < 1 + epsilon) {
		return (1 - x) / epsilon;
	} else if (x < 2 - epsilon){
		return -1;
	} else {
		return (x - 2) / epsilon;
	}
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
		radius = radius - ApplicationConstants.STROKE_WIDTH / 4.5;
		color = HexUtils.modifyByPercent(color, colorModifier / 6);
	}
};

var moveOnParametricCurve = function (curveCalculator, center, initialRadius, initialColor, context, darken) {
	var max_t = 2 * Math.PI;
	var radius = initialRadius;
	var ballRadius = 5;
	var color = initialColor;
	var dc = 4;
	var increment = ballRadius * ApplicationConstants.STROKE_WIDTH / radius;
	var t = 0;
	var P = curveCalculator(center, radius, t);
	var trajectory = [];
	trajectory.push(P);
	while (t < max_t) {
		t += increment;
		P = curveCalculator(center, radius, t);
		trajectory.push(P);
	}
	animatePath(trajectory, 0, context, color, ballRadius);	
	trajectory = [];
	context.closePath();
};

var animatePath = function(trajectory, index, context, color, ballRadius){
	if (index == trajectory.length - 1){
		trajectory = [];
		return;
	}
	setTimeout(function(){
		var P = trajectory[index];
		/*context.strokeWidth = context.strokeWidth + 2;
		drawBall(P.getViewX(), P.getViewY(), ballRadius, context, '#00020F');
		context.strokeWidth = context.strokeWidth - 2; */
		context.clearRect(P.getViewX() - ballRadius - 2, P.getViewY() - ballRadius - 2, 
			2 * ballRadius + 2 * ApplicationConstants.STROKE_WIDTH, 2 * ballRadius + 2 * ApplicationConstants.STROKE_WIDTH);
			// draw
		var newIndex = (index + 1) % trajectory.length;
		P = trajectory[newIndex];
		drawBall(P.getViewX(), P.getViewY(), ballRadius, context, color);
		animatePath(trajectory, newIndex, context, color, ballRadius);
	}, 40);
}

var drawBall = function(x, y, radius, context, color){
	context.beginPath();
	context.strokeStyle = color;
	context.arc(x, y, radius, 0, 360);
	context.stroke();
	context.closePath();
};

var A = Point.createPoint(100, 100);
var B = Point.createPoint(200, 200);

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
	var O = Point.createPoint(300, 300);
	switch (drawingNumber) {
		case 0:
			var P1 = Point.createPoint(100, 100);
			var P2 = Point.createPoint(100, 300);
			var P3 = Point.createPoint(300, 300);
			var P4 = Point.createPoint(300, 100);
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
		case 6:
			var dents = 30;
			var dentFactor = 15;
			var G = Gear.createGear(O, radius, dents, dentFactor);
			G.draw(context);
			G = Gear.createGear(Point.createPoint(400, 400), radius * 1.5, dents * 1.4 , dentFactor);
			G.draw(context);
			break;
		case 7:
			drawParametricCurve(modifiedCardioidFunction, O, 100, "#DDDFEA", context, true);
			break;
		case 8:
			drawParametricCurve(zigguratCardioid, O, 100, "#11DFEA", context, true);
			break;
		case 9:
			drawParametricCurve(gearedBernoulliLemniscateFunction, O, 200, "#FD9F3A", context, true);
			drawParametricCurve(gearedBernoulliLemniscateFunction, O, 100, "#FD9F5A", context, true);
			break;
		case 10:
			drawParametricCurve(wavedCircleFunction, O, 200, '#3D4D9D', context, true);
	}
};

var drawMovingCurves = function() {
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.beginPath();
	context.strokeStyle = '#FF9944';
	context.lineWidth = ApplicationConstants.STROKE_WIDTH;
	var side = ApplicationConstants.CIRCLE_RADIUS
		* ApplicationConstants.SIDE_TO_RADIUS_RATIO;
	var radius = ApplicationConstants.CIRCLE_RADIUS;
	var drawingNumber = parseInt(document.getElementById('movingCurvesSelect').value);
	var O = Point.createPoint(300, 300);
	switch (drawingNumber) {
		case 0:
			moveOnParametricCurve(circleFunction, O, 100, "#1111FF", context, true);
			break;
		case 1:
			moveOnParametricCurve(wavedCircleFunction, O, 100, "#1111FF", context, true);
			break;
		case 2:
			moveOnParametricCurve(reverseCardioidFunction, O, 100, "#1111FF", context, true);
			break;
		case 3:
			moveOnParametricCurve(astroidFunction, O, 100, "#1111FF", context, true);
			break;
	}
};
