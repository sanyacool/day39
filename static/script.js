var socket = io();

var stage;
var gridOX;
var myFigure, opponentFigure;
var data;
var spriteSheet;
var myScore, enemyScore;


socket.on("connected", function(roomID, fig) {
	
	document.title = "Room: " + roomID;
	document.body.innerHTML = "<canvas id='canvas' width='900px' height='900px'></canvas>";
	document.body.innerHTML += "<canvas id='score' width='120px' height='100px'></canvas>";
	
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

	Restart();
});

function onload() {
	document.getElementById('but1').addEventListener('click', newTable);
	document.getElementById('but2').addEventListener('click', connectTable);
}

function newTable(event) {	
	event.preventDefault();
	roomId = (Math.random().toString(36)).substring(2, 6);
	alert('Вы создали комнату ' + roomId);
	socket.emit('create room', roomId);
};

function connectTable(event) {
	event.preventDefault();
	roomId = prompt("Введите ID комнаты", "");
	if (roomId == null) 
		return;
	if (roomId != '' && roomId.indexOf(' ') < 0)
		socket.emit('connect to room', roomId);
	else
		wrongTable();					
};

function wrongTable() {
	roomId = prompt("Неверно введен ID \nВведите ID комнаты", "");
	if (roomId == null) 
		return;
	if (roomId != '' && roomId.indexOf(' ') < 0)
		socket.emit('connect to room', roomId);
	else
		wrongTable();			
};

function CreateXO(evt) { //Рисуем крестики-нолики
	
	//console.log('hi!');
	let column = Math.floor(evt.stageX / 300);
	let line = Math.floor(evt.stageY / 300);
	if (column == 3) column = 2;
	if (line == 3) line = 2;
	
	socket.emit("step", line, column);
	
};

socket.on("put figure", function(line, column) {
	let X = 300 * column + 150;
	let Y = 300 * line + 150;
	let fig = new createjs.Sprite(spriteSheet, myFigure);
	fig.regX = 75;
	fig.regY = 73;
	fig.x = X;
	fig.y = Y;		
	stage.addChild(fig);
	stage.update();
});

socket.on("put opponent figure", function(line, column) {
	let X = 300 * column + 150;
	let Y = 300 * line + 150;
	let fig = new createjs.Sprite(spriteSheet, opponentFigure);
	fig.regX = 75;
	fig.regY = 73;
	fig.x = X;
	fig.y = Y;		
	stage.addChild(fig);
	stage.update();
	/*if (gridOX[line][column] == -1) {
		console.log('Create ' + figure + ' in X = ' + Math.floor(evt.stageX) + ' Y = ' + Math.floor(evt.stageY));
		let fig = new createjs.Sprite(spriteSheet, figure);
		fig.regX = 75;
		fig.regY = 73;
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
	};*/
});

socket.on("win", function(line) {
	switch(line) {
		case 1:
			DrawLine(150, 150, 750, 150);
			break;
		case 2:
			DrawLine(150, 450, 750, 450);
			break;
		case 3:
			DrawLine(150, 750, 750, 750);
			break;
		case 4:
			DrawLine(150, 150, 150, 750);
			break;
		case 5:
			DrawLine(450, 150, 450, 750);
			break;
		case 6:
			DrawLine(750, 150, 750, 750);
			break;
		case 7:
			DrawLine(150, 150, 750, 750);
			break;
		case 8:
			DrawLine(150, 750, 750, 150);
			break;		
	}
	
	alert("You won");
	Restart();
});

