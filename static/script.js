var socket = io();

var stage;
var p = "px";

//var canvas = document.getElementById("canvas");
stage = new createjs.Stage("canvas");

//var gridOX = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
var gridOX = [
	[-1, -1, -1],
	[-1, -1, -1],
	[-1, -1, -1]
];
var figure = 0;

var data = {
	images: ["/static/xo.png"],
	frames: {width:150, height:146},
	animations: {
		cross: 0,
		circle: 1
	}
};
var spriteSheet = new createjs.SpriteSheet(data);
	
console.log('hi!');
// Рисуем сетку
var grid = new createjs.Shape();
grid.graphics.beginFill("black").drawRect(parseFloat(document.getElementById("canvas").width) / 3, 0, 2, parseFloat(document.getElementById("canvas").height));
grid.graphics.beginFill("black").drawRect(parseFloat(document.getElementById("canvas").width) / 3 * 2, 0, 2, parseFloat(document.getElementById("canvas").height));
grid.graphics.beginFill("black").drawRect(0, parseFloat(document.getElementById("canvas").height) / 3, parseFloat(document.getElementById("canvas").width), 2);
grid.graphics.beginFill("black").drawRect(0, parseFloat(document.getElementById("canvas").height) / 3 * 2, parseFloat(document.getElementById("canvas").width), 2);
stage.addChild(grid);
stage.update();

stage.on("stagemousedown", CreateXO);

function CreateXO(evt) { //Рисуем крестики-нолики
	
	//console.log('hi!');
	let column = Math.floor(evt.stageX / 300);
	let line = Math.floor(evt.stageY / 300);
	let X = 300 * column + 150;
	let Y = 300 * line + 150;
	//console.log('line = ' + line + ' column = ' + column);
	
	
	if (figure == 1) {
		if (gridOX[line][column] == -1) {
			console.log('Create Cross in X = ' + Math.floor(evt.stageX) + ' Y = ' + Math.floor(evt.stageY));
			let cross = new createjs.Sprite(spriteSheet, "cross");
			cross.regX = 75;
			cross.regY = 75;
			cross.x = X;
			cross.y = Y;		
			stage.addChild(cross);
			stage.update();
			figure = 0;
			gridOX[line][column] = 0;
		} else {
				console.log('Figure already exists!');
				alert('Figure already exists!');
		}
	} else {
			if (gridOX[line][column] == -1) {
				console.log('Create Circle in X = ' + Math.floor(evt.stageX) + ' Y = ' + Math.floor(evt.stageY));

				let circle = new createjs.Sprite(spriteSheet, "circle");
				circle.regX = 75;
				circle.regY = 75;
				circle.x = X;
				circle.y = Y;		
				stage.addChild(circle);
				stage.update();
				figure = 1;
				gridOX[line][column] = 1;
		} else {
				console.log('Figure already exists!');
				alert('Figure already exists!');
		}
	}
};