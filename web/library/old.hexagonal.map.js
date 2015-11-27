/****
 *
 *
 *
 ****/

var HexCell = HexCell || {

		color: null,
		visible: null,
		hovered: null,

		createCell: function (color, visible) {
			var hx = Object.create(HexCell);
			hx.color = color;
			if (visible) {
				hx.visible = true;
			} else {
				hx.visible = false;
			}
			hx.hovered = false;
			return hx;
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

HexagonalMap.placeColor = function (posX, posY, blobRadius, colorStr) {
	for (var i = -blobRadius; i <= blobRadius; i++) {
		for (var j = -blobRadius; j <= blobRadius; j++) {
			HexagonalMap.Map[posX + i][posY + j] = HexCell.createCell(HexUtils.hexToInt(colorStr), false);
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
	for (var k = 0; k < indexPairs.length; k++){
		var hxC = HexagonalMap.getVal(indexPairs[k][0], indexPairs[k][1]);
		if (hxC){
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
	var Vx = new Array();
	var Vy = new Array();
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

function drawSimpleHex(context, x, y, r, color){
	var Vx = new Array();
	var Vy = new Array();
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

function rand(n) {
	return Math.floor(Math.random() * n);
}


HexagonalMap.drawMapI = function (sizex, sizey) {
	for (var x = 0; x < sizex; x++) {
		for (var y = 0; y < sizey; y++) {
			if (!showContours) {
				HexagonalMap.drawCell(x, y);
			} else {
				HexagonalMap.drawCellContour(x, y);
			}
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
	  
