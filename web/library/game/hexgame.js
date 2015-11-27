var canvas = document.getElementById('myCanvas');

var radius = 32;

var MSizeX = Math.floor(1.2 * canvas.width / (2 * GameConstants.radius));
var MSizeY = Math.floor(1.2 * canvas.height / (2 * GameConstants.radius));

HexagonalMap.init({
	'canvas': canvas,
	'MSizeX': MSizeX,
	'MSizeY': MSizeY,
	'radius': GameConstants.radius,
	'showContours': true,
});
HexagonalMap.initMap();
initColors();

var explorer = Unit.createUnit(2, 2, '#1151FF', GameConstants.radius * 2 / 3, canvas);
var units = [];

var drawAllUnits = function () {
	var cells = [];
	for (var i = 0; i < units.length; i++) {
		var px = units[i].positionX;
		var py = units[i].positionY;
		cells.push([px, py]);
		var ngbIdx = HexagonalMap.getNeighbourIndexes(px, py);
		for (var k = 0; k < ngbIdx.length; k++) {
			if (HexagonalMap.contains(ngbIdx[k][0], ngbIdx[k][1])) {
				cells.push([ngbIdx[k][0], ngbIdx[k][1]]);
			}
		}
	}
	for (var i = 0; i < cells.length; i++) {
		HexagonalMap.getVal(cells[i][0], cells[i][1]).draw(context, cells[i][0], cells[i][1]);
	}
	for (var i = 0; i < units.length; i++) {
		units[i].draw();
	}
};

var allUnitsAction = function () {
	for (var i = 0; i < units.length; i++) {
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
	drawAllUnits();
}, false);


var hoveredCell = {x: 0, y: 0, color: '#000000'};

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
		HexagonalMap.getVal(hoveredCell.x, hoveredCell.y).draw(context, hoveredCell.x, hoveredCell.y);
	}
	if (HexagonalMap.contains(selectedX, selectedY)) {
		hoveredCell.x = selectedX;
		hoveredCell.y = selectedY;
		//selectedCell.color = HexagonalMap.getMapColorAt(selectedX, selectedY);
		//HexagonalMap.setMapColorAt(selectedX, selectedY, hoverColor);
		HexagonalMap.setHoveredAt(hoveredCell.x, hoveredCell.y, true);
		HexagonalMap.getVal(selectedX, selectedY).draw(context, selectedX, selectedY);
	}
	drawAllUnits();
}, false);

function initColors() {
	HexagonalMap.placeColor(Math.floor(MSizeX / 3), Math.floor(MSizeY / 3), GameConstants.blobRadius / 2, HexTypes.FOREST_TYPE);
	HexagonalMap.placeColor(Math.floor(2 * MSizeX / 3), Math.floor(2 * MSizeY / 3), GameConstants.blobRadius / 2, HexTypes.WATER_TYPE);
	HexagonalMap.placeColor(Math.floor(2 * MSizeX / 3), Math.floor(MSizeY / 3), GameConstants.blobRadius / 2, HexTypes.FOREST_TYPE);
	HexagonalMap.placeColor(Math.floor(MSizeX / 3), Math.floor(2 * MSizeY / 3), GameConstants.blobRadius / 2, HexTypes.ROCK_TYPE);
	HexagonalMap.placeColor(Math.floor(MSizeX / 2), Math.floor(MSizeY / 2), GameConstants.blobRadius / 2, HexTypes.WATER_TYPE);

	/*				placeColor(Math.floor(MSizeX / 3), Math.floor(MSizeY / 3), GameConstants.blobRadius, "#00FF00" );
	 placeColor(Math.floor(2 * MSizeX / 3), Math.floor(2 * MSizeY / 3), GameConstants.blobRadius, "#00FF00" );
	 placeColor(Math.floor(2 * MSizeX / 3), Math.floor(MSizeY / 3), GameConstants.blobRadius, "#00FF00" );
	 placeColor(Math.floor(MSizeX / 3), Math.floor(2 * MSizeY / 3), GameConstants.blobRadius, "#00FF00" );
	 placeColor(Math.floor(MSizeX / 2), Math.floor(MSizeY / 2), GameConstants.blobRadius / 2, "#FFFFFF" );
	 */
}

