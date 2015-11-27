var Unit = Unit || {
		positionX: 0,
		positionY: 0,
		size: 0,
		context: null,
		color: '#444499',

		canMoveTo: function (px, py) {
			if (!HexagonalMap.contains(px, py)) {
				return false;
			}
			var indexes = HexagonalMap.getNeighbourIndexes(this.positionX, this.positionY);
			for (var i = 0; i < indexes.length; i++) {
				if ((indexes[i][0] === px) && (indexes[i][1] === py)) {
					return true;
				}
			}
			return false;
		},

		moveTo: function (newX, newY) {
			this.positionX = newX;
			this.positionY = newY;
		},

		createUnit: function (px, py, color, size, canvas) {
			var u = Object.create(Unit);
			u.positionX = px;
			u.positionY = py;
			u.size = size;
			u.color = color;
			u.context = canvas.getContext('2d');
			return u;
		},

		draw: function () {
			var P = realXY(this.positionX, this.positionY);
			//drawSimpleHex(this.context, P.x, P.y, this.size, this.color);
			var points = [];
			for (var k = 0; k < HexagonalMap.baseUnitHex.length; k++){
				points.push(HexagonalMap.baseUnitHex[k].translate(P.x, P.y));
			}
			CommonDrawing.drawContour(context, points, true, this.color);
			var img = document.getElementById('explorerImg');
			var size = GameConstants.radius;
			context.drawImage(img, P.x - size / 2, P.y - size / 2, size, size);
		},

		reveal: function (HexaMap) {
			HexaMap.getVal(this.positionX, this.positionY).visible = true;
			var indexes = HexaMap.getNeighbourIndexes(this.positionX, this.positionY);
			for (var i = 0; i < indexes.length; i++) {
				if (HexaMap.contains(indexes[i][0], indexes[i][1])) {
					HexaMap.getVal(indexes[i][0], indexes[i][1]).visible = true;
				}
			}
		}

	};

