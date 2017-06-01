var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http); 	
var fs = require('fs');
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use("/static", express.static(__dirname + "/static"));

var rooms = {};

function onConnection(socket) {
	
	var roomID;
	
	socket.on("create room", function(roomId, size, win) {
		roomID = roomId;
		
		if (rooms[roomID]) {
			socket.emit("room is busy");
			return;
		}
		
		rooms[roomID] = {
			playerCount: 1,
			step: socket.id,
			leftCnt: 0,
			rightCnt: 0,
			leftPlayer: socket.id,
			rightPlayer: 0,
			count: 0,
			gridOX: new Array(),
			winLine: [0, 0, 0, 0],
			winCnt: win,
			sizeField: size 
		}
		
		for (let i = 0; i < rooms[roomID].sizeField; i++) {
			rooms[roomID].gridOX[i] = new Array();
			for (let j = 0; j < rooms[roomID].sizeField; j++)
				rooms[roomID].gridOX[i][j] = -1;
		}
		
		console.log(rooms[roomID].sizeField.length);
		
		socket.join(roomID, function() {
			console.log("connect: ", socket.id," to ", roomID);
			socket.emit("connected", roomID, "cross", rooms[roomID].sizeField);
		});
		
	});
	
	socket.on("connect to room", function(roomId) {		
		roomID = roomId;
		
		if (!rooms[roomID]) {
			socket.emit("room doesn't exist");
			return;
		}
		
		if (rooms[roomID].playerCount == 2){
			socket.emit("room is full");
			return;
		}
		
		socket.join(roomID, function() {
			console.log("connect: ", socket.id," to ", roomID);
			if (rooms[roomID].step == 0) 
				rooms[roomID].step = socket.id;
			socket.emit("connected", roomID, "circle", rooms[roomID].sizeField);
			rooms[roomID].rightPlayer = socket.id;
			rooms[roomID].playerCount++;
		});			
		
	});
	
	socket.on("step", function(line, column) {
		//console.log("left ", rooms[roomID].leftPlayer, ", right ", rooms[roomID].rightPlayer);
		//console.log(rooms[roomID]);
		if (!rooms[roomID]) return;
		console.log("step ", rooms[roomID].step, ", player ", socket.id, " to: " ,rooms[roomID].gridOX[line][column], " players:" + rooms[roomID].playerCount);
		if ((rooms[roomID].gridOX[line][column] == -1) && (rooms[roomID].step == socket.id) && (rooms[roomID].playerCount == 2)) {
			rooms[roomID].gridOX[line][column] = socket.id;
			rooms[roomID].count++;
			socket.emit("put figure", line, column);
			socket.to(roomID).broadcast.emit("put opponent figure", line, column);
			
			if (rooms[roomID].step == rooms[roomID].leftPlayer)
				rooms[roomID].step = rooms[roomID].rightPlayer;
			else
				rooms[roomID].step = rooms[roomID].leftPlayer;
			
			if (checkVictory(socket, roomID, line, column)) {
				if (rooms[roomID].leftPlayer == socket.id) {
					rooms[roomID].leftCnt++;
					socket.emit("change score", rooms[roomID].leftCnt, rooms[roomID].rightCnt);
					socket.to(roomID).broadcast.emit("change score", rooms[roomID].rightCnt, rooms[roomID].leftCnt);
				}
				else {
					rooms[roomID].rightCnt++;
					socket.emit("change score", rooms[roomID].rightCnt, rooms[roomID].leftCnt);
					socket.to(roomID).broadcast.emit("change score", rooms[roomID].leftCnt, rooms[roomID].rightCnt);					
				}
				updateRoom(rooms[roomID]);
				socket.emit("win", rooms[roomID].winLine);
				socket.to(roomID).broadcast.emit("lose", rooms[roomID].winLine);
				console.log("score: ", rooms[roomID].leftCnt, " - ", rooms[roomID].rightCnt);
			}
			if (draw(roomID)) {
				updateRoom(rooms[roomID]);
				io.to(roomID).emit("draw");
			}
		}
	
	});
	
	socket.on('disconnect', function(){
		
		if (!rooms[roomID]) return;
		console.log("disconnect: ", socket.id," from ", roomID);
		
		rooms[roomID].playerCount--;

		if (rooms[roomID].leftPlayer == socket.id)
			rooms[roomID].leftPlayer = 0;
		else
			rooms[roomID].rightPlayer = 0;		
		
		if (rooms[roomID].step == socket.id)
			rooms[roomID].step = 0;
	});

};

