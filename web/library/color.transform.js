/** Color transformations **/
var ColorTransform = ColorTransform || {};

   /** Game of life **/
  ColorTransform.gameOfLife = function (colors){
				var sum = 0;
				for (var i = 1; i < colors.length; i++) {
								sum += colors[i] > 0 ? 1 : 0;
				}
				if (colors[0] > 0){
								if ((sum < starvationLimit) || (sum > overpopulationLimit)){
												return 0;
								} else {
												return colors[0];
								}
				} else {
								if (sum === birthLimit){
												//return separateAverage(colors);
												return HexUtils.hexToInt('#119922');
								} else {
												return colors[0];
								}
				}
    }
    
	/* Average functions */
	
  /* Average of absolute values */
	ColorTransform.classicAverage = function (colors){
				var sum = 0;
				for (var i = 0; i < colors.length; i++) {
								sum += colors[i];
				}
				return Math.floor(sum / colors.length);
	}
	
  /* Average of values separately for R,G,B */
	ColorTransform.separateAverage = function (colors){
				var sumR = 0;
				var sumG = 0;
				var sumB = 0;
				for (var i = 0; i < colors.length; i++) {
								var split = splitColor(colors[i]);
								sumR += split[0];
								sumG += split[1];
								sumB += split[2];
				}
				sumR = Math.floor(sumR / colors.length);
				sumG = Math.floor(sumG / colors.length);
				sumB = Math.floor(sumB / colors.length);
				return sumR * 256 * 256 + sumG * 256 + sumB;
	}
	
  /* Average of values separately for R,G,B with a weight factor */
	ColorTransform.centerFocusedAverage = function (colors, alpha) {
				var split;
				var power = 3;
				// assume the first element is the center
				split = splitColor(colors[0]);
				var sumR = power * split[0];
				var sumG = power * split[1];
				var sumB = power * split[2];
				for (var i = 1; i < colors.length; i++) {
								split = splitColor(colors[i]);
								sumR += split[0];
								sumG += split[1];
								sumB += split[2];
				}
				var div = (power + colors.length - 1) * alpha;
				sumR = Math.floor(sumR / div);
				sumG = Math.floor(sumG / div);
				sumB = Math.floor(sumB / div);
				return sumR * 256 * 256 + sumG * 256 + sumB;
	}
	
	function splitColor(col) {
				var r = Math.floor(col / (256 * 256));
				var t = Math.floor(col % (256 * 256));
				var g = Math.floor(t / 256);
				var b = Math.floor(t % 256);
				return [r, g, b];
	}
		