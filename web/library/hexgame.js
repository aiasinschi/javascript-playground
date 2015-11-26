var canvas = document.getElementById('myCanvas');

var blobRadius = 8;
var timerDelay = 100;

var radius = 16;

var Unit = Unit || {
		positionX: 0,
		positionY: 0,
		size: 0,
		context: null,

		canMoveTo: function(px, py){
			if (!HexagonalMap.contains(px, py)){
				return false;
			}
			var indexes = HexagonalMap.getNeighbourIndexes(this.positionX, this.positionY);
			for (var i = 0; i < indexes.length; i++){
				if ( (indexes[i][0] === px) && (indexes[i][1] === py) ){
					return true;
				}
			}
			return false;
		},

		moveTo: function(newX, newY){
			this.positionX = newX;
			this.positionY = newY;
		},

		createUnit: function(px, py, color, size, canvas){
			var u = Object.create(Unit);
			u.positionX = px;
			u.positionY = py;
			u.size = size;
			u.color = HexUtils.hexToInt(color);
			u.context = canvas.getContext('2d');
			return u;
		},

		draw: function(){
			var P = realXY(this.positionX, this.positionY);
			drawSimpleHex(this.context, P.x, P.y, this.size, this.color);
		},

		reveal: function(HexaMap){
			HexaMap.getVal(this.positionX, this.positionY).visible = true;
			var indexes = HexaMap.getNeighbourIndexes(this.positionX, this.positionY);
			for (var i = 0; i < indexes.length; i++){
				if (HexaMap.contains(indexes[i][0], indexes[i][1])){
					HexaMap.getVal(indexes[i][0], indexes[i][1]).visible = true;
				}
			}
		}

	};

var MSizeX = Math.floor(1.2 * canvas.width / (2 * radius));
var MSizeY = Math.floor(1.2 * canvas.height / (2 * radius));

var paused = true;
/** 2, 3, 3 for the classic square grid **/
/** 1.5, 2.25, 2 for a non convergent situation **/

HexagonalMap.init({
	'canvas': canvas,
	'MSizeX': MSizeX,
	'MSizeY': MSizeY,
	'radius': radius,
	'showContours': true,
});
HexagonalMap.initMap();
initColors();

var explorer = Unit.createUnit(2, 2, '#A1A1EE', radius * 2 / 3, canvas);
var units = [];

var drawAllUnits = function(){
	var cells = [];
	for (var i = 0; i < units.length; i++) {
		var px = units[i].positionX;
		var py = units[i].positionY;
		cells.push([px, py]);
		var ngbIdx = HexagonalMap.getNeighbourIndexes(px, py);
		for (var k = 0; k < ngbIdx.length; k++){
			if (HexagonalMap.contains(ngbIdx[k][0], ngbIdx[k][1])){
				cells.push([ngbIdx[k][0], ngbIdx[k][1]]);
			}
		}
	}
	for (var i = 0; i < cells.length; i++){
		HexagonalMap.drawCellContour(cells[i][0], cells[i][1]);
	}
	for (var i = 0; i < units.length; i++){
		units[i].draw();
	}
};

var allUnitsAction = function(){
	for (var i = 0; i < units.length; i++){
		units[i].reveal(HexagonalMap);
	}
};

units.push(explorer);
allUnitsAction();
// draw map
HexagonalMap.drawMapI(MSizeX, MSizeY);
drawAllUnits();


