var http = require('http')
var fs = require('fs')
var path = require('path')

var app = http.createServer(function(request,response){
		var filepath ='.' + request.url;
		if (filepath == './'){
			filepath = 'chatroom.html';
		}
		var extname = path.extname(filepath)
		var contentType = 'text/html';
		
		switch (extname){
			case '.js':
				contentType = 'text/javascript';
				break;
			case '.css':
				contentType = 'text/css';
				break;
			case '.html':
				contentType = 'text/html';
				break;
			default: 
		}

		fs.readFile(filepath, 'utf-8',function(err,data){
			if (err){
				response.writeHead(500)
				response.end();
			} else {
				response.writeHead(200, {'Content-Type': contentType});
				response.write(data);
				response.end();
			}	
		});
			
}).listen(1337) // is this a free port or would 8080 be better?

var io = require('socket.io').listen(app); //accepts an http server instance

io.sockets.on('connection', function(socket){
	socket.on('message_to_server', function(data){
		io.sockets.emit("message_to_client",{ message : data["message"]});
	})
})