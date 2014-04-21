var http = require('http')
var fs = require('fs')

var app = http.createServer(function(request,response){
	fs.readFile('chatroom.html', 'utf-8',function(err,data){
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write(data);
		response.end();
	});
}).listen(1337) // is this a free port or would 8080 be better?


var io = require('socket.io').listen(app); //accepts an http server instance

io.sockets.on('connection', function(socket){
	socket.on('message_to_server', function(data){
		io.sockets.emit("message_to_client",{ message : data["message"]});
	})
})