socket.on("lose", function(line) {
		switch(line) {
		case 1:
			DrawLine(150, 150, 750, 150);
			break;
		case 2:
			DrawLine(150, 450, 750, 450);
			break;
		case 3:
			DrawLine(150, 750, 750, 750);
			break;
		case 4:
			DrawLine(150, 150, 150, 750);
			break;
		case 5:
			DrawLine(450, 150, 450, 750);
			break;
		case 6:
			DrawLine(750, 150, 750, 750);
			break;
		case 7:
			DrawLine(150, 150, 750, 750);
			break;
		case 8:
			DrawLine(150, 750, 750, 150);
			break;		
	}
	
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

function checkVictory() {
	
	for (let i = 0; i < 3; i++)
		{
			y = i * 300 + 150;
			x = i * 300 + 150;
			if (gridOX[i][0] == 0 && gridOX[i][1] == 0 && gridOX[i][2] == 0) 
			{				
				DrawLine(150, y, 750, y);
				stage.update();
				BlueWin();				
			}
			if (gridOX[i][0] == 1 && gridOX[i][1] == 1 && gridOX[i][2] == 1) 
			{
				DrawLine(150, y, 750, y);
				stage.update();
				RedWin();				
			}
			if (gridOX[0][i] == 1 && gridOX[1][i] == 1 && gridOX[2][i] == 1) 
			{
				DrawLine(x, 150, x, 750);
				stage.update();
				RedWin();				
			}
			if (gridOX[0][i] == 0 && gridOX[1][i] == 0 && gridOX[2][i] == 0) 
			{
				DrawLine(x, 150, x, 750);
				stage.update();
				BlueWin();				
			}
		}
	
	if (gridOX[0][0] == 0 && gridOX[1][1] == 0 && gridOX[2][2] == 0)
	{
		DrawLine(150, 150, 750, 750);
		stage.update();
		BlueWin();
	}
	if (gridOX[0][2] == 0 && gridOX[1][1] == 0 && gridOX[2][0] == 0)
	{
		DrawLine(750, 150, 150, 750);
		stage.update();
		BlueWin();
	}
	
	if (gridOX[0][0] == 1 && gridOX[1][1] == 1 && gridOX[2][2] == 1)
	{
		DrawLine(150, 150, 750, 750);
		stage.update();
		RedWin();
	}
	if (gridOX[0][2] == 1 && gridOX[1][1] == 1 && gridOX[2][0] == 1)
	{
		DrawLine(750, 150, 150, 750);
		stage.update();
		RedWin();
	}
		
		
		
		
	
	// Желательно оптимизировать
	// If Circles Wins
/*	if (gridOX[0][0] == 0 && gridOX[1][1] == 0 && gridOX[2][2] == 0)
	{
		DrawLine(150, 150, 750, 750);
		stage.update();
		BlueWin();
	}
	if (gridOX[0][2] == 0 && gridOX[1][1] == 0 && gridOX[2][0] == 0)
	{
		DrawLine(750, 150, 150, 750);
		stage.update();
		BlueWin();
	}
	if (gridOX[0][0] == 0 && gridOX[0][1] == 0 && gridOX[0][2] == 0)
	{
		DrawLine(150, 150, 750, 150);
		stage.update();
		BlueWin();	
	}
	if (gridOX[1][0] == 0 && gridOX[1][1] == 0 && gridOX[1][2] == 0)
	{
		DrawLine(150, 450, 750, 450);
		stage.update();
		BlueWin();
	}
	if (gridOX[2][0] == 0 && gridOX[2][1] == 0 && gridOX[2][2] == 0)
	{
		DrawLine(150, 750, 750, 750);
		stage.update();
		BlueWin();
	}
	if (gridOX[0][0] == 0 && gridOX[1][0] == 0 && gridOX[2][0] == 0)
	{
		DrawLine(150, 150, 150, 750);
		stage.update();
		BlueWin();
	}
	if (gridOX[0][1] == 0 && gridOX[1][1] == 0 && gridOX[2][1] == 0)
	{
		DrawLine(450, 150, 450, 750);
		stage.update();
		BlueWin();
	}
	if (gridOX[0][2] == 0 && gridOX[1][2] == 0 && gridOX[2][2] == 0)
	{
		DrawLine(750, 150, 750, 750);
		stage.update();
		BlueWin();
	}
	// If Crosses Wins
	if (gridOX[0][0] == 1 && gridOX[1][1] == 1 && gridOX[2][2] == 1)
	{
		DrawLine(150, 150, 750, 750);
		stage.update();
		RedWin();
	}
	if (gridOX[0][2] == 0 && gridOX[1][1] == 0 && gridOX[2][0] == 1)
	{
		DrawLine(750, 150, 150, 750);
		stage.update();
		RedWin();
	}
	if (gridOX[0][0] == 0 && gridOX[0][1] == 0 && gridOX[0][2] == 1)
	{
		DrawLine(150, 150, 750, 150);
		stage.update();
		RedWin();
	}
	if (gridOX[1][0] == 0 && gridOX[1][1] == 0 && gridOX[1][2] == 1)
	{
		DrawLine(150, 450, 750, 450);
		stage.update();
		RedWin();
	}
	if (gridOX[2][0] == 0 && gridOX[2][1] == 0 && gridOX[2][2] == 1)
	{
		DrawLine(150, 750, 750, 750);
		stage.update();
		RedWin();
	}
	if (gridOX[0][0] == 0 && gridOX[1][0] == 0 && gridOX[2][0] == 1)
	{
		DrawLine(150, 150, 150, 750);
		stage.update();
		RedWin();
	}
	if (gridOX[0][1] == 0 && gridOX[1][1] == 0 && gridOX[2][1] == 1)
	{
		DrawLine(450, 150, 450, 750);
		stage.update();
		RedWin();
	}
	if (gridOX[0][2] == 0 && gridOX[1][2] == 0 && gridOX[2][2] == 0)
	{
		DrawLine(750, 150, 750, 750);
		stage.update();
		RedWin();
	} */
};

function BlueWin() {
	alert('Circles Won!!');
	Restart();
}

function RedWin() {
	alert('Crosses Won!!');
	Restart();
	
}

function DrawLine(x1, y1, x2, y2){
	let line = new createjs.Shape();
	line.graphics.beginStroke("red").setStrokeStyle(5, 'round').moveTo(x1,y1).lineTo(x2,y2);
	stage.addChild(line);
	stage.update();
}

function Restart() {
	// Не получилось сослаться на начало кода, чтобы не повторять все то, что было уже вначале
	// тем создания функции вроде init. Программа просто игнорировала функцию
	stage.removeAllChildren();
	/*gridOX = [
		[-1, -1, -1],
		[-1, -1, -1],
		[-1, -1, -1]
	];	
	figure = 'circle';
	count = 0;*/
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
