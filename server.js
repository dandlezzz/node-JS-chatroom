var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};
var chatServer = require('./lib/chat_server');

//helper functions
var send404 = function(res){
	res.writeHead(404, {'Content-Type': 'text/plain'});
	res.write('Error 404: no page here!')
	res.end();
};

var sendFile = function(res, filepath, contents){
	res.writeHead(200, {'content-type': mime.lookup(path.basename(filepath))}
		);
	res.end(contents)
};

var serveStatic = function(res, cache, absPath){
	if (cache[absPath]){
		sendFile(res, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists){
			if (exists){
				fs.readFile(absPath, function(err, data){
					if(err){
						send404(res);
					} else {
						cache[absPath] = data;
						sendFile(res, absPath, data)
					}
				});
			} else {
				send404(res);
			}
		});
	}
};

// http server

var server = http.createServer(function(request,response){
	var filePath = false;
	if (request.url == '/'){
		filePath = 'public/index.html'
	} else {
		filePath = 'public' + request.url
	}
	var absPath = './' + filePath;
	serveStatic(response, cache, absPath)
});

server.listen(process.env.PORT,function(){
	console.log('Bring it!')
});

//sockets listen
chatServer.listen(server)




















