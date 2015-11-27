var Point = Point
	|| {
		x: 0,
		y: 0,
		sizeX: ApplicationConstants.APP_WIDTH,
		sizeY: ApplicationConstants.APP_HEIGHT,

		getViewX: function () {
			return this.x;
		},
		getViewY: function () {
			return this.y;
		},
		computeKInnerPoint: function (A, B, k) {
			return Point(A.x * (1 - k) + B.x * k, A.y * (1 - k) + B.y * k);
		},

		drawLine: function (A, B, g) {
			g.moveTo(A.getViewX(), A.getViewY());
			g.lineTo(B.getViewX(), B.getViewY());
			g.stroke();
		},

		distance: function (A, B) {
			return Math.sqrt((A.x - B.x) * (A.x - B.x) + (A.y - B.y)
				* (A.y - B.y));
		},

		createPoint: function (x, y) {
			var ret = (Object.create(Point));
			ret.x = x;
			ret.y = y;
			return ret;
		},

		translate: function(dx, dy){
			return Point.createPoint(
				this.x + dx,
				this.y + dy
			);
		}
	};