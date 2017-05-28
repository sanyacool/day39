var socket = io();

var stage;
var p = "px";

//var canvas = document.getElementById("canvas");
stage = new createjs.Stage("canvas");
var data = {
	images: ["/static/xo.png"],
	frames: {width:150, height:146},
	animations: {
		cross: 0,
		circle: 1
	}
};
var spriteSheet = new createjs.SpriteSheet(data);
stage.on("stagemousedown", CreateXO);

//var gridOX = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
var gridOX = [
	[-1, -1, -1],
	[-1, -1, -1],
	[-1, -1, -1]
];

var figure = 'circle';
var count = 0;
	
console.log('New Game');
// Рисуем сетку
var grid = new createjs.Shape();
grid.graphics.beginFill("black").drawRect(parseFloat(document.getElementById("canvas").width) / 3, 0, 2, parseFloat(document.getElementById("canvas").height));
grid.graphics.beginFill("black").drawRect(parseFloat(document.getElementById("canvas").width) / 3 * 2, 0, 2, parseFloat(document.getElementById("canvas").height));
grid.graphics.beginFill("black").drawRect(0, parseFloat(document.getElementById("canvas").height) / 3, parseFloat(document.getElementById("canvas").width), 2);
grid.graphics.beginFill("black").drawRect(0, parseFloat(document.getElementById("canvas").height) / 3 * 2, parseFloat(document.getElementById("canvas").width), 2);
stage.addChild(grid);
stage.update();

function CreateXO(evt) { //Рисуем крестики-нолики
	
	//console.log('hi!');
	let column = Math.floor(evt.stageX / 300);
	let line = Math.floor(evt.stageY / 300);
	let X = 300 * column + 150;
	let Y = 300 * line + 150;
	//console.log('line = ' + line + ' column = ' + column);
	let kas = gridOX[line][column];
	if (gridOX[line][column] == -1) {
		console.log('Create ' + figure + ' in X = ' + Math.floor(evt.stageX) + ' Y = ' + Math.floor(evt.stageY));
		let fig = new createjs.Sprite(spriteSheet, figure);
		fig.regX = 75;
		fig.regY = 75;
		fig.x = X;
		fig.y = Y;		
		stage.addChild(fig);
		stage.update();
		//Проверяем ничью
		count++;
		if (figure == 'cross') {
			gridOX[line][column] = 1;
			checkVictory();
			figure = 'circle';
		} else {
			gridOX[line][column] = 0;
			checkVictory();
			figure = 'cross';
		};
		if (count == 9) {
			alert('Draw!');
			Restart();
			return
		}
	} else {
		console.log('Figure already exists!');
		//alert('Figure already exists!');
	};
	
};

function checkVictory() {
	// Желательно оптимизировать
	// If Circles Wins
	if (gridOX[0][0] == 0 && gridOX[1][1] == 0 && gridOX[2][2] == 0)
		BlueWin();
	if (gridOX[0][2] == 0 && gridOX[1][1] == 0 && gridOX[2][0] == 0)
		BlueWin();
	if (gridOX[0][0] == 0 && gridOX[0][1] == 0 && gridOX[0][2] == 0)
		BlueWin();
	if (gridOX[1][0] == 0 && gridOX[1][1] == 0 && gridOX[1][2] == 0)
		BlueWin();
	if (gridOX[2][0] == 0 && gridOX[2][1] == 0 && gridOX[2][2] == 0)
		BlueWin();
	if (gridOX[0][0] == 0 && gridOX[1][0] == 0 && gridOX[2][0] == 0)
		BlueWin();
	if (gridOX[0][1] == 0 && gridOX[1][1] == 0 && gridOX[2][1] == 0)
		BlueWin();
	if (gridOX[0][2] == 0 && gridOX[1][2] == 0 && gridOX[2][2] == 0)
		BlueWin();
	// If Crosses Wins
	if (gridOX[0][0] == 1 && gridOX[1][1] == 1 && gridOX[2][2] == 1)
		RedWin();
	if (gridOX[0][2] == 1 && gridOX[1][1] == 1 && gridOX[2][0] == 1)
		RedWin();
	if (gridOX[0][0] == 1 && gridOX[0][1] == 1 && gridOX[0][2] == 1)
		RedWin();
	if (gridOX[1][0] == 1 && gridOX[1][1] == 1 && gridOX[1][2] == 1)
		RedWin();
	if (gridOX[2][0] == 1 && gridOX[2][1] == 1 && gridOX[2][2] == 1)
		RedWin();
	if (gridOX[0][0] == 1 && gridOX[1][0] == 1 && gridOX[2][0] == 1)
		RedWin();
	if (gridOX[0][1] == 1 && gridOX[1][1] == 1 && gridOX[2][1] == 1)
		RedWin();
	if (gridOX[0][2] == 1 && gridOX[1][2] == 1 && gridOX[2][2] == 1)
		RedWin();
};

function BlueWin() {
	alert('Circles Won!!');
	Restart();
}

function RedWin() {
	alert('Crosses Won!!');
	Restart();
	
}
function Restart() {
	// Не получилось сослаться на начало кода, чтобы не повторять все то, что было уже вначале
	// тем создания функции вроде init. Программа просто игнорировала функцию
	stage.removeAllChildren();
	gridOX = [
		[-1, -1, -1],
		[-1, -1, -1],
		[-1, -1, -1]
	];
	count = 0;
	console.log('New Game');
	// Рисуем сетку
	// Можно сетку реализовать в <div>, чтобы ее каждый раз не перерисовывать
	var grid = new createjs.Shape();
	grid.graphics.beginFill("black").drawRect(parseFloat(document.getElementById("canvas").width) / 3, 0, 2, parseFloat(document.getElementById("canvas").height));
	grid.graphics.beginFill("black").drawRect(parseFloat(document.getElementById("canvas").width) / 3 * 2, 0, 2, parseFloat(document.getElementById("canvas").height));
	grid.graphics.beginFill("black").drawRect(0, parseFloat(document.getElementById("canvas").height) / 3, parseFloat(document.getElementById("canvas").width), 2);
	grid.graphics.beginFill("black").drawRect(0, parseFloat(document.getElementById("canvas").height) / 3 * 2, parseFloat(document.getElementById("canvas").width), 2);
	stage.addChild(grid);
	stage.update();
	// Неплохо было бы реализовать подсчет очков и вывод их на экран
}
