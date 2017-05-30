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
				[-1, -1, -1],
				[-1, -1, -1],
				[-1, -1, -1]
			]
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
			rooms[roomID].playerCount++;
			rooms[roomID].rightPlayer = socket.id;
			if (rooms[roomID].step == 0) 
				rooms[roomID].step = socket.id;
			socket.emit("connected", roomID, "circle");
		});			
		
	});
	
	socket.on("step", function(line, column) {
		//console.log("left ", rooms[roomID].leftPlayer, ", right ", rooms[roomID].rightPlayer);
		//console.log("step ", rooms[roomID].step, ", player ", socket.id);
		console.log(rooms[roomID]);
		if (!rooms[roomID]) return;
		if ((rooms[roomID].gridOX[line][column] == -1) && (rooms[roomID].step == socket.id) && (rooms[roomID].playerCount == 2)) {
			//console.log("step ", rooms[roomID].step == rooms[roomID].leftPlayer?"left player":"right player");
			rooms[roomID].gridOX[line][column] = socket.id;
			rooms[roomID].count++;
			socket.emit("put figure", line, column);
			socket.to(roomID).broadcast.emit("put opponent figure", line, column);
			
			if (rooms[roomID].step == rooms[roomID].leftPlayer)
				rooms[roomID].step = rooms[roomID].rightPlayer;
			else
				rooms[roomID].step = rooms[roomID].leftPlayer;
			
			let path;
			if (path = checkVictory(socket, roomID)) {
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
				socket.emit("win", path);
				socket.to(roomID).broadcast.emit("lose", path);
				console.log("score: ", rooms[roomID].leftCnt, " - ", rooms[roomID].rightCnt);
			}
			if (draw(roomID)) {
				io.to(roomID).emit("draw");
			}
		}
	
	});
	
	socket.on('disconnect', function(){
		
		if (!rooms[roomID]) return;
		console.log("client: ", socket.id," disconnected from ", roomID);
		
		rooms[roomID].playerCount--;

		if (rooms[roomID].leftPlayer == socket.id)
			rooms[roomID].leftPlayer = 0;
		else
			rooms[roomID].rightPlayer = 0;		
		
		if (rooms[roomID].step == socket.id)
			rooms[roomID].step = 0;
	});

};

function checkVictory(socket, roomID) {
	
	for (let i = 0; i < 3; i++)
	{
		y = i * 300 + 150;
		x = i * 300 + 150;
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
	}	
}

function draw(roomID) {
	if (rooms[roomID].count == 9) {
		updateRoom(rooms[roomID]);
		return true;
	}
	return false;
}

function updateRoom(room) {
	room.count = 0;
	room.gridOX = [
		[-1, -1, -1],
		[-1, -1, -1],
		[-1, -1, -1]
	];	
};

io.on('connection', onConnection); 

http.listen(port, function(){
  console.log('listening on *:' + port);
});