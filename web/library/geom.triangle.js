var Triangle = Triangle
	|| {
		center: null,
		radius: 0,
		startingAngle: 0,
		topDown: false,
		A: null,
		B: null,
		C: null,
		innerA: null,
		outerA: null,
		innerB: null,
		outerB: null,
		innerC: null,
		outerC: null,

		closed: 0,

		getPointAtAngle: function (angle) {
			var _this = this;
			return Point.createPoint(_this.center.x + _this.radius
				* Math.cos(_this.startingAngle + angle), _this.center.y
				+ _this.radius * Math.sin(_this.startingAngle + angle));
		},

		draw: function (g) {
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
				case 0:
				{
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

		doIntersections: function (toDraw, intersOne, intersTwo,
								   intersThree, intersFour, g) {
			var ret = [];
			ret.push(toDraw.intersectAngle(intersOne));
			ret.push(toDraw.intersectAngle(intersTwo));
			ret.push(toDraw.intersectAngle(intersThree));
			ret.push(toDraw.intersectAngle(intersFour));
			ret.sort();
			var firstPart = Arc.createArc(toDraw.center, toDraw.radius,
				toDraw.startAngle, ret[2]);
			var secondPart = Arc.createArc(toDraw.center, toDraw.radius,
				ret[3], toDraw.endAngle);
			firstPart.draw(g);
			secondPart.draw(g);
		},

		doLoop: function (firstArc, secondArc, g) {
			var angle = firstArc.intersectAngle(secondArc);
			var firstPart = Arc.createArc(firstArc.center, firstArc.radius,
				firstArc.startAngle, angle);
			angle = secondArc.intersectAngle(firstArc);
			var secondPart = Arc.createArc(secondArc.center, secondArc.radius,
				angle, secondArc.endAngle);
			firstPart.draw(g);
			secondPart.draw(g);
		},

		close: function (closed) {
			this.closed = closed;
		},

		createTriangle: function (center, radius, topDown) {
			var t = Object.create(Triangle);
			t.center = center;
			t.radius = radius;
			t.startingAngle = topDown ? Math.PI / 6 : Math.PI / 2;
			t.topDown = topDown;
			t.A = t.getPointAtAngle(0);
			t.B = t.getPointAtAngle(Math.PI * 2 / 3);
			t.C = t.getPointAtAngle(Math.PI * 4 / 3);

			var startAt = topDown ? 180 : 240;

			t.innerA = Arc.createArc(t.A, radius * ApplicationConstants.SMALL_FACTOR,
				startAt, (startAt + 60));
			t.outerA = Arc.createArc(t.A, radius * ApplicationConstants.LARGE_FACTOR,
				startAt, (startAt + 60));

			startAt = (startAt + 120);
			t.innerB = Arc.createArc(t.B, radius * ApplicationConstants.SMALL_FACTOR,
				startAt, (startAt + 60));
			t.outerB = Arc.createArc(t.B, radius * ApplicationConstants.LARGE_FACTOR,
				startAt, (startAt + 60));

			startAt = (startAt + 120);
			t.innerC = Arc.createArc(t.C, radius * ApplicationConstants.SMALL_FACTOR,
				startAt, (startAt + 60));
			t.outerC = Arc.createArc(t.C, radius * ApplicationConstants.LARGE_FACTOR,
				startAt, (startAt + 60));

			return t;
		}


	}

