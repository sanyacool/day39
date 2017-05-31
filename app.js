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
	
	socket.on("create room", function(roomId) {
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
			gridOX: [
				[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
				[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
				[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
				[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
				[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
				[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
				[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
				[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
				[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
				[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
			],
			winLine: [0, 0, 0, 0]
		}
		
		socket.join(roomID, function() {
			console.log("client: ", socket.id," connected to ", roomID);
			socket.emit("connected", roomID, "cross");
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
			console.log("client: ", socket.id," connected to ", roomID);
			if (rooms[roomID].step == 0) 
				rooms[roomID].step = socket.id;
			socket.emit("connected", roomID, "circle");
			rooms[roomID].rightPlayer = socket.id;
			rooms[roomID].playerCount++;
		});			
		
	});
	
	socket.on("step", function(line, column) {
		//console.log("left ", rooms[roomID].leftPlayer, ", right ", rooms[roomID].rightPlayer);
		console.log(rooms[roomID]);
		console.log("Line: ", line, "Col: ", column);
		if (!rooms[roomID]) return;
		console.log("step ", rooms[roomID].step, ", player ", socket.id, " to: " ,rooms[roomID].gridOX[line][column]);
		if ((rooms[roomID].gridOX[line][column] == -1) && (rooms[roomID].step == socket.id) && (rooms[roomID].playerCount == 2)) {
			rooms[roomID].gridOX[line][column] = socket.id;
			rooms[roomID].count++;
			socket.emit("put figure", line, column);
			socket.to(roomID).broadcast.emit("put opponent figure", line, column);
			
			if (rooms[roomID].step == rooms[roomID].leftPlayer)
				rooms[roomID].step = rooms[roomID].rightPlayer;
			else
				rooms[roomID].step = rooms[roomID].leftPlayer;
			
			let path = 1;
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
		//console.log("client: ", socket.id," disconnected from ", roomID);
		
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
	
	
	//check horizontal and vertical winning line
	for (let i = 1; i < 6; i++)
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
		
		if (column + i > 9)
			rightFlag = false;
		if (rightFlag) 
		{
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
		
		if (line + i > 9)
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
	
	if (winHor >= 5)
	{
		rooms[roomID].winLine[0] = lineWin1[0];
		rooms[roomID].winLine[1] = lineWin1[1];
		rooms[roomID].winLine[2] = lineWin1[2];
		rooms[roomID].winLine[3] = lineWin1[3];
		return true;
	}
	
	if (winVert >= 5)
	{
		rooms[roomID].winLine[0] = lineWin2[0];
		rooms[roomID].winLine[1] = lineWin2[1];
		rooms[roomID].winLine[2] = lineWin2[2];
		rooms[roomID].winLine[3] = lineWin2[3];
		return true;
	}
	
	//check diagonals winning line
	for (let i = 1; i < 6; i++)
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
		
		if (line - i < 0 || column + i > 9)
			lbFlag = false;
		if (lbFlag) 
		{
			if (rooms[roomID].gridOX[line - i][column + i] == socket.id)
			{				
				lineWin2[0] = column + i;
				lineWin2[1] = line - i;
				winDtoTR++;
			} else 
			{
				lbFlag = false;
			}			
			//console.log("winDtoTR = ", winDtoTR);		
		}
		
		if (column + i > 9 || line + i > 9)
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
		
		if (line + i > 9 || column - i < 0)
			rtFlag = false;
		if (rtFlag) 
		{
			if (rooms[roomID].gridOX[line + i][column - i] == socket.id)
			{
				lineWin2[2] = column - i;
				lineWin2[3] = line + i;
				winDtoTR++;
			} else 
			{
				rtFlag = false;
			}		
			//console.log("winDtoTR = ", winDtoTR);		
		}		
	}
	
	if (winDtoBR >= 5)
	{
		rooms[roomID].winLine[0] = lineWin1[0];
		rooms[roomID].winLine[1] = lineWin1[1];
		rooms[roomID].winLine[2] = lineWin1[2];
		rooms[roomID].winLine[3] = lineWin1[3];
		return true;
	}
	
	if (winDtoTR >= 5)
	{
		rooms[roomID].winLine[0] = lineWin2[0];
		rooms[roomID].winLine[1] = lineWin2[1];
		rooms[roomID].winLine[2] = lineWin2[2];
		rooms[roomID].winLine[3] = lineWin2[3];
		return true;
	}
	
	
	/*for (let i = 1; i < 3; i++)
	{
		//y = i * 300 + 150;
		//x = i * 300 + 150;
		if (rooms[roomID].gridOX[i][0] == socket.id && rooms[roomID].gridOX[i][1] == socket.id && rooms[roomID].gridOX[i][2] == socket.id) 
		{					
			updateRoom(rooms[roomID]);
			return i + 1;
		}
		if (rooms[roomID].gridOX[0][i] == socket.id && rooms[roomID].gridOX[1][i] == socket.id && rooms[roomID].gridOX[2][i] == socket.id) 
		{
			updateRoom(rooms[roomID]);
			return i + 4;			
		}
	}
	
	if (rooms[roomID].gridOX[0][0] == socket.id && rooms[roomID].gridOX[1][1] == socket.id && rooms[roomID].gridOX[2][2] == socket.id)
	{
		updateRoom(rooms[roomID]);
		return 7;
	}
	if (rooms[roomID].gridOX[0][2] == socket.id && rooms[roomID].gridOX[1][1] == socket.id &&rooms[roomID].gridOX[2][0] == socket.id)
	{
		updateRoom(rooms[roomID]);
		return 8;
	}	*/
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
	room.gridOX = [
		[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
		[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	];
};

io.on('connection', onConnection); 

http.listen(port, function(){
  console.log('listening on *:' + port);
});