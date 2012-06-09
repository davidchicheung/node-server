var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');

app.listen(8080);

function handler(request, response){
	fs.readFile(__dirname + '/index.html', function(error, data){
		if (error){
			response.writeHead(500);
			return response.end('Error loading index.html');
		}
		response.writeHead(200);
		response.end(data);
	});
}

var usernames = {};

io.sockets.on('connection', function(socket){
	socket.on('sendchat', function(data){
		io.sockets.emit('updatechat', socket.username, data);
	});
	
	socket.on('adduser', function(username){
		socket.username = username;
		usernames[username] = username;
		socket.emit('updatechat', 'SERVER', 'you have connected');
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		io.sockets.emit('updateusers', usernames);
	});
	
	socket.on('disconnect', function(){
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});