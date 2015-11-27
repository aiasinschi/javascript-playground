/****
 *
 * Hex Map file
 *
 ****/
var HexTypes = HexTypes || {
		value: null,
		name: null,
		color: null,
		imgSrc: null,

		construct: function (value, name, color, imgSrc) {
			var ht = Object.create(HexTypes);
			ht.value = value;
			ht.name = name;
			ht.color = color;
			ht.imgSrc = imgSrc;
			return ht;
		},
	};

	HexTypes.DIRT_TYPE = HexTypes.construct(0, 'Dirt', '#554400', 'placeholder.png');
	HexTypes.ROCK_TYPE = HexTypes.construct(1, 'Rock', '#9999BB', 'placeholder.png');
	HexTypes.WATER_TYPE = HexTypes.construct(2, 'Water', '#0000BB', 'placeholder.png');
	HexTypes.FOREST_TYPE = HexTypes.construct(3, 'Forest', '#00AA00', 'placeholder.png');


var CommonDrawing = CommonDrawing || {
		drawContour: function(context, points, visible, strokeStyle, fillStyle){
			context.strokeStyle = strokeStyle;
			context.beginPath();
			var N = points.length;
			context.moveTo(points[N - 1].x, points[N - 1].y);
			for (var i = 0; i < N; i++) {
				context.lineTo(points[i].x, points[i].y);
			}

			if (fillStyle) {
				context.fillStyle = visible ? fillStyle : HexCell.FOG_COLOR;
				context.fill();
			}
			context.closePath();
			context.stroke();
		}
	};

var HexCell = HexCell || {

		type: null,
		color: null,
		visible: null,
		hovered: null,
		FOG_COLOR: '#555577',

		createCell: function (color, visible, type) {
			var hx = Object.create(HexCell);
			hx.color = color;
			if (visible) {
				hx.visible = true;
			} else {
				hx.visible = false;
			}
			if (type) {
				hx.type = type;
			} else {
				hx.type = HexTypes.DIRT_TYPE;
			}
			hx.hovered = false;
			return hx;
		},
		draw: function (context, px, py) {
			var P = realXY(px, py);
			var x = P.x;
			var y = P.y;
			var color = this.type.color;
			var bH = [];
			for (var i = 0; i < HexagonalMap.baseHex.length; i++){
				bH.push(HexagonalMap.baseHex[i].translate(x, y));
			}
			CommonDrawing.drawContour(context, bH, this.visible,
								color, color);
			CommonDrawing.drawContour(context, bH, this.visible,
								this.hovered ? hoveredBorderColor : borderColor);
		}

	};

var HexagonalMap = HexagonalMap || {};

/** Stuff that needs to be initialized with options parameter **/
HexagonalMap.Map = Array();

var MSizeX;
var MSizeY;
var canvas;
var context;
var radius;

var deltaX;
var deltaY;
var borderColor = '#DDDDFF';
var hoveredBorderColor = '#F0F000';
var BORDER_WIDTH = 2;
var showContours;

/** Internal vars **/

/** Public methods **/

HexagonalMap.init = function (options) {
	canvas = options.canvas;
	MSizeX = options.MSizeX;
	MSizeY = options.MSizeY;
	radius = options.radius;
	deltaX = radius * 3 / 2;
	deltaY = radius * 2 * Math.sqrt(3) / 2;
	showContours = options.showContours;
	context = canvas.getContext('2d');
	context.lineWidth = BORDER_WIDTH;
}

HexagonalMap.initMap = function () {
	HexagonalMap.baseHex = [];
	HexagonalMap.baseUnitHex = [];
	for (var i = 0; i < 6; i++) {
		var P = Point.createPoint(
			radius * Math.cos(i * Math.PI / 3),
			radius * Math.sin(i * Math.PI / 3)
		);
		HexagonalMap.baseHex.push(P);
		var iP = Point.createPoint(
			0.75 * radius * Math.cos(i * Math.PI / 3),
			0.75 * radius * Math.sin(i * Math.PI / 3)
		);
		HexagonalMap.baseUnitHex.push(iP);
	}
	HexagonalMap.Map = new Array(MSizeX);
	for (var i = 0; i < MSizeX; i++) {
		HexagonalMap.Map[i] = new Array(MSizeY);
	}

	for (var i = 0; i < MSizeX; i++) {
		for (var j = 0; j < MSizeY; j++) {
			HexagonalMap.Map[i][j] = HexCell.createCell(0, false);
		}
	}
}

HexagonalMap.placeColor = function (posX, posY, blobRadius, hexType) {
	for (var i = -blobRadius; i <= blobRadius; i++) {
		for (var j = -blobRadius; j <= blobRadius; j++) {
			HexagonalMap.Map[posX + i][posY + j] = HexCell.createCell(HexUtils.hexToInt(hexType.color), false, hexType);
		}
	}
}

HexagonalMap.setMapColorAt = function (posX, posY, colorStr) {
	var cell = HexagonalMap.getVal(posX, posY);
	cell.color = colorStr;
	HexagonalMap.setVal(posX, posY, cell);
}

HexagonalMap.getMapColorAt = function (posX, posY) {
	return HexUtils.intToHex(HexagonalMap.getVal(posX, posY).color);
}

HexagonalMap.setHoveredAt = function (posX, posY, hovered) {
	var cell = HexagonalMap.getVal(posX, posY);
	if (cell) {
		cell.hovered = hovered;
	}
}

HexagonalMap.getVal = function (i, j) {
	if (!HexagonalMap.contains(i, j)) {
		return null;
	} else {
		return HexagonalMap.Map[i][j];
	}
}

