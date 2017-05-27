var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/in', function(req, res){
  res.sendFile(__dirname + '/in.html');
});

app.get('/out', function(req, res){
  res.sendFile(__dirname + '/out.html');
});
 
io.on('connection', function(socket){
  var name = 'U' + (socket.id).toString().substr(1,4);
  socket.on('button clicked', function(val){
    io.emit('button clicked', val);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});