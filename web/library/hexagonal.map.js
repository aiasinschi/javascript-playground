/****
 *
 *
 *
 ****/
 
 var HexagonalMap = HexagonalMap || {};
 
 /** Stuff that needs to be initialized with options parameter **/
 	HexagonalMap.Map = Array();
  
  var MSizeX;
  var MSizeY;
  var canvas;
  var context;
  var r;
  
  var deltaX ;
	var deltaY;
  var borderColor = '#FFFFFF';
  var showContours;
  
  /** Internal vars **/
 
 /** Public methods **/
 
  HexagonalMap.init = function (options){
    canvas = options.canvas;
    MSizeX = options.MSizeX;
    MSizeY = options.MSizeY;
    r = options.radius;
		deltaX = r * 3 / 2;
		deltaY = r * 2 * Math.sqrt(3)/2 ;
    showContours = options.showContours;
    context = canvas.getContext('2d');
    context.lineWidth = 0.3;
    }
 
 	HexagonalMap.initMap = function () {
				HexagonalMap.Map = new Array(MSizeX);
					for (var i = 0; i < MSizeX; i++) {
				HexagonalMap.Map[i] = new Array(MSizeY);
				}

				for (var i = 0; i < MSizeX; i++){
								for (var j = 0; j < MSizeY; j++){
									HexagonalMap.Map[i][j] = 0;
							}
				}
  }
    
  HexagonalMap.placeColor = function (posX, posY, radius, colorStr){
		for (var i = -radius; i <= radius ; i++){
			for (var j = -radius; j <= radius ; j++){
				HexagonalMap.Map[posX + i][posY + j] = HexUtils.hexToInt(colorStr);
				}
		}	
	}
  
  HexagonalMap.setMapColorAt = function (posX, posY, colorStr){
    HexagonalMap.setVal(posX, posY, HexUtils.hexToInt(colorStr));
  }
  
  HexagonalMap.getMapColorAt = function (posX, posY){
    return HexUtils.intToHex(HexagonalMap.getVal(posX, posY));
  }
  
  HexagonalMap.getVal = function (i, j){
		if (!HexagonalMap.contains(i, j)) {
				return 0;
		} else {
				return HexagonalMap.Map[i][j];
		}
	}

  HexagonalMap.setVal = function (i, j, val){
		if (!HexagonalMap.contains(i, j)) {
				return;
		} else {
				HexagonalMap.Map[i][j] = val;
		}
	}

  HexagonalMap.contains = function(i, j){
  	return ((i >= 0) && (j >= 0) && (i < MSizeY) && (j < MSizeX));
  }

  HexagonalMap.getNeighbourIndexes = function (i, j) {
				var arrayOfIndexes;
				if (i % 2 !== 0){
								arrayOfIndexes = [
												[i - 1, j],
												[i + 1, j],
												[i, j - 1],
												[i - 1, j + 1],
												[i, j + 1],
												[i + 1, j + 1] ];
								} else {
								arrayOfIndexes = [
												[i - 1, j],
												[i + 1, j],
												[i, j + 1],
												[i - 1, j - 1],
												[i, j - 1],
												[i + 1, j - 1] ];
								}
				return arrayOfIndexes;
	}
	
	HexagonalMap.getNeighbours = function (i, j) {
				var arrayOfColors;
        var Map = HexagonalMap.Map;
				if (i % 2 !== 0){
								arrayOfColors = [
												Map[i][j],
												HexagonalMap.getVal(i - 1, j),
												HexagonalMap.getVal(i + 1, j),
												HexagonalMap.getVal(i, j - 1),
												HexagonalMap.getVal(i - 1, j + 1),
												HexagonalMap.getVal(i , j + 1),
												HexagonalMap.getVal(i + 1, j + 1)];
								} else {
								arrayOfColors = [
												Map[i][j],
												HexagonalMap.getVal(i - 1, j),
												HexagonalMap.getVal(i + 1, j),
												HexagonalMap.getVal(i, j + 1),
												HexagonalMap.getVal(i - 1, j - 1),
												HexagonalMap.getVal(i, j - 1),
												HexagonalMap.getVal(i + 1, j - 1)];
								}
				return arrayOfColors;
	}


	/* Drawing stuff */

	function drawHex(x, y, color, drawInsideOnly){
		var Vx = new Array();
		var Vy = new Array();
		for (var i=0;i<6;i++){
			Vx[i] = x + r * Math.cos(i*Math.PI/3);
			Vy[i] = y + r * Math.sin(i*Math.PI/3);
		}
		context.strokeStyle = HexUtils.intToHex(color);
		context.beginPath();
		context.moveTo(Vx[5],Vy[5]);
		for (var i=0;i<6;i++){
			context.lineTo(Vx[i],Vy[i]);
		}
		context.fillStyle = HexUtils.intToHex(color);
 		context.closePath();
 		context.fill();
 		context.stroke();
		if (!drawInsideOnly) {
			context.strokeStyle = borderColor;
			context.beginPath();
            context.moveTo(Vx[5],Vy[5]);
		    for (var i=0;i<6;i++){
			    context.lineTo(Vx[i],Vy[i]);
		    }
			context.closePath();
			context.stroke();
		}
	}
	
	function realXY(cx, cy){
		var x;
		var y;
		if ((cx % 2) == 1){
			x = r + deltaX * (cx-1) + deltaX ;
			y = r + deltaY * (cy) + deltaY / 2;
		}
		else{
			x = r + deltaX * (cx);
			y = r + deltaY * (cy);
		}
		var P = new Object();
		P.x = x;
		P.y = y;
		return P;
	}
	
	
	HexagonalMap.drawCell = function (cx, cy){
		var P = realXY(cx, cy);
		drawHex(P.x, P.y, HexagonalMap.Map[cx][cy], true);
	}
	
	HexagonalMap.drawCellContour = function (cx, cy){
		var P = realXY(cx, cy);
		drawHex(P.x, P.y, HexagonalMap.Map[cx][cy], false);
	}
	
	/*function drawMap(sizex, sizey){
		for (var x=0;x<sizex;x++){
			for (var y=0;y<sizey;y++){
				drawCell(x,y);
			}
		}
	}*/
	
	function rand(n){
		return Math.floor(Math.random() * n);
	}
	
	
	HexagonalMap.drawMapI = function (sizex, sizey){
		for (var x=0;x<sizex;x++){
			for (var y=0;y<sizey;y++){
				if (!showContours){
				    HexagonalMap.drawCell(x,y);
				} else {
				    HexagonalMap.drawCellContour(x,y);
				}
			}
		}		
	}
	
	function dist2(cx, cy, x, y){
		var P = realXY(cx, cy);
		return Math.sqrt((P.x-x)*(P.x-x) + (P.y-y)*(P.y-y));
	}
	
	HexagonalMap.getMapPos = function (mouseP){
		var mapP = new Object();
		mapP.x = 0;
		mapP.y = 0;
		var tmpx = Math.floor((mouseP.x - r) / deltaX) - 1;
		var tmpy = Math.floor((mouseP.y - r) / deltaY) - 1;
		mindist = 2 * r;
		for (var i=0;i<3;i++){
			for (var j=0;j<3;j++){
				var d = dist2(tmpx + i, tmpy + j,  mouseP.x, mouseP.y);
				if (d < mindist){
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
	  
