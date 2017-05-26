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

function onConnection(socket) {

	};

	
io.on('connection', onConnection); 

http.listen(port, function(){
  console.log('listening on *:' + port);
});