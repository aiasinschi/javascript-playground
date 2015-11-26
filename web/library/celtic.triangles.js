var getTile = function(i, j, side, radius, closed) {
	var orig;
	if (i % 2 == 0) {
		orig = Point.createPoint(ApplicationConstants.HOFFSET
			+ (j % 2 == 0 ? side / 2 : side) + side * Math.floor(j / 2),
			ApplicationConstants.VOFFSET
			+ (j % 2 == 0 ? radius : radius / 2) + 3 * radius
			* Math.floor(i / 2));
	} else {
		orig = Point.createPoint(ApplicationConstants.HOFFSET
			+ (j % 2 == 0 ? side / 2 : side) + side * Math.floor(j / 2),
			ApplicationConstants.VOFFSET
			+ (j % 2 == 0 ? 2 * radius : 2.5 * radius) + 3 * radius
			* Math.floor(i / 2));
	}
	var ret = Triangle.createTriangle(orig, radius, (i + j) % 2 == 0);
	ret.close(closed);
	return ret;
};

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
};