function checkVictory(socket, roomID, line, column) {

	let leftFlag = true;
	let rightFlag = true;
	let topFlag = true;
	let botFlag = true;
	let winHor = 1;
	let winVert = 1;	
	
	let ltFlag = true;
	let rbFlag = true;
	let lbFlag = true;
	let rtFlag = true;
	let winDtoTR = 1;
	let winDtoBR = 1;
	
	//[x1, y1, x2, y2]
	let lineWin1 = [column, line, column, line];
	let lineWin2 = [column, line, column, line];
	
	//console.log(rooms[roomID].sizeField);
	//check horizontal and vertical winning line
	for (let i = 1; i < rooms[roomID].winCnt; i++)
	{	
		if (column - i < 0) 
			leftFlag = false;
		if (leftFlag) 
		{
			if (rooms[roomID].gridOX[line][column - i] == socket.id)
			{
				lineWin1[0] = column - i;
				lineWin1[1] = line;
				winHor++;
			} else 
			{
				leftFlag = false;
			}	
			//console.log("winHor = ", winHor);		
		}
		
		if (line - i < 0)
			topFlag = false;
		if (topFlag) 
		{
			if (rooms[roomID].gridOX[line - i][column] == socket.id)
			{
				lineWin2[0] = column;
				lineWin2[1] = line - i;
				winVert++;
			} else 
			{
				topFlag = false;
			}			
			//console.log("winVert = ", winVert);		
		}
		
		if (column + i > rooms[roomID].sizeField - 1)
			rightFlag = false;
		if (rightFlag) 
		{
			console.log("right: ", column + i, " asd: ", rooms[roomID].gridOX[line][column + i]);
			if (rooms[roomID].gridOX[line][column + i] == socket.id)
			{
				lineWin1[2] = column + i;
				lineWin1[3] = line;
				winHor++;
			} else 
			{
				rightFlag = false;
			}	
			//console.log("winHor = ", winHor);			
		}
		
		if (line + i > rooms[roomID].sizeField - 1)
			botFlag = false;
		if (botFlag) 
		{
			if (rooms[roomID].gridOX[line + i][column] == socket.id)
			{
				lineWin2[2] = column;
				lineWin2[3] = line + i;
				winVert++;
			} else 
			{
				botFlag = false;
			}		
			//console.log("winVert = ", winVert);		
		}		
	}
	
	if (winHor >= rooms[roomID].winCnt)
	{
		rooms[roomID].winLine[0] = lineWin1[0];
		rooms[roomID].winLine[1] = lineWin1[1];
		rooms[roomID].winLine[2] = lineWin1[2];
		rooms[roomID].winLine[3] = lineWin1[3];
		return true;
	}
	
	if (winVert >= rooms[roomID].winCnt)
	{
		rooms[roomID].winLine[0] = lineWin2[0];
		rooms[roomID].winLine[1] = lineWin2[1];
		rooms[roomID].winLine[2] = lineWin2[2];
		rooms[roomID].winLine[3] = lineWin2[3];
		return true;
	}

	//console.log("length winHor: ", winHor, " but need ", rooms[roomID].winCnt);
	//console.log("length winVert: ", winVert, " but need ", rooms[roomID].winCnt);
	
	//check diagonals winning line
	for (let i = 1; i < rooms[roomID].winCnt; i++)
	{	
		if (column - i < 0 || line - i < 0)
			ltFlag = false;
		if (ltFlag) 
		{
			if (rooms[roomID].gridOX[line - i][column - i] == socket.id)
			{
				lineWin1[0] = column - i;
				lineWin1[1] = line - i;
				winDtoBR++;
			} else 
			{
				ltFlag = false;
			}	
			//console.log("winDtoBR = ", winDtoBR);		
		}
		
		if (line + i > rooms[roomID].sizeField - 1 || column - i < 0)
			lbFlag = false;
		//console.log("leftbot: ", line + i, "Col: ", column - i, "winDtoTR = ", winDtoTR, " lbFlag = ", lbFlag);
		if (lbFlag) 
		{
			if (rooms[roomID].gridOX[line + i][column - i] == socket.id)
			{
				lineWin2[0] = column - i;
				lineWin2[1] = line + i;
				winDtoTR++;
			} else 
			{
				lbFlag = false;
			}			
			//console.log("winDtoTR = ", winDtoTR);		
		}
		
		if (column + i > rooms[roomID].sizeField - 1 || line + i > rooms[roomID].sizeField - 1)
			rbFlag = false;
		if (rbFlag) 
		{
			if (rooms[roomID].gridOX[line + i][column + i] == socket.id)
			{
				lineWin1[2] = column + i;
				lineWin1[3] = line + i;
				winDtoBR++;
			} else 
			{
				rbFlag = false;
			}	
			//console.log("winDtoBR = ", winDtoBR);			
		}
		
		if (line - i < 0 || column + i > rooms[roomID].sizeField - 1)
			rtFlag = false;
		//console.log("righttop: ", line - i, "Col: ", column + i, "winDtoTR = ", winDtoTR, " rtFlag = ", rtFlag);
		if (rtFlag) 
		{
			if (rooms[roomID].gridOX[line - i][column + i] == socket.id)
			{
				lineWin2[2] = column + i;
				lineWin2[3] = line - i;
				winDtoTR++;
			} else 
			{
				rtFlag = false;
			}		
			//console.log("winDtoTR = ", winDtoTR);		
		}		
	}
	
	//console.log("length winDtoBR: ", winDtoBR, " but need ", rooms[roomID].winCnt);
	//console.log("length winDtoTR: ", winDtoTR, " but need ", rooms[roomID].winCnt);
	
	if (winDtoBR >= rooms[roomID].winCnt)
	{
		rooms[roomID].winLine[0] = lineWin1[0];
		rooms[roomID].winLine[1] = lineWin1[1];
		rooms[roomID].winLine[2] = lineWin1[2];
		rooms[roomID].winLine[3] = lineWin1[3];
		return true;
	}
	
	if (winDtoTR >= rooms[roomID].winCnt)
	{
		rooms[roomID].winLine[0] = lineWin2[0];
		rooms[roomID].winLine[1] = lineWin2[1];
		rooms[roomID].winLine[2] = lineWin2[2];
		rooms[roomID].winLine[3] = lineWin2[3];
		return true;
	}
	
}

function draw(roomID) {
	if (rooms[roomID].count == 100) {
		updateRoom(rooms[roomID]);
		return true;
	}
	return false;
}

function updateRoom(room) {
	room.count = 0;
	for (let i = 0; i < room.sizeField; i++) {
		for (let j = 0; j < room.sizeField; j++)
			room.gridOX[i][j] = -1;
	}
};

io.on('connection', onConnection); 

http.listen(port, function(){
  console.log('listening on *:' + port);
});