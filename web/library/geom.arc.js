var Arc = Arc
	|| {
		center: null,
		startAngle: 0,
		endAngle: 0,
		radius: 0,
		INCREMENT: 0.1,

		draw: function (g) {
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

		pointOnArc: function (angle) {
			var _this = this;
			return Point.createPoint(_this.center.x + _this.radius
				* Math.cos(angle * Math.PI / 180), _this.center.y
				+ _this.radius * Math.sin(angle * Math.PI / 180));
		},

		intersectAngle: function (arc) {
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
		},

		createArc: function (center, radius, startAngle, endAngle) {
			var arc = Object.create(Arc);
			arc.center = center;
			arc.startAngle = startAngle;
			arc.endAngle = endAngle;
			arc.radius = radius;
			arc.INCREMENT = ApplicationConstants.STROKE_WIDTH * 180
				/ (Math.PI * radius);
			return arc;
		}
	};