canvas.addEventListener('mousedown', function (evt) {
	var mousePos = HexagonalMap.getMousePos(canvas, evt);
	var mapPos = HexagonalMap.getMapPos(mousePos);

	var selectedX = mapPos.x;
	var selectedY = mapPos.y;

	document.getElementById("selectedX").innerHTML = selectedX.toString();
	document.getElementById("selectedY").innerHTML = selectedY.toString();
	document.getElementById("clickedColour").innerHTML = HexagonalMap.getMapColorAt(selectedX, selectedY);
	document.getElementById("neighbours").innerHTML = HexagonalMap.getNeighbours(selectedX, selectedY);

	if (explorer.canMoveTo(selectedX, selectedY)) {
		explorer.moveTo(selectedX, selectedY);
		allUnitsAction();
	}

	//HexagonalMap.setMapColorAt(selectedX, selectedY, '#99AAFF');
/*
	var ngbIdx = HexagonalMap.getNeighbourIndexes(selectedX, selectedY);
	for (var k = 0; k < ngbIdx.length; k++){
		var hxCell = HexagonalMap.getVal(ngbIdx[k][0], ngbIdx[k][1]);
		if (hxCell){
			hxCell.visible = true;
			HexagonalMap.drawCellContour(ngbIdx[k][0], ngbIdx[k][1]);
		}
	}
	HexagonalMap.getVal(selectedX, selectedY).visible = true;
	HexagonalMap.drawCellContour(selectedX, selectedY);
*/
	drawAllUnits();
}, false);


var hoveredCell = {x: 0, y: 0, color: '#000000'};
var hoverColor = '#FFFFFF';

canvas.addEventListener('mousemove', function (evt) {
	var mousePos = HexagonalMap.getMousePos(canvas, evt);
	var mapPos = HexagonalMap.getMapPos(mousePos);

	var selectedX = mapPos.x;
	var selectedY = mapPos.y;

	if ((hoveredCell.x == selectedX) && (hoveredCell.y == selectedY))
		return;

	document.getElementById("selectedX").innerHTML = selectedX.toString();
	document.getElementById("selectedY").innerHTML = selectedY.toString();

	if (HexagonalMap.contains(hoveredCell.x, hoveredCell.y)) {
		//HexagonalMap.setMapColorAt(selectedCell.x, selectedCell.y, selectedCell.color);
		HexagonalMap.setHoveredAt(hoveredCell.x, hoveredCell.y, false);
		HexagonalMap.drawCellContour(hoveredCell.x, hoveredCell.y);
	}
	if (HexagonalMap.contains(selectedX, selectedY)) {
		hoveredCell.x = selectedX;
		hoveredCell.y = selectedY;
		//selectedCell.color = HexagonalMap.getMapColorAt(selectedX, selectedY);
		//HexagonalMap.setMapColorAt(selectedX, selectedY, hoverColor);
		HexagonalMap.setHoveredAt(hoveredCell.x, hoveredCell.y, true);
		HexagonalMap.drawCellContour(selectedX, selectedY);
	}
	drawAllUnits();
}, false);

function initColors() {
	HexagonalMap.placeColor(Math.floor(MSizeX / 3), Math.floor(MSizeY / 3), blobRadius / 2, "#2244FF");
	HexagonalMap.placeColor(Math.floor(2 * MSizeX / 3), Math.floor(2 * MSizeY / 3), blobRadius / 2, "#FF4422");
	HexagonalMap.placeColor(Math.floor(2 * MSizeX / 3), Math.floor(MSizeY / 3), blobRadius / 2, "#22FF00");
	HexagonalMap.placeColor(Math.floor(MSizeX / 3), Math.floor(2 * MSizeY / 3), blobRadius / 2, "#AF04A2");
	HexagonalMap.placeColor(Math.floor(MSizeX / 2), Math.floor(MSizeY / 2), blobRadius / 2, "#11A1F1");

	/*				placeColor(Math.floor(MSizeX / 3), Math.floor(MSizeY / 3), blobRadius, "#00FF00" );
	 placeColor(Math.floor(2 * MSizeX / 3), Math.floor(2 * MSizeY / 3), blobRadius, "#00FF00" );
	 placeColor(Math.floor(2 * MSizeX / 3), Math.floor(MSizeY / 3), blobRadius, "#00FF00" );
	 placeColor(Math.floor(MSizeX / 3), Math.floor(2 * MSizeY / 3), blobRadius, "#00FF00" );
	 placeColor(Math.floor(MSizeX / 2), Math.floor(MSizeY / 2), blobRadius / 2, "#FFFFFF" );
	 */
}

