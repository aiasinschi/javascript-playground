/***
 *  UTIL FUNCTIONS RELATED TO CONVERSION FROM INT TO STRING COLOR NOTATION:
 *  '#AFD90F' ==> integer value and the reverse
 *  @author Adrian Iasinschi aiasinschi@gmail.com
 *
 ***/
var HexUtils = HexUtils || {};

	/*  Hex to int conversion */	
	HexUtils.hexToInt = function (hex){
		var arr = HexUtils.hexToByteArray(hex);
		return HexUtils.hexToByte(arr[0]) * 256* 256 + HexUtils.hexToByte(arr[1]) * 256 + HexUtils.hexToByte(arr[2]);
	}
	
	HexUtils.hexToByteArray = function(hex){
		var ret = [];
		for (var i = 0 ; i < (hex.length - 1) / 2 ; i ++){
			ret.push(HexUtils.hexToByte(hex.substr(2 * i + 1, 2)));
		}
		return ret;
	}
	
	HexUtils.byteArrayToHex = function(bArray){
		var ret = '#';
		for (var i = 0; i < bArray.length; i++){
			ret += HexUtils.byteToHex(bArray[i]);
		}
		return ret;
	}
	
	HexUtils.hexToByte = function (hex) {		
		return (HexUtils.hexDigitValue(hex[0].toUpperCase() )) * 16 + HexUtils.hexDigitValue(hex[1].toUpperCase()) ;
	}
	
	HexUtils.hexDigitValue = function (X){
		var code = X.charCodeAt(0);
		if ((code >= 48) && (code <= 57)) {
				return code - 48;
		} else if ((code >= 65) && (code <= 70)){
				return code - 65 + 10;
		} else {
				return 0;
		}
	}
	
	/* Int to hex conversion */
	
	HexUtils.intToHex = function (number){
		var red = number / (256 * 256);
		var temp = number % (256 * 256);
		var green = temp / 256;
		var blue = temp % 256;
		return '#' + HexUtils.byteToHex(red) + HexUtils.byteToHex(green) + HexUtils.byteToHex(blue);
	}
	
	HexUtils.byteToHex = function (b){
		var hi = b / 16;
		var lo = b % 16;
		return HexUtils.digitToHex(hi) + HexUtils.digitToHex(lo);
	}
	
	HexUtils.digitToHex = function (d) {
		if (d < 10) {
				return String.fromCharCode(48 + d);
		} else {
				return String.fromCharCode(65 + d - 10);
		}
	}
	
	HexUtils.modifyByPercent = function(hex, percent){
		var ret = HexUtils.hexToByteArray(hex);
		for (var i = 0; i < ret.length; i++){
			ret[i] = (ret[i] * (1 + percent / 100)) % 256; 
		}
		return HexUtils.byteArrayToHex(ret);
	}
	