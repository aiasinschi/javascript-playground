var Gear = Gear || {

		center: null,
		radius: null,
		dentFactor: 10,
		dents: 20,
		_POINTS: [],
		_AXLE: [],
		color: '#0510F0',
		empty: false,
		fillColor: '#1177FF',

		createGear: function(center, radius, dents, dentFactor){
			var g = Object.create(Gear);
			g.center = center;
			g.radius = radius;
			if (dents){
				g.dents = dents;
			}
			if (dentFactor) {
				g.dentFactor = dentFactor;
			}
			g._POINTS = [];
			g._AXLE = [];
			for (var i = 0; i < g.dents; i++){
				var angle = i * 2 * Math.PI / g.dents;
				var P_outer = Point.createPoint(
					center.x + radius * Math.cos(angle),
					center.y + radius * Math.sin(angle)
				);
				var P_inner = Point.createPoint(
					center.x + (radius * (100 - g.dentFactor) / 100 ) * Math.cos(angle),
					center.y + (radius * (100 - g.dentFactor) / 100 ) * Math.sin(angle)
				);
				g._AXLE.push(
					Point.createPoint(
						center.x + radius * ( g.dentFactor  / 100 ) * Math.cos(angle),
						center.y + radius * ( g.dentFactor  / 100 ) * Math.sin(angle)
					)
				);
				if (i % 2 === 0){
					g._POINTS.push(P_inner);
					g._POINTS.push(P_outer);
				} else {
					g._POINTS.push(P_outer);
					g._POINTS.push(P_inner);
				}
			}
			return g;
		},

		draw: function(ctx){
			ctx.strokeStyle = this.color;
			ctx.beginPath();
			// draw the exterior part
			ctx.moveTo(this._POINTS[0].getViewX(), this._POINTS[0].getViewY());
			for (var i = 0; i < this._POINTS.length; i++){
				ctx.lineTo(this._POINTS[i].getViewX(), this._POINTS[i].getViewY());
			}
			ctx.lineTo(this._POINTS[0].getViewX(), this._POINTS[0].getViewY());
			ctx.stroke();
			ctx.closePath();
			if (!this.empty) {
				ctx.fillStyle = this.fillColor;
				ctx.fill();
			}
			// draw the inner axle
			ctx.beginPath();
			ctx.moveTo(this._AXLE[0].getViewX(), this._AXLE[0].getViewY());
			for (var i = 0; i < this._AXLE.length; i++){
				ctx.lineTo(this._AXLE[i].getViewX(), this._AXLE[i].getViewY());
			}
			ctx.lineTo(this._AXLE[0].getViewX(), this._AXLE[0].getViewY());
			ctx.stroke();
			ctx.closePath();
			if (!this.empty) {
				ctx.fillStyle = '#000000';
				ctx.fill();
			}
		}
	};
