var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var path = require('path');
var fs = require('fs');

app.listen(8080);

function handler(request, response){
	var filePath = "." + request.url;
	if(filePath == './'){
	  filePath = './index.html';
	}
	
	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch(extname){
	  case '.js':
	    contentType = 'text/javascript';
	    break;
	  case '.css':
	    contentType = 'text/css';
	    break;
	}
	
	path.exists(filePath, function(exists){
	  if(exists){
	    fs.readFile(filePath, function(error, content){
	      if(error){
	        response.writeHead(500);
	        response.end();
	      }
	      else{
	        response.writeHead(200, { 'Content-Type': contentType });
	        response.end(content, 'utf-8');
	      }
	    });
	  }
	  else{
	    response.writeHead(404);
	    response.end();
	  }
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