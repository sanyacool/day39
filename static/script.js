var socket = io();

var stage;
var p = "px";

stage = new createjs.Stage("canvas");

var gridOX = [
	[-1, -1, -1],
	[-1, -1, -1],
	[-1, -1, -1]
];

var grid = new createjs.Shape();	
grid.graphics.beginFill("black").drawRect(parseFloat(document.getElementById("canvas").width) / 3, 0, 2, parseFloat(document.getElementById("canvas").height));
grid.graphics.beginFill("black").drawRect(parseFloat(document.getElementById("canvas").width) / 3 * 2, 0, 2, parseFloat(document.getElementById("canvas").height));
grid.graphics.beginFill("black").drawRect(0, parseFloat(document.getElementById("canvas").height) / 3, parseFloat(document.getElementById("canvas").width), 2);
grid.graphics.beginFill("black").drawRect(0, parseFloat(document.getElementById("canvas").height) / 3 * 2, parseFloat(document.getElementById("canvas").width), 2);
stage.addChild(grid);
stage.update();

stage.on("stagemousedown", CreateXO);

function CreateXO(evt) {
	
	console.log('hi!');
	
	let X = 300 * Math.floor(evt.stageX / 300) + 150;
	let Y = 300 * Math.floor(evt.stageY / 300) + 150;
	
	console.log('hi! 2x');
	console.log('gridOX[X][Y] = ' + gridOX[X][Y]);
	
	if (gridOX[X][Y] == -1) {
		console.log('X = ' + evt.stageX + ' Y = ' + evt.stageY);
		gridOX[X][Y] = 1;
		var data = {
			images: ["/static/xo.png"],
			frames: {width:150, height:146},
			animations: {
				cross: 0,
				circle: 1
			}
		};
		var spriteSheet = new createjs.SpriteSheet(data);
		var cross = new createjs.Sprite(spriteSheet, "cross");
		cross.regX = 75;
		cross.regY = 75;
		cross.x = X;
		cross.y = Y;		
		stage.addChild(cross);
		stage.update();
	}
}