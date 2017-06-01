"use strict";
var socket = io();

var stage, score;
var gridOX;
var myFigure, opponentFigure;
var data;
var spriteSheet;
var myScore, enemyScore;
var fieldSize;

socket.on("connected", function(roomID, fig, size) {
	fieldSize = size;
	document.title = "Room: " + roomID;
	document.body.innerHTML = "<canvas id='canvas' width='" + size * 100 + "px' height='" + size * 100 + "px'></canvas>";
	document.body.innerHTML += "<canvas id='score' width='120px' height='100px'></canvas>";

	reSize();
	
	stage = new createjs.Stage("canvas");
	score = new createjs.Stage("score");
	
	let i = new createjs.Text("Me:", "20px Arial", "#ff7700");
	let enemy = new createjs.Text("Enemy:", "20px Arial", "#ff7700");	
	myScore = new createjs.Text("0", "20px Arial", "black");
	enemyScore = new createjs.Text("0", "20px Arial", "#black");

	score.addChild(i);
	i.x = 5;
	i.y = 15;
	
	score.addChild(myScore);
	myScore.x = 80;
	myScore.y = 15;
	
	score.addChild(enemyScore);
	enemyScore.x = 80;
	enemyScore.y = 70;
	
	score.addChild(enemy);
	enemy.x = 5;
	enemy.y = 70;
	
	score.update();
	
	gridOX = [
		[-1, -1, -1],
		[-1, -1, -1],
		[-1, -1, -1]
	];
	
	data = {
		images: ["/static/xo.png"],
		frames: {width:150, height:146},
		animations: {
			cross: 0,
			circle: 1
		}
	};
		
	spriteSheet = new createjs.SpriteSheet(data);
	
	myFigure = fig;
	if (fig == "circle")
		opponentFigure = "cross";
	else
		opponentFigure = "circle";
		
		
	stage.on("stagemousedown", CreateXO);

	Restart(fieldSize);
});

function onload() {
	document.getElementById('but1').addEventListener('click', newTable);
	document.getElementById('but2').addEventListener('click', connectTable);
	document.getElementById('field').addEventListener('focus', function(evt) {
		evt.target.style.backgroundColor = "#5ED2B8";
		evt.target.value = "";
	});
	document.getElementById('winCnt').addEventListener('focus', function(evt) {
		evt.target.style.backgroundColor = "#5ED2B8";
		evt.target.value = "";
	});
	document.getElementById('field').addEventListener("blur", function(evt) {
		evt.target.style.backgroundColor = "rgba(31,123,103,0.6)";
		if (evt.target.value == "")
			evt.target.value = "Введите размер поля";
	});
	document.getElementById('winCnt').addEventListener("blur", function(evt) {
		evt.target.style.backgroundColor = "rgba(31,123,103,0.6)";
		if (evt.target.value == "")
			evt.target.value = "Введите длину для победы"
	});
}

function newTable(event) {
	let size = parseInt(document.getElementById('field').value);
	let win = parseInt(document.getElementById('winCnt').value);
	
	if (!size || !win)
		return;
	if (size < 3 && win < 3)
		return;
	event.preventDefault();
	let roomId = (Math.random().toString(36)).substring(2, 6);
	alert('Вы создали комнату ' + roomId);
	socket.emit('create room', roomId, size, win);
};

function connectTable(event) {
	event.preventDefault();
	let roomId = prompt("Введите ID комнаты", "");
	if (roomId == null) 
		return;
	if (roomId != '' && roomId.indexOf(' ') < 0)
		socket.emit('connect to room', roomId);
	else
		wrongTable();					
};

function wrongTable() {
	let roomId = prompt("Неверно введен ID \nВведите ID комнаты", "");
	if (roomId == null) 
		return;
	if (roomId != '' && roomId.indexOf(' ') < 0)
		socket.emit('connect to room', roomId);
	else
		wrongTable();			
};

function CreateXO(evt) { 
	//Рисуем крестики-нолики
	
	let column = Math.floor(evt.stageX / 100);
	let line = Math.floor(evt.stageY / 100);
	if (column == fieldSize) column = fieldSize - 1;
	if (line == fieldSize) line = fieldSize - 1;
	
	//console.log('pressed: ', column, " - ", line);
	socket.emit("step", line, column);
	
};

socket.on("put figure", function(line, column) {
	let X = 100 * column + 50;
	let Y = 100 * line + 50;
	let fig = new createjs.Sprite(spriteSheet, myFigure);
	fig.scaleX = 100 / 150;
	fig.scaleY = 100 / 146; 
	fig.regX = 75;
	fig.regY = 73;
	fig.x = X;
	fig.y = Y;		
	stage.addChild(fig);
	stage.update();
});

socket.on("put opponent figure", function(line, column) {
	let X = 100 * column + 50;
	let Y = 100 * line + 50;
	let fig = new createjs.Sprite(spriteSheet, opponentFigure);
	fig.scaleX = 100 / 150;
	fig.scaleY = 100 / 146; 
	fig.regX = 75;
	fig.regY = 73;
	fig.x = X;
	fig.y = Y;		
	stage.addChild(fig);
	stage.update();
});

socket.on("win", function(line) {	
	DrawLine(line[0] * 100 + 50, line[1] * 100 + 50, line[2] * 100 + 50, line[3] * 100 + 50)	
	
	alert("You won");
	Restart();
});

socket.on("lose", function(line) {
	DrawLine(line[0] * 100 + 50, line[1] * 100 + 50, line[2] * 100 + 50, line[3] * 100 + 50)	
	alert("You lost");
	Restart();
});

socket.on("draw", function(line) {
	alert("Draw");	
	Restart();
});

socket.on("change score", function (mySc, enSc) {
	
	myScore.text = mySc;
	enemyScore.text = enSc;
	score.update();

});
	
function DrawLine(x1, y1, x2, y2){
	let line = new createjs.Shape();
	line.graphics.beginStroke("#FFBF00").setStrokeStyle(10, 'round').moveTo(x1,y1).lineTo(x2,y2);
	stage.addChild(line);
	stage.update();
}

function Restart() {
	// Не получилось сослаться на начало кода, чтобы не повторять все то, что было уже вначале
	// тем создания функции вроде init. Программа просто игнорировала функцию
	stage.removeAllChildren();
	var grid = new createjs.Shape();
	var lenPx = fieldSize * 100;
	for (let i = 100; i < lenPx; i += 100)
	{
		grid.graphics.beginFill("black").drawRect(0, i - 1, lenPx, 2);
		grid.graphics.beginFill("black").drawRect(i - 1, 0, 2, lenPx);
	}
	stage.addChild(grid);
	stage.update();
	// Неплохо было бы реализовать подсчет очков и вывод их на экран
}

function reSize() {
	let width = window.innerWidth;
	let height = window.innerHeight;
	let min = width > height ? height : width;
	let canvas = document.getElementById('canvas');
	canvas.style.width = min - 4 + 'px';
	canvas.style.height = min - 4 + 'px';	canvas.style.left = (window.innerWidth - min) / 2 + 'px';
}