HexagonalMap.setVal = function (i, j, val) {
	if (!HexagonalMap.contains(i, j)) {
		return;
	} else {
		HexagonalMap.Map[i][j] = val;
	}
}

HexagonalMap.contains = function (i, j) {
	return ((i >= 0) && (j >= 0) && (i < MSizeY) && (j < MSizeX));
}

HexagonalMap.getNeighbourIndexes = function (i, j) {
	var arrayOfIndexes;
	if (i % 2 !== 0) {
		arrayOfIndexes = [
			[i - 1, j],
			[i + 1, j],
			[i, j - 1],
			[i - 1, j + 1],
			[i, j + 1],
			[i + 1, j + 1]];
	} else {
		arrayOfIndexes = [
			[i - 1, j],
			[i + 1, j],
			[i, j + 1],
			[i - 1, j - 1],
			[i, j - 1],
			[i + 1, j - 1]];
	}
	return arrayOfIndexes;
}

HexagonalMap.getNeighbours = function (i, j) {
	var arrayOfColors = [];
	var Map = HexagonalMap.Map;
	var indexPairs = HexagonalMap.getNeighbourIndexes(i, j);
	for (var k = 0; k < indexPairs.length; k++) {
		var hxC = HexagonalMap.getVal(indexPairs[k][0], indexPairs[k][1]);
		if (hxC) {
			arrayOfColors.push(hxC.color ? hxC.color : 0);
		} else {
			arrayOfColors.push(0);
		}
	}
	return arrayOfColors;
}


/* Drawing stuff */

function drawHex(context, x, y, r, hxCell, drawInsideOnly) {
	var color = hxCell.color;
	var Vx = [];
	var Vy = [];
	for (var i = 0; i < 6; i++) {
		Vx[i] = x + r * Math.cos(i * Math.PI / 3);
		Vy[i] = y + r * Math.sin(i * Math.PI / 3);
	}
	context.strokeStyle = HexUtils.intToHex(color);
	context.beginPath();
	context.moveTo(Vx[5], Vy[5]);
	for (var i = 0; i < 6; i++) {
		context.lineTo(Vx[i], Vy[i]);
	}
	context.fillStyle = hxCell.visible ? HexUtils.intToHex(color) : '#555577';
	context.closePath();
	context.fill();
	context.stroke();
	if (!drawInsideOnly) {
		context.strokeStyle = hxCell.hovered ? '#FF00FF' : borderColor;
		context.beginPath();
		context.moveTo(Vx[5], Vy[5]);
		for (var i = 0; i < 6; i++) {
			context.lineTo(Vx[i], Vy[i]);
		}
		context.closePath();
		context.stroke();
	}
}

function drawSimpleHex(context, x, y, r, color) {
	var Vx = [];
	var Vy = [];
	for (var i = 0; i < 6; i++) {
		Vx[i] = x + r * Math.cos(i * Math.PI / 3);
		Vy[i] = y + r * Math.sin(i * Math.PI / 3);
	}
	context.strokeStyle = HexUtils.intToHex(color);
	context.beginPath();
	context.moveTo(Vx[5], Vy[5]);
	for (var i = 0; i < 6; i++) {
		context.lineTo(Vx[i], Vy[i]);
	}
	context.fillStyle = HexUtils.intToHex(color);
	context.closePath();
	context.fill();
	context.stroke();
}

function realXY(cx, cy) {
	var x;
	var y;
	if ((cx % 2) == 1) {
		x = radius + deltaX * (cx - 1) + deltaX;
		y = radius + deltaY * (cy) + deltaY / 2;
	}
	else {
		x = radius + deltaX * (cx);
		y = radius + deltaY * (cy);
	}
	var P = new Object();
	P.x = x;
	P.y = y;
	return P;
}


HexagonalMap.drawCell = function (cx, cy) {
	var P = realXY(cx, cy);
	drawHex(context, P.x, P.y, radius, HexagonalMap.Map[cx][cy], true);
}

HexagonalMap.drawCellContour = function (cx, cy) {
	var P = realXY(cx, cy);
	drawHex(context, P.x, P.y, radius, HexagonalMap.Map[cx][cy], false);
}

/*function drawMap(sizex, sizey){
 for (var x=0;x<sizex;x++){
 for (var y=0;y<sizey;y++){
 drawCell(x,y);
 }
 }
 }*/

function rand(n) {
	return Math.floor(Math.random() * n);
}


HexagonalMap.drawMapI = function (sizex, sizey) {
	for (var x = 0; x < sizex; x++) {
		for (var y = 0; y < sizey; y++) {
			/*if (!showContours) {
				HexagonalMap.drawCell(x, y);
			} else {
				HexagonalMap.drawCellContour(x, y);
			}*/
			HexagonalMap.getVal(x, y).draw(context, x, y);
		}
	}
}

function dist2(cx, cy, x, y) {
	var P = realXY(cx, cy);
	return Math.sqrt((P.x - x) * (P.x - x) + (P.y - y) * (P.y - y));
}

HexagonalMap.getMapPos = function (mouseP) {
	var mapP = new Object();
	mapP.x = 0;
	mapP.y = 0;
	var tmpx = Math.floor((mouseP.x - radius) / deltaX) - 1;
	var tmpy = Math.floor((mouseP.y - radius) / deltaY) - 1;
	mindist = 2 * radius;
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			var d = dist2(tmpx + i, tmpy + j, mouseP.x, mouseP.y);
			if (d < mindist) {
				mindist = d;
				mapP.x = tmpx + i;
				mapP.y = tmpy + j;
			}
		}
	}
	return mapP;
}

HexagonalMap.getMousePos = function (canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}
	  